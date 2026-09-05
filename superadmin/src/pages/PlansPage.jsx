import React, { useState, useEffect } from 'react';
import { superadminApi } from '../services/api/superadminApi.js';
import { 
  FaTags, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaStar, 
  FaTimes, 
  FaLayerGroup 
} from 'react-icons/fa';
import './PlansPage.css';

export const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState({
    planId: '',
    name: '',
    monthlyPriceUSD: 49,
    annualPriceUSD: 490,
    desc: '',
    popular: false,
    featuresText: '',
    propertiesLimit: -1,
    agentsLimit: -1,
    isActive: true,
  });

  const loadPlans = () => {
    setLoading(true);
    superadminApi.listPlans()
      .then(res => setPlans(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm({
      planId: '',
      name: '',
      monthlyPriceUSD: 49,
      annualPriceUSD: 490,
      desc: '',
      popular: false,
      featuresText: 'Up to 100 Properties\n5 Agent Seats\nSmart QR Engine\nSmart Match Algorithm',
      propertiesLimit: 100,
      agentsLimit: 5,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setForm({
      planId: plan.planId,
      name: plan.name,
      monthlyPriceUSD: plan.monthlyPriceUSD,
      annualPriceUSD: plan.annualPriceUSD,
      desc: plan.desc || '',
      popular: !!plan.popular,
      featuresText: (plan.features || []).join('\n'),
      propertiesLimit: plan.limits?.properties ?? -1,
      agentsLimit: plan.limits?.agents ?? -1,
      isActive: plan.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const features = form.featuresText.split('\n').map(s => s.trim()).filter(Boolean);
    const payload = {
      planId: form.planId.toLowerCase().trim(),
      name: form.name.trim(),
      monthlyPriceUSD: Number(form.monthlyPriceUSD),
      annualPriceUSD: Number(form.annualPriceUSD),
      desc: form.desc,
      popular: form.popular,
      features,
      limits: {
        properties: Number(form.propertiesLimit),
        agents: Number(form.agentsLimit),
        qrs: Number(form.propertiesLimit),
      },
      isActive: form.isActive,
    };

    try {
      if (editingPlan) {
        await superadminApi.updatePlan(editingPlan._id, payload);
      } else {
        await superadminApi.createPlan(payload);
      }
      setShowModal(false);
      loadPlans();
    } catch (err) {
      alert(err.message || 'Error saving plan configuration');
    }
  };

  const handleDeactivate = async (plan) => {
    if (!window.confirm(`Are you sure you want to deactivate plan "${plan.name}"?`)) return;
    try {
      await superadminApi.updatePlan(plan._id, { isActive: !plan.isActive });
      loadPlans();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  return (
    <div className="sa-plans-view">
      <div className="sa-plans-header-row">
        <div>
          <h1>Subscription Plan Management</h1>
          <p className="text-muted">Configure pricing tiers, features, and limits. Real-time updates sync across DealDesk onboarding and customer billing.</p>
        </div>
        <button className="sa-plans-btn-primary" onClick={openCreateModal}>
          <FaPlus /> Create New Plan
        </button>
      </div>

      {loading ? (
        <div className="sa-plans-loading">Loading plans collection...</div>
      ) : (
        <div className="sa-plans-cards-grid">
          {plans.map(p => (
            <div key={p._id} className={`sa-plan-card ${p.popular ? 'is-popular' : ''} ${!p.isActive ? 'is-inactive' : ''}`}>
              <div className="sa-plan-card-top">
                <div>
                  <span className="sa-plan-id-tag">{p.planId}</span>
                  <h3>{p.name}</h3>
                </div>
                <div className="sa-plan-top-actions">
                  <span className={`sa-plan-status-badge ${p.isActive ? 'active' : 'disabled'}`}>
                    {p.isActive ? 'Active' : 'Archived'}
                  </span>
                  {p.popular && <span className="sa-plan-popular-badge"><FaStar /> Popular</span>}
                </div>
              </div>

              <p className="sa-plan-desc">{p.desc || 'Workspace subscription plan.'}</p>

              <div className="sa-plan-prices-box">
                <div className="price-item">
                  <span className="price-label">Monthly</span>
                  <span className="price-num">${p.monthlyPriceUSD}</span>
                </div>
                <div className="price-divider"></div>
                <div className="price-item">
                  <span className="price-label">Annual</span>
                  <span className="price-num">${p.annualPriceUSD}</span>
                </div>
              </div>

              <div className="sa-plan-limits-row">
                <span>Properties: <strong>{p.limits?.properties === -1 ? 'Unlimited' : p.limits?.properties}</strong></span>
                <span>Agents: <strong>{p.limits?.agents === -1 ? 'Unlimited' : p.limits?.agents}</strong></span>
              </div>

              <ul className="sa-plan-features-list">
                {(p.features || []).map((feat, fidx) => (
                  <li key={fidx}><FaCheck className="check" /> {feat}</li>
                ))}
              </ul>

              <div className="sa-plan-card-footer">
                <button className="sa-plan-btn-edit" onClick={() => openEditModal(p)}>
                  <FaEdit /> Edit Plan
                </button>
                <button 
                  className={`sa-plan-btn-toggle ${p.isActive ? 'deactivate' : 'activate'}`}
                  onClick={() => handleDeactivate(p)}
                >
                  {p.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Edit / Create Modal */}
      {showModal && (
        <div className="sa-plans-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="sa-plans-modal-card" onClick={e => e.stopPropagation()}>
            <div className="sa-plans-modal-header">
              <h3>{editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create Subscription Plan'}</h3>
              <button className="sa-plans-modal-close" onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="sa-plans-form">
              <div className="sa-plans-form-grid-2">
                <div className="sa-plans-group">
                  <label>Plan Key / ID *</label>
                  <input 
                    type="text" 
                    required 
                    disabled={!!editingPlan}
                    placeholder="e.g. starter, professional, business, custom" 
                    value={form.planId} 
                    onChange={e => setForm({ ...form, planId: e.target.value })} 
                  />
                </div>

                <div className="sa-plans-group">
                  <label>Plan Display Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Professional Suite" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                  />
                </div>

                <div className="sa-plans-group">
                  <label>Monthly Price ($ USD) *</label>
                  <input 
                    type="number" 
                    required 
                    value={form.monthlyPriceUSD} 
                    onChange={e => setForm({ ...form, monthlyPriceUSD: e.target.value })} 
                  />
                </div>

                <div className="sa-plans-group">
                  <label>Annual Price ($ USD) *</label>
                  <input 
                    type="number" 
                    required 
                    value={form.annualPriceUSD} 
                    onChange={e => setForm({ ...form, annualPriceUSD: e.target.value })} 
                  />
                </div>

                <div className="sa-plans-group">
                  <label>Properties Limit (-1 for Unlimited)</label>
                  <input 
                    type="number" 
                    value={form.propertiesLimit} 
                    onChange={e => setForm({ ...form, propertiesLimit: e.target.value })} 
                  />
                </div>

                <div className="sa-plans-group">
                  <label>Agents Limit (-1 for Unlimited)</label>
                  <input 
                    type="number" 
                    value={form.agentsLimit} 
                    onChange={e => setForm({ ...form, agentsLimit: e.target.value })} 
                  />
                </div>
              </div>

              <div className="sa-plans-group">
                <label>Plan Description</label>
                <input 
                  type="text" 
                  value={form.desc} 
                  onChange={e => setForm({ ...form, desc: e.target.value })} 
                  placeholder="Target customer segment description"
                />
              </div>

              <div className="sa-plans-group">
                <label>Features (One feature per line)</label>
                <textarea 
                  rows={4} 
                  value={form.featuresText} 
                  onChange={e => setForm({ ...form, featuresText: e.target.value })} 
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div className="sa-plans-checkboxes-row">
                <label className="sa-plans-checkbox">
                  <input 
                    type="checkbox" 
                    checked={form.popular} 
                    onChange={e => setForm({ ...form, popular: e.target.checked })} 
                  />
                  <span>Mark as "Most Popular / Recommended"</span>
                </label>

                <label className="sa-plans-checkbox">
                  <input 
                    type="checkbox" 
                    checked={form.isActive} 
                    onChange={e => setForm({ ...form, isActive: e.target.checked })} 
                  />
                  <span>Active & Visible in Onboarding</span>
                </label>
              </div>

              <div className="sa-plans-modal-actions">
                <button type="button" className="sa-plans-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="sa-plans-btn-primary">Save Plan Configuration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
