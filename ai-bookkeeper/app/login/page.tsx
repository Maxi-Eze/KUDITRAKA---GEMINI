'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Zap, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import styles from '../signup/page.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    if (!success) setError(true);
    setIsLoading(false);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authDecoration}>
        <div className={styles.glow} />
      </div>

      <div className={styles.authCardWrapper}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <img src="/logo-icon.png" alt="K" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span className={styles.logoText}>Kuditraka.Ai</span>
        </div>

        <div className={`glass-card ${styles.authCard}`}>
          <div className={styles.cardHeader}>
            <h1>Welcome Back</h1>
            <p>Enter your credentials to access your dashboard</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div style={{ 
                padding: '0.75rem', 
                background: 'rgba(244,63,94,0.1)', 
                border: '1px solid var(--accent-red)', 
                borderRadius: '8px',
                color: 'var(--accent-red)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} /> Invalid email or password.
              </div>
            )}

            <div className={styles.inputGroup}>
              <label><Mail size={14} /> Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="name@business.com" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label><Lock size={14} /> Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={isLoading}>
            <LogIn size={18} /> {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          </form>

          <p className={styles.footerText}>
            Don't have an account? <Link href="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
