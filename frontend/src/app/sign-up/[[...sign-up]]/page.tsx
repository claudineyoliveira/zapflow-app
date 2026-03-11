'use client';

import React, { useState, useEffect } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, RefreshCw, User, Check, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const signUpData = useSignUp() as any;
  const isLoaded = signUpData.isLoaded;
  const signUp = signUpData.signUp;
  const setActive = signUpData.setActive;
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      await signUp.create({
        firstName,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerifying(true);
    } catch (err: any) {
      setError(err.errors[0]?.message || 'Ocorreu um erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/');
      } else {
        setError('O código está incorreto. Tente novamente.');
      }
    } catch (err: any) {
      setError(err.errors[0]?.message || 'Erro ao verificar código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container">
      <div className="cosmos-background">
        <div className="nebula-emerald"></div>
        <div className="nebula-indigo"></div>
        <div className="starfield"></div>
        <div className="float-orb orb-green"></div>
        <div className="crystal shape-1"></div>
      </div>

      <div className="content-shield">
        <div className="glass-panel">
          {!verifying ? (
            <>
              <div className="brand-header">
                <div className="icon-bolt">
                  <Zap size={32} fill="#25d366" color="#25d366" />
                </div>
                <h1 className="brand-title">ZapFlow</h1>
                <p className="brand-motto">Create your account to start scaling.</p>
              </div>

              <form onSubmit={handleSubmit} className="secure-form">
                <div className="field-group">
                  <label>Full Name</label>
                  <div className="input-box">
                    <User size={16} className="icon-field" />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                  <label>Password</label>
                  <div className="input-box">
                    <Lock size={16} className="icon-field" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-toggle-btn">
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
                    <>
                      <span>Sign Up</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="brand-header">
                <div className="icon-bolt" style={{ borderRadius: '8px', width: '64px', height: '64px' }}>
                  <ShieldCheck size={32} color="#25d366" />
                </div>
                <h1 className="brand-title">Verify</h1>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Sent to <strong>{email}</strong></p>
              </div>

              <form onSubmit={handleVerify} className="secure-form">
                <div className="field-group">
                  <label>6-Digit Code</label>
                  <div className="input-box code-box">
                    <input
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      className="code-input"
                    />
                  </div>
                </div>

                {error && (
                  <div className="alert-box">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="action-btn" disabled={loading}>
                  {loading ? (
                    <RefreshCw size={22} className="spin-loader" />
                  ) : (
                    <span>Verify Account</span>
                  )}
                </button>
                
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', marginTop: '1.5rem' }}>
                  No code? <button type="button" onClick={() => signUp.prepareEmailAddressVerification({ strategy: 'email_code' })} style={{ color: '#25d366', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Resend</button>
                </p>
              </form>
            </>
          )}

          <div className="panel-footer">
            <p>Already have an account? <Link href="/sign-in">Sign In</Link></p>
          </div>
        </div>
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
        .cosmos-background { position: absolute; inset: 0; z-index: 0; }
        .nebula-emerald {
          position: absolute; top: 15%; left: 10%; width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(37, 211, 102, 0.12) 0%, transparent 75%);
          filter: blur(80px);
        }
        .nebula-indigo {
          position: absolute; bottom: 10%; right: 5%; width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 75%);
          filter: blur(100px);
        }
        .starfield {
          position: absolute; inset: 0;
          background-image: radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0));
          background-repeat: repeat; background-size: 200px 200px; opacity: 0.12;
        }
        .float-orb {
          position: absolute; border-radius: 50%; filter: blur(2px);
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
        }
        .crystal { position: absolute; background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .shape-1 { width: 100px; height: 100px; top: 8%; left: 10%; clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); transform: rotate(15deg); }

        .content-shield { position: relative; z-index: 10; width: 100%; max-width: 440px; padding: 15px; }
        .glass-panel {
          background: rgba(18, 22, 28, 0.45); backdrop-filter: blur(40px) saturate(200%);
          border-radius: 12px; padding: 2.8rem 2.2rem; border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.8);
        }

        .brand-header { text-align: center; margin-bottom: 2rem; }
        .icon-bolt {
          display: inline-flex; align-items: center; justify-content: center;
          width: 64px; height: 64px; background: rgba(37, 211, 102, 0.06);
          border: 1px solid rgba(37, 211, 102, 0.25); border-radius: 8px;
          margin-bottom: 1.2rem; box-shadow: 0 0 30px rgba(37, 211, 102, 0.12);
        }
        .brand-title { font-size: 2.4rem; font-weight: 950; letter-spacing: -2px; }
        .brand-motto { color: rgba(255, 255, 255, 0.35); font-size: 0.85rem; }

        .secure-form { display: flex; flex-direction: column; gap: 1.2rem; }
        .field-group label { display: block; font-size: 0.75rem; font-weight: 700; color: rgba(255, 255, 255, 0.25); text-transform: uppercase; margin-bottom: 0.5rem; }
        .input-box {
          display: flex; align-items: center; background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 0 1.2rem;
        }
        .input-box:focus-within { border-color: rgba(37, 211, 102, 0.4); }
        .icon-field { color: rgba(255, 255, 255, 0.2); }
        .input-box:focus-within .icon-field { color: #25d366; }
        .input-box input { flex: 1; background: transparent; border: none; padding: 0.9rem; color: #fff; outline: none; }
        
        .code-box { border-color: rgba(37, 211, 102, 0.2); background: rgba(37, 211, 102, 0.03); }
        .code-input { text-align: center; font-size: 2rem !important; letter-spacing: 0.8rem; font-weight: 900; color: #25d366 !important; }

        .action-btn {
          background: linear-gradient(135deg, #25d366, #128c7e); color: #fff;
          border: none; padding: 1.2rem; border-radius: 6px; font-weight: 900;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.8rem;
          box-shadow: 0 12px 25px rgba(37, 211, 102, 0.2);
        }
        .action-btn:hover { transform: translateY(-3px); filter: brightness(1.1); }
        
        .alert-box { display: flex; align-items: center; gap: 0.6rem; background: rgba(239, 68, 68, 0.08); padding: 0.9rem; border-radius: 4px; color: #fca5a5; font-size: 0.8rem; }

        .panel-footer { margin-top: 2rem; text-align: center; font-size: 0.9rem; color: rgba(255, 255, 255, 0.25); }
        .panel-footer a { color: #25d366; font-weight: 800; text-decoration: none; }

        .spin-loader { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
