'use client';

import { useState } from 'react';
import { Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        setError('Incorrect password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* ScOp logo */}
        <div style={styles.logoRow}>
          <img
            src="https://scopvc.com/wp-content/uploads/2025/08/logo-1.png"
            alt="ScOp"
            style={styles.logo}
          />
        </div>

        <div style={styles.divider} />

        <p style={styles.subtitle}>Portfolio Meeting</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrap}>
            <Lock size={14} color="var(--cream-40)" style={{ flexShrink: 0 }} />
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoFocus
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !password}
            style={styles.btn}
          >
            {loading ? (
              <Loader2 size={14} className="spinner" />
            ) : (
              <>Enter <ArrowRight size={14} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--black)',
  },
  card: {
    background: 'var(--surface-1)',
    border: '1px solid var(--cream-08)',
    padding: '40px',
    width: '360px',
    maxWidth: '90vw',
    boxShadow: 'var(--shadow-lg)',
  },
  logoRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  logo: {
    height: '28px',
    filter: 'brightness(0) invert(0.94) sepia(0.08) saturate(0.3) hue-rotate(15deg)',
  },
  divider: {
    height: '1px',
    background: 'var(--cream-08)',
    margin: '0 0 16px',
  },
  subtitle: {
    fontSize: '13px',
    fontWeight: 400,
    letterSpacing: '0.02em',
    color: 'var(--cream-40)',
    textAlign: 'center',
    marginBottom: '28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--surface-2)',
    border: '1px solid var(--cream-12)',
    padding: '0 12px',
  },
  input: {
    border: 'none',
    background: 'transparent',
    flex: 1,
    padding: '12px 0',
  },
  error: {
    fontSize: '12px',
    color: 'var(--red)',
  },
  btn: {
    width: '100%',
    justifyContent: 'center',
    padding: '10px 16px',
  },
};
