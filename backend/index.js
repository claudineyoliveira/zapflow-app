require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { clerkMiddleware, requireAuth, getAuth } = require('@clerk/express');
const { createClerkClient, verifyToken } = require('@clerk/backend');
const { createClient: createSupabase } = require('@supabase/supabase-js');

// ── Clientes ────────────────────────────────────────────────
const clerkBackend = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const supabase = createSupabase(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// ── Express + Socket.IO ──────────────────────────────────────
const app = express();
const server = http.createServer(app);
const allowedOrigins = ['http://localhost:3000', 'https://zapflow-oficial.vercel.app'];

const io = new Server(server, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(clerkMiddleware());

// ── Mapa de clientes WhatsApp por userId ─────────────────────
// userId -> { client, status, qr, engine }
const clients = new Map();

function getOrCreateState(userId) {
    if (clients.has(userId)) return clients.get(userId);
    const state = { client: null, status: 'disconnected', qr: null, engineRunning: false };
    clients.set(userId, state);
    return state;
}

function buildClient(userId) {
    return new Client({
        authStrategy: new LocalAuth({ clientId: userId }),
        puppeteer: {
            handleSIGINT: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
    });
}

function setupEvents(userId, client, state) {
    const room = `user:${userId}`;

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
        state.qr = qr;
        state.status = 'waiting';
        io.to(room).emit('qr', qr);
    });

    client.on('ready', () => {
        state.status = 'ready';
        state.qr = null;
        io.to(room).emit('ready');
    });

    client.on('authenticated', () => io.to(room).emit('authenticated'));

    client.on('auth_failure', (msg) => {
        state.status = 'disconnected';
        io.to(room).emit('auth_failure', { message: msg });
    });

    client.on('disconnected', (reason) => {
        state.status = 'disconnected';
        state.qr = null;
        io.to(room).emit('disconnected', { reason });
        clients.delete(userId);
    });
}

function initClient(userId) {
    const state = getOrCreateState(userId);
    const client = buildClient(userId);
    state.client = client;
    setupEvents(userId, client, state);
    client.initialize();
    return state;
}

// ── Auth Socket.IO via Clerk JWT ─────────────────────────────
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Token ausente'));
        const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
        socket.userId = payload.sub;
        next();
    } catch {
        next(new Error('Token inválido'));
    }
});

io.on('connection', (socket) => {
    const userId = socket.userId;
    socket.join(`user:${userId}`);
    // Envia status atual ao reconectar
    const state = clients.get(userId);
    if (state) {
        socket.emit('status_update', { status: state.status, qr: state.qr });
    }
});

// ── Rotas ────────────────────────────────────────────────────

app.get('/api/status', requireAuth(), (req, res) => {
    const { userId } = getAuth(req);
    const state = clients.get(userId);
    res.json({ status: state?.status || 'disconnected', qr: state?.qr || null });
});

app.post('/api/connect', requireAuth(), (req, res) => {
    const { userId } = getAuth(req);
    const state = clients.get(userId);
    if (state?.status === 'ready' || state?.status === 'waiting') {
        return res.json({ success: true, message: 'Já conectado ou aguardando.' });
    }
    initClient(userId);
    res.json({ success: true });
});

app.post('/api/reconnect', requireAuth(), async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const state = clients.get(userId);
        if (state?.client) {
            try { await state.client.destroy(); } catch { }
            clients.delete(userId);
        }
        initClient(userId);
        res.json({ success: true, message: 'Reconectando...' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/logout', requireAuth(), async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const state = clients.get(userId);
        if (state?.client) {
            try { await state.client.logout(); } catch { }
            try { await state.client.destroy(); } catch { }
            clients.delete(userId);
        }
        io.to(`user:${userId}`).emit('disconnected', { reason: 'Logout manual' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Motor de Campanha (isolado por usuário) ──────────────────

app.post('/api/campaign/start', requireAuth(), async (req, res) => {
    const { userId } = getAuth(req);
    const state = clients.get(userId);

    if (!state || state.status !== 'ready') {
        return res.status(400).json({ error: 'WhatsApp não conectado.' });
    }
    if (state.engineRunning) {
        return res.status(400).json({ error: 'Campanha já em execução.' });
    }

    const { contacts, config } = req.body;

    // Registrar campanha no Supabase
    const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({ user_id: userId, total_numbers: contacts.length })
        .select()
        .single();

    if (error) console.error('Supabase insert error:', error);

    // Executar em background
    state.engineRunning = true;
    runCampaign(userId, campaign?.id, contacts, config, state).catch(console.error);

    res.json({ success: true, message: 'Campanha iniciada!' });
});

async function runCampaign(userId, campaignId, contacts, config, state) {
    const room = `user:${userId}`;
    const { minDelay, maxDelay, batchSize, batchPause, useBatches } = config;
    let sentCount = 0;
    let sent = 0, failed = 0;

    for (let i = 0; i < contacts.length; i++) {
        if (!state.engineRunning) break;

        const contact = contacts[i];
        const result = { number: contact.number, status: 'pending', timestamp: Date.now() };

        try {
            const cleanNumber = contact.number.replace(/\D/g, '');
            const numberId = await state.client.getNumberId(cleanNumber);

            if (numberId) {
                await state.client.sendMessage(numberId._serialized, contact.message || '');
                result.status = 'sent';
                sent++;
            } else {
                result.status = 'failed';
                result.error = 'Número não está no WhatsApp';
                failed++;
            }
        } catch (err) {
            result.status = 'failed';
            result.error = err.message;
            failed++;
        }

        sentCount++;
        io.to(room).emit('campaign_progress', {
            current: sentCount,
            total: contacts.length,
            lastResult: result
        });

        // Salvar log no Supabase
        if (campaignId) {
            await supabase.from('campaign_logs').insert({
                campaign_id: campaignId,
                user_id: userId,
                number: contact.number,
                status: result.status,
                error: result.error || null,
            }).catch(console.error);
        }

        // Delays e batches
        if (i < contacts.length - 1) {
            if (useBatches && sentCount % batchSize === 0) {
                for (let p = batchPause; p > 0; p--) {
                    if (!state.engineRunning) break;
                    io.to(room).emit('campaign_tick', { timeLeft: p, type: 'batch' });
                    await new Promise(r => setTimeout(r, 1000));
                }
            } else {
                const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
                for (let d = delay; d > 0; d--) {
                    if (!state.engineRunning) break;
                    io.to(room).emit('campaign_tick', { timeLeft: d, type: 'message' });
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }
    }

    state.engineRunning = false;

    // Atualizar totais no Supabase
    if (campaignId) {
        await supabase.from('campaigns').update({ sent, failed }).eq('id', campaignId).catch(console.error);
    }

    io.to(room).emit('campaign_finished', { total: sentCount, results: [] });
}

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`ZapFlow backend running on port ${PORT}`));
