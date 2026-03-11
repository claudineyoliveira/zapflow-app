'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  useEffect(() => {
    setMounted(true);
    // Se já logado, redireciona
    const user = localStorage.getItem('zapflow_user');
    if (user) router.replace('/');
  }, [router]);

  if (!mounted) return null;

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: e.target.value });
    setFeedback(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return setFeedback({ type: 'error', msg: 'Preencha e-mail e senha.' });
    setLoading(true);

    await new Promise(r => setTimeout(r, 700)); // simula latência

    const users: any[] = JSON.parse(localStorage.getItem('zapflow_users') || '[]');
    const found = users.find((u: any) => u.email === form.email && u.password === btoa(form.password));

    if (!found) {
      setFeedback({ type: 'error', msg: 'E-mail ou senha incorretos.' });
      setLoading(false);
      return;
    }

    localStorage.setItem('zapflow_user', JSON.stringify({ name: found.name, email: found.email, photo: found.photo || undefined }));
    setFeedback({ type: 'success', msg: `Bem-vindo de volta, ${found.name}!` });
    setTimeout(() => router.replace('/'), 800);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm)
      return setFeedback({ type: 'error', msg: 'Preencha todos os campos.' });
    if (form.password !== form.confirm)
      return setFeedback({ type: 'error', msg: 'As senhas não coincidem.' });
    if (form.password.length < 6)
      return setFeedback({ type: 'error', msg: 'Senha deve ter pelo menos 6 caracteres.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setFeedback({ type: 'error', msg: 'E-mail inválido.' });

    setLoading(true);
    await new Promise(r => setTimeout(r, 700));

    const users: any[] = JSON.parse(localStorage.getItem('zapflow_users') || '[]');
    if (users.find((u: any) => u.email === form.email))
      return (setFeedback({ type: 'error', msg: 'E-mail já cadastrado.' }), setLoading(false));

    users.push({ name: form.name, email: form.email, password: btoa(form.password) });
    localStorage.setItem('zapflow_users', JSON.stringify(users));
    localStorage.setItem('zapflow_user', JSON.stringify({ name: form.name, email: form.email }));

    setFeedback({ type: 'success', msg: `Conta criada! Bem-vindo, ${form.name}!` });
    setTimeout(() => router.replace('/'), 800);
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setForm({ name: '', email: '', password: '', confirm: '' });
    setFeedback(null);
    setShowPassword(false);
    setShowConfirm(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0b0d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(37,211,102,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(18,140,126,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        margin: '1rem',
        animation: 'fadeUp 0.5s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px', height: '60px',
            background: 'linear-gradient(135deg, #25d366, #128c7e)',
            borderRadius: '18px',
            marginBottom: '1rem',
            boxShadow: '0 8px 32px rgba(37,211,102,0.3)',
          }}>
            <Zap size={28} fill="#fff" color="#fff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f1f3f4', letterSpacing: '-1px', lineHeight: 1 }}>
            Zap<span style={{ color: '#25d366' }}>Flow</span>
          </h1>
          <p style={{ color: '#9aa0a6', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Disparo inteligente no WhatsApp
          </p>
        </div>

        {/* Card principal */}
        <div style={{
          background: 'rgba(18,20,24,0.95)',
          border: '1px solid rgba(37,211,102,0.1)',
          borderRadius: '24px',
          padding: '2.5rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}>
          {/* Toggle Login / Cadastro */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '2rem',
          }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  padding: '0.7rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  transition: 'all 0.25s ease',
                  background: mode === m ? 'linear-gradient(135deg, #25d366, #128c7e)' : 'transparent',
                  color: mode === m ? '#fff' : '#9aa0a6',
                  boxShadow: mode === m ? '0 4px 12px rgba(37,211,102,0.3)' : 'none',
                }}
              >
                {m === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          {/* Titulo */}
          <div style={{ marginBottom: '1.8rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f3f4' }}>
              {mode === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}
            </h2>
            <p style={{ color: '#9aa0a6', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              {mode === 'login'
                ? 'Entre com suas credenciais para continuar.'
                : 'Preencha os dados abaixo para começar.'}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Nome (só no cadastro) */}
            {mode === 'register' && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <label style={labelStyle}>Nome completo</label>
                <div style={inputWrapStyle}>
                  <User size={16} style={inputIconStyle} />
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Seu nome"
                    value={form.name}
                    onChange={setField('name')}
                    style={inputStyle}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* E-mail */}
            <div>
              <label style={labelStyle}>E-mail</label>
              <div style={inputWrapStyle}>
                <Mail size={16} style={inputIconStyle} />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={setField('email')}
                  style={inputStyle}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label style={labelStyle}>Senha</label>
              <div style={{ ...inputWrapStyle, paddingRight: '0.8rem' }}>
                <Lock size={16} style={inputIconStyle} />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  value={form.password}
                  onChange={setField('password')}
                  style={{ ...inputStyle, paddingRight: '0' }}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtnStyle}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmar senha (só no cadastro) */}
            {mode === 'register' && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <label style={labelStyle}>Confirmar senha</label>
                <div style={{ ...inputWrapStyle, paddingRight: '0.8rem' }}>
                  <Lock size={16} style={inputIconStyle} />
                  <input
                    id="auth-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={form.confirm}
                    onChange={setField('confirm')}
                    style={{ ...inputStyle, paddingRight: '0' }}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={eyeBtnStyle}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Indicator de senhas iguais */}
                {form.confirm && (
                  <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                    {form.password === form.confirm
                      ? <><Check size={12} style={{ color: '#25d366' }} /><span style={{ color: '#25d366' }}>Senhas coincidem</span></>
                      : <><AlertCircle size={12} style={{ color: '#d92d20' }} /><span style={{ color: '#d92d20' }}>Senhas não coincidem</span></>
                    }
                  </div>
                )}
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div style={{
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: feedback.type === 'error' ? 'rgba(217,45,32,0.1)' : 'rgba(37,211,102,0.1)',
                color: feedback.type === 'error' ? '#d92d20' : '#25d366',
                border: `1px solid ${feedback.type === 'error' ? 'rgba(217,45,32,0.2)' : 'rgba(37,211,102,0.2)'}`,
                animation: 'fadeUp 0.2s ease',
              }}>
                {feedback.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                {feedback.msg}
              </div>
            )}

            {/* Botão submit */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '1rem',
                borderRadius: '14px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 800,
                fontSize: '1rem',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.7rem',
                background: loading ? 'rgba(37,211,102,0.4)' : 'linear-gradient(135deg, #25d366, #128c7e)',
                color: '#fff',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(37,211,102,0.35)',
                transition: 'all 0.3s ease',
                transform: loading ? 'none' : undefined,
              }}
              onMouseEnter={e => !loading && ((e.currentTarget.style.transform = 'translateY(-2px)'), (e.currentTarget.style.boxShadow = '0 10px 28px rgba(37,211,102,0.45)'))}
              onMouseLeave={e => !loading && ((e.currentTarget.style.transform = 'none'), (e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,0.35)'))}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Processando...
                </span>
              ) : (
                <>
                  {mode === 'login' ? 'Entrar no ZapFlow' : 'Criar minha conta'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Switch de modo */}
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#9aa0a6' }}>
            {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#25d366', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit',
                textDecoration: 'underline', textUnderlineOffset: '3px',
              }}
            >
              {mode === 'login' ? 'Criar conta grátis' : 'Fazer login'}
            </button>
          </p>
        </div>

        {/* Rodapé */}
        <p style={{ textAlign: 'center', color: '#4a5056', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          © 2026 ZapFlow • Disparo Inteligente
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #1a1d22 inset !important;
          -webkit-text-fill-color: #f1f3f4 !important;
        }
      `}</style>
    </div>
  );
}

// --- Estilos utilitários ---
const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.4rem',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#9aa0a6',
  letterSpacing: '0.3px',
  textTransform: 'uppercase',
};

const inputWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: 'rgba(0,0,0,0.3)',
  border: '1.5px solid rgba(255,255,255,0.06)',
  borderRadius: '12px',
  padding: '0 0.8rem',
  gap: '0.6rem',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const inputIconStyle: React.CSSProperties = {
  color: '#9aa0a6',
  flexShrink: 0,
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#f1f3f4',
  fontSize: '0.95rem',
  padding: '0.85rem 0',
  fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
};

const eyeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#9aa0a6',
  display: 'flex',
  alignItems: 'center',
  padding: '0',
  flexShrink: 0,
  transition: 'color 0.2s',
};
