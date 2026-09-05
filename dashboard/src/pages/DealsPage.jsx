import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dealApi, leadApi, propertyApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { 
  FaHandshake, 
  FaPlus, 
  FaEye, 
  FaTimes, 
  FaBuilding, 
  FaUserTie, 
  FaExternalLinkAlt,
  FaMoneyBillWave,
  FaPercentage
} from 'react-icons/fa';
import './DealsPage.css';

const STAGES = ['New', 'Qualified', 'Viewing', 'Offer/Negotiation', 'Won', 'Lost'];

export const DealsPage = () => {
  const { addToast } = useToast();
  const [deals, setDeals] = useState([]);
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDealDetail, setSelectedDealDetail] = useState(null);

  const [formData, setFormData] = useState({
    leadId: '',
    propertyId: '',
    dealValue: 500000,
    stage: 'New',
    commissionPercent: 2.0,
    notes: 'Initial buyer negotiation.',
  });

  const loadDeals = () => {
    setLoading(true);
    dealApi.list()
      .then(res => setDeals(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDeals();
    propertyApi.list().then(r => setProperties(r.data || [])).catch(() => {});
    leadApi.list().then(r => setLeads(r.data || [])).catch(() => {});
  }, []);

  const handleStageChange = async (dealId, newStage, e) => {
    if (e) e.stopPropagation();
    try {
      await dealApi.update(dealId, { stage: newStage });
      addToast(`Deal moved to ${newStage}`);
      loadDeals();
      if (selectedDealDetail && selectedDealDetail._id === dealId) {
        setSelectedDealDetail({ ...selectedDealDetail, stage: newStage });
      }
    } catch (err) {
      addToast(err.message || 'Error updating deal', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await dealApi.create(formData);
      addToast('Deal recorded in sales pipeline!');
      setShowModal(false);
      loadDeals();
    } catch (err) {
      addToast(err.message || 'Error creating deal', 'error');
    }
  };

  const getCommission = (deal) => {
    const percent = deal.commissionPercent || 2;
    return Math.round((deal.dealValue || 0) * (percent / 100));
  };

  return (
    <div className="deal-page">
      {/* Header */}
      <div className="deal-header">
        <div>
          <h1>Deals Pipeline</h1>
          <p className="deal-subtitle">Track buyer negotiations, commission projections, and closing timelines across your inventory.</p>
        </div>
        <button className="deal-btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Record Deal
        </button>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="deal-loading">Loading deals pipeline...</div>
      ) : deals.length === 0 ? (
        <div className="deal-empty">
          <FaHandshake className="deal-empty-icon" />
          <h3>No deals in pipeline yet</h3>
          <p>Record your first buyer negotiation and track it through the sales stages.</p>
          <button className="deal-btn-primary" onClick={() => setShowModal(true)}>Record First Deal</button>
        </div>
      ) : (
        <>
          {/* Desktop Kanban */}
          <div className="deal-kanban">
            {STAGES.map(stage => {
              const stageDeals = deals.filter(d => d.stage === stage);
              const stageTotal = stageDeals.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

              return (
                <div key={stage} className="deal-column">
                  <div className="deal-column-header">
                    <h4>{stage} <span className="deal-count">({stageDeals.length})</span></h4>
                    <span className="deal-column-total">${stageTotal.toLocaleString()}</span>
                  </div>

                  <div className="deal-column-cards">
                    {stageDeals.map(d => (
                      <div key={d._id} className="deal-card" onClick={() => setSelectedDealDetail(d)}>
                        <div className="deal-card-value">${d.dealValue?.toLocaleString()}</div>
                        <h5 className="deal-card-client">{d.leadId?.name || 'Client'}</h5>
                        <p className="deal-card-prop">{d.propertyId?.projectName || 'Property'}</p>
                        <span className="deal-card-agent">Advisor: {d.agentId?.name || 'Assigned'}</span>

                        <div className="deal-card-stage" onClick={e => e.stopPropagation()}>
                          <select value={d.stage} onChange={e => handleStageChange(d._id, e.target.value, e)}>
                            {STAGES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="deal-empty-card">No deals</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Cards */}
          <div className="deal-cards-mobile">
            {deals.map(d => (
              <div key={d._id} className="deal-card-mobile" onClick={() => setSelectedDealDetail(d)}>
                <div className="deal-card-mobile-top">
                  <div className="deal-card-mobile-value">${d.dealValue?.toLocaleString()}</div>
                  <span className={`deal-stage-badge deal-stage-${d.stage?.toLowerCase() || 'new'}`}>
                    {d.stage || 'New'}
                  </span>
                </div>
                <div className="deal-card-mobile-client">
                  <FaUserTie className="deal-card-mobile-icon" /> {d.leadId?.name || 'Client'}
                </div>
                <div className="deal-card-mobile-prop">
                  <FaBuilding className="deal-card-mobile-icon" /> {d.propertyId?.projectName || 'Property'}
                </div>
                <div className="deal-card-mobile-footer">
                  <span className="deal-card-mobile-agent">Advisor: {d.agentId?.name || 'Assigned'}</span>
                  <select value={d.stage} onClick={e => e.stopPropagation()} onChange={e => handleStageChange(d._id, e.target.value, e)}>
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* RECORD DEAL MODAL */}
      {showModal && (
        <div className="deal-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="deal-modal deal-modal-create" onClick={e => e.stopPropagation()}>
            <div className="deal-modal-header">
              <h3>Record New Deal</h3>
              <button type="button" className="deal-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} className="deal-modal-form">
              <div className="deal-form-group">
                <label>Prospect / Client *</label>
                <select required value={formData.leadId} onChange={e => setFormData({ ...formData, leadId: e.target.value })}>
                  <option value="">Select Lead...</option>
                  {leads.map(l => (
                    <option key={l._id} value={l._id}>{l.name} ({l.phone})</option>
                  ))}
                </select>
              </div>

              <div className="deal-form-group">
                <label>Property Listing *</label>
                <select required value={formData.propertyId} onChange={e => setFormData({ ...formData, propertyId: e.target.value })}>
                  <option value="">Select Property...</option>
                  {properties.map(p => (
                    <option key={p._id} value={p._id}>{p.projectName} ({p.propertyCode})</option>
                  ))}
                </select>
              </div>

              <div className="deal-form-row">
                <div className="deal-form-group">
                  <label>Deal Value ($) *</label>
                  <input type="number" required value={formData.dealValue} onChange={e => setFormData({ ...formData, dealValue: Number(e.target.value) })} />
                </div>
                <div className="deal-form-group">
                  <label>Commission %</label>
                  <input type="number" step="0.1" value={formData.commissionPercent} onChange={e => setFormData({ ...formData, commissionPercent: Number(e.target.value) })} />
                </div>
              </div>

              <div className="deal-form-group">
                <label>Notes & Negotiation Terms</label>
                <textarea rows={2} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div className="deal-modal-actions">
                <button type="button" className="deal-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="deal-btn-primary">Save Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEAL DETAILS MODAL */}
      {selectedDealDetail && (
        <div className="deal-modal-overlay" onClick={() => setSelectedDealDetail(null)}>
          <div className="deal-modal deal-modal-detail" onClick={e => e.stopPropagation()}>
            <div className="deal-modal-header">
              <div>
                <h3>Deal Record</h3>
                <p className="deal-modal-subtitle">#{selectedDealDetail._id.slice(-6).toUpperCase()}</p>
              </div>
              <button type="button" className="deal-modal-close" onClick={() => setSelectedDealDetail(null)}><FaTimes /></button>
            </div>

            <div className="deal-modal-body">
              <div className="deal-stats">
                <div className="deal-stat">
                  <span className="deal-stat-label">Deal Value</span>
                  <strong>${selectedDealDetail.dealValue?.toLocaleString()}</strong>
                </div>
                <div className="deal-stat">
                  <span className="deal-stat-label">Commission ({selectedDealDetail.commissionPercent || 2}%)</span>
                  <strong className="deal-stat-green">${getCommission(selectedDealDetail).toLocaleString()}</strong>
                </div>
                <div className="deal-stat">
                  <span className="deal-stat-label">Stage</span>
                  <span className={`deal-stage-badge deal-stage-${selectedDealDetail.stage?.toLowerCase() || 'new'}`}>
                    {selectedDealDetail.stage || 'New'}
                  </span>
                </div>
              </div>

              <div className="deal-entity">
                <div className="deal-entity-top">
                  <FaBuilding className="deal-entity-icon" />
                  <h4>{selectedDealDetail.propertyId?.projectName || 'Property'}</h4>
                </div>
                <p className="deal-entity-sub">{selectedDealDetail.propertyId?.propertyCode} • {selectedDealDetail.propertyId?.address}</p>
                {selectedDealDetail.propertyId && (
                  <Link to={`/app/properties/${selectedDealDetail.propertyId._id}`} className="deal-link">
                    Open Property Details →
                  </Link>
                )}
              </div>

              <div className="deal-entity">
                <div className="deal-entity-top">
                  <FaUserTie className="deal-entity-icon" />
                  <h4>{selectedDealDetail.leadId?.name || 'Client'}</h4>
                </div>
                <p className="deal-entity-sub">{selectedDealDetail.leadId?.phone} {selectedDealDetail.leadId?.email && `• ${selectedDealDetail.leadId.email}`}</p>
                {selectedDealDetail.leadId && (
                  <Link to={`/app/leads/${selectedDealDetail.leadId._id}`} className="deal-link">
                    Open Lead Details →
                  </Link>
                )}
              </div>

              {selectedDealDetail.notes && (
                <div className="deal-notes">
                  <label>Notes:</label>
                  <p>{selectedDealDetail.notes}</p>
                </div>
              )}
            </div>

            <div className="deal-modal-actions">
              <button type="button" className="deal-btn-secondary" onClick={() => setSelectedDealDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};