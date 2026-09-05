import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { qrApi, propertyApi, billingApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { UpgradePlanModal } from '../components/UpgradePlanModal.jsx';
import { DealDeskLogo } from '../components/DealDeskLogo.jsx';
import html2canvas from 'html2canvas';
import { 
  FaQrcode, 
  FaPlus, 
  FaSyncAlt, 
  FaDownload, 
  FaExternalLinkAlt,
  FaCamera,
  FaBuilding,
  FaCheck,
  FaTimes,
  FaPrint,
  FaShieldAlt,
  FaEye,
  FaFileDownload
} from 'react-icons/fa';
import './SmartQRPage.css';

export const SmartQRPage = () => {
  const { addToast } = useToast();
  const { user, business } = useAuth();

  const [qrs, setQrs] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQrForReassign, setSelectedQrForReassign] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterQR, setPosterQR] = useState(null);
  const posterRef = useRef(null);

  // Limit & Upgrade states
  const [qrLimitExceeded, setQrLimitExceeded] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    propertyId: '',
    label: 'Main Gate Physical Board',
  });

  // ============================================================
  // LOAD DATA & CHECK LIMIT
  // ============================================================
  const loadQRs = () => {
    setLoading(true);
    qrApi.list()
      .then(res => {
        setQrs(res.data || []);
        checkQRLimit();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQRs();
    propertyApi.list().then(r => {
      setProperties(r.data || []);
      if (r.data && r.data.length > 0 && !formData.propertyId) {
        setFormData(prev => ({ ...prev, propertyId: r.data[0]._id }));
      }
    }).catch(() => {});
  }, []);

  const checkQRLimit = async () => {
    try {
      const statusRes = await billingApi.getStatus();
      const usage = statusRes.data?.usage?.qrs;
      if (usage) {
        setQrLimitExceeded(usage.exceeded || false);
        setLimitInfo(usage);
      }
    } catch (error) {}
  };

  // ============================================================
  // DOWNLOAD QR (only QR)
  // ============================================================
  const handleDownloadDirectPNG = async (qrId, targetUrl, propertyCode) => {
    setDownloadingId(qrId);
    try {
      const highResQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=25&data=${encodeURIComponent(targetUrl)}`;
      const response = await fetch(highResQrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `DealDesk-QR-${qrId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      addToast(`QR downloaded!`);
    } catch (err) {
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=25&data=${encodeURIComponent(targetUrl)}`, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  // ============================================================
  // POSTER DOWNLOAD
  // ============================================================
  const handleOpenPoster = (qr) => {
    setPosterQR(qr);
    setShowPosterModal(true);
  };

  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `DealDesk-Poster-${posterQR.qrId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      addToast('Poster downloaded successfully!');
    } catch (err) {
      addToast('Error generating poster', 'error');
    }
  };

  // ============================================================
  // CREATE / REASSIGN QR (with limit check)
  // ============================================================
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.propertyId) {
      addToast('Please select a property', 'error');
      return;
    }

    if (!selectedQrForReassign) {
      try {
        const statusRes = await billingApi.getStatus();
        const usage = statusRes.data?.usage?.qrs;
        if (usage && usage.exceeded) {
          setQrLimitExceeded(true);
          setLimitInfo(usage);
          setShowUpgradeModal(true);
          return;
        }
      } catch (error) {}
    }

    try {
      await qrApi.createOrReassign({
        ...formData,
        qrId: selectedQrForReassign?.qrId || null,
      });
      addToast(selectedQrForReassign ? 'Smart QR destination updated!' : 'New Smart QR generated!');
      setShowModal(false);
      setSelectedQrForReassign(null);
      loadQRs();
    } catch (err) {
      if (err?.data?.suggestion) {
        setQrLimitExceeded(true);
        setLimitInfo(err.data);
        setShowUpgradeModal(true);
        addToast(err.message || 'QR limit reached', 'error');
      } else {
        addToast(err.message || 'Error updating QR', 'error');
      }
    }
  };

  const handleUpgradeSuccess = async () => {
    await checkQRLimit();
    addToast('✅ Plan upgraded! You can now create more QR codes.');
  };

  const activeModalProperty = properties.find(p => p._id === formData.propertyId);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="smart-qr-page">
      {/* Header */}
      <div className="page-title-row">
        <div>
          <h1>Smart Dynamic QR Fleet</h1>
          <p className="text-muted">
            Permanent physical barcodes for site hoardings and boards. Reassign destination listings without reprinting.
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedQrForReassign(null); setShowModal(true); }}>
          <FaPlus style={{ marginRight: 6 }} /> Generate Smart QR
        </button>
      </div>

      {/* Usage Banner */}
      <div className={`qr-usage-banner ${qrLimitExceeded ? 'limit-reached' : ''}`}>
        <div className="qr-usage-info">
          <span className="qr-usage-label">QR Usage:</span>
          <strong>{qrs.length}</strong>
          <span className="qr-usage-separator">/</span>
          <span className={`qr-usage-limit ${qrLimitExceeded ? 'exceeded' : ''}`}>
            {limitInfo?.limit === -1 ? 'Unlimited' : limitInfo?.limit || 'Unlimited'}
          </span>
          {qrLimitExceeded && (
            <span className="qr-usage-badge limit-exceeded">⚠️ Limit Reached</span>
          )}
        </div>
        {qrLimitExceeded && (
          <button className="qr-btn-upgrade" onClick={() => setShowUpgradeModal(true)}>
            <FaShieldAlt /> Upgrade Plan
          </button>
        )}
      </div>

      {/* QR Grid */}
      {loading ? (
        <div className="skeleton-grid">Loading dynamic QR fleet...</div>
      ) : qrs.length === 0 ? (
        <div className="clean-empty-container">
          <FaQrcode className="empty-icon" />
          <h3>No Smart QRs active yet</h3>
          <p>Generate your first permanent board QR to acquire mobile leads directly from site visitors.</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>Generate Smart QR</button>
        </div>
      ) : (
        <div className="qr-grid">
          {qrs.map(qr => {
            const targetUrl = `${window.location.origin}/qr/${qr.qrId}`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(targetUrl)}`;
            const isDownloading = downloadingId === qr.qrId;

            return (
              <div key={qr._id} className="qr-item-card">
                <div className="qr-card-top">
                  <span className="qr-id-pill">ID: {qr.qrId}</span>
                  <span className={`status-pill ${qr.status?.toLowerCase() || 'active'}`}>
                    {qr.status || 'Active'}
                  </span>
                </div>

                <div className="qr-visual-block">
                  <div className="qr-matrix-frame">
                    <img 
                      src={qrImageUrl} 
                      alt={`Scannable barcode for ${qr.qrId}`}
                      className="real-scannable-qr-img"
                    />
                  </div>

                  <div className="scan-prompt-chip">
                    <FaCamera /> Point phone camera to test scan
                  </div>

                  <a 
                    href={`/qr/${qr.qrId}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="qr-sim-link"
                  >
                    <span>/qr/{qr.qrId}</span>
                    <FaExternalLinkAlt style={{ fontSize: '0.6875rem' }} />
                  </a>

                  {/* 🔥 Updated Download Buttons */}
                  <div className="qr-download-buttons">
                    <button 
                      className="btn-download-direct"
                      disabled={isDownloading}
                      onClick={() => handleDownloadDirectPNG(qr.qrId, targetUrl, qr.currentPropertyId?.propertyCode)}
                    >
                      <FaDownload />
                      <span>{isDownloading ? 'Downloading...' : 'QR Only'}</span>
                    </button>
                    <button 
                      className="btn-download-poster"
                      onClick={() => handleOpenPoster(qr)}
                    >
                      <FaFileDownload /> Poster
                    </button>
                  </div>
                </div>

                <div className="qr-assigned-info">
                  <span className="lbl">Currently Linked Listing:</span>
                  {qr.currentPropertyId ? (
                    <Link to={`/app/properties/${qr.currentPropertyId._id}`} className="qr-prop-title-link">
                      <h4>{qr.currentPropertyId.projectName} ({qr.currentPropertyId.propertyCode}) →</h4>
                    </Link>
                  ) : (
                    <h4>Unassigned Physical Board</h4>
                  )}
                  <p className="prop-sub">
                    {qr.currentPropertyId?.configuration} • {qr.currentPropertyId?.address}
                  </p>
                </div>

                <div className="qr-metrics-row">
                  <div className="metric-col">
                    <span className="val">{qr.scanCount || 0}</span>
                    <span className="txt">Scans</span>
                  </div>
                  <div className="metric-col">
                    <span className="val">{qr.viewCount || 0}</span>
                    <span className="txt">Views</span>
                  </div>
                  <Link to="/app/leads" className="metric-col clickable-qr-metric">
                    <span className="val">{qr.leadCount || 0}</span>
                    <span className="txt">Leads →</span>
                  </Link>
                </div>

                <button 
                  className="btn-reassign"
                  onClick={() => {
                    setSelectedQrForReassign(qr);
                    setFormData({ propertyId: qr.currentPropertyId?._id || '', label: qr.label || 'Main Gate' });
                    setShowModal(true);
                  }}
                >
                  <FaSyncAlt /> Reassign Property (No Reprint Needed)
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* GENERATE / REASSIGN MODAL (box-style) */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-surface qr-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selectedQrForReassign ? `Reassign QR Board (${selectedQrForReassign.qrId})` : 'Generate Production Smart QR'}</h3>
                <p className="modal-subtitle">Permanent barcode with automated sold inventory fallback routing.</p>
              </div>
              <button className="btn-close" onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <div className="modal-split-layout">
                <div className="modal-inputs-col">
                  <div className="form-group">
                    <label>Physical Board Placement / Label *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Main Gate Acrylic Board, Site Hoarding #3, Lift Flyer"
                      value={formData.label} 
                      onChange={e => setFormData({ ...formData, label: e.target.value })} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Destination Listing *</label>
                    <select 
                      required 
                      value={formData.propertyId} 
                      onChange={e => setFormData({ ...formData, propertyId: e.target.value })}
                    >
                      <option value="">Select Property Listing...</option>
                      {properties.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.projectName} ({p.propertyCode}) • {p.configuration} • ${p.askingPrice?.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="qr-usage-info-modal">
                    <FaQrcode className="qr-usage-icon" />
                    <span>
                      <strong>{qrs.length}</strong> of <strong>{limitInfo?.limit === -1 ? 'Unlimited' : limitInfo?.limit || 'Unlimited'}</strong> QR slots used
                    </span>
                  </div>

                  <div className="qr-intelligence-reminder">
                    <div className="reminder-title"><FaCheck style={{ color: '#16a34a' }} /> Built-In Sold Fallback Intelligence</div>
                    <p>
                      If this property is marked Sold or Unavailable later, this QR will automatically route scanning buyers to equivalent available inventory in the same project without printing a new board.
                    </p>
                  </div>
                </div>

                <div className="modal-preview-col">
                  <span className="preview-label">Live Board Preview</span>
                  <div className="live-qr-preview-frame">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(window.location.origin + '/qr/' + (selectedQrForReassign?.qrId || 'PREVIEW'))}`} 
                      alt="Live QR Preview" 
                    />
                    <div className="preview-details">
                      <strong>{activeModalProperty?.projectName || 'Select a Property'}</strong>
                      <span>{activeModalProperty?.configuration || 'Configuration'} • {activeModalProperty?.propertyCode || 'CODE'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {selectedQrForReassign ? 'Update Destination Listing' : (qrLimitExceeded ? '🔒 Upgrade Required' : 'Generate & Activate Smart QR')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POSTER PREVIEW MODAL */}
      {showPosterModal && posterQR && (
        <div className="modal-overlay" onClick={() => setShowPosterModal(false)}>
          <div className="poster-modal" onClick={e => e.stopPropagation()}>
            <div className="poster-modal-header">
              <h3>Download Poster</h3>
              <button className="btn-close" onClick={() => setShowPosterModal(false)}><FaTimes /></button>
            </div>
            <div className="poster-modal-body">
              {/* Poster Preview */}
              <div className="poster-container" ref={posterRef}>
                <div className="poster-inner">
                  {/* Header with Logo */}
                  <div className="poster-header">
                    <DealDeskLogo size="sm" theme="dark" />
                    <div className="poster-business-name">{business?.name || 'DealDesk'}</div>
                  </div>

                  {/* Property Info */}
                  <div className="poster-property">
                    <h2>{posterQR.currentPropertyId?.projectName || 'Property'}</h2>
                    <p className="poster-address">
                      {posterQR.currentPropertyId?.address || 'Address not available'}
                    </p>
                    <p className="poster-details">
                      {posterQR.currentPropertyId?.configuration || ''} • 
                      {posterQR.currentPropertyId?.propertyType || ''}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="poster-qr">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=20&data=${encodeURIComponent(`${window.location.origin}/qr/${posterQR.qrId}`)}`}
                      alt="QR Code"
                    />
                  </div>

                  {/* Footer with Contact */}
                  <div className="poster-footer">
                    <p className="poster-contact">
                      Contact: {business?.phone || '+91 98765 43210'}
                    </p>
                    <p className="poster-powered">Powered by DealDesk</p>
                  </div>
                </div>
              </div>

              <div className="poster-actions">
                <button className="btn-secondary" onClick={() => handleDownloadDirectPNG(posterQR.qrId, `${window.location.origin}/qr/${posterQR.qrId}`, posterQR.currentPropertyId?.propertyCode)}>
                  <FaDownload /> Download QR Only
                </button>
                <button className="btn-primary" onClick={handleDownloadPoster}>
                  <FaFileDownload /> Download Full Poster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE MODAL */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
        title="QR Limit Reached"
        message="You've reached the maximum number of QR codes in your current plan. Upgrade to create more QR codes and capture more leads."
        feature="QR Codes"
      />
    </div>
  );
};