'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { User as UserType } from '@/lib/types';
import { apiClient } from '@/lib/apiClient';
import { Building2, User, Mail, Phone, MapPin, FileText, BadgeCheck, ShieldCheck, Camera, Save, X, Edit3 } from 'lucide-react';
import styles from './page.module.css';

const LOGO_KEY = 'ai-bk-business-logo';

function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  const display = value?.trim() || null;
  return (
    <div className={styles.infoRow}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={`${styles.rowValue} ${!display ? styles.notProvided : ''}`}>
        {icon && display && <span className={styles.rowIcon}>{icon}</span>}
        {display ?? 'Not provided'}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [logo, setLogo] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    business_name: '',
    business_sector: '',
    phone: '',
    address: '',
    cac_number: '',
    business_size: '',
    sales_channel: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOGO_KEY);
    if (saved) setLogo(saved);
    apiClient('/auth/profile')
      .then(res => {
        if (res) {
          const savedUser = localStorage.getItem('ai-bk-user');
          const localData = savedUser ? JSON.parse(savedUser) : {};
          const merged = { ...localData, ...res };
          if (setUser) setUser(merged);
          localStorage.setItem('ai-bk-user', JSON.stringify(merged));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user && editing) {
      setForm({
        name: user.ownerName || '',
        business_name: user.businessName || '',
        business_sector: user.businessSector || user.businessType || '',
        phone: user.phone || '',
        address: user.address || '',
        cac_number: user.cacNumber || '',
        business_size: user.businessSize || '',
        sales_channel: user.salesChannel || '',
      });
    }
  }, [user, editing]);

  const handleSave = async () => {
    try {
      await apiClient('/auth/profile', {
        method: 'PUT',
        data: {
          name: form.name,
          business_name: form.business_name,
          business_sector: form.business_sector,
        },
      });
      const updatedUser: UserType = {
        id: user?.id ?? '',
        businessName: form.business_name,
        ownerName: form.name,
        businessSector: form.business_sector as UserType['businessSector'],
        inventoryEnabled: user?.inventoryEnabled ?? false,
        onboarded: user?.onboarded ?? false,
        email: user?.email ?? '',
        phone: form.phone || user?.phone,
        address: form.address || user?.address,
        cacNumber: form.cac_number || user?.cacNumber,
        businessType: form.business_sector,
        businessSize: form.business_size || user?.businessSize,
        salesChannel: form.sales_channel || user?.salesChannel,
      };
      if (setUser) setUser(updatedUser);
      localStorage.setItem('ai-bk-user', JSON.stringify(updatedUser));
      setEditing(false);
    } catch (e) {
      console.error('Failed to update profile', e);
    }
  };

  const handleLogoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogo(dataUrl);
      localStorage.setItem(LOGO_KEY, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!user) return null;

  const initial = (user.businessName || user.ownerName || 'B').charAt(0).toUpperCase();

  return (
    <div className="page-container">

      {/* ── Identity Hero ── */}
      <div className={styles.hero}>

        {/* Logo / avatar uploader */}
        <div className={styles.avatarWrapper} onClick={handleLogoClick} title="Upload business logo">
          {logo ? (
            <img src={logo} alt="Business logo" className={styles.logoImg} />
          ) : (
            <div className={styles.avatar}>{initial}</div>
          )}
          <div className={styles.avatarOverlay}>
            <Camera size={18} />
            <span>{logo ? 'Change' : 'Upload'}</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div className={styles.heroText}>
          <h1 className={styles.businessName}>{user.businessName || 'Your Business'}</h1>
          <p className={styles.heroSub}>{user.businessSector || user.businessType || 'Business Account'}</p>
        </div>

        <div className={styles.statusBadge}>
          <ShieldCheck size={14} />
          <span>Active</span>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '1rem' }}
          onClick={() => editing ? handleSave() : setEditing(true)}
        >
          {editing ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit Profile</>}
        </button>
        {editing && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: '1rem' }}
            onClick={() => setEditing(false)}
          >
            <X size={14} /> Cancel
          </button>
        )}
      </div>

      <hr className={styles.divider} />

      {/* ── Info Columns ── */}
      <div className={styles.infoColumns}>

        <div className={styles.infoSection}>
          <p className={styles.sectionTitle}><Building2 size={14} /> Company</p>
          {editing ? (
            <>
              <div className={styles.infoRow}>
                <span className={styles.rowLabel}>Legal Business Name</span>
                <input className="input-field" value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} />
              </div>
              <div className={styles.infoRow}>
                <span className={styles.rowLabel}>Business Type</span>
                <input className="input-field" value={form.business_sector} onChange={e => setForm({...form, business_sector: e.target.value})} />
              </div>
              <div className={styles.infoRow}>
                <span className={styles.rowLabel}>CAC Number</span>
                <input className="input-field" value={form.cac_number} onChange={e => setForm({...form, cac_number: e.target.value})} />
              </div>
              <div className={styles.infoRow}>
                <span className={styles.rowLabel}>Business Size</span>
                <input className="input-field" value={form.business_size} onChange={e => setForm({...form, business_size: e.target.value})} />
              </div>
              <div className={styles.infoRow}>
                <span className={styles.rowLabel}>Sales Channel</span>
                <input className="input-field" value={form.sales_channel} onChange={e => setForm({...form, sales_channel: e.target.value})} />
              </div>
              <div className={styles.infoRow}>
                <span className={styles.rowLabel}>Official Address</span>
                <input className="input-field" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
            </>
          ) : (
            <>
              <InfoRow label="Legal Business Name" value={user.businessName} />
              <InfoRow label="Business Type"       value={user.businessType} />
              <InfoRow label="CAC Number"          value={user.cacNumber} icon={<BadgeCheck size={13} />} />
              <InfoRow label="Business Size"       value={user.businessSize || 'Solo'} />
              <InfoRow label="Sales Channel"       value={user.salesChannel || 'Physical shop'} />
              <InfoRow label="Official Address"    value={user.address} icon={<MapPin size={13} />} />
            </>
          )}
        </div>

        <div className={styles.vertDivider} />

        <div className={styles.infoSection}>
          <p className={styles.sectionTitle}><User size={14} /> Owner</p>
          {editing ? (
            <>
              <div className={styles.infoRow}>
                <span className={styles.rowLabel}>Full Name</span>
                <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className={styles.infoRow}>
                <span className={styles.rowLabel}>Email Address</span>
                <span className={styles.rowValue}>{user.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.rowLabel}>Phone</span>
                <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
            </>
          ) : (
            <>
              <InfoRow label="Full Name"     value={user.ownerName} />
              <InfoRow label="Email Address" value={user.email}  icon={<Mail size={13} />} />
              <InfoRow label="Phone"         value={user.phone}  icon={<Phone size={13} />} />
            </>
          )}
        </div>

      </div>

      <hr className={styles.divider} />

      {/* ── Compliance ── */}
      <div className={styles.compliance}>
        <p className={styles.sectionTitle}><FileText size={14} /> Compliance &amp; Records</p>
        <div className={styles.emptyDocs}>
          <p>Business documents and certificates will appear here once uploaded.</p>
          <button className="btn btn-ghost btn-sm" disabled>Manage Documents</button>
        </div>
      </div>

    </div>
  );
}
