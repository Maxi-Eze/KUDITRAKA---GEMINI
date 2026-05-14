'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Sparkles, Bot, CheckCircle, ArrowRight, Play, 
  ChevronRight, RotateCcw, Target, Heart, Shield, ShoppingCart,
  Store, Briefcase, Coffee, Factory, Package, Upload, Camera, FileText, Info
} from 'lucide-react';
import { BusinessSector } from '@/lib/types';
import styles from './page.module.css';
import { parseTransaction, formatAmount } from '@/lib/aiParser';

const DEMO_STEPS = [
  {
    text: 'Sold 5 bags of rice for 150,000 to Mr. Ade via Transfer',
    result: { type: 'income', amount: 150000, item: 'Rice', quantity: 5, customer: 'Mr. Ade', payment_method: 'Transfer' }
  },
  {
    text: 'Received 100k for Flour: 40k Cash and 60k Transfer',
    isBalanced: true,
    result: { type: 'income', amount: 100000, item: 'Flour', quantity: 1, customer: '', payment_method: 'Split (Cash/Transfer)' }
  },
  {
    text: 'Misa, how much have we spent on Fuel this week?',
    isQuery: true,
    queryResult: {
      answer: "You've spent a total of ₦28,500 on Fuel this week.",
      details: "Records: May 04 (₦12,500), May 06 (₦8,000), May 08 (₦8,000)"
    }
  }
];

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const [phase, setPhase] = useState<'sector' | 'inventory-setup' | 'movie' | 'sandbox' | 'finish'>('sector');
  
  // New Onboarding State
  const [selectedSector, setSelectedSector] = useState<BusinessSector>('Retail & Trade');
  const [inventoryEnabled, setInventoryEnabled] = useState(true);
  const [initialStock, setInitialStock] = useState([
    { name: '', stock: 0, price: 0 },
    { name: '', stock: 0, price: 0 },
    { name: '', stock: 0, price: 0 },
  ]);
  const [isScanning, setIsScanning] = useState(false);

  // Movie State
  const [movieStep, setMovieStep] = useState(0);
  const [movieText, setMovieText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Sandbox State
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [isSandboxThinking, setIsSandboxThinking] = useState(false);

  // Movie Logic
  useEffect(() => {
    if (phase !== 'movie') return;

    const currentStep = DEMO_STEPS[movieStep];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (movieText.length < currentStep.text.length) {
        timeout = setTimeout(() => {
          setMovieText(currentStep.text.slice(0, movieText.length + 1));
        }, 40);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
          setIsParsing(true);
        }, 800);
      }
    } else if (isParsing) {
      timeout = setTimeout(() => {
        setIsParsing(false);
        setShowResult(true);
      }, 1500);
    } else if (showResult) {
      timeout = setTimeout(() => {
        if (movieStep < DEMO_STEPS.length - 1) {
          setShowResult(false);
          setMovieText('');
          setIsTyping(true);
          setMovieStep(movieStep + 1);
        } else {
          setPhase('sandbox');
        }
      }, 2500);
    }

    return () => clearTimeout(timeout);
  }, [phase, movieStep, movieText, isTyping, isParsing, showResult]);

  const handleSandboxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxInput.trim()) return;
    
    setIsSandboxThinking(true);
    await new Promise(r => setTimeout(r, 1500));
    const result = parseTransaction(sandboxInput);
    setSandboxResult(result);
    setIsSandboxThinking(false);
  };

  return (
    <div className={styles.onboardContainer}>
      <div className={styles.onboardContent}>
        
        {/* Phase 1: Sector Selection */}
        {phase === 'sector' && (
          <div className={styles.personaScreen}>
            <div className={styles.badge}><Target size={14} /> <span>Step 1: Your Business</span></div>
            <h1 className={styles.title}>What kind of business do you run?</h1>
            <p className={styles.subtitle}>We'll configure Kuditraka.Ai to match your specific needs.</p>

            <div className={styles.personaGrid}>
              {[
                { id: 'Retail & Trade', label: 'Retail & Trade', icon: Store, desc: 'Shops, kiosks, and general commerce.', hasInv: true },
                { id: 'Professional Services', label: 'Professional Services', icon: Briefcase, desc: 'Consulting, agencies, and services.', hasInv: false },
                { id: 'Food & Catering', label: 'Food & Catering', icon: Coffee, desc: 'Restaurants, cafes, and food vendors.', hasInv: true },
                { id: 'Manufacturing', label: 'Manufacturing', icon: Factory, desc: 'Production, assembly, and workshops.', hasInv: true },
              ].map(s => (
                <button 
                  key={s.id}
                  className={`${styles.personaCard} ${selectedSector === s.id ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedSector(s.id as BusinessSector);
                    setInventoryEnabled(s.hasInv);
                  }}
                >
                  <div className={styles.cardIcon}><s.icon size={24} /></div>
                  <h3 className={styles.cardTitle}>{s.label}</h3>
                  <p className={styles.cardText}>{s.desc}</p>
                </button>
              ))}
            </div>

            <div className={styles.inventoryToggle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={18} color="var(--accent-green)" />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Enable Inventory Tracking?</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Keep track of stock levels and reorder points automatically.</p>
                </div>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={inventoryEnabled} 
                  onChange={(e) => setInventoryEnabled(e.target.checked)} 
                />
                <span className={styles.slider} />
              </label>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ marginTop: '2rem', width: '100%' }} 
              onClick={() => setPhase(inventoryEnabled ? 'inventory-setup' : 'movie')}
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Phase 2: Inventory Setup (Conditional) */}
        {phase === 'inventory-setup' && (
          <div className={styles.inventorySetupScreen}>
            <div className={styles.badge}><Package size={14} /> <span>Step 2: Initial Stock</span></div>
            <h1 className={styles.title}>Let's add your stock</h1>
            <p className={styles.subtitle}>Tell Misa what you have on hand. You can skip this and add more later.</p>

            <div className={styles.setupOptions}>
              <div className={`glass-card ${styles.manualSetup}`}>
                <h3>Manual Entry</h3>
                <div className={styles.stockForm}>
                  {initialStock.map((item, i) => (
                    <div key={i} className={styles.stockRow}>
                      <input 
                        className="input-field" 
                        placeholder="Item Name" 
                        value={item.name}
                        onChange={e => {
                          const newStock = [...initialStock];
                          newStock[i].name = e.target.value;
                          setInitialStock(newStock);
                        }}
                      />
                      <input 
                        type="number" 
                        className="input-field" 
                        placeholder="Qty" 
                        style={{ width: '80px' }}
                        onChange={e => {
                          const newStock = [...initialStock];
                          newStock[i].stock = parseInt(e.target.value) || 0;
                          setInitialStock(newStock);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.dividerBox}>
                <div className={styles.line} />
                <span>OR</span>
                <div className={styles.line} />
              </div>

              <div className={`glass-card ${styles.aiScannerCard}`}>
                <div className={styles.scannerHeader}>
                  <Sparkles size={20} color="var(--accent-green)" />
                  <h3>AI Stock Scanner</h3>
                </div>
                <p className={styles.scannerText}>Upload a photo of your stock book or a PDF, and Misa will extract everything.</p>
                
                <div className={styles.scannerActions}>
                  <button className="btn btn-ghost" disabled={isScanning} onClick={() => {
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 3000);
                  }}>
                    {isScanning ? <RotateCcw className={styles.spin} size={16} /> : <Camera size={16} />}
                    {isScanning ? 'Misa is Reading...' : 'Scan Photo'}
                  </button>
                  <button className="btn btn-ghost" disabled={isScanning}>
                    <FileText size={16} /> Upload PDF
                  </button>
                </div>

                {isScanning && (
                  <div className={styles.scanningOverlay}>
                    <div className={styles.scanLine} />
                    <p>Detecting items...</p>
                  </div>
                )}
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ marginTop: '2rem', width: '100%' }} 
              onClick={() => setPhase('movie')}
            >
              Continue to Demo <ChevronRight size={18} />
            </button>
            <button className="btn btn-ghost" style={{ marginTop: '0.75rem', width: '100%' }} onClick={() => setPhase('movie')}>
              I'll do this later
            </button>
          </div>
        )}

        {/* Phase 2: The Movie */}
        {phase === 'movie' && (
          <>
            <div className={styles.welcomeHeader}>
              <div className={styles.badge}><Play size={14} /> <span>Step 2: The Movie</span></div>
              <h1 className={styles.title}>How it works</h1>
              <p className={styles.subtitle}>Watch Misa turn plain talk into perfect books</p>
            </div>

            <div className={`glass-card ${styles.demoBox}`}>
              <div className={styles.simulationArea}>
                <div className={styles.userInput}>
                  <p className={styles.inputLabel}>Business Owner says:</p>
                  <div className={styles.typingBox}>
                    "{movieText}"<span className={styles.cursor} />
                  </div>
                </div>

                <div className={styles.aiProcess}>
                  {isParsing && (
                    <div className={styles.parsingAnim}>
                      <div className={styles.scanLine} />
                      <p><Bot size={20} className={styles.pulseIcon} /> Misa is analyzing...</p>
                    </div>
                  )}

                  {showResult && !DEMO_STEPS[movieStep].isQuery && (
                    <div className={styles.resultCard}>
                      <div className={styles.resultTitle}>
                        <CheckCircle size={18} /> 
                        <span>{DEMO_STEPS[movieStep].isBalanced ? 'Balanced & Sorted' : 'Parsed Successfully'}</span>
                      </div>
                      <div className={styles.extractedGrid}>
                        <div className={styles.extractItem}><span className={styles.exLabel}>Amount</span><span className={styles.exValue}>{formatAmount(DEMO_STEPS[movieStep].result.amount)}</span></div>
                        <div className={styles.extractItem}><span className={styles.exLabel}>Item</span><span className={styles.exValue}>{DEMO_STEPS[movieStep].result.item}</span></div>
                        <div className={styles.extractItem}><span className={styles.exLabel}>Qty</span><span className={styles.exValue}>{DEMO_STEPS[movieStep].result.quantity || 1}</span></div>
                        <div className={styles.extractItem}><span className={styles.exLabel}>Channel</span><span className={styles.exValue}>{DEMO_STEPS[movieStep].result.payment_method}</span></div>
                        {DEMO_STEPS[movieStep].isBalanced && (
                          <div className={styles.extractItem}><span className={styles.exLabel}>Status</span><span className="badge badge-income">Verified</span></div>
                        )}
                      </div>
                    </div>
                  )}

                  {showResult && DEMO_STEPS[movieStep].isQuery && (
                    <div className={styles.queryCard}>
                      <div className={styles.resultTitle}><Bot size={18} /> <span>Misa Answered</span></div>
                      <p className={styles.queryAnswer}>{DEMO_STEPS[movieStep].queryResult.answer}</p>
                      <p className={styles.queryDetails}>{DEMO_STEPS[movieStep].queryResult.details}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Phase 3: Sandbox */}
        {phase === 'sandbox' && (
          <div className={styles.sandboxScreen}>
            <div className={styles.badge}><Bot size={14} /> <span>Step 3: Try It Yourself</span></div>
            <h1 className={styles.title}>Your turn! Type a record</h1>
            <p className={styles.subtitle}>Tell Misa what you sold or bought today.</p>

            <form onSubmit={handleSandboxSubmit} className={styles.sandboxForm}>
              <input 
                className="input-field"
                placeholder='e.g. "Just sold 2 shirts for 5000 to John"'
                value={sandboxInput}
                onChange={e => setSandboxInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" disabled={isSandboxThinking}>
                Test Misa
              </button>
            </form>

            {isSandboxThinking && <div className={styles.loading}>Misa is thinking...</div>}

            {sandboxResult && (
              <div className={`glass-card ${styles.sandboxResult}`}>
                <div className={styles.resultHeader}>
                  <Bot size={24} />
                  <div>
                    <h3 className={styles.cardTitle}>Misa says: "I've got it!"</h3>
                    <p className={styles.cardText}>I detected an <strong>{sandboxResult.type}</strong> of <strong>{formatAmount(sandboxResult.amount)}</strong>.</p>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setPhase('finish')}>
                  Everything Looks Perfect <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Phase 4: Finish */}
        {phase === 'finish' && (
          <div className={styles.finishScreen}>
            <div className={styles.finishIcon}><Sparkles size={48} /></div>
            <h1 className={styles.title}>You're all set!</h1>
            <p className={styles.subtitle}>Kuditraka.Ai is ready to transform your business bookkeeping.</p>
            <button className="btn btn-primary" onClick={() => completeOnboarding(selectedSector, inventoryEnabled)}>
              Go to Dashboard <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
