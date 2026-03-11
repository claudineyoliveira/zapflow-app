import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0b0d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
    }}>
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,211,102,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(18,140,126,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'linear-gradient(135deg, #25d366, #128c7e)', borderRadius: '18px', marginBottom: '1rem', boxShadow: '0 8px 32px rgba(37,211,102,0.3)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f1f3f4', letterSpacing: '-1px' }}>
            Zap<span style={{ color: '#25d366' }}>Flow</span>
          </h1>
        </div>

        <SignUp
          appearance={{
            variables: {
              colorPrimary: '#25d366',
              colorBackground: '#12141880',
              colorText: '#f1f3f4',
              colorInputBackground: 'rgba(0,0,0,0.3)',
              colorInputText: '#f1f3f4',
              borderRadius: '12px',
              fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            },
            elements: {
              card: { boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(37,211,102,0.1)', background: 'rgba(18,20,24,0.95)', backdropFilter: 'blur(20px)' },
              headerTitle: { color: '#f1f3f4', fontWeight: 800 },
              headerSubtitle: { color: '#9aa0a6' },
              formButtonPrimary: { background: 'linear-gradient(135deg, #25d366, #128c7e)', boxShadow: '0 6px 20px rgba(37,211,102,0.35)', fontWeight: 800 },
              footerActionLink: { color: '#25d366' },
              formFieldLabel: { color: '#9aa0a6' },
            }
          }}
        />
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');`}</style>
    </div>
  );
}
