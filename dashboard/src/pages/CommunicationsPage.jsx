import React, { useState, useEffect } from 'react';
import { communicationApi, leadApi, propertyApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { 
  FaCommentDots, 
  FaWhatsapp, 
  FaEnvelope, 
  FaShareAlt, 
  FaBullhorn, 
  FaPlus, 
  FaCheckCircle, 
  FaHistory,
  FaPaperPlane 
} from 'react-icons/fa';
import './CommunicationsPage.css';

export const CommunicationsPage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('outreach');

  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [history, setHistory] = useState([]);

  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [draftResult, setDraftResult] = useState(null);
  const [channel, setChannel] = useState('WhatsApp');

  const [toggles, setToggles] = useState({
    propertyName: true,
    configuration: true,
    location: true,
    propertyLink: true,
    price: false,
    propertySize: false,
  });

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: 'Weekend Open House VIP Broadcast',
    channel: 'WhatsApp',
    propertyId: '',
    targetAudience: 'All Leads',
    content: 'Exclusive Invitation: Join us this Saturday for a VIP preview of our latest luxury residences. RSVP directly to this message for private viewing passes.',
  });

  const loadData = () => {
    leadApi.list().then(res => {
      setLeads(res.data || []);
      if ((res.data || []).length > 0 && !selectedLeadId) {
        setSelectedLeadId(res.data[0]._id);
      }
    }).catch(() => {});

    propertyApi.list().then(res => {
      setProperties(res.data || []);
      if ((res.data || []).length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(res.data[0]._id);
        setCampaignForm(prev => ({ ...prev, propertyId: res.data[0]._id }));
      }
    }).catch(() => {});

    communicationApi.listTemplates().then(res => {
      setTemplates(res.data || []);
      if ((res.data || []).length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(res.data[0]._id);
      }
    }).catch(() => {});

    communicationApi.listCampaigns().then(res => {
      setCampaigns(res.data || []);
    }).catch(() => {});

    communicationApi.listHistory().then(res => {
      setHistory(res.data || []);
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateDraft = async () => {
    if (!selectedLeadId) {
      addToast('Please select a client prospect first', 'error');
      return;
    }
    try {
      const res = await communicationApi.generateDraft({
        leadId: selectedLeadId,
        propertyId: selectedPropertyId || undefined,
        templateId: selectedTemplateId || undefined,
        channel,
        detailsToggle: toggles,
      });
      setDraftResult(res.data);
      addToast('Draft generated with interpolated listing variables');
    } catch (err) {
      addToast(err.message || 'Error generating draft', 'error');
    }
  };

  const handleSendAndLog = async () => {
    if (!draftResult) return;
    if (!selectedLeadId) {
      addToast('A valid lead must be selected before sending.', 'error');
      return;
    }
    try {
      await communicationApi.sendOutreach({
        leadId: selectedLeadId,
        propertyId: selectedPropertyId || undefined,
        channel,
        content: draftResult.rendered,
        recipient: draftResult.recipient || 'Client',
      });

      addToast('Outreach logged successfully in workspace timeline');
      loadData();

      if (channel === 'WhatsApp') {
        const cleanNumber = (draftResult.recipient || '').replace(/[^0-9]/g, '');
        const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(draftResult.rendered)}`;
        window.open(url, '_blank');
      }
    } catch (err) {
      addToast(err.message || 'Error recording message', 'error');
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!campaignForm.title || !campaignForm.content) {
      addToast('Title and campaign content are required', 'error');
      return;
    }

    try {
      await communicationApi.createCampaign({
        ...campaignForm,
        propertyId: campaignForm.propertyId || undefined,
      });
      addToast('Broadcast campaign initiated successfully!');
      setShowCampaignModal(false);
      communicationApi.listCampaigns().then(res => setCampaigns(res.data || []));
    } catch (err) {
      addToast(err.message || 'Failed to create campaign', 'error');
    }
  };

  return (
    <div className="comm-page">
      {/* Header */}
      <div className="comm-header">
        <div>
          <h1>Client Communications</h1>
          <p className="comm-subtitle">Personalized 1:1 client outreach and segment-wide broadcast campaigns.</p>
        </div>
        <button className="comm-btn-primary" onClick={() => setShowCampaignModal(true)}>
          <FaBullhorn /> Create Campaign
        </button>
      </div>

      {/* Tabs */}
      <div className="comm-tabs">
        <button 
          className={`comm-tab ${activeTab === 'outreach' ? 'comm-tab-active' : ''}`}
          onClick={() => setActiveTab('outreach')}
        >
          <FaPaperPlane /> 1:1 Outreach
        </button>
        <button 
          className={`comm-tab ${activeTab === 'campaigns' ? 'comm-tab-active' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          <FaBullhorn /> Campaigns ({campaigns.length})
        </button>
        <button 
          className={`comm-tab ${activeTab === 'history' ? 'comm-tab-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory /> History ({history.length})
        </button>
      </div>

      {/* TAB 1: Outreach */}
      {activeTab === 'outreach' && (
        <div className="comm-studio">
          <div className="comm-config">
            <h3>Compose Client Outreach</h3>

            <div className="comm-form-group">
              <label>Select Prospect *</label>
              <select value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)}>
                <option value="">Choose Lead...</option>
                {leads.map(l => (
                  <option key={l._id} value={l._id}>{l.name} ({l.phone})</option>
                ))}
              </select>
            </div>

            <div className="comm-form-group">
              <label>Link Property Listing</label>
              <select value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}>
                <option value="">No Property Attached</option>
                {properties.map(p => (
                  <option key={p._id} value={p._id}>{p.projectName} ({p.propertyCode})</option>
                ))}
              </select>
            </div>

            <div className="comm-form-group">
              <label>Channel</label>
              <div className="comm-channels">
                <button 
                  type="button" 
                  className={`comm-channel ${channel === 'WhatsApp' ? 'comm-channel-active' : ''}`}
                  onClick={() => setChannel('WhatsApp')}
                >
                  <FaWhatsapp /> WhatsApp
                </button>
                <button 
                  type="button" 
                  className={`comm-channel ${channel === 'Email' ? 'comm-channel-active' : ''}`}
                  onClick={() => setChannel('Email')}
                >
                  <FaEnvelope /> Email
                </button>
              </div>
            </div>

            <div className="comm-form-group">
              <label>Template</label>
              <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}>
                <option value="">Custom Outreach</option>
                {templates.map(t => (
                  <option key={t._id} value={t._id}>{t.title} ({t.channel})</option>
                ))}
              </select>
            </div>

            <div className="comm-toggles">
              <h4>Property Details Visibility</h4>
              <div className="comm-toggle-grid">
                <label><input type="checkbox" checked={toggles.propertyName} onChange={e => setToggles({ ...toggles, propertyName: e.target.checked })} /> Property Name</label>
                <label><input type="checkbox" checked={toggles.configuration} onChange={e => setToggles({ ...toggles, configuration: e.target.checked })} /> Configuration</label>
                <label><input type="checkbox" checked={toggles.location} onChange={e => setToggles({ ...toggles, location: e.target.checked })} /> Location</label>
                <label><input type="checkbox" checked={toggles.propertyLink} onChange={e => setToggles({ ...toggles, propertyLink: e.target.checked })} /> Property Link</label>
                <label><input type="checkbox" checked={toggles.price} onChange={e => setToggles({ ...toggles, price: e.target.checked })} /> Asking Price (Default Off)</label>
                <label><input type="checkbox" checked={toggles.propertySize} onChange={e => setToggles({ ...toggles, propertySize: e.target.checked })} /> Carpet Area (Default Off)</label>
              </div>
            </div>

            <button type="button" className="comm-btn-primary comm-btn-full" onClick={handleGenerateDraft}>
              Generate Draft
            </button>
          </div>

          <div className="comm-preview">
            <h3>Outreach Preview</h3>
            {draftResult ? (
              <div className="comm-preview-box">
                <div className="comm-preview-meta">
                  <span>To: <strong>{draftResult.recipient || 'Client'}</strong></span>
                  <span>Via: <strong>{draftResult.channel}</strong></span>
                </div>
                <textarea 
                  className="comm-preview-text"
                  value={draftResult.rendered}
                  onChange={e => setDraftResult({ ...draftResult, rendered: e.target.value })}
                  rows={10}
                />
                <button type="button" className="comm-btn-send" onClick={handleSendAndLog}>
                  <FaShareAlt /> Send via {channel}
                </button>
              </div>
            ) : (
              <div className="comm-preview-empty">
                Select a client and click "Generate Draft" to preview.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="comm-campaigns">
          {campaigns.length === 0 ? (
            <div className="comm-empty">
              <FaBullhorn className="comm-empty-icon" />
              <h3>No broadcast campaigns created yet</h3>
              <p>Launch targeted WhatsApp or email broadcasts to segments of your leads.</p>
              <button className="comm-btn-primary" onClick={() => setShowCampaignModal(true)}>
                <FaPlus /> Create First Campaign
              </button>
            </div>
          ) : (
            <>
              <div className="comm-table-wrap">
                <table className="comm-table">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Audience</th>
                      <th>Channel</th>
                      <th>Property</th>
                      <th>Recipients</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c._id}>
                        <td><strong>{c.title}</strong></td>
                        <td><span className="comm-tag">{c.targetAudience}</span></td>
                        <td>
                          <span className={`comm-channel-badge comm-channel-${c.channel?.toLowerCase()}`}>
                            {c.channel === 'WhatsApp' ? <FaWhatsapp /> : <FaEnvelope />} {c.channel}
                          </span>
                        </td>
                        <td>{c.propertyId?.projectName || 'General'}</td>
                        <td><strong>{c.totalRecipients || 1}</strong></td>
                        <td><span className="comm-status comm-status-active">{c.status}</span></td>
                        <td>{new Date(c.scheduledAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="comm-campaign-cards">
                {campaigns.map(c => (
                  <div key={c._id} className="comm-card">
                    <div className="comm-card-top">
                      <strong>{c.title}</strong>
                      <span className={`comm-channel-badge comm-channel-${c.channel?.toLowerCase()}`}>
                        {c.channel === 'WhatsApp' ? <FaWhatsapp /> : <FaEnvelope />} {c.channel}
                      </span>
                    </div>
                    <div className="comm-card-details">
                      <span>Audience: {c.targetAudience}</span>
                      <span>Property: {c.propertyId?.projectName || 'General'}</span>
                      <span>Recipients: {c.totalRecipients || 1}</span>
                      <span>Status: {c.status}</span>
                      <span>Created: {new Date(c.scheduledAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: History */}
      {activeTab === 'history' && (
        <div className="comm-history">
          {history.length === 0 ? (
            <div className="comm-empty">
              <FaHistory className="comm-empty-icon" />
              <h3>No outreach history yet</h3>
              <p>Send your first 1:1 outreach or broadcast campaign to see history here.</p>
            </div>
          ) : (
            <>
              <div className="comm-table-wrap">
                <table className="comm-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Client</th>
                      <th>Channel</th>
                      <th>Property</th>
                      <th>Message Preview</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h._id}>
                        <td>{new Date(h.sentAt).toLocaleString()}</td>
                        <td><strong>{h.leadId?.name || h.recipient}</strong></td>
                        <td>{h.channel}</td>
                        <td>{h.propertyId?.projectName || 'N/A'}</td>
                        <td className="comm-snippet">{h.content?.slice(0, 60)}...</td>
                        <td><span className="comm-status comm-status-active">{h.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="comm-history-cards">
                {history.map(h => (
                  <div key={h._id} className="comm-card">
                    <div className="comm-card-top">
                      <strong>{h.leadId?.name || h.recipient}</strong>
                      <span>{new Date(h.sentAt).toLocaleDateString()}</span>
                    </div>
                    <div className="comm-card-details">
                      <span>Channel: {h.channel}</span>
                      <span>Property: {h.propertyId?.projectName || 'N/A'}</span>
                      <span className="comm-snippet">{h.content?.slice(0, 60)}...</span>
                      <span>Status: <span className="comm-status comm-status-active">{h.status}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* CAMPAIGN MODAL */}
      {showCampaignModal && (
        <div className="comm-modal-overlay" onClick={() => setShowCampaignModal(false)}>
          <div className="comm-modal" onClick={e => e.stopPropagation()}>
            <div className="comm-modal-header">
              <h3>Create Broadcast Campaign</h3>
              <button className="comm-modal-close" onClick={() => setShowCampaignModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateCampaign} className="comm-modal-form">
              <div className="comm-form-group">
                <label>Campaign Title *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Golf Course Road Luxury Pre-Launch Alert" 
                  value={campaignForm.title} 
                  onChange={e => setCampaignForm({ ...campaignForm, title: e.target.value })} 
                />
              </div>

              <div className="comm-form-row">
                <div className="comm-form-group">
                  <label>Channel</label>
                  <select value={campaignForm.channel} onChange={e => setCampaignForm({ ...campaignForm, channel: e.target.value })}>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
                <div className="comm-form-group">
                  <label>Target Audience</label>
                  <select value={campaignForm.targetAudience} onChange={e => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })}>
                    <option value="All Leads">All Leads</option>
                    <option value="Hot Leads Only">🔥 Hot Leads</option>
                    <option value="Warm Leads">☀️ Warm Leads</option>
                    <option value="Smart QR Inquiries">📱 Smart QR</option>
                    <option value="Open House Visitors">🚪 Open House</option>
                  </select>
                </div>
              </div>

              <div className="comm-form-group">
                <label>Featured Property</label>
                <select value={campaignForm.propertyId} onChange={e => setCampaignForm({ ...campaignForm, propertyId: e.target.value })}>
                  <option value="">General Broadcast</option>
                  {properties.map(p => (
                    <option key={p._id} value={p._id}>{p.projectName} ({p.propertyCode})</option>
                  ))}
                </select>
              </div>

              <div className="comm-form-group">
                <label>Campaign Message *</label>
                <textarea 
                  rows={4} 
                  required 
                  value={campaignForm.content} 
                  onChange={e => setCampaignForm({ ...campaignForm, content: e.target.value })} 
                />
              </div>

              <div className="comm-modal-actions">
                <button type="button" className="comm-btn-secondary" onClick={() => setShowCampaignModal(false)}>Cancel</button>
                <button type="submit" className="comm-btn-primary">Launch Campaign 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};