'use client';

import React, { useState, useEffect } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/');
      } else {
        setError('Erro ao fazer login. Verifique suas credenciais.');
      }
    } catch (err: any) {
      setError(err.errors[0]?.message || 'Ocorreu um erro ao entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container">
      {/* Cinematic Universe Background */}
      <div className="cosmos-background">
        <div className="nebula-emerald"></div>
        <div className="nebula-indigo"></div>
        <div className="starfield"></div>
        
        {/* Floating Glass Orbs and Geometrics */}
        <div className="float-orb orb-green"></div>
        <div className="float-orb orb-cyan"></div>
        <div className="saturn-ring"></div>
        
        <div className="crystal shape-1"></div>
        <div className="crystal shape-2"></div>
        <div className="crystal shape-3"></div>
      </div>

      <div className="content-shield">
        <div className="glass-panel">
          {/* Brand Identity - Compact Mode with Squared elements */}
          <div className="brand-header">
            <div className="icon-bolt">
              <Zap size={32} fill="#25d366" color="#25d366" />
            </div>
            <h1 className="brand-title">ZapFlow</h1>
            <p className="brand-motto">Workflow simplified. Access your account.</p>
          </div>

          <form onSubmit={handleSignIn} className="secure-form">
            <div className="field-group">
              <label>Email Address</label>
              <div className="input-box">
                <Mail size={16} className="icon-field" />
                <input
                  type="email"
                  placeholder="john.doe@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <div className="label-row-alt">
                <label>Password</label>
                <Link href="#" className="link-forgot-pass">Forgot?</Link>
              </div>
              <div className="input-box">
                <Lock size={16} className="icon-field" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye-toggle-btn"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert-box">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="action-btn" disabled={loading || !isLoaded}>
              {loading ? (
                <RefreshCw size={22} className="spin-loader" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="panel-footer">
            <p>Don't have an account? <Link href="/sign-up">Sign Up</Link></p>
          </div>
        </div>
        
        <p className="copyright-label">© 2026 ZapFlow • Integrated System</p>
      </div>

      <style jsx>{`
        .portal-container {
          min-height: 100vh;
          background: #010204;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
          color: #fff;
        }

        .cosmos-background {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .nebula-emerald {
          position: absolute;
          top: 15%;
          left: 10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(37, 211, 102, 0.12) 0%, transparent 75%);
          filter: blur(80px);
          animation: slowPulse 12s infinite alternate ease-in-out;
        }

        .nebula-indigo {
          position: absolute;
          bottom: 10%;
          right: 5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 75%);
          filter: blur(100px);
          animation: slowPulse 15s infinite alternate-reverse ease-in-out;
        }

        @keyframes slowPulse {
          from { transform: scale(1) translate(0, 0); opacity: 0.6; }
          to { transform: scale(1.05) translate(20px, 15px); opacity: 0.8; }
        }

        .starfield {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 150px 150px;
          opacity: 0.12;
        }

        .float-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(2px);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 0 10px rgba(255,255,255,0.05);
        }

        .orb-green { width: 100px; height: 100px; top: 15%; right: 15%; background: radial-gradient(circle at 30% 30%, rgba(37, 211, 102, 0.15), transparent); animation: floatOrb 25s infinite linear; }
        .orb-cyan { width: 70px; height: 70px; bottom: 20%; left: 10%; background: radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.1), transparent); animation: floatOrb 18s infinite linear reverse; }

        @keyframes floatOrb {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }

        .saturn-ring {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(37, 211, 102, 0.2), transparent);
          transform: rotate(-20deg);
          opacity: 0.4;
        }

        .crystal {
          position: absolute;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          z-index: 1;
        }

        .shape-1 { width: 90px; height: 90px; top: 8%; left: 12%; clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); transform: rotate(15deg); }
        .shape-2 { width: 60px; height: 60px; bottom: 8%; right: 8%; clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }

        /* --- SQUARED Glass Panel --- */
        .content-shield {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 410px;
          padding: 15px;
        }

        .glass-panel {
          background: rgba(18, 22, 28, 0.45);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border-radius: 12px; /* Squared effect */
          padding: 2.8rem 2.2rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 40px 80px -20px rgba(0, 0, 0, 0.8),
            inset 0 0 1px 1px rgba(255, 255, 255, 0.05);
          box-sizing: border-box;
          animation: panelEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes panelEntry {
          from { opacity: 0; transform: scale(0.97) translateY(15px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .brand-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .icon-bolt {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: rgba(37, 211, 102, 0.08);
          border: 1px solid rgba(37, 211, 102, 0.3);
          border-radius: 8px; /* Squared */
          margin-bottom: 1.2rem;
          box-shadow: 0 0 30px rgba(37, 211, 102, 0.15);
        }

        .brand-title {
          font-size: 2.4rem;
          font-weight: 900;
          letter-spacing: -2px;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .brand-motto {
          color: rgba(255, 255, 255, 0.35);
          font-size: 0.85rem;
          font-weight: 400;
        }

        /* --- Secure Form - Squared Layout --- */
        .secure-form {
          display: flex;
          flex-direction: column;
          gap: 1.3rem;
        }

        .field-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.25);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .label-row-alt {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .link-forgot-pass {
          font-size: 0.75rem;
          color: #25d366;
          text-decoration: none;
          font-weight: 800;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .link-forgot-pass:hover { opacity: 1; }

        .input-box {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px; /* Squared */
          padding: 0 1.1rem;
          transition: all 0.3s ease;
        }

        .input-box:focus-within {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(37, 211, 102, 0.4);
        }

        .icon-field {
          color: rgba(255, 255, 255, 0.2);
        }

        .input-box:focus-within .icon-field {
          color: #25d366;
        }

        .input-box input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 0.9rem;
          color: #fff;
          font-size: 0.95rem;
          outline: none;
        }

        .eye-toggle-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.15);
          cursor: pointer;
          padding: 0;
        }

        .eye-toggle-btn:hover { color: #fff; }

        .action-btn {
          margin-top: 0.4rem;
          background: linear-gradient(135deg, #25d366, #128c7e);
          color: #fff;
          border: none;
          padding: 1.1rem;
          border-radius: 6px; /* Squared */
          font-weight: 900;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 12px 25px rgba(37, 211, 102, 0.2);
        }

        .action-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(37, 211, 102, 0.3);
        }

        .alert-box {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(239, 68, 68, 0.08);
          color: #fca5a5;
          padding: 0.8rem;
          border-radius: 4px; /* Squared */
          font-size: 0.8rem;
        }

        .panel-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.25);
        }

        .panel-footer a {
          color: #25d366;
          font-weight: 800;
          text-decoration: none;
        }

        .copyright-label {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.1);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .spin-loader { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .glass-panel { padding: 2.2rem 1.5rem; }
          .brand-title { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
