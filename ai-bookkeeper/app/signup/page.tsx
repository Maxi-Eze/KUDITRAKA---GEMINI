'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  Building2, Mail, Phone, Lock, ChevronRight, Bot, 
  User as UserIcon, MapPin, Briefcase, Users, Hash 
} from 'lucide-react';
import styles from './page.module.css';

export default function SignupPage() {
  const { signup } = useAuth();
  const [view, setView] = useState<'welcome' | 'form'>('welcome');
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [form, setForm] = useState({
    businessName: '',
    email: '',
    phone: '',
    businessType: 'Retail',
    password: '',
    ownerName: '',
    address: '',
    cacNumber: '',
    businessSize: 'Solo',
    salesChannel: 'Physical shop',
  });

  const [misaMessage, setMisaMessage] = useState("Hi! I'm Misa. Let's get your business started.");

  useEffect(() => {
    if (view === 'form') {
      const messages = [
        "",
        "First, what is your business called, and who's the visionary behind it?",
        "What's your email, and select a strong password;",
        "Where can clients find you? And your phone number?",
        "Last one! Any official CAC registration number? You can skip this if you're not sure."
      ];
      setMisaMessage(messages[step]);
    }
  }, [step, view]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signup(form);
    setIsLoading(false);
  };

  const handleSignupClick = async () => {
    setValidationError('');
    setIsLoading(true);
    await signup(form);
    setIsLoading(false);
  };

  const handleNext = () => {
    setValidationError('');
    if (step === 1) {
      if (!form.businessName.trim() || !form.ownerName.trim()) {
        return setValidationError('Please provide both your business name and owner name.');
      }
    } else if (step === 2) {
      if (!form.email.includes('@') || !form.email.includes('.')) {
        return setValidationError('Please enter a valid email address.');
      }
      if (form.password.length < 6) {
        return setValidationError('Your password must be at least 6 characters long.');
      }
      if (form.password !== confirmPassword) {
        return setValidationError('The passwords do not match. Please try again.');
      }
    } else if (step === 3) {
      if (!form.phone.trim() || !form.address.trim()) {
        return setValidationError('Please provide your phone number and address.');
      }
    }
    setStep(step + 1);
  };

  return (
    <>
      <div className={styles.authContainer}>
      <div className={styles.authDecoration}>
        <div className={styles.glow} />
        <div className={styles.abstractShapes} />
      </div>

        <div className={styles.authCardWrapper} key={view}>
          {view === 'welcome' ? (
            <div className={`${styles.heroSection} ${styles.animateIn}`}>
              <div className={styles.misaHero}>
                <div className={styles.misaAvatar}>
                  <Bot size={64} />
                  <div className={styles.misaGlow} />
                </div>
                <div className={styles.misaChatBubble}>
                  "Hi! I'm Misa. I'll handle your books so you can handle the magic."
                </div>
              </div>
              
              <h1 className={styles.heroTitle}>The future of <br /><span>business finance.</span></h1>
              <p className={styles.heroSubtitle}>
                Experience the power of AI-driven bookkeeping. 
                Simple, beautiful, and built for your growth.
              </p>
              <button 
                className="btn btn-primary" 
                style={{ padding: '1.2rem 3rem', fontSize: '1.1rem', borderRadius: '100px' }}
                onClick={() => setView('form')}
              >
                Get Started <ChevronRight size={20} />
              </button>
              <p className={styles.heroFooter}>
                Already using Kuditraka? <Link href="/login">Log In</Link>
              </p>
            </div>
          ) : (
            <div className={styles.animateIn}>
              <div className={styles.misaConversational}>
                <div className={styles.misaHeader}>
                  <div className={styles.smallAvatar}>
                    <Bot size={24} />
                  </div>
                  <div className={styles.misaStatus}>
                    <span className={styles.misaName}>Misa</span>
                    <span className={styles.statusDot} />
                  </div>
                </div>

                <div className={styles.chatMessage}>
                  {misaMessage}
                </div>

                <div className={styles.stepContainer}>
                  <div className={styles.stepProgress}>
                    {[1, 2, 3, 4].map(s => (
                      <div key={s} className={`${styles.dot} ${step >= s ? styles.dotActive : ''}`} />
                    ))}
                  </div>

                  <div className={styles.formPhase}>
                    {step === 1 && (
                      <div className={styles.phaseContent}>
                        <div className={styles.inputWrapper}>
                          <Building2 size={18} />
                          <input 
                            placeholder="My Business Name" 
                            className={styles.transparentInput}
                            autoFocus
                            value={form.businessName}
                            onChange={e => setForm({...form, businessName: e.target.value})}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <UserIcon size={18} />
                          <input 
                            placeholder="My Full Name" 
                            className={styles.transparentInput}
                            value={form.ownerName}
                            onChange={e => setForm({...form, ownerName: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className={styles.phaseContent}>
                        <div className={styles.inputWrapper}>
                          <Mail size={18} />
                          <input 
                            type="email"
                            placeholder="Email Address" 
                            className={styles.transparentInput}
                            autoFocus
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <Lock size={18} />
                          <input 
                            type="password"
                            placeholder="Choose Password" 
                            className={styles.transparentInput}
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <Lock size={18} />
                          <input 
                            type="password"
                            placeholder="Confirm Password" 
                            className={styles.transparentInput}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className={styles.phaseContent}>
                        <div className={styles.inputWrapper}>
                          <Phone size={18} />
                          <input 
                            type="tel"
                            placeholder="Phone Number" 
                            className={styles.transparentInput}
                            autoFocus
                            value={form.phone}
                            onChange={e => setForm({...form, phone: e.target.value})}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <MapPin size={18} />
                          <input 
                            placeholder="Business Address" 
                            className={styles.transparentInput}
                            value={form.address}
                            onChange={e => setForm({...form, address: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className={styles.phaseContent}>
                        <div className={styles.inputWrapper}>
                          <Hash size={18} />
                          <input 
                            placeholder="CAC Number (Optional)" 
                            className={styles.transparentInput}
                            autoFocus
                            value={form.cacNumber}
                            onChange={e => setForm({...form, cacNumber: e.target.value})}
                          />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                          We're ready to create your account!
                        </p>
                      </div>
                    )}

                    {validationError && (
                      <div style={{ color: 'var(--accent-red)', fontSize: '0.875rem', marginTop: '1rem', textAlign: 'center', fontWeight: 500 }}>
                        {validationError}
                      </div>
                    )}
                  </div>

                  <div className={styles.actionsRow}>
                    {step > 1 && (
                      <button className={styles.backBtn} onClick={() => { setValidationError(''); setStep(step - 1); }}>Back</button>
                    )}
                    {step < 4 ? (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '1rem 2.5rem', borderRadius: '100px' }}
                        onClick={handleNext}
                      >
                        Next <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '1rem 2.5rem', borderRadius: '100px' }}
                        onClick={handleSignupClick}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : <>Create My Account <ChevronRight size={18} /></>}
                      </button>
                    )}
                  </div>
                </div>

                <p className={styles.footerText}>
                  Already have an account? <Link href="/login">Log In</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
