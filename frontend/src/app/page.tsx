'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import { 
  Smartphone, Users, Clipboard, Star, X, Plus, 
  Send, Trash2, ChevronDown, FileText, Check, 
  AlertCircle, LayoutDashboard, Settings, User, 
  LogOut, Menu, Zap, Download, RefreshCw, 
  Moon, Sun, ExternalLink, FileSpreadsheet, HelpCircle,
  ShieldCheck, Pencil
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function Home() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { signOut, openUserProfile } = useClerk();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activePage, setActivePage] = useState<'dispatcher' | 'settings'>('dispatcher');
  const [status, setStatus] = useState<'disconnected' | 'waiting' | 'ready'>('disconnected');
  const [qr, setQr] = useState<string | null>(null);
  const [campaignCountdown, setCampaignCountdown] = useState<{timeLeft: number, type: 'message' | 'batch'} | null>(null);
  
  // Connection Config (Settings)
  const [connectionType, setConnectionType] = useState<'qrcode' | 'api'>('qrcode');
  const [apiConfig, setApiConfig] = useState({ apiKey: '', instanceId: '', apiUrl: '' });
  
  // Input State
  const [numberInput, setNumberInput] = useState('');
  const [numbers, setNumbers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [selectedDdi, setSelectedDdi] = useState({ code: '+55', flag: 'br' });
  const [showDdiList, setShowDdiList] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Templates
  const [templates, setTemplates] = useState<{id: string, text: string, selected: boolean}[]>([
    { id: '1', text: 'Olá! Sou o seu assistente. Como posso ajudar?', selected: true }
  ]);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  // Campaign Config
  const [config, setConfig] = useState({
    minDelay: 25,
    maxDelay: 45,
    batchSize: 5,
    batchPause: 50,
    useBatches: true
  });
  
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [campaignRunning, setCampaignRunning] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: chamada autenticada ao backend
  const apiFetch = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = await getToken();
    return fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  }, [getToken]);

  // Montar UI
  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Conectar Socket.IO com JWT do Clerk
  useEffect(() => {
    if (!isLoaded || !user) return;

    let sock: Socket | null = null;

    const connectSocket = async () => {
      const token = await getToken();
      sock = io(BACKEND_URL, { auth: { token } });

      sock.on('qr', (data) => { setQr(data); setStatus('waiting'); });
      sock.on('ready', () => { setStatus('ready'); setQr(null); });
      sock.on('disconnected', () => { setStatus('disconnected'); setQr(null); });
      sock.on('status_update', (data) => { setStatus(data.status); if (data.qr) setQr(data.qr); });

      sock.on('campaign_progress', (data) => {
        setProgress({ current: data.current, total: data.total });
        setLogs(prev => prev.map(l =>
          l.number === data.lastResult.number ? { ...l, ...data.lastResult, text: data.lastResult.status === 'sent' ? 'Enviada com sucesso' : (data.lastResult.error || 'Erro') } : l
        ));
      });
      sock.on('campaign_tick', (data) => setCampaignCountdown(data));
      sock.on('campaign_finished', (data) => {
        setCampaignRunning(false);
        setCampaignCountdown(null);
        setFeedback({ type: 'success', msg: `Finalizado: ${data.total} envios concluídos.` });
      });

      setSocket(sock);

      // Buscar status atual
      apiFetch('/api/status').then(r => r.json()).then(data => {
        setStatus(data.status);
        if (data.qr) setQr(data.qr);
      }).catch(console.error);
    };

    connectSocket();

    return () => { sock?.disconnect(); };
  }, [isLoaded, user, getToken, apiFetch]);

  const handleLogout = () => signOut({ redirectUrl: '/sign-in' });

  if (!mounted || !isLoaded) return null;

  const processNumbersValue = (input: string) => {
    const parts = input.split(/[\n\r\t,;]|\s{2,}/);
    const newNumbersList: string[] = [];
    const ddiDigits = selectedDdi.code.replace('+', '');

    parts.forEach(part => {
      const val = part.trim().replace(/[^0-9]/g, '');
      if (val.length < 8) return;

      let cleanNum = val;
      if (cleanNum.startsWith(ddiDigits)) {
        cleanNum = cleanNum.substring(ddiDigits.length);
      }
      
      const fullNum = `${ddiDigits}${cleanNum}`;
      if (!numbers.includes(fullNum) && !newNumbersList.includes(fullNum)) {
        newNumbersList.push(fullNum);
      }
    });

    if (newNumbersList.length > 0) {
      setNumbers([...numbers, ...newNumbersList]);
    }
  };

  const addFromInput = () => {
    if (!numberInput.trim()) return;
    processNumbersValue(numberInput);
    setNumberInput('');
  };

  const addNumber = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addFromInput();
    }
  };

  const removeNumber = (idx: number) => {
    setNumbers(numbers.filter((_, i) => i !== idx));
  };

  const clearNumbers = () => setNumbers([]);

  const addTemplate = () => {
    const newId = Date.now().toString();
    setTemplates([...templates, { id: newId, text: '', selected: true }]);
    setEditingTemplate(newId);
  };

  const updateTemplateText = (id: string, text: string) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, text } : t));
  };

  const toggleTemplateSelection = (id: string) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const deleteTemplate = (id: string) => {
    if (templates.length > 1) {
      setTemplates(templates.filter(t => t.id !== id));
      if (editingTemplate === id) setEditingTemplate(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Feedback otimista: Zeramos o frontend primeiro para melhorar a velocidade da UI (@dev)
      setStatus('disconnected');
      setQr(null);

      const res = await apiFetch('/api/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', msg: 'Sessão desconectada. Clique em "Conectar" para gerar um novo QR Code.' });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) { setFeedback({ type: 'error', msg: `Erro: ${err.message}` }); }
  };

  const handleReconnect = async () => {
    setIsReconnecting(true);
    setQr(null);
    try {
      const res = await apiFetch('/api/reconnect', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatus('waiting');
        setFeedback({ type: 'success', msg: 'Aguardando QR Code...' });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', msg: `Erro ao reconectar: ${err.message}` });
      setStatus('disconnected');
    } finally {
      setIsReconnecting(false);
    }
  };

  const executeSend = async () => {
    if (numbers.length === 0) return setFeedback({ type: 'error', msg: 'Adicione números primeiro' });
    const selectedTemplates = templates.filter(t => t.selected && t.text.trim());
    if (selectedTemplates.length === 0) return setFeedback({ type: 'error', msg: 'Selecione e escreva pelo menos um template' });

    const initialLogs = numbers.map(num => ({
      number: num,
      status: 'pending',
      timestamp: new Date().toISOString(),
      text: 'Aguardando na fila...'
    }));

    setCampaignRunning(true);
    setLogs(initialLogs);
    setProgress({ current: 0, total: numbers.length });

    const campaignContacts = numbers.map((num, index) => ({ 
      number: num, 
      message: selectedTemplates[index % selectedTemplates.length].text 
    }));

    try {
      await apiFetch('/api/campaign/start', {
        method: 'POST',
        body: JSON.stringify({ 
          contacts: campaignContacts, 
          config: {
            ...config,
            batchSize: config.useBatches ? config.batchSize : 999999,
          } 
        }),
      });
    } catch { setCampaignRunning(false); }
  };

  const exportReport = (format: 'csv' | 'xlsx') => {
    if (logs.length === 0) return setFeedback({ type: 'error', msg: 'Nenhum dado no relatório para exportar.' });
    
    const cleanData = logs.map(l => ({
      Telefone: l.number,
      Status: l.status.toUpperCase(),
      Resultado: l.error || 'Sucesso',
      Horario: new Date(l.timestamp).toLocaleString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');

    const fileName = `zapflow_relatorio_${Date.now()}`;

    try {
      if (format === 'xlsx') {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const wbout = XLSX.write(wb, { bookType: 'csv', type: 'string' });
        const blob = new Blob(['\uFEFF' + wbout], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      setFeedback({ type: 'success', msg: `Relatório ${format.toUpperCase()} exportado!` });
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Erro ao gerar o arquivo.' });
    }
    setShowExportMenu(false);
  };

  const ddiOptions = [
    { code: '+55', flag: 'br', name: 'Brasil' },
    { code: '+1', flag: 'us', name: 'EUA' },
    { code: '+351', flag: 'pt', name: 'Portugal' },
    { code: '+54', flag: 'ar', name: 'Argentina' },
    { code: '+57', flag: 'co', name: 'Colômbia' },
    { code: '+34', flag: 'es', name: 'Espanha' },
    { code: '+52', flag: 'mx', name: 'México' },
  ];

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!sidebarCollapsed && <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 900, fontSize: '1.4rem' }}>
            <Zap size={24} fill="var(--primary)" color="var(--primary)" /> Zap Flow
          </div>}
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}><Menu size={20} /></button>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className={`sidebar-item ${activePage === 'dispatcher' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePage('dispatcher'); }}>
            <Zap size={20} /> <span className="sidebar-text">Disparador</span>
          </a>
        </nav>
        
        <div className="sidebar-footer">
          <div className={`sidebar-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => setActivePage('settings')}>
            <Settings size={20} /> <span className="sidebar-text">Configurações</span>
          </div>
          
          <div className="profile-section">
            <div className="sidebar-item" onClick={() => setProfileOpen(!profileOpen)} style={{ gap: '0.8rem' }}>
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--primary)' }} />
              ) : (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                  {user?.firstName?.charAt(0).toUpperCase() || <User size={14} />}
                </div>
              )}
              <div className="sidebar-text" style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName || user?.firstName || 'Usuário'}
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.emailAddresses?.[0]?.emailAddress || ''}
                </div>
              </div>
            </div>
            {profileOpen && !sidebarCollapsed && (
              <>
                <button
                  id="edit-profile-btn"
                  onClick={() => { openUserProfile(); setProfileOpen(false); }}
                  className="sidebar-item logout-sub"
                  style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', fontFamily: 'inherit', color: 'var(--text-muted)' }}
                >
                  <Pencil size={15} /> <span className="sidebar-text">Editar Perfil</span>
                </button>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="sidebar-item logout-sub"
                  style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', fontFamily: 'inherit' }}
                >
                  <LogOut size={16} /> <span className="sidebar-text">Sair do Sistema</span>
                </button>
              </>
            )}
          </div>

        </div>
      </aside>


      {/* MAIN */}
      {activePage === 'dispatcher' ? (
        <main className="main-content">
          <div className="container">
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1px' }}>Módulo de Disparo</h1>
                <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Configure sua estratégia de segurança antes de iniciar os envios.</p>
              </div>
              
              <div className={`status-badge ${status}`}>
                {status === 'ready' ? <><Check size={16} /> Conectado</> : <><AlertCircle size={16} /> Desconectado</>}
              </div>
            </div>

            {/* SEGURANÇA E CONTROLE (PRIORIDADE MÁXIMA) */}
            <div className="priority-section card" style={{ position: 'relative' }}>
                <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  <ShieldCheck size={24} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Inteligência Anti-Bloqueio</h3>
                </div>
                
                {status === 'waiting' && qr ? (
                  <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '2rem', border: '2px solid var(--primary)' }}>
                    <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                      <QRCodeSVG value={qr} size={140} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>Conectar WhatsApp</h4>
                      <p style={{ fontSize: '0.8rem', opacity: 0.8, maxWidth: '200px', marginBottom: '1rem' }}>Escaneie agora para autenticar e iniciar os envios seguros.</p>
                      <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>Abra o WhatsApp → Menu → Aparelhos conectados → Conectar aparelho</p>
                    </div>
                  </div>
                ) : status === 'disconnected' ? (
                  <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '2rem', border: '2px dashed var(--border)' }}>
                    <div style={{ background: 'var(--bg-input)', padding: '1.2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', flexShrink: 0 }}>
                      <Smartphone size={36} style={{ opacity: 0.4 }} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 800, marginBottom: '0.5rem', opacity: 0.8 }}>WhatsApp Desconectado</h4>
                      <p style={{ fontSize: '0.8rem', opacity: 0.5, maxWidth: '220px', marginBottom: '1rem' }}>Clique no botão abaixo para gerar um QR Code e conectar sua conta.</p>
                      <button 
                        className="btn-primary"
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                        onClick={handleReconnect}
                        disabled={isReconnecting}
                      >
                        {isReconnecting ? <><RefreshCw size={14} className="spin" /> Aguardando...</> : <><Smartphone size={14} /> Conectar WhatsApp</>}
                      </button>
                    </div>
                  </div>
                ) : status === 'waiting' && !qr ? (
                  <div style={{ background: 'var(--bg-main)', padding: '2rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '2px solid var(--primary)' }}>
                    <RefreshCw size={32} className="spin" style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem' }}>Gerando QR Code...</h4>
                      <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Aguarde enquanto o servidor prepara a conexão.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.8rem' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={handleDisconnect}
                      >
                        <LogOut size={12} /> Desconectar
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)' }}>{progress.total}</div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>FILA</div>
                      </div>
                      <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{logs.filter(l => l.status === 'sent').length}</div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>OK</div>
                      </div>
                      <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--error)' }}>{logs.filter(l => l.status === 'failed').length}</div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>FALHAS</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.6 }}>PROGRESSO DO DISPARO</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{progress.current} / {progress.total}</div>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-chip)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${(progress.current / (progress.total || 1)) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s ease-out' }}></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2.5rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    Variabilidade de Tempo (Segundos)
                    <div className="info-tooltip"><HelpCircle size={14} /><span className="tooltip-text">Intervalo randômico entre cada mensagem para evitar simetria robótica e bloqueios.</span></div>
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>MÍNIMO</span>
                      <input type="number" min="1" className="batch-input" style={{ width: '100%' }} value={config.minDelay} onChange={(e) => setConfig({...config, minDelay: Math.max(1, +e.target.value)})} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>MÁXIMO</span>
                      <input type="number" min="1" className="batch-input" style={{ width: '100%' }} value={config.maxDelay} onChange={(e) => setConfig({...config, maxDelay: Math.max(1, +e.target.value)})} />
                    </div>
                  </div>
                </div>

                <div className="option-group" style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={16} /> Rodízio de Lotes (Obrigatório)
                    <div className="info-tooltip"><HelpCircle size={14} /><span className="tooltip-text">Pausa automática obrigatória para simular comportamento humano e evitar bloqueios imediatos.</span></div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Pausar por <input type="number" min="0" className="batch-input" value={config.batchPause} onChange={(e) => setConfig({...config, batchPause: Math.max(0, +e.target.value)})} /> s 
                    a cada <input type="number" min="1" className="batch-input" value={config.batchSize} onChange={(e) => setConfig({...config, batchSize: Math.max(1, +e.target.value)})} /> envios.
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="main-column">
                {/* Card de Entrada */}
                <div className="card">
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>1. Destinatários</h3>
                    <div className="info-tooltip">
                      <HelpCircle size={14} />
                      <span className="tooltip-text">
                        Adicione números manualmente (Enter) ou cole uma lista/coluna inteira do Excel. O DDI selecionado será aplicado automaticamente a números sem prefixo.
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', background: 'var(--bg-input)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.5rem' }}>
                      <div style={{ position: 'relative' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '10px' }}
                          onClick={() => setShowDdiList(!showDdiList)}
                        >
                          <img src={`https://flagcdn.com/w20/${selectedDdi.flag}.png`} width="20" alt={selectedDdi.flag} />
                          <span style={{ fontWeight: 700 }}>{selectedDdi.code}</span>
                          <ChevronDown size={14} />
                        </button>
                        
                        {showDdiList && (
                          <div className="export-dropdown" style={{ left: 0, top: '110%', width: '220px' }}>
                            {ddiOptions.slice(0, 8).map(opt => (
                              <div key={opt.code + opt.name} className="export-item" onClick={() => { setSelectedDdi(opt); setShowDdiList(false); }}>
                                <img src={`https://flagcdn.com/w20/${opt.flag}.png`} width="18" alt={opt.flag} />
                                <span>{opt.name} ({opt.code})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {numbers.map((n, i) => (
                        <div key={i} className="chip">
                          {n} <button onClick={() => removeNumber(i)} style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer' }}><X size={14} /></button>
                        </div>
                      ))}
                      
                      <input 
                        type="text"
                        placeholder="Digite números ou cole listas..."
                        className="textarea"
                        style={{ minHeight: 'auto', padding: '0.5rem', flex: 1, border: 'none', background: 'transparent' }}
                        value={numberInput}
                        onChange={(e) => setNumberInput(e.target.value)}
                        onKeyDown={addNumber}
                        onBlur={addFromInput}
                        onPaste={(e) => {
                          const paste = e.clipboardData.getData('text');
                          if (paste.includes('\n') || paste.includes('\r') || paste.includes('\t')) {
                            e.preventDefault();
                            processNumbersValue(paste);
                          }
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>💡 Cole uma coluna do Excel para processar instantaneamente.</span>
                      <button onClick={clearNumbers} style={{ color: 'var(--error)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '5px' }}>
                        <Trash2 size={14} /> Limpar tudo
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>2. Mensagens (Templates Variados)</h3>
                      <div className="info-tooltip">
                        <HelpCircle size={14} />
                        <span className="tooltip-text">
                          Crie múltiplas variações da sua mensagem. O sistema irá rotacionar entre elas para cada contato, simulando um comportamento humano e evitando o bloqueio por padrão repetitivo.
                        </span>
                      </div>
                    </div>
                    <button onClick={addTemplate} className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', borderRadius: '10px' }}>
                      <Plus size={16} /> Adicionar Variação
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {templates.map((tpl, idx) => (
                      <div key={tpl.id} className="card" style={{ padding: '1.2rem', border: tpl.selected ? '2px solid var(--primary)' : '1px solid var(--border)', background: tpl.selected ? 'var(--primary-light)' : 'transparent' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <input type="checkbox" checked={tpl.selected} onChange={() => toggleTemplateSelection(tpl.id)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.5px' }}>VARIAÇÃO {idx + 1}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <button onClick={() => setEditingTemplate(editingTemplate === tpl.id ? null : tpl.id)} className="btn-icon" style={{ color: 'var(--primary)' }}>
                              <RefreshCw size={14} />
                            </button>
                            <button onClick={() => deleteTemplate(tpl.id)} className="btn-icon" style={{ color: 'var(--error)' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {editingTemplate === tpl.id ? (
                          <textarea 
                            className="textarea"
                            style={{ minHeight: '80px', fontSize: '0.85rem' }}
                            value={tpl.text}
                            onChange={(e) => updateTemplateText(tpl.id, e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <div style={{ fontSize: '0.85rem', opacity: 0.8, minHeight: '60px', whiteSpace: 'pre-wrap' }}>
                             {tpl.text || <em style={{ opacity: 0.4 }}>Sem conteúdo...</em>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                      className="btn-primary" 
                      id="start-send-btn"
                      style={{ flex: 1, padding: '1.2rem', position: 'relative', minHeight: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }} 
                      onClick={executeSend} 
                      disabled={campaignRunning}
                    >
                      {campaignRunning ? (
                        <>
                          <RefreshCw size={22} className="spin" /> 
                          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            {campaignCountdown 
                              ? `AGUARDANDO: ${campaignCountdown.timeLeft}s` 
                              : 'ENVIANDO MENSAGENS...'}
                          </span>
                        </>
                      ) : (
                        <><Send size={22} /> INICIAR DISPARO IMEDIATO</>
                      )}
                    </button>
                    
                    {campaignRunning && campaignCountdown?.type === 'batch' && (
                      <div className="status-badge" style={{ background: 'var(--warning)', color: '#000', animation: 'pulse 1s infinite' }}>
                        PAUSA DE LOTE ATIVA
                      </div>
                    )}
                  </div>
              </div>

              {/* Card de Relatório / Logs */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3>Relatório de Envios</h3>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.2rem' }}>{logs.length} registros</p>
                  </div>
                  <div className="export-menu">
                    <button className="btn-secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
                      <Download size={18} /> Exportar <ChevronDown size={14} />
                    </button>
                    {showExportMenu && (
                      <div className="export-dropdown">
                        <div className="export-item" onClick={() => exportReport('xlsx')}>
                          <FileSpreadsheet size={16} /> Excel (.xlsx)
                        </div>
                        <div className="export-item" onClick={() => exportReport('csv')}>
                          <FileText size={16} /> CSV (.csv)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Número</th>
                        <th>WhatsApp</th>
                        <th>Status</th>
                        <th>Mensagem/Erro</th>
                        <th>Horário</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', opacity: 0.4 }}>Aguardando início dos disparos...</td>
                        </tr>
                      )}
                      {logs.map((log, idx) => (
                        <tr key={idx}>
                          <td>{log.number}</td>
                          <td><span style={{ color: 'var(--primary)', fontWeight: 700 }}>SIM</span></td>
                          <td><span className={`badge-${log.status}`}>{log.status.toUpperCase()}</span></td>
                          <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8rem' }}>
                            {log.error ? <span style={{ color: 'var(--error)' }}>{log.error}</span> : log.text || 'Mensagem enviada'}
                          </td>
                          <td style={{ opacity: 0.5, fontSize: '0.8rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      ) : (
        <main className="main-content">
          <div className="container">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Configurações do Sistema</h1>
            
            <div className="card" style={{ maxWidth: '800px' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>Conexões WhatsApp</h3>
              <p style={{ marginBottom: '1.5rem', opacity: 0.6, fontSize: '0.9rem' }}>Escolha como deseja conectar o sistema ao WhatsApp para realizar os disparos.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div 
                  onClick={() => setConnectionType('qrcode')}
                  style={{ 
                    padding: '1.5rem', 
                    borderRadius: '16px', 
                    border: `2px solid ${connectionType === 'qrcode' ? 'var(--primary)' : 'var(--card-border)'}`,
                    background: connectionType === 'qrcode' ? 'var(--primary-bg)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                   <Smartphone size={32} style={{ marginBottom: '1rem', color: connectionType === 'qrcode' ? 'var(--primary)' : 'inherit' }} />
                   <h4 style={{ marginBottom: '0.4rem' }}>WhatsApp Web (QR Code)</h4>
                   <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Conexão direta escaneando o código. Mais simples de configurar.</p>
                </div>

                <div 
                  onClick={() => setConnectionType('api')}
                  style={{ 
                    padding: '1.5rem', 
                    borderRadius: '16px', 
                    border: `2px solid ${connectionType === 'api' ? 'var(--primary)' : 'var(--card-border)'}`,
                    background: connectionType === 'api' ? 'var(--primary-bg)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                   <Zap size={32} style={{ marginBottom: '1rem', color: connectionType === 'api' ? 'var(--primary)' : 'inherit' }} />
                   <h4 style={{ marginBottom: '0.4rem' }}>WhatsApp Service (API)</h4>
                   <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Conexão via API oficial ou serviços terceiros. Mais estável para grandes volumes.</p>
                </div>
              </div>

              {connectionType === 'api' && (
                <div style={{ display: 'grid', gap: '1.5rem', borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="option-group">
                      <label className="input-label">URL da API Service</label>
                      <input 
                        type="text" className="textarea" style={{ minHeight: 'auto', padding: '0.8rem' }} 
                        placeholder="https://api.seuservico.com"
                        value={apiConfig.apiUrl}
                        onChange={(e) => setApiConfig({...apiConfig, apiUrl: e.target.value})}
                      />
                    </div>
                    <div className="option-group">
                      <label className="input-label">Token / API Key</label>
                      <input 
                        type="password" className="textarea" style={{ minHeight: 'auto', padding: '0.8rem' }} 
                        placeholder="••••••••••••••••"
                        value={apiConfig.apiKey}
                        onChange={(e) => setApiConfig({...apiConfig, apiKey: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="option-group">
                    <label className="input-label">ID da Instância (Instance ID)</label>
                    <input 
                      type="text" className="textarea" style={{ minHeight: 'auto', padding: '0.8rem' }} 
                      placeholder="Identificador da estância WhatsApp"
                      value={apiConfig.instanceId}
                      onChange={(e) => setApiConfig({...apiConfig, instanceId: e.target.value})}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn-primary" style={{ width: 'fit-content' }}>
                      <Check size={18} /> Salvar Configurações
                    </button>
                  </div>
                </div>
              )}

              {connectionType === 'qrcode' && (
                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '2rem', textAlign: 'center' }}>
                  <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Status da Conexão QR:</p>
                  <div className={`status-badge ${status}`} style={{ marginBottom: '1rem' }}>
                    {status === 'ready' ? <><Check size={16} /> WhatsApp Conectado</> : <><AlertCircle size={16} /> Aguardando Conexão</>}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn-secondary" onClick={() => window.location.reload()}><RefreshCw size={16} /> Recarregar</button>
                    {status === 'ready' && (
                      <button className="btn-secondary" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={handleDisconnect}>
                        <LogOut size={16} /> Desconectar WhatsApp
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '1.5rem' }}>Retorne ao menu 'Disparador' para escanear o QR Code em tempo real.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
