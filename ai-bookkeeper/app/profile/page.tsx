'use client';
import { useAuth } from '@/context/AuthContext';
import { Building2, User, Mail, Phone, MapPin, FileText, BadgeCheck, ShieldCheck } from 'lucide-react';
import styles from './page.module.css';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="page-container">
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Business Profile</h1>
          <p>Verified information for Kuditraka.Ai</p>
        </div>
        <div className={styles.statusBadge}>
          <ShieldCheck size={16} /> 
          <span>Active Account</span>
        </div>
      </header>

      <div className={styles.profileGrid}>
        {/* Company Overview Card */}
        <div className={`glass-card ${styles.profileCard}`}>
          <div className={styles.cardHeader}>
            <Building2 size={20} className={styles.headerIcon} />
            <h3>Company Information</h3>
          </div>
          
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Legal Business Name</span>
              <span className={styles.value}>{user.businessName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Business Type</span>
              <span className={styles.value}>{user.businessType}</span>
            </div>
             <div className={styles.infoItem}>
               <span className={styles.label}>CAC Registration Number</span>
               <span className={styles.value}>
                 {user.cacNumber ? (
                   <span className={styles.cacText}><BadgeCheck size={14} /> {user.cacNumber}</span>
                 ) : 'Not Provided'}
               </span>
             </div>
             <div className={styles.infoItem}>
               <span className={styles.label}>Business Size</span>
               <span className={styles.value}>{user.businessSize || 'Solo'}</span>
             </div>
             <div className={styles.infoItem}>
               <span className={styles.label}>Primary Sales Channel</span>
               <span className={styles.value}>{user.salesChannel || 'Physical shop'}</span>
             </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Official Address</span>
              <span className={styles.value}><MapPin size={14} /> {user.address || 'Not Provided'}</span>
            </div>
          </div>
        </div>

        {/* Owner Details Card */}
        <div className={`glass-card ${styles.profileCard}`}>
          <div className={styles.cardHeader}>
            <User size={20} className={styles.headerIcon} />
            <h3>Authorized Person</h3>
          </div>

          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Owner Full Name</span>
              <span className={styles.value}>{user.ownerName || 'Not Provided'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email Address</span>
              <span className={styles.value}><Mail size={14} /> {user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Phone Contact</span>
              <span className={styles.value}><Phone size={14} /> {user.phone}</span>
            </div>
          </div>
        </div>

        {/* Subscription / Security Placeholder */}
        <div className={`glass-card ${styles.profileCard} ${styles.wideCard}`}>
          <div className={styles.cardHeader}>
            <FileText size={20} className={styles.headerIcon} />
            <h3>Compliance & Records</h3>
          </div>
          <div className={styles.placeholderBox}>
            <p>Your business documents and certificates will appear here once uploaded.</p>
            <button className="btn btn-secondary btn-sm" disabled>Manage Documents</button>
          </div>
        </div>
      </div>
    </div>
  );
}
