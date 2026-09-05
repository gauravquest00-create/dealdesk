import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  propertyApi, 
  viewingApi, 
  openHouseApi, 
  qrApi, 
  leadApi, 
  documentApi, 
  dealApi,
  uploadApi,
  teamApi,
  matchApi
} from '../services/api/services.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { 
  FaArrowLeft, FaBuilding, FaBed, FaBath, FaRulerCombined, FaCompass, FaCouch, FaClock,
  FaMapMarkerAlt, FaMoneyBillWave, FaPercentage, FaCheckCircle, FaExclamationTriangle,
  FaEdit, FaTrash, FaCamera, FaQrcode, FaCalendarAlt, FaDoorOpen, FaUserFriends,
  FaFolder, FaHandshake, FaHistory, FaPlus, FaDownload, FaExternalLinkAlt, FaWhatsapp,
  FaTimes, FaShieldAlt, FaFileAlt, FaCloudUploadAlt, FaEye, FaSpinner, FaUserCheck, FaBolt, FaShareAlt
} from 'react-icons/fa';
import './PropertyDetailPage.css';

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [replacements, setReplacements] = useState([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [showOpenHouseModal, setShowOpenHouseModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [propertyMatches, setPropertyMatches] = useState([]);
  const [propertyAgents, setPropertyAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const { isAdmin } = useAuth();

  // Media upload & drag-drop state
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const floorPlanInputRef = useRef(null);

  // Form states
  const [editForm, setEditForm] = useState({});
  const [mediaForm, setMediaForm] = useState({ coverPhotoUrl: '', newPhotoUrl: '', floorPlanUrl: '' });
  
  // Viewing Form (Correctly formatted: YYYY-MM-DD + separate HH:mm)
  const [viewingForm, setViewingForm] = useState({ 
    leadId: '', 
    clientName: '', 
    clientPhone: '', 
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
    scheduledTime: '15:00', 
    notes: '' 
  });
  
  // OpenHouse Form (Uses eventDate required by model)
  const [openHouseForm, setOpenHouseForm] = useState({ 
    title: 'Exclusive Weekend Open House Preview', 
    eventDate: new Date(Date.now() + 259200000).toISOString().split('T')[0], 
    startTime: '11:00', 
    endTime: '16:00' 
  });
  
  // Lead Form
  const [leadForm, setLeadForm] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    temperature: 'Hot', 
    budgetMax: 0, 
    notes: '' 
  });
  
  // Document Form
  const [docForm, setDocForm] = useState({ 
    title: '', 
    category: 'Legal', 
    fileUrl: '', 
    status: 'Verified' 
  });
  
  // Deal Form (Valid DEAL_STAGE: 'New', 'Qualified', 'Viewing', 'Offer/Negotiation', 'Won', 'Lost')
  const [dealForm, setDealForm] = useState({ 
    leadId: '', 
    clientName: '', 
    title: '', 
    stage: 'Offer/Negotiation', 
    dealValue: 0, 
    commissionPercent: 2.0, 
    expectedCloseDate: new Date(Date.now() + 1209600000).toISOString().split('T')[0] 
  });

  const loadPropertyData = () => {
    setLoading(true);
    propertyApi.get(id)
      .then(res => {
        const data = res.data;
        setProperty(data);
        setEditForm({
          projectName: data.projectName || '',
          propertyCode: data.propertyCode || '',
          propertyType: data.propertyType || 'Apartment',
          configuration: data.configuration || '3 BHK',
          status: data.status || 'Available',
          carpetAreaSqFt: data.carpetAreaSqFt || data.sizeSqFt || 0,
          superAreaSqFt: data.superAreaSqFt || Math.round((data.sizeSqFt || 1000) * 1.25),
          bedrooms: data.bedrooms || 3,
          bathrooms: data.bathrooms || 3,
          floor: data.floor || 5,
          totalFloors: data.totalFloors || 24,
          facing: data.facing || 'North-East',
          furnishing: data.furnishing || 'Semi-Furnished',
          possession: data.possession || 'Ready to Move',
          askingPrice: data.askingPrice || 0,
          isNegotiable: !!data.isNegotiable,
          monthlyMaintenance: data.monthlyMaintenance || 0,
          expectedRoiPct: data.expectedRoiPct || 6.5,
          address: data.address || '',
          sector: data.sector || '',
          city: data.city || 'Gurugram',
          googleMapsUrl: data.googleMapsUrl || '',
          reraNumber: data.reraNumber || '',
          description: data.description || '',
          privateNotes: data.privateNotes || '',
          amenities: data.amenities || [],
        });
        setMediaForm({
          coverPhotoUrl: data.photos?.[0]?.url || '',
          newPhotoUrl: '',
          floorPlanUrl: data.floorPlanUrl || '',
        });
        if (data.status === 'Sold' || data.status === 'Under Offer') {
          propertyApi.getReplacements(id).then(r => setReplacements(r.data || [])).catch(() => {});
        }
        setSelectedAgentId(data.assignedAgentId?._id || data.assignedAgentId || '');
      })
      .then(() => {
        matchApi.getForProperty(id).then(res => setPropertyMatches(res.data || [])).catch(() => {});
        teamApi.list().then(res => {
          const validAgents = (res.data || []).filter(a => 
            a.role === 'ADMIN' || 
            a.subRole === 'PROPERTY_AGENT' || 
            a.subRole === 'PROPERTY_LEAD_AGENT'
          );
          setPropertyAgents(validAgents);
        }).catch(() => {});
      })
      .catch(err => addToast(err.message || 'Error loading listing', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPropertyData(); }, [id]);

  // Update Property Full Details
  const handleAssignAdvisor = async (e) => {
    e.preventDefault();
    try {
      await propertyApi.update(id, { assignedAgentId: selectedAgentId || null });
      addToast('Listing advisor assignment updated successfully!');
      setShowAssignModal(false);
      loadPropertyData();
    } catch (err) {
      addToast(err.message || 'Error updating advisor assignment', 'error');
    }
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    try {
      await propertyApi.update(id, editForm);
      addToast('Listing updated successfully!');
      setShowEditModal(false);
      loadPropertyData();
    } catch (err) { addToast(err.message || 'Error updating listing', 'error'); }
  };

  // Drag & Drop / File Select Cloudinary Upload Handler
  const handleFileUploadToCloudinary = async (files, isFloorPlan = false) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        const base64Data = await base64Promise;

        // Upload to Cloudinary via backend endpoint
        const res = await uploadApi.upload(base64Data, 'dealdesk/properties');
        const uploadedUrl = res.data?.url;

        if (uploadedUrl) {
          if (isFloorPlan) {
            setMediaForm(prev => ({ ...prev, floorPlanUrl: uploadedUrl }));
            await propertyApi.update(id, { floorPlanUrl: uploadedUrl });
            addToast('Floor plan uploaded to Cloudinary successfully!');
          } else {
            const newPhoto = {
              url: uploadedUrl,
              caption: file.name.replace(/\.[^/.]+$/, ''),
              isCover: !property.photos || property.photos.length === 0,
            };
            const updatedPhotos = [...(property.photos || []), newPhoto];
            await propertyApi.update(id, { photos: updatedPhotos });
            addToast(`Uploaded ${file.name} to Cloudinary!`);
          }
        }
      }
      loadPropertyData();
    } catch (err) {
      addToast(err.message || 'Error uploading file to Cloudinary', 'error');
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  // Manual URL Save
  const handleSaveMediaUrls = async (e) => {
    e.preventDefault();
    try {
      let updatedPhotos = [...(property.photos || [])];
      if (mediaForm.newPhotoUrl.trim()) {
        updatedPhotos.push({ 
          url: mediaForm.newPhotoUrl.trim(), 
          caption: `Photo ${updatedPhotos.length + 1}`, 
          isCover: updatedPhotos.length === 0 
        });
      }
      if (mediaForm.coverPhotoUrl.trim() && updatedPhotos.length > 0) {
        updatedPhotos[0].url = mediaForm.coverPhotoUrl.trim();
      } else if (mediaForm.coverPhotoUrl.trim()) {
        updatedPhotos.push({ url: mediaForm.coverPhotoUrl.trim(), caption: 'Cover Image', isCover: true });
      }
      await propertyApi.update(id, { photos: updatedPhotos, floorPlanUrl: mediaForm.floorPlanUrl.trim() });
      addToast('Media assets updated!');
      setShowMediaModal(false);
      loadPropertyData();
    } catch (err) { addToast(err.message || 'Error saving media', 'error'); }
  };

  const handleRemovePhoto = async (index) => {
    try {
      const updatedPhotos = property.photos.filter((_, idx) => idx !== index);
      await propertyApi.update(id, { photos: updatedPhotos });
      addToast('Photo removed');
      loadPropertyData();
    } catch (err) { addToast(err.message, 'error'); }
  };

  const handleDeleteProperty = async () => {
    try {
      await propertyApi.delete(id);
      addToast('Listing deleted successfully');
      navigate('/app/properties');
    } catch (err) { addToast(err.message || 'Error deleting listing', 'error'); }
  };

  const handleCreateQR = async () => {
    try {
      await qrApi.createOrReassign({ propertyId: id, label: `${property.projectName} - ${property.propertyCode}` });
      addToast('Smart Dynamic QR generated and mapped to listing!');
      loadPropertyData();
    } catch (err) { addToast(err.message || 'Error creating Smart QR', 'error'); }
  };

  const handleDownloadQR = async (qrId, targetUrl) => {
    try {
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=20&data=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `DealDesk-QR-${qrId}-${property.propertyCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      addToast('High-Res QR (800x800) downloaded to device!');
    } catch (err) {
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=20&data=${encodeURIComponent(targetUrl)}`, '_blank');
    }
  };

  // Schedule Viewing (sends clean date + time + optional leadId or manual clientName)
  const handleScheduleViewing = async (e) => {
    e.preventDefault();
    try {
      await viewingApi.schedule({ 
        propertyId: id, 
        leadId: viewingForm.leadId || undefined,
        clientName: viewingForm.clientName,
        clientPhone: viewingForm.clientPhone,
        scheduledDate: viewingForm.scheduledDate,
        scheduledTime: viewingForm.scheduledTime || '15:00',
        notes: viewingForm.notes,
      });
      addToast('Viewing scheduled successfully!');
      setShowViewingModal(false);
      loadPropertyData();
    } catch (err) { addToast(err.message || 'Failed to schedule viewing', 'error'); }
  };

  // Create Open House (sends required eventDate field)
  const handleCreateOpenHouse = async (e) => {
    e.preventDefault();
    try {
      await openHouseApi.create({ 
        propertyId: id, 
        title: openHouseForm.title,
        eventDate: openHouseForm.eventDate,
        startTime: openHouseForm.startTime,
        endTime: openHouseForm.endTime,
      });
      addToast('Open house scheduled with check-in QR!');
      setShowOpenHouseModal(false);
      loadPropertyData();
    } catch (err) { addToast(err.message || 'Error scheduling open house', 'error'); }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await leadApi.create({ 
        ...leadForm, 
        interestedPropertyId: id, 
        requirements: { 
          budgetMax: Number(leadForm.budgetMax) || property.askingPrice, 
          preferredConfigurations: [property.configuration], 
          preferredLocations: [property.projectName] 
        } 
      });
      addToast('Lead mapped to listing!');
      setShowLeadModal(false);
      loadPropertyData();
    } catch (err) { addToast(err.message, 'error'); }
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    try {
      await documentApi.create({ propertyId: id, ...docForm });
      addToast('Document added to compliance checklist!');
      setShowDocModal(false);
      loadPropertyData();
    } catch (err) { addToast(err.message, 'error'); }
  };

  // Create Deal (sends valid enum stage and ensures leadId)
  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      await dealApi.create({ 
        propertyId: id, 
        leadId: dealForm.leadId || undefined,
        clientName: dealForm.clientName || 'Deal Buyer',
        title: dealForm.title || `${property.propertyCode} Purchase Deal`,
        dealValue: Number(dealForm.dealValue) || property.askingPrice,
        stage: dealForm.stage,
        commissionPercent: Number(dealForm.commissionPercent) || 2.0,
        expectedCloseDate: dealForm.expectedCloseDate,
      });
      addToast('Deal recorded in sales pipeline!');
      setShowDealModal(false);
      loadPropertyData();
    } catch (err) { addToast(err.message, 'error'); }
  };

  if (loading) {
    return <div className="pdp-loading-screen"><div className="pdp-spinner"></div><p>Loading real estate listing...</p></div>;
  }

  if (!property) {
    return (
      <div className="pdp-notfound-card">
        <FaBuilding className="pdp-empty-icon" />
        <h2>Property Listing Not Found</h2>
        <button type="button" className="pdp-btn-primary" onClick={() => navigate('/app/properties')}><FaArrowLeft /> Back to Properties</button>
      </div>
    );
  }

  const qr = property.smartQR;
  const qrTargetUrl = `${window.location.origin}/qr/${qr?.qrId}`;
  const qrImageUrl = qr ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(qrTargetUrl)}` : null;

  return (
    <div className="pdp-shell">
      {/* Top Header */}
      <div className="pdp-top-header">
        <div className="pdp-header-left">
          <button type="button" className="pdp-btn-back" onClick={() => navigate('/app/properties')}><FaArrowLeft /> Back to Listings</button>
          <div className="pdp-title-box">
            <div className="pdp-code-row">
              <span className="pdp-prop-code">{property.propertyCode}</span>
              <span className={`pdp-status-badge ${property.status?.toLowerCase()}`}>{property.status}</span>
              <span className="pdp-type-pill">{property.propertyType} • {property.configuration}</span>
            </div>
            <h1>{property.projectName}</h1>
            <p className="pdp-header-address"><FaMapMarkerAlt /> {property.address || `${property.sector}, ${property.city}`}</p>
          </div>
        </div>

        <div className="pdp-header-right">
          <div className="pdp-price-badge-box">
            <span className="pdp-price-val">${property.askingPrice?.toLocaleString()}</span>
            {property.isNegotiable && <span className="pdp-negotiable-tag">Negotiable</span>}
          </div>
          <div className="pdp-header-actions">
            <button type="button" className="pdp-action-btn assign" onClick={() => setShowAssignModal(true)} title="Assign Listing Advisor"><FaUserCheck /> Assign</button>
            <button type="button" className="pdp-action-btn edit" onClick={() => setShowEditModal(true)}><FaEdit /> Edit</button>
            <button type="button" className="pdp-action-btn media" onClick={() => setShowMediaModal(true)}><FaCamera /> Manage Media ({property.photos?.length || 0})</button>
            <button type="button" className="pdp-action-btn delete" onClick={() => setShowDeleteModal(true)}><FaTrash /> Delete</button>
          </div>
        </div>
      </div>

      {/* Sold / Fallback Alert Banner */}
      {(property.status === 'Sold' || property.status === 'Under Offer') && (
        <div className="pdp-sold-alert-banner">
          <FaExclamationTriangle className="pdp-alert-icon" />
          <div className="pdp-alert-content">
            <strong>Listing Status: {property.status}</strong>
            <p>Smart QR routing intelligence is automatically redirecting scanning buyers to active alternative inventory.</p>
            {replacements.length > 0 && (
              <div className="pdp-replacements-chips">
                <span>Active Replacements:</span>
                {replacements.map(r => (
                  <Link key={r._id} to={`/app/properties/${r._id}`} className="pdp-rep-chip">{r.projectName} ({r.propertyCode}) - ${r.askingPrice?.toLocaleString()}</Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs Bar (8 Working Tabs) */}
      <div className="pdp-tabs-container">
        <button type="button" className={`pdp-tab-nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><FaBuilding /> Overview & Specs</button>
        <button type="button" className={`pdp-tab-nav-btn ${activeTab === 'viewings' ? 'active' : ''}`} onClick={() => setActiveTab('viewings')}><FaCalendarAlt /> Private Viewings ({property.viewings?.length || 0})</button>
        <button type="button" className={`pdp-tab-nav-btn ${activeTab === 'openHouses' ? 'active' : ''}`} onClick={() => setActiveTab('openHouses')}><FaDoorOpen /> Open Houses ({property.openHouses?.length || 0})</button>
        <button type="button" className={`pdp-tab-nav-btn ${activeTab === 'smartQR' ? 'active' : ''}`} onClick={() => setActiveTab('smartQR')}><FaQrcode /> Smart Dynamic QR {qr ? '✓' : ''}</button>
        <button type="button" className={`pdp-tab-nav-btn ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}><FaUserFriends /> Leads ({property.leads?.length || 0})</button>
        <button type="button" className={`pdp-tab-nav-btn ${activeTab === 'match' ? 'active' : ''}`} onClick={() => setActiveTab('match')}><FaBolt /> Matches ({propertyMatches.length})</button>
        <button type="button" className={`pdp-tab-nav-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}><FaFolder /> Documents ({property.documents?.length || 0})</button>
        <button type="button" className={`pdp-tab-nav-btn ${activeTab === 'deals' ? 'active' : ''}`} onClick={() => setActiveTab('deals')}><FaHandshake /> Deals Pipeline ({property.deals?.length || 0})</button>
        <button type="button" className={`pdp-tab-nav-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}><FaHistory /> Audit Activity ({property.activities?.length || 0})</button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="pdp-tab-content pdp-overview-grid">
          <div className="pdp-overview-left">
            <div className="pdp-gallery-viewer">
              <div className="pdp-main-photo-wrap">
                <img src={property.photos?.[activePhotoIdx]?.url || property.photos?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'} alt={property.projectName} />
                <button type="button" className="pdp-btn-manage-photos-overlay" onClick={() => setShowMediaModal(true)}><FaCamera /> Manage Media Assets</button>
              </div>
              {property.photos && property.photos.length > 1 && (
                <div className="pdp-thumbnails-strip">
                  {property.photos.map((p, idx) => (
                    <img key={idx} src={p.url} alt={`Thumb ${idx}`} className={activePhotoIdx === idx ? 'active' : ''} onClick={() => setActivePhotoIdx(idx)} />
                  ))}
                </div>
              )}
            </div>

            <div className="pdp-card pdp-specs-card">
              <h3>Architectural & Dimension Matrix</h3>
              <div className="pdp-specs-matrix">
                <div className="pdp-spec-cell"><FaBed className="cell-icon" /><div><span className="cell-val">{property.bedrooms} Beds</span><span className="cell-lbl">Bedrooms</span></div></div>
                <div className="pdp-spec-cell"><FaBath className="cell-icon" /><div><span className="cell-val">{property.bathrooms} Baths</span><span className="cell-lbl">Bathrooms</span></div></div>
                <div className="pdp-spec-cell"><FaRulerCombined className="cell-icon" /><div><span className="cell-val">{property.carpetAreaSqFt || property.sizeSqFt} sq.ft</span><span className="cell-lbl">Carpet Area</span></div></div>
                <div className="pdp-spec-cell"><FaBuilding className="cell-icon" /><div><span className="cell-val">{property.superAreaSqFt || Math.round((property.sizeSqFt || 1000) * 1.25)} sq.ft</span><span className="cell-lbl">Super Built-up</span></div></div>
                <div className="pdp-spec-cell"><FaClock className="cell-icon" /><div><span className="cell-val">Floor {property.floor} of {property.totalFloors}</span><span className="cell-lbl">Floor Level</span></div></div>
                <div className="pdp-spec-cell"><FaCompass className="cell-icon" /><div><span className="cell-val">{property.facing || 'East'}</span><span className="cell-lbl">Facing</span></div></div>
                <div className="pdp-spec-cell"><FaCouch className="cell-icon" /><div><span className="cell-val">{property.furnishing || 'Semi-Furnished'}</span><span className="cell-lbl">Furnishing</span></div></div>
                <div className="pdp-spec-cell"><FaCheckCircle className="cell-icon" /><div><span className="cell-val">{property.possession || 'Ready to Move'}</span><span className="cell-lbl">Possession</span></div></div>
              </div>
            </div>

            <div className="pdp-card">
              <h3>Marketing Description</h3>
              <p className="pdp-desc-text">{property.description || 'Exclusive luxury residence positioned in a prime location with contemporary architecture, panoramic views, and high-end finishes.'}</p>
            </div>

            <div className="pdp-card">
              <h3>Key Features & Amenities</h3>
              <div className="pdp-amenities-pills">
                {(property.amenities && property.amenities.length > 0 ? property.amenities : ['Clubhouse', 'Swimming Pool', 'Fitness Gym', '24/7 Concierge', 'EV Charging', 'Power Backup']).map((am, idx) => (
                  <span key={idx} className="pdp-amenity-chip"><FaCheckCircle className="check" /> {am}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="pdp-overview-right">
            <div className="pdp-card pdp-financials-card">
              <h3>Commercial Terms</h3>
              <div className="pdp-fin-rows">
                <div className="pdp-fin-row"><span>Asking Price</span><strong className="pdp-fin-price">${property.askingPrice?.toLocaleString()}</strong></div>
                <div className="pdp-fin-row"><span>Negotiation</span><span>{property.isNegotiable ? 'Negotiable for genuine buyer' : 'Fixed Price'}</span></div>
                <div className="pdp-fin-row"><span>Monthly Maintenance</span><span>${property.monthlyMaintenance || 250}/mo</span></div>
                <div className="pdp-fin-row"><span>Brokerage Commission</span><span>2.0% (${Math.round((property.askingPrice || 0) * 0.02).toLocaleString()})</span></div>
                <div className="pdp-fin-row"><span>Expected ROI</span><span className="pdp-roi-badge">{property.expectedRoiPct || 6.5}% p.a.</span></div>
              </div>
            </div>

            <div className="pdp-card">
              <h3>Location & Neighborhood</h3>
              <p className="pdp-loc-address">{property.address || `${property.sector}, ${property.city}`}</p>
              {property.googleMapsUrl && (
                <a href={property.googleMapsUrl} target="_blank" rel="noreferrer" className="pdp-btn-maps-link"><FaExternalLinkAlt /> Open in Google Maps</a>
              )}
            </div>

            <div className="pdp-card">
              <h3>RERA Registration</h3>
              <div className="pdp-rera-box"><FaShieldAlt className="rera-icon" /><div><span className="lbl">State Registration Number</span><strong>{property.reraNumber || 'RERA-GRG-2024-PR882'}</strong></div></div>
            </div>

            <div className="pdp-card pdp-advisor-card">
              <h3>Authorized Advisor</h3>
              <div className="pdp-advisor-profile">
                <div className="pdp-avatar">{property.assignedAgentId?.photoUrl ? <img src={property.assignedAgentId.photoUrl} alt="Advisor" /> : <span>A</span>}</div>
                <div><h4>{property.assignedAgentId?.name || 'Listing Advisor'}</h4><span className="role">Senior Property Consultant</span><p className="contact">{property.assignedAgentId?.phone || '+91 98765 43210'}</p></div>
              </div>
            </div>

            <div className="pdp-card pdp-private-notes-card">
              <h3>Confidential Internal Notes</h3>
              <div className="pdp-notes-box">{property.privateNotes || 'Owner open to immediate closing. Keys held at site office.'}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIEWINGS */}
      {activeTab === 'viewings' && (
        <div className="pdp-tab-content">
          <div className="pdp-section-header">
            <div><h3>Scheduled Private Walkthroughs</h3><p className="text-muted">Track on-site client tours and viewing verification.</p></div>
            <button type="button" className="pdp-btn-primary" onClick={() => setShowViewingModal(true)}><FaPlus /> Schedule New Viewing</button>
          </div>
          {(!property.viewings || property.viewings.length === 0) ? (
            <div className="pdp-empty-tab-box"><FaCalendarAlt className="empty-icon" /><h4>No private viewings scheduled</h4><button type="button" className="pdp-btn-primary" onClick={() => setShowViewingModal(true)}>Schedule First Viewing</button></div>
          ) : (
            <div className="pdp-table-card">
              <table className="pdp-table">
                <thead><tr><th>Date & Time</th><th>Client Prospect</th><th>Phone</th><th>Assigned Advisor</th><th>Notes</th><th>Status</th></tr></thead>
                <tbody>
                  {property.viewings.map(v => (
                    <tr key={v._id}>
                      <td><strong>{v.scheduledDate} ({v.scheduledTime || '15:00'})</strong></td>
                      <td>{v.leadId?.name || v.clientName || 'Client'}</td>
                      <td><a href={`tel:${v.leadId?.phone || v.clientPhone}`} className="pdp-table-link">{v.leadId?.phone || v.clientPhone || 'N/A'}</a></td>
                      <td>{v.agentId?.name || 'Authorized Advisor'}</td>
                      <td>{v.notes || v.cancellationReason || 'Walkthrough'}</td>
                      <td><span className="pdp-status-pill available">{v.status || 'Scheduled'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OPEN HOUSES */}
      {activeTab === 'openHouses' && (
        <div className="pdp-tab-content">
          <div className="pdp-section-header">
            <div><h3>Open House Events</h3><p className="text-muted">Manage scheduled open house dates and visitor registrations.</p></div>
            <button type="button" className="pdp-btn-primary" onClick={() => setShowOpenHouseModal(true)}><FaPlus /> Schedule Open House</button>
          </div>
          {(!property.openHouses || property.openHouses.length === 0) ? (
            <div className="pdp-empty-tab-box"><FaDoorOpen className="empty-icon" /><h4>No open house scheduled yet</h4><button type="button" className="pdp-btn-primary" onClick={() => setShowOpenHouseModal(true)}>Schedule Open House</button></div>
          ) : (
            <div className="pdp-table-card">
              <table className="pdp-table">
                <thead><tr><th>Event Title</th><th>Event Date</th><th>Hours</th><th>Host Advisor</th><th>Visitors</th><th>Status</th></tr></thead>
                <tbody>
                  {property.openHouses.map(oh => (
                    <tr key={oh._id}>
                      <td><strong>{oh.title}</strong></td>
                      <td>{oh.eventDate || new Date(oh.date).toLocaleDateString()}</td>
                      <td>{oh.startTime} - {oh.endTime}</td>
                      <td>{oh.hostAgentId?.name || 'Lead Broker'}</td>
                      <td><span className="pdp-counter-badge">{oh.visitorCount || oh.registrationsCount || 0} Visitors</span></td>
                      <td><span className="pdp-status-pill available">{oh.status || 'Active'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SMART QR */}
      {activeTab === 'smartQR' && (
        <div className="pdp-tab-content">
          <div className="pdp-section-header">
            <div><h3>Smart Dynamic QR Barcode</h3><p className="text-muted">Permanent physical board code linked to listing with automated fallback intelligence.</p></div>
            <Link to="/app/smart-qr" className="pdp-btn-secondary">QR Fleet Overview →</Link>
          </div>
          {qr ? (
            <div className="pdp-qr-card-surface">
              <div className="pdp-qr-left-col">
                <div className="pdp-scannable-qr-box">
                  <img src={qrImageUrl} alt={`QR for ${property.propertyCode}`} className="pdp-qr-matrix-img" />
                  <div className="pdp-qr-camera-prompt">📷 100% Scannable with mobile camera</div>
                </div>
                <div className="pdp-qr-actions-row">
                  <button type="button" className="pdp-btn-primary" onClick={() => handleDownloadQR(qr.qrId, qrTargetUrl)}><FaDownload /> Download Print PNG (800x800)</button>
                  <a href={qrTargetUrl} target="_blank" rel="noreferrer" className="pdp-btn-secondary"><FaExternalLinkAlt /> Open Public Deal Room</a>
                </div>
              </div>
              <div className="pdp-qr-right-col">
                <div className="pdp-qr-meta-item"><span className="lbl">Smart QR ID</span><code className="pdp-qr-id-val">{qr.qrId}</code></div>
                <div className="pdp-qr-meta-item"><span className="lbl">Public URL</span><a href={qrTargetUrl} target="_blank" rel="noreferrer" className="pdp-url-link">{qrTargetUrl}</a></div>
                <div className="pdp-qr-stats-grid">
                  <div className="pdp-qr-stat-tile"><span className="val">{qr.scanCount || 0}</span><span className="lbl">Total Scans</span></div>
                  <div className="pdp-qr-stat-tile"><span className="val">{qr.viewCount || 0}</span><span className="lbl">Unique Views</span></div>
                  <div className="pdp-qr-stat-tile"><span className="val">{qr.leadCount || 0}</span><span className="lbl">Leads</span></div>
                </div>
                <div className="pdp-qr-intelligence-box">
                  <strong>Automated Inventory Intelligence:</strong>
                  <p>If this property is marked Sold, this QR code automatically routes scanning buyers to equivalent active inventory in {property.projectName}.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="pdp-empty-tab-box">
              <FaQrcode className="empty-icon" />
              <h4>No Smart QR linked to this listing yet</h4>
              <button type="button" className="pdp-btn-primary" onClick={handleCreateQR}><FaPlus /> Generate & Map Smart QR Now</button>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: LEADS */}
      {activeTab === 'leads' && (
        <div className="pdp-tab-content">
          <div className="pdp-section-header">
            <div><h3>Interested Buyer Prospects</h3><p className="text-muted">Qualified buyer leads mapped to this property.</p></div>
            <button type="button" className="pdp-btn-primary" onClick={() => setShowLeadModal(true)}><FaPlus /> Add Interested Lead</button>
          </div>
          {(!property.leads || property.leads.length === 0) ? (
            <div className="pdp-empty-tab-box"><FaUserFriends className="empty-icon" /><h4>No buyer leads linked yet</h4><button type="button" className="pdp-btn-primary" onClick={() => setShowLeadModal(true)}>Add Lead</button></div>
          ) : (
            <div className="pdp-table-card">
              <table className="pdp-table">
                <thead><tr><th>Name</th><th>Phone</th><th>Temperature</th><th>Score</th><th>Source</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {property.leads.map(l => (
                    <tr key={l._id}>
                      <td><strong>{l.name}</strong></td>
                      <td>{l.phone}</td>
                      <td><span className={`pdp-temp-pill ${l.temperature?.toLowerCase() || 'warm'}`}>{l.temperature}</span></td>
                      <td><strong className="pdp-score-tag">{l.score || 75}/100</strong></td>
                      <td><span className="pdp-source-pill">{l.source || 'Smart QR'}</span></td>
                      <td>{l.status || 'New'}</td>
                      <td>
                        <div className="pdp-lead-actions-row">
                          {/* View Lead Button (Navigates to Lead or opens quick preview) */}
                          <button 
                            type="button" 
                            className="pdp-btn-view-lead" 
                            onClick={() => setSelectedLeadForDetail(l)}
                            title="View full lead record"
                          >
                            <FaEye /> View Lead
                          </button>
                          {/* WhatsApp Chat Button */}
                          <a 
                            href={`https://wa.me/${(l.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${l.name}, following up regarding ${property.projectName} (${property.propertyCode}).`)}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="pdp-btn-whatsapp-sm"
                            title="Chat on WhatsApp"
                          >
                            <FaWhatsapp /> WA
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5.5: MATCH */}
      {activeTab === 'match' && (
        <div className="pdp-tab-content">
          <div className="pdp-section-header">
            <div>
              <h3>7-Factor Smart Buyer Matches ({propertyMatches.length})</h3>
              <p className="text-muted">High-intent buyer prospects whose criteria matches this property layout and budget.</p>
            </div>
            <Link to="/app/matches" className="pdp-btn-secondary">Open Smart Match Studio →</Link>
          </div>
          {propertyMatches.length === 0 ? (
            <div className="pdp-empty-tab-box">
              <FaBolt className="empty-icon" />
              <h4>No high-probability matches for this listing yet</h4>
              <p>When new buyer leads enter requirements matching {property.configuration} or ${property.askingPrice?.toLocaleString()} budget, they will auto-populate here.</p>
            </div>
          ) : (
            <div className="pdp-matches-list">
              {propertyMatches.map((m, idx) => (
                <div key={idx} className="pdp-match-card">
                  <div className="pdp-match-score-badge">
                    <span className="score">{m.matchScore}%</span>
                    <span className="lbl">MATCH</span>
                  </div>
                  <div className="pdp-match-info">
                    <h4>{m.lead?.name}</h4>
                    <p>{m.lead?.phone} {m.lead?.email && `• ${m.lead.email}`}</p>
                    <div className="pdp-match-factors">
                      <span>Budget: <strong>{m.scoreBreakdown?.budgetScore || 0}%</strong></span>
                      <span>Location: <strong>{m.scoreBreakdown?.locationScore || 0}%</strong></span>
                      <span>Config: <strong>{m.scoreBreakdown?.configScore || 0}%</strong></span>
                      <span>Size: <strong>{m.scoreBreakdown?.sizeScore || 0}%</strong></span>
                    </div>
                  </div>
                  <div className="pdp-match-actions">
                    <Link to={`/app/leads/${m.lead?._id}`} className="pdp-btn-secondary">
                      View Lead Details
                    </Link>
                    {m.lead?.phone && !m.lead?.isLimitedPreview && (
                      <a 
                        href={`https://wa.me/${(m.lead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${m.lead.name}, I have an exclusive unit available at ${property.projectName} (${property.propertyCode}) matching your requirements.`)}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="pdp-btn-whatsapp-sm"
                      >
                        <FaWhatsapp /> Pitch WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="pdp-tab-content">
          <div className="pdp-section-header">
            <div><h3>Due Diligence & Legal Checklist</h3><p className="text-muted">Manage title registry, floor plans, and RERA certificates.</p></div>
            <button type="button" className="pdp-btn-primary" onClick={() => setShowDocModal(true)}><FaPlus /> Link Document</button>
          </div>
          <div className="pdp-docs-checklist-grid">
            {[
              { name: 'Title Deed & Ownership Registry', cat: 'Ownership' },
              { name: 'Approved Architectural Floor Plan', cat: 'Layout' },
              { name: 'RERA Registration Certificate', cat: 'Compliance' },
              { name: 'Occupancy Certificate (OC)', cat: 'Municipal' },
              { name: 'Seller KYC & Brokerage Mandate', cat: 'Brokerage' },
            ].map((item, idx) => {
              const matched = property.documents?.find(d => d.title?.toLowerCase().includes(item.name.toLowerCase().slice(0, 10)));
              return (
                <div key={idx} className="pdp-doc-checklist-item">
                  <div className="doc-icon-box"><FaFileAlt /></div>
                  <div className="doc-meta-box"><h4>{item.name}</h4><span className="doc-cat">{item.cat}</span></div>
                  <div>{matched ? <span className="pdp-doc-verified"><FaCheckCircle /> Verified</span> : <span className="pdp-doc-pending"><FaClock /> Pending</span>}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: DEALS PIPELINE */}
      {activeTab === 'deals' && (
        <div className="pdp-tab-content">
          <div className="pdp-section-header">
            <div><h3>Active Offers & Deal Pipeline</h3><p className="text-muted">Track buyer negotiations and projected closing dates.</p></div>
            <button type="button" className="pdp-btn-primary" onClick={() => setShowDealModal(true)}><FaPlus /> Record Deal</button>
          </div>
          {(!property.deals || property.deals.length === 0) ? (
            <div className="pdp-empty-tab-box"><FaHandshake className="empty-icon" /><h4>No active deals recorded</h4><button type="button" className="pdp-btn-primary" onClick={() => setShowDealModal(true)}>Record Deal</button></div>
          ) : (
            <div className="pdp-table-card">
              <table className="pdp-table">
                <thead><tr><th>Deal Title</th><th>Contract Value</th><th>Commission</th><th>Stage</th><th>Expected Close</th></tr></thead>
                <tbody>
                  {property.deals.map(d => (
                    <tr key={d._id}>
                      <td><strong>{d.title || 'Deal Offer'}</strong></td>
                      <td><strong className="pdp-deal-val">${d.dealValue?.toLocaleString()}</strong></td>
                      <td>{d.commissionPercent || 2.0}% (${d.commissionValue?.toLocaleString() || Math.round((d.dealValue || 0) * 0.02).toLocaleString()})</td>
                      <td><span className="pdp-status-pill available">{d.stage || 'Offer/Negotiation'}</span></td>
                      <td>{d.expectedClosingDate ? new Date(d.expectedClosingDate).toLocaleDateString() : 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: ACTIVITY HISTORY */}
      {activeTab === 'activity' && (
        <div className="pdp-tab-content">
          <div className="pdp-section-header">
            <div><h3>Audit Activity Timeline</h3><p className="text-muted">Chronological audit records since property creation.</p></div>
          </div>
          <div className="pdp-activity-timeline">
            {(!property.activities || property.activities.length === 0) ? (
              <div className="pdp-empty-tab-box"><FaHistory className="empty-icon" /><p>Audit records initiated upon listing creation.</p></div>
            ) : (
              property.activities.map((act, idx) => (
                <div key={idx} className="pdp-timeline-item">
                  <div className="pdp-timeline-dot"></div>
                  <div className="pdp-timeline-content">
                    <div className="pdp-timeline-header">
                      <span className="pdp-act-type">{act.action || act.eventType || 'ACTIVITY'}</span>
                      <span className="pdp-act-time">{new Date(act.timestamp || act.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="pdp-act-desc">{act.description || act.details || 'Property details updated.'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT PROPERTY FULL DETAILS */}
      {showEditModal && (
        <div className="pdp-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="pdp-modal-box large" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header">
              <h3>Edit Listing Specifications: {property.propertyCode}</h3>
              <button type="button" className="pdp-btn-close-modal" onClick={() => setShowEditModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleUpdateProperty} className="pdp-modal-form">
              <div className="pdp-form-grid-3">
                <div className="pdp-form-group"><label>Project Name *</label><input type="text" required value={editForm.projectName} onChange={e => setEditForm({ ...editForm, projectName: e.target.value })} /></div>
                <div className="pdp-form-group"><label>Property Code *</label><input type="text" required value={editForm.propertyCode} onChange={e => setEditForm({ ...editForm, propertyCode: e.target.value })} /></div>
                <div className="pdp-form-group"><label>Status *</label><select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}><option value="Available">Available</option><option value="Under Offer">Under Offer</option><option value="Sold">Sold</option></select></div>
              </div>
              <div className="pdp-form-grid-3">
                <div className="pdp-form-group"><label>Asking Price ($) *</label><input type="number" required value={editForm.askingPrice} onChange={e => setEditForm({ ...editForm, askingPrice: Number(e.target.value) })} /></div>
                <div className="pdp-form-group"><label>Carpet Area (sq.ft) *</label><input type="number" required value={editForm.carpetAreaSqFt} onChange={e => setEditForm({ ...editForm, carpetAreaSqFt: Number(e.target.value) })} /></div>
                <div className="pdp-form-group"><label>Configuration *</label><input type="text" required value={editForm.configuration} onChange={e => setEditForm({ ...editForm, configuration: e.target.value })} /></div>
              </div>
              <div className="pdp-form-grid-3">
                <div className="pdp-form-group"><label>Facing</label><input type="text" value={editForm.facing} onChange={e => setEditForm({ ...editForm, facing: e.target.value })} /></div>
                <div className="pdp-form-group"><label>Furnishing</label><select value={editForm.furnishing} onChange={e => setEditForm({ ...editForm, furnishing: e.target.value })}><option value="Fully Furnished">Fully Furnished</option><option value="Semi-Furnished">Semi-Furnished</option><option value="Unfurnished">Unfurnished</option></select></div>
                <div className="pdp-form-group"><label>Possession</label><select value={editForm.possession} onChange={e => setEditForm({ ...editForm, possession: e.target.value })}><option value="Ready to Move">Ready to Move</option><option value="Under Construction">Under Construction</option></select></div>
              </div>
              <div className="pdp-form-group"><label>Street Address</label><input type="text" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} /></div>
              <div className="pdp-form-group"><label>Description</label><textarea rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} /></div>
              <div className="pdp-form-group"><label>Confidential Notes</label><textarea rows={2} value={editForm.privateNotes} onChange={e => setEditForm({ ...editForm, privateNotes: e.target.value })} /></div>
              <div className="pdp-modal-footer">
                <button type="button" className="pdp-btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="pdp-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE MEDIA (DRAG & DROP TO CLOUDINARY + DIRECT URLS) */}
      {showMediaModal && (
        <div className="pdp-modal-backdrop" onClick={() => setShowMediaModal(false)}>
          <div className="pdp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header">
              <h3>Manage Media Assets</h3>
              <button type="button" className="pdp-btn-close-modal" onClick={() => setShowMediaModal(false)}><FaTimes /></button>
            </div>

            <div className="pdp-modal-form">
              {/* CLOUDINARY DRAG & DROP UPLOAD ZONE */}
              <div className="pdp-form-group">
                <label>Drag & Drop Images from Computer to Upload (Cloudinary)</label>
                <div 
                  className={`pdp-dropzone-box ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => handleFileUploadToCloudinary(e.dataTransfer.files, false)}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    multiple 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => handleFileUploadToCloudinary(e.target.files, false)}
                  />
                  {uploading ? (
                    <div className="pdp-uploading-indicator">
                      <FaSpinner className="pdp-spin-icon" />
                      <span>Uploading media to Cloudinary...</span>
                    </div>
                  ) : (
                    <div className="pdp-dropzone-content">
                      <FaCloudUploadAlt className="drop-icon" />
                      <strong>Drop local images here or click to browse</strong>
                      <p>Uploads directly to Cloudinary storage and adds to listing gallery</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Floor Plan */}
              <div className="pdp-form-group">
                <label>Upload Floor Plan Document / Image</label>
                <div className="pdp-file-row">
                  <input 
                    type="file" 
                    ref={floorPlanInputRef}
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUploadToCloudinary(e.target.files, true)}
                  />
                  <button 
                    type="button" 
                    className="pdp-btn-secondary" 
                    onClick={() => floorPlanInputRef.current && floorPlanInputRef.current.click()}
                  >
                    <FaCloudUploadAlt /> Choose Local Floor Plan
                  </button>
                  <input 
                    type="url" 
                    placeholder="Or paste floor plan URL" 
                    value={mediaForm.floorPlanUrl} 
                    onChange={e => setMediaForm({ ...mediaForm, floorPlanUrl: e.target.value })} 
                  />
                </div>
              </div>

              {/* Cover Photo URL input */}
              <div className="pdp-form-group">
                <label>Primary Cover Image URL</label>
                <input type="url" value={mediaForm.coverPhotoUrl} onChange={e => setMediaForm({ ...mediaForm, coverPhotoUrl: e.target.value })} />
              </div>

              {/* Current Photos Gallery Grid */}
              <div className="pdp-photos-reorder-box">
                <span className="lbl">Current Gallery Photos ({property.photos?.length || 0})</span>
                <div className="pdp-media-thumbs-grid">
                  {(property.photos || []).map((p, idx) => (
                    <div key={idx} className="pdp-media-thumb-item">
                      <img src={p.url} alt={`Media ${idx}`} />
                      <button type="button" className="btn-del-photo" onClick={() => handleRemovePhoto(idx)} title="Remove photo"><FaTimes /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pdp-modal-footer">
                <button type="button" className="pdp-btn-secondary" onClick={() => setShowMediaModal(false)}>Close</button>
                <button type="button" className="pdp-btn-primary" onClick={handleSaveMediaUrls}>Save URL Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE */}
      {showDeleteModal && (
        <div className="pdp-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="pdp-modal-box danger" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header"><h3>Delete Listing {property.propertyCode}?</h3><button type="button" className="pdp-btn-close-modal" onClick={() => setShowDeleteModal(false)}><FaTimes /></button></div>
            <p className="pdp-modal-p">Permanently remove <strong>{property.projectName} ({property.propertyCode})</strong> from your workspace?</p>
            <div className="pdp-modal-footer">
              <button type="button" className="pdp-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button type="button" className="pdp-btn-danger" onClick={handleDeleteProperty}>Delete Listing</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEWING (Correctly formatted: YYYY-MM-DD + separate HH:mm) */}
      {showViewingModal && (
        <div className="pdp-modal-backdrop" onClick={() => setShowViewingModal(false)}>
          <div className="pdp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header"><h3>Schedule Private Viewing</h3><button type="button" className="pdp-btn-close-modal" onClick={() => setShowViewingModal(false)}><FaTimes /></button></div>
            <form onSubmit={handleScheduleViewing} className="pdp-modal-form">
              <div className="pdp-form-group">
                <label>Select Prospect (or enter client details below)</label>
                <select 
                  value={viewingForm.leadId} 
                  onChange={e => {
                    const matched = property.leads?.find(l => l._id === e.target.value);
                    setViewingForm({
                      ...viewingForm,
                      leadId: e.target.value,
                      clientName: matched?.name || viewingForm.clientName,
                      clientPhone: matched?.phone || viewingForm.clientPhone,
                    });
                  }}
                >
                  <option value="">Manual Client Entry...</option>
                  {(property.leads || []).map(l => (
                    <option key={l._id} value={l._id}>{l.name} ({l.phone})</option>
                  ))}
                </select>
              </div>

              <div className="pdp-form-grid-2">
                <div className="pdp-form-group"><label>Client Name *</label><input type="text" required value={viewingForm.clientName} onChange={e => setViewingForm({ ...viewingForm, clientName: e.target.value })} /></div>
                <div className="pdp-form-group"><label>Phone *</label><input type="text" required value={viewingForm.clientPhone} onChange={e => setViewingForm({ ...viewingForm, clientPhone: e.target.value })} /></div>
              </div>
              <div className="pdp-form-grid-2">
                <div className="pdp-form-group"><label>Viewing Date *</label><input type="date" required value={viewingForm.scheduledDate} onChange={e => setViewingForm({ ...viewingForm, scheduledDate: e.target.value })} /></div>
                <div className="pdp-form-group"><label>Viewing Time *</label><input type="time" required value={viewingForm.scheduledTime} onChange={e => setViewingForm({ ...viewingForm, scheduledTime: e.target.value })} /></div>
              </div>
              <div className="pdp-form-group"><label>Walkthrough Instructions</label><textarea rows={2} value={viewingForm.notes} onChange={e => setViewingForm({ ...viewingForm, notes: e.target.value })} /></div>
              <div className="pdp-modal-footer">
                <button type="button" className="pdp-btn-secondary" onClick={() => setShowViewingModal(false)}>Cancel</button>
                <button type="submit" className="pdp-btn-primary">Schedule Walkthrough</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: OPEN HOUSE (Sends required eventDate) */}
      {showOpenHouseModal && (
        <div className="pdp-modal-backdrop" onClick={() => setShowOpenHouseModal(false)}>
          <div className="pdp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header"><h3>Schedule Open House</h3><button type="button" className="pdp-btn-close-modal" onClick={() => setShowOpenHouseModal(false)}><FaTimes /></button></div>
            <form onSubmit={handleCreateOpenHouse} className="pdp-modal-form">
              <div className="pdp-form-group"><label>Event Title *</label><input type="text" required value={openHouseForm.title} onChange={e => setOpenHouseForm({ ...openHouseForm, title: e.target.value })} /></div>
              <div className="pdp-form-grid-3">
                <div className="pdp-form-group"><label>Event Date *</label><input type="date" required value={openHouseForm.eventDate} onChange={e => setOpenHouseForm({ ...openHouseForm, eventDate: e.target.value })} /></div>
                <div className="pdp-form-group"><label>Start *</label><input type="time" required value={openHouseForm.startTime} onChange={e => setOpenHouseForm({ ...openHouseForm, startTime: e.target.value })} /></div>
                <div className="pdp-form-group"><label>End *</label><input type="time" required value={openHouseForm.endTime} onChange={e => setOpenHouseForm({ ...openHouseForm, endTime: e.target.value })} /></div>
              </div>
              <div className="pdp-modal-footer">
                <button type="button" className="pdp-btn-secondary" onClick={() => setShowOpenHouseModal(false)}>Cancel</button>
                <button type="submit" className="pdp-btn-primary">Activate Open House</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD LEAD */}
      {showLeadModal && (
        <div className="pdp-modal-backdrop" onClick={() => setShowLeadModal(false)}>
          <div className="pdp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header"><h3>Add Interested Lead</h3><button type="button" className="pdp-btn-close-modal" onClick={() => setShowLeadModal(false)}><FaTimes /></button></div>
            <form onSubmit={handleAddLead} className="pdp-modal-form">
              <div className="pdp-form-grid-2">
                <div className="pdp-form-group"><label>Client Name *</label><input type="text" required value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} /></div>
                <div className="pdp-form-group"><label>Phone *</label><input type="text" required value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} /></div>
              </div>
              <div className="pdp-form-group"><label>Budget ($)</label><input type="number" value={leadForm.budgetMax || property.askingPrice} onChange={e => setLeadForm({ ...leadForm, budgetMax: Number(e.target.value) })} /></div>
              <div className="pdp-modal-footer">
                <button type="button" className="pdp-btn-secondary" onClick={() => setShowLeadModal(false)}>Cancel</button>
                <button type="submit" className="pdp-btn-primary">Map Buyer Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: ADD DOCUMENT */}
      {showDocModal && (
        <div className="pdp-modal-backdrop" onClick={() => setShowDocModal(false)}>
          <div className="pdp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header"><h3>Link Compliance Document</h3><button type="button" className="pdp-btn-close-modal" onClick={() => setShowDocModal(false)}><FaTimes /></button></div>
            <form onSubmit={handleAddDoc} className="pdp-modal-form">
              <div className="pdp-form-group"><label>Document Title *</label><input type="text" required value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} /></div>
              <div className="pdp-form-group"><label>Cloud File URL</label><input type="url" value={docForm.fileUrl} onChange={e => setDocForm({ ...docForm, fileUrl: e.target.value })} /></div>
              <div className="pdp-modal-footer">
                <button type="button" className="pdp-btn-secondary" onClick={() => setShowDocModal(false)}>Cancel</button>
                <button type="submit" className="pdp-btn-primary">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: RECORD DEAL (Valid stage enum and lead association) */}
      {showDealModal && (
        <div className="pdp-modal-backdrop" onClick={() => setShowDealModal(false)}>
          <div className="pdp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header"><h3>Record Deal Negotiation</h3><button type="button" className="pdp-btn-close-modal" onClick={() => setShowDealModal(false)}><FaTimes /></button></div>
            <form onSubmit={handleCreateDeal} className="pdp-modal-form">
              <div className="pdp-form-group">
                <label>Select Associated Buyer Lead</label>
                <select 
                  value={dealForm.leadId} 
                  onChange={e => {
                    const matched = property.leads?.find(l => l._id === e.target.value);
                    setDealForm({
                      ...dealForm,
                      leadId: e.target.value,
                      clientName: matched?.name || dealForm.clientName,
                    });
                  }}
                >
                  <option value="">Auto-associate lead or manual buyer</option>
                  {(property.leads || []).map(l => (
                    <option key={l._id} value={l._id}>{l.name} ({l.phone})</option>
                  ))}
                </select>
              </div>

              {!dealForm.leadId && (
                <div className="pdp-form-group">
                  <label>Buyer Name *</label>
                  <input type="text" required placeholder="e.g. Rahul Singhania" value={dealForm.clientName} onChange={e => setDealForm({ ...dealForm, clientName: e.target.value })} />
                </div>
              )}

              <div className="pdp-form-group">
                <label>Deal Reference Title *</label>
                <input type="text" required value={dealForm.title} onChange={e => setDealForm({ ...dealForm, title: e.target.value })} />
              </div>

              <div className="pdp-form-grid-3">
                <div className="pdp-form-group"><label>Offer Amount ($) *</label><input type="number" required value={dealForm.dealValue || property.askingPrice} onChange={e => setDealForm({ ...dealForm, dealValue: Number(e.target.value) })} /></div>
                <div className="pdp-form-group"><label>Commission %</label><input type="number" step="0.1" value={dealForm.commissionPercent} onChange={e => setDealForm({ ...dealForm, commissionPercent: Number(e.target.value) })} /></div>
                <div className="pdp-form-group">
                  <label>Pipeline Stage *</label>
                  <select value={dealForm.stage} onChange={e => setDealForm({ ...dealForm, stage: e.target.value })}>
                    <option value="New">New</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Viewing">Viewing</option>
                    <option value="Offer/Negotiation">Offer/Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>

              <div className="pdp-modal-footer">
                <button type="button" className="pdp-btn-secondary" onClick={() => setShowDealModal(false)}>Cancel</button>
                <button type="submit" className="pdp-btn-primary">Record Deal in Pipeline</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: VIEW LEAD DETAILS CARD */}
      {selectedLeadForDetail && (
        <div className="pdp-modal-backdrop" onClick={() => setSelectedLeadForDetail(null)}>
          <div className="pdp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header">
              <h3>Buyer Lead Profile: {selectedLeadForDetail.name}</h3>
              <button type="button" className="pdp-btn-close-modal" onClick={() => setSelectedLeadForDetail(null)}><FaTimes /></button>
            </div>

            <div className="pdp-lead-detail-content">
              <div className="pdp-lead-detail-row">
                <span>Phone / WhatsApp:</span>
                <strong>{selectedLeadForDetail.phone}</strong>
              </div>
              <div className="pdp-lead-detail-row">
                <span>Email:</span>
                <strong>{selectedLeadForDetail.email || 'N/A'}</strong>
              </div>
              <div className="pdp-lead-detail-row">
                <span>Temperature:</span>
                <span className={`pdp-temp-pill ${selectedLeadForDetail.temperature?.toLowerCase() || 'warm'}`}>
                  {selectedLeadForDetail.temperature}
                </span>
              </div>
              <div className="pdp-lead-detail-row">
                <span>Deal Propensity Score:</span>
                <strong className="pdp-score-tag">{selectedLeadForDetail.score || 75}/100</strong>
              </div>
              <div className="pdp-lead-detail-row">
                <span>Lead Source:</span>
                <span className="pdp-source-pill">{selectedLeadForDetail.source || 'Smart QR'}</span>
              </div>
              <div className="pdp-lead-detail-row">
                <span>Current Status:</span>
                <span className="pdp-status-pill available">{selectedLeadForDetail.status || 'New'}</span>
              </div>
              {selectedLeadForDetail.notes && (
                <div className="pdp-lead-notes-area">
                  <label>Notes & History:</label>
                  <p>{selectedLeadForDetail.notes}</p>
                </div>
              )}

              <div className="pdp-modal-footer">
                <button 
                  type="button" 
                  className="pdp-btn-secondary" 
                  onClick={() => {
                    setSelectedLeadForDetail(null);
                    navigate(`/app/leads?search=${encodeURIComponent(selectedLeadForDetail.phone || selectedLeadForDetail.name)}`);
                  }}
                >
                  Open in Leads CRM →
                </button>
                <a 
                  href={`https://wa.me/${(selectedLeadForDetail.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selectedLeadForDetail.name}, regarding ${property.projectName} (${property.propertyCode}).`)}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="pdp-btn-primary"
                >
                  <FaWhatsapp /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: ASSIGN PROPERTY ADVISOR */}
      {showAssignModal && (
        <div className="pdp-modal-backdrop" onClick={() => setShowAssignModal(false)}>
          <div className="pdp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header">
              <h3>Assign Property Advisor</h3>
              <button type="button" className="pdp-btn-close-modal" onClick={() => setShowAssignModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAssignAdvisor} className="pdp-modal-form">
              <div className="pdp-form-group">
                <label>Select Authorized Property Advisor *</label>
                <select value={selectedAgentId} onChange={e => setSelectedAgentId(e.target.value)}>
                  <option value="">Unassigned (Open pool)</option>
                  {propertyAgents.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.subRole === 'PROPERTY_AGENT' ? 'Property Agent' : 'Dual Agent'}) • {a.assignedCounts?.properties || 0} listings
                    </option>
                  ))}
                </select>
              </div>

              <div className="pdp-advisor-preview-info">
                <p>Authorized agents will be directly notified and listed as the direct contact on physical Smart QR deal rooms.</p>
              </div>

              <div className="pdp-modal-footer">
                <button type="button" className="pdp-btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="pdp-btn-primary">Confirm Advisor Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
