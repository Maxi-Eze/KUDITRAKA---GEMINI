'use client';
import { useAuth } from '@/context/AuthContext';
import { Building2, User, Mail, Phone, MapPin, FileText, BadgeCheck, ShieldCheck } from 'lucide-react';
import styles from './page.module.css';

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
  const { user } = useAuth();

  if (!user) return null;

  const initial = (user.businessName || user.ownerName || 'B').charAt(0).toUpperCase();

  return (
    <div className="page-container">

      {/* ── Identity Hero ── */}
      <div className={styles.hero}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.heroText}>
          <h1 className={styles.businessName}>{user.businessName || 'Your Business'}</h1>
          <p className={styles.heroSub}>{user.businessSector || user.businessType || 'Business Account'}</p>
        </div>
        <div className={styles.statusBadge}>
          <ShieldCheck size={14} />
          <span>Active</span>
        </div>
      </div>

      <hr className={styles.divider} />

      {/* ── Info Columns ── */}
      <div className={styles.infoColumns}>

        <div className={styles.infoSection}>
          <p className={styles.sectionTitle}><Building2 size={14} /> Company</p>
          <InfoRow label="Legal Business Name" value={user.businessName} />
          <InfoRow label="Business Type"       value={user.businessType} />
          <InfoRow label="CAC Number"          value={user.cacNumber} icon={<BadgeCheck size={13} />} />
          <InfoRow label="Business Size"       value={user.businessSize || 'Solo'} />
          <InfoRow label="Sales Channel"       value={user.salesChannel || 'Physical shop'} />
          <InfoRow label="Official Address"    value={user.address} icon={<MapPin size={13} />} />
        </div>

        <div className={styles.vertDivider} />

        <div className={styles.infoSection}>
          <p className={styles.sectionTitle}><User size={14} /> Owner</p>
          <InfoRow label="Full Name"     value={user.ownerName} />
          <InfoRow label="Email Address" value={user.email}  icon={<Mail size={13} />} />
          <InfoRow label="Phone"         value={user.phone}  icon={<Phone size={13} />} />
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
