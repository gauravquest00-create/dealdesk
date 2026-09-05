import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyApi, matchApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  FaBolt, 
  FaBuilding, 
  FaUserTie, 
  FaShareAlt, 
  FaCalendarPlus,
  FaExternalLinkAlt,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaShieldAlt,
  FaInfoCircle,
  FaWhatsapp
} from 'react-icons/fa';
import './SmartMatchPage.css';

export const SmartMatchPage = () => {
  const { addToast } = useToast();
  const { user, isAdmin } = useAuth();

  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDetailMatch, setActiveDetailMatch] = useState(null);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    propertyApi.list().then(res => {
      const props = res.data || [];
      setProperties(props);
      if (props.length > 0) {
        setSelectedPropertyId(props[0]._id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedPropertyId) return;
    setLoading(true);
    matchApi.getForProperty(selectedPropertyId)
      .then(res => setMatches(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedPropertyId]);

  const activeProperty = properties.find(p => p._id === selectedPropertyId);

  return (
    <div className="sm-page">
      {/* Header */}
      <div className="sm-header">
        <div>
          <h1>Smart Match Intelligence</h1>
          <p className="sm-subtitle">7-factor algorithmic match scoring connecting qualified buyer requirements to available inventory.</p>
          <button 
            className="sm-howto-btn"
            onClick={() => setShowHowTo(!showHowTo)}
          >
            <FaInfoCircle /> {showHowTo ? 'Hide Guide' : 'How It Works'}
          </button>
        </div>
      </div>

      {/* How-to Guide */}
      {showHowTo && (
        <div className="sm-howto-card">
          <div className="sm-howto-grid">
            <div>
              <span className="sm-howto-step">1</span>
              <h4>Select Property</h4>
              <p>Choose a listing from your inventory. The system will analyze all buyer leads against this property.</p>
            </div>
            <div>
              <span className="sm-howto-step">2</span>
              <h4>7-Factor Algorithm</h4>
              <p>Budget (30%), Location (25%), Layout (20%), Style (10%), Size (5%), Transaction (5%), Other (5%).</p>
            </div>
            <div>
              <span className="sm-howto-step">3</span>
              <h4>Match Score</h4>
              <p>Each lead receives a match percentage. Higher score = better fit. Click "Details" to see breakdown.</p>
            </div>
            <div>
              <span className="sm-howto-step">4</span>
              <h4>Take Action</h4>
              <p>Use the WhatsApp button to pitch the property to the lead directly. Track all follow-ups in the CRM.</p>
            </div>
          </div>
        </div>
      )}

      {/* Selector */}
      <div className="sm-selector">
        <label className="sm-selector-label">Select Property for Lead Matching:</label>
        <select 
          value={selectedPropertyId} 
          onChange={e => setSelectedPropertyId(e.target.value)}
          className="sm-selector-dropdown"
        >
          {properties.map(p => (
            <option key={p._id} value={p._id}>
              {p.projectName} ({p.propertyCode}) • {p.configuration} • ${p.askingPrice?.toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {/* Weighting Hint */}
      <div className="sm-weighting-hint">
        <span>Scoring Factors: Budget (30%) • Location (25%) • Layout (20%) • Style (10%) • Size (5%) • Transaction (5%) • Other (5%)</span>
      </div>

      {/* Match Results */}
      {loading ? (
        <div className="sm-loading">Computing 7-factor match matrices...</div>
      ) : matches.length === 0 ? (
        <div className="sm-empty">
          <FaBolt className="sm-empty-icon" />
          <h3>No high-probability matches for this listing</h3>
          <p>Try selecting a different property or capture more prospect lead requirements.</p>
        </div>
      ) : (
        <>
          {/* Desktop Grid */}
          <div className="sm-grid">
            {matches.map((m, idx) => {
              const cleanNumber = (m.lead?.phone || '').replace(/[^0-9]/g, '');
              const isMasked = m.lead?.isLimitedPreview;

              return (
                <div key={idx} className="sm-card">
                  <div className="sm-card-score">
                    <span className="sm-score-percent">{m.matchScore}%</span>
                    <span className="sm-score-label">Deal Match</span>
                  </div>

                  <div className="sm-card-body">
                    <div className="sm-card-header">
                      <h3>
                        {m.lead?.name || 'Prospect Lead'}
                        {isMasked && <span className="sm-privacy-badge"><FaShieldAlt /> Privacy</span>}
                      </h3>
                      <span className="sm-lead-phone">{m.lead?.phone || 'Confidential'}</span>
                    </div>

                    <div className="sm-reasons">
                      {(m.whyMatched || []).map((reason, rIdx) => (
                        <div key={rIdx} className="sm-reason">
                          <FaCheckCircle className="sm-reason-check" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    <div className="sm-breakdown-chips">
                      <span>Budget: {m.scoreBreakdown?.budgetScore || 0}%</span>
                      <span>Location: {m.scoreBreakdown?.locationScore || 0}%</span>
                      <span>Config: {m.scoreBreakdown?.configScore || 0}%</span>
                    </div>
                  </div>

                  <div className="sm-card-footer">
                    <button 
                      type="button" 
                      className="sm-btn-detail"
                      onClick={() => setActiveDetailMatch(m)}
                    >
                      <FaEye /> Details
                    </button>
                    {!isMasked && cleanNumber && (
                      <a 
                        href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(`Hi ${m.lead?.name}, I have an exclusive residence at ${activeProperty?.projectName} (${activeProperty?.propertyCode}) matching your criteria.`)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="sm-btn-wa"
                      >
                        <FaWhatsapp /> Pitch
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Cards */}
          <div className="sm-cards-mobile">
            {matches.map((m, idx) => {
              const cleanNumber = (m.lead?.phone || '').replace(/[^0-9]/g, '');
              const isMasked = m.lead?.isLimitedPreview;

              return (
                <div key={idx} className="sm-card-mobile">
                  <div className="sm-card-mobile-top">
                    <span className="sm-score-percent">{m.matchScore}%</span>
                    <span className="sm-score-label">Match</span>
                  </div>
                  <div className="sm-card-mobile-body">
                    <h4>{m.lead?.name || 'Prospect'}</h4>
                    <div className="sm-reasons">
                      {(m.whyMatched || []).slice(0, 2).map((reason, rIdx) => (
                        <div key={rIdx} className="sm-reason">
                          <FaCheckCircle className="sm-reason-check" />
                          <span>{reason}</span>
                        </div>
                      ))}
                      {(m.whyMatched || []).length > 2 && (
                        <span className="sm-reason-more">+{m.whyMatched.length - 2} more</span>
                      )}
                    </div>
                    <div className="sm-card-mobile-footer">
                      <button 
                        type="button" 
                        className="sm-btn-detail"
                        onClick={() => setActiveDetailMatch(m)}
                      >
                        <FaEye /> Details
                      </button>
                      {!isMasked && cleanNumber && (
                        <a 
                          href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(`Hi ${m.lead?.name}, I have an exclusive residence at ${activeProperty?.projectName} (${activeProperty?.propertyCode}) matching your criteria.`)}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="sm-btn-wa"
                        >
                          <FaWhatsapp /> Pitch
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MATCH DETAILS MODAL — same as before, using sm- classes */}
      {activeDetailMatch && (
        <div className="sm-modal-overlay" onClick={() => setActiveDetailMatch(null)}>
          <div className="sm-modal sm-modal-detail" onClick={e => e.stopPropagation()}>
            <div className="sm-modal-header">
              <div>
                <h3>7-Factor Match Diagnostic</h3>
                <p className="sm-modal-subtitle">Compatibility analysis between buyer criteria and property inventory.</p>
              </div>
              <button type="button" className="sm-modal-close" onClick={() => setActiveDetailMatch(null)}><FaTimes /></button>
            </div>

            <div className="sm-modal-body">
              <div className="sm-modal-grid">
                <div className="sm-modal-col">
                  <span className="sm-col-title">BUYER LEAD CRITERIA</span>
                  <div className="sm-col-card">
                    <h4>{activeDetailMatch.lead?.name}</h4>
                    <p className="sm-col-contact">{activeDetailMatch.lead?.phone} {activeDetailMatch.lead?.email && `• ${activeDetailMatch.lead.email}`}</p>
                    <div className="sm-col-details">
                      <span>Budget Cap: <strong>${(activeDetailMatch.lead?.requirements?.budgetMax || 0).toLocaleString()}</strong></span>
                      <span>Layouts: <strong>{(activeDetailMatch.lead?.requirements?.preferredConfigurations || []).join(', ') || '3 BHK'}</strong></span>
                      <span>Locations: <strong>{(activeDetailMatch.lead?.requirements?.preferredLocations || []).join(', ') || 'Gurgaon Prime'}</strong></span>
                      <span>Timeline: <strong>{activeDetailMatch.lead?.requirements?.timeline || 'Immediate'}</strong></span>
                    </div>
                    <Link to={`/app/leads/${activeDetailMatch.lead?._id}`} className="sm-col-link">
                      Open Lead Details →
                    </Link>
                  </div>
                </div>

                <div className="sm-modal-col">
                  <span className="sm-col-title">PROPERTY INVENTORY</span>
                  <div className="sm-col-card">
                    <h4>{activeProperty?.projectName}</h4>
                    <p className="sm-col-contact">{activeProperty?.propertyCode} • {activeProperty?.address}</p>
                    <div className="sm-col-details">
                      <span>Asking Price: <strong>${activeProperty?.askingPrice?.toLocaleString()}</strong></span>
                      <span>Configuration: <strong>{activeProperty?.configuration}</strong></span>
                      <span>Carpet Area: <strong>{activeProperty?.sizeSqFt} sq.ft</strong></span>
                      <span>Status: <strong>{activeProperty?.status}</strong></span>
                    </div>
                    <Link to={`/app/properties/${activeProperty?._id}`} className="sm-col-link">
                      Open Property Details →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="sm-factors">
                <span className="sm-col-title">FACTOR COMPATIBILITY BREAKDOWN ({activeDetailMatch.matchScore}%)</span>
                <div className="sm-factors-grid">
                  <div className="sm-factor-tile">
                    <span>Budget</span>
                    <strong>{activeDetailMatch.scoreBreakdown?.budgetScore || 0}%</strong>
                  </div>
                  <div className="sm-factor-tile">
                    <span>Location</span>
                    <strong>{activeDetailMatch.scoreBreakdown?.locationScore || 0}%</strong>
                  </div>
                  <div className="sm-factor-tile">
                    <span>Layout</span>
                    <strong>{activeDetailMatch.scoreBreakdown?.configScore || 0}%</strong>
                  </div>
                  <div className="sm-factor-tile">
                    <span>Style</span>
                    <strong>{activeDetailMatch.scoreBreakdown?.propertyTypeScore || 0}%</strong>
                  </div>
                  <div className="sm-factor-tile">
                    <span>Size</span>
                    <strong>{activeDetailMatch.scoreBreakdown?.sizeScore || 0}%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="sm-modal-actions">
              <button type="button" className="sm-btn-secondary" onClick={() => setActiveDetailMatch(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};