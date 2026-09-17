import React, { useState, useEffect } from 'react';
import { superadminApi } from '../services/api/superadminApi.js';

import { useToast } from '../context/ToastContext.jsx';
import {
  FaSearch,
  FaKey,
  FaCopy,
  FaCheck,
  FaEnvelope,
  FaWhatsapp,
  FaTimes,
  FaShieldAlt,
  FaBuilding,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import './ResetBusinessPassword.css';

export const ResetBusinessPassword = () => {
  const { addToast } = useToast();

  const [businesses, setBusinesses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  // UI states
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // LOAD BUSINESSES
  // ============================================================
  useEffect(() => {
    setLoading(true);
    superadminApi.listBusinesses()
      .then(res => {
        const list = res.data || [];
        setBusinesses(list);
        setFiltered(list);
      })
      .catch(err => addToast(err.message || 'Failed to load businesses', 'error'))
      .finally(() => setLoading(false));
  }, []);

  // Filter by search
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(businesses);
      return;
    }
    setFiltered(
      businesses.filter(b =>
        b.name?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q)
      )
    );
  }, [search, businesses]);

  // ============================================================
  // RESET FLOW
  // ============================================================
  const handleChipClick = (biz) => {
    setSelectedBusiness(biz);
  };

  const handleResetClick = () => {
    if (!selectedBusiness) {
      addToast('Please select a business first', 'error');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmReset = async () => {
    if (!selectedBusiness) return;
    setResetting(true);
    try {
      const res = await superadminApi.resetBusinessAdminPassword(selectedBusiness._id);
      setResetResult(res.data);
      setShowConfirm(false);
      setShowResult(true);
      addToast('Password reset successfully!');
    } catch (err) {
      addToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setResetting(false);
    }
  };

  // ============================================================
  // COPY / SHARE
  // ============================================================
  const handleCopy = async () => {
    if (!resetResult?.newPassword) return;
    try {
      await navigator.clipboard.writeText(resetResult.newPassword);
      setCopied(true);
      addToast('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy', 'error');
    }
  };

  const buildShareMessage = () => {
    return `Hello ${resetResult?.adminName || 'Admin'},\n\nYour DealDesk workspace password for "${resetResult?.businessName}" has been reset by support.\n\nNew Password: ${resetResult?.newPassword}\n\nPlease log in and change it immediately.\n\n— DealDesk Support`;
  };

  const handleShareEmail = () => {
    if (!resetResult?.adminEmail) return addToast('No email on file', 'error');
    const subject = `Your DealDesk password has been reset`;
    const body = buildShareMessage();
    window.open(
      `mailto:${resetResult.adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank'
    );
  };

  const handleShareWhatsApp = () => {
    if (!resetResult?.adminPhone) return addToast('No phone on file', 'error');
    const clean = resetResult.adminPhone.replace(/[^0-9]/g, '');
    window.open(
      `https://wa.me/${clean}?text=${encodeURIComponent(buildShareMessage())}`,
      '_blank'
    );
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setResetResult(null);
    setSelectedBusiness(null);
    setShowPassword(false);
    setCopied(false);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="rbp-page">
      {/* Header */}
      <div className="rbp-header">
        <div>
          <h1><FaKey style={{ marginRight: 8 }} /> Reset Business Password</h1>
          <p className="rbp-subtitle">
            Reset the admin password for any business. A new random password will be generated and shown once.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rbp-info-banner">
        <FaShieldAlt className="rbp-info-icon" />
        <div>
          <strong>Security Notice</strong>
          <p>The new password will be displayed only once. Share it securely with the business admin via email or WhatsApp.</p>
        </div>
      </div>

      {/* Search */}
      <div className="rbp-search-wrap">
        <FaSearch className="rbp-search-icon" />
        <input
          type="text"
          placeholder="Search business by name, city, or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Business Chips */}
      <div className="rbp-chip-section">
        <div className="rbp-chip-label">
          <FaBuilding /> Select Business
          {selectedBusiness && (
            <span className="rbp-chip-count">
              Selected: <strong>{selectedBusiness.name}</strong>
            </span>
          )}
        </div>

        {loading ? (
          <div className="rbp-loading">Loading businesses...</div>
        ) : filtered.length === 0 ? (
          <div className="rbp-empty">No businesses found</div>
        ) : (
          <div className="rbp-chips">
            {filtered.map(biz => (
              <button
                key={biz._id}
                type="button"
                className={`rbp-chip ${selectedBusiness?._id === biz._id ? 'active' : ''}`}
                onClick={() => handleChipClick(biz)}
                title={biz.email}
              >
                <span className="rbp-chip-avatar">
                  {biz.name?.charAt(0).toUpperCase() || 'B'}
                </span>
                <span className="rbp-chip-text">
                  <strong>{biz.name}</strong>
                  {biz.city && <small>{biz.city}</small>}
                </span>
                {selectedBusiness?._id === biz._id && (
                  <FaCheck className="rbp-chip-check" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="rbp-action-bar">
        <div className="rbp-selected-info">
          {selectedBusiness ? (
            <>
              <span>Selected:</span>
              <strong>{selectedBusiness.name}</strong>
            </>
          ) : (
            <span className="rbp-muted">No business selected</span>
          )}
        </div>
        <button
          className="rbp-btn-danger"
          onClick={handleResetClick}
          disabled={!selectedBusiness}
        >
          <FaKey /> Reset Password
        </button>
      </div>

      {/* ============================================================ */}
      {/* CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {showConfirm && selectedBusiness && (
        <div className="rbp-modal-backdrop" onClick={() => !resetting && setShowConfirm(false)}>
          <div className="rbp-modal" onClick={e => e.stopPropagation()}>
            <div className="rbp-modal-header">
              <div className="rbp-modal-icon danger">
                <FaExclamationTriangle />
              </div>
              <div>
                <h3>Confirm Password Reset</h3>
                <p>This action cannot be undone.</p>
              </div>
              <button
                className="rbp-modal-close"
                onClick={() => !resetting && setShowConfirm(false)}
                disabled={resetting}
              >
                <FaTimes />
              </button>
            </div>

            <div className="rbp-modal-body">
              <p>
                Are you sure you want to reset the admin password for this business?
              </p>
              <div className="rbp-confirm-box">
                <strong>{selectedBusiness.name}</strong>
                {selectedBusiness.email && <span>{selectedBusiness.email}</span>}
              </div>
              <p className="rbp-modal-warning">
                The admin will be forced to change their password on next login.
              </p>
            </div>

            <div className="rbp-modal-footer">
              <button
                className="rbp-btn-secondary"
                onClick={() => setShowConfirm(false)}
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                className="rbp-btn-danger"
                onClick={handleConfirmReset}
                disabled={resetting}
              >
                {resetting ? 'Resetting...' : 'Yes, Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* RESULT MODAL (Password Reveal) */}
      {/* ============================================================ */}
      {showResult && resetResult && (
        <div className="rbp-modal-backdrop">
          <div className="rbp-modal result" onClick={e => e.stopPropagation()}>
            <div className="rbp-modal-header">
              <div className="rbp-modal-icon success">
                <FaCheck />
              </div>
              <div>
                <h3>Password Reset Successfully</h3>
                <p>Share this with the business admin securely.</p>
              </div>
              <button className="rbp-modal-close" onClick={handleCloseResult}>
                <FaTimes />
              </button>
            </div>

            <div className="rbp-modal-body">
              {/* Business Info */}
              <div className="rbp-result-meta">
                <div className="rbp-result-row">
                  <span>Business</span>
                  <strong>{resetResult.businessName}</strong>
                </div>
                <div className="rbp-result-row">
                  <span>Admin</span>
                  <strong>{resetResult.adminName}</strong>
                </div>
                {resetResult.adminEmail && (
                  <div className="rbp-result-row">
                    <span>Email</span>
                    <strong>{resetResult.adminEmail}</strong>
                  </div>
                )}
              </div>

              {/* Password Reveal */}
              <div className="rbp-password-box">
                <label>New Password</label>
                <div className="rbp-password-row">
                  <code className="rbp-password-value">
                    {showPassword ? resetResult.newPassword : '••••••••••'}
                  </code>
                  <button
                    className="rbp-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button
                    className="rbp-icon-btn"
                    onClick={handleCopy}
                    title="Copy password"
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
                <p className="rbp-password-hint">
                  ⚠️ This password will not be shown again.
                </p>
              </div>

              {/* Share Buttons */}
              <div className="rbp-share-row">
                <button
                  className="rbp-share-btn email"
                  onClick={handleShareEmail}
                  disabled={!resetResult.adminEmail}
                >
                  <FaEnvelope /> Share via Email
                </button>
                <button
                  className="rbp-share-btn whatsapp"
                  onClick={handleShareWhatsApp}
                  disabled={!resetResult.adminPhone}
                >
                  <FaWhatsapp /> Share via WhatsApp
                </button>
              </div>
            </div>

            <div className="rbp-modal-footer">
              <button className="rbp-btn-primary" onClick={handleCloseResult}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};