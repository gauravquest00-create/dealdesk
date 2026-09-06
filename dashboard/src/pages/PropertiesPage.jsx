import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyApi, teamApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaSearch, 
  FaBuilding, 
  FaQrcode, 
  FaBed, 
  FaBath, 
  FaRulerCombined,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaEye,
  FaUserFriends,
  FaImages,
  FaFileContract,
  FaMoneyBillWave,
  FaTimes,
  FaCloudUploadAlt,
  FaTrash,
  FaStar,
  FaSpinner,
  FaGlobe
} from 'react-icons/fa';
import './PropertiesPage.css';

const AMENITIES_LIST = [
  'Swimming Pool',
  'Private Clubhouse',
  'Modern Gym & Fitness Center',
  '24/7 Gated Security & CCTV',
  '100% Power Backup',
  'Reserved Covered Parking',
  'EV Charging Stations',
  'High-Speed Elevators',
  'Landscaped Gardens & Jogging Track',
  'Tennis / Squash Court',
  'Kids Play Zone',
  'Concierge & Reception Desk'
];

// Currency options for property listing
const PROPERTY_CURRENCIES = [
  { code: 'USD', label: 'USD ($)' },
  { code: 'INR', label: 'INR (₹)' },
  { code: 'AED', label: 'AED' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'CAD', label: 'CAD (CA$)' },
  { code: 'AUD', label: 'AUD (A$)' },
];

// Helper to get currency symbol
const getCurrencySymbol = (currencyCode) => {
  const map = {
    USD: '$',
    INR: '₹',
    AED: 'AED ',
    GBP: '£',
    EUR: '€',
    CAD: 'CA$',
    AUD: 'A$',
  };
  return map[currencyCode] || '$';
};

export const PropertiesPage = () => {
  const { addToast } = useToast();
  // 🔥 FIX: Take currency, rates, and formatPrice from context
  const { currency, rates, formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('basic');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // ---- NEW: Helper to display price with conversion ----
  const getDisplayPrice = (property) => {
    const propCurrency = property.currency || 'USD';
    const amount = property.askingPrice || 0;
    const targetCurrency = currency;

    // If same currency, just show with symbol
    if (propCurrency === targetCurrency) {
      const symbol = getCurrencySymbol(propCurrency);
      return `${symbol}${amount.toLocaleString()}`;
    }

    // If rates not loaded or missing, fallback to property's native display
    if (!rates[propCurrency] || !rates[targetCurrency]) {
      const symbol = getCurrencySymbol(propCurrency);
      return `${symbol}${amount.toLocaleString()}`;
    }

    // Convert: property currency → USD → target currency
    const usdAmount = amount / rates[propCurrency];
    const converted = usdAmount * rates[targetCurrency];
    const symbol = getCurrencySymbol(targetCurrency);
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  };

  const [formData, setFormData] = useState({
    propertyCode: '',
    projectName: '',
    propertyType: 'Apartment',
    configuration: '3 BHK',
    status: 'Available',
    possessionStatus: 'Ready to Move',
    sizeSqFt: 2400,
    carpetAreaSqFt: 1950,
    superAreaSqFt: 2400,
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    floor: '12th Floor',
    totalFloors: 28,
    facing: 'East',
    furnishing: 'Semi-Furnished',
    transactionType: 'Sale',
    askingPrice: 420000,
    currency: 'USD',
    isNegotiable: true,
    monthlyMaintenance: 180,
    commissionPercent: 2.0,
    expectedRoi: 6.5,
    address: 'Golf Course Extension Road, Sector 58',
    sector: 'Sector 58',
    city: 'Gurugram',
    postalCode: '122011',
    googleMapsUrl: '',
    description: 'Ultra-luxury high-rise residential apartment with panoramic green views, Italian marble flooring, and VRV air conditioning.',
    amenities: ['Swimming Pool', 'Private Clubhouse', 'Modern Gym & Fitness Center', '24/7 Gated Security & CCTV', '100% Power Backup'],
    coverPhotoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    floorPlanUrl: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80',
    reraNumber: 'RC/REP/HARERA/GGM/2026/89',
    privateNotes: 'Seller is a motivated NRI investor. Willing to close escrow within 30 days.',
    assignedAgentId: '',
    photos: [],
  });

  const loadProperties = () => {
    setLoading(true);
    propertyApi.list({ search, status: statusFilter })
      .then(res => setProperties(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProperties();
    teamApi.list()
      .then(res => {
        setAgents(res.data);
        if (res.data[0]) {
          setFormData(prev => ({ ...prev, assignedAgentId: res.data[0]._id }));
        }
      })
      .catch(() => {});
  }, [statusFilter]);

  const handleQuickStatusChange = (propertyId, newStatus, e) => {
    e.stopPropagation();
    propertyApi.update(propertyId, { status: newStatus })
      .then(() => {
        addToast('Property status updated successfully');
        loadProperties();
      })
      .catch(() => addToast('Failed to update status', 'error'));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProperties();
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => {
      const current = prev.amenities || [];
      const updated = current.includes(amenity)
        ? current.filter(a => a !== amenity)
        : [...current, amenity];
      return { ...prev, amenities: updated };
    });
  };

  // ============================================================
  // IMAGE UPLOAD HANDLERS
  // ============================================================
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedPhotos = [];
    const token = sessionStorage.getItem('dealdesk_token') || localStorage.getItem('dealdesk_token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const currentPhotos = formData.photos || [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('folder', 'dealdesk/properties');

        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: formDataUpload,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Upload failed');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Upload failed');
        }

        const url = data.data?.secure_url;
        if (!url) throw new Error('No URL returned');

        const isCover = currentPhotos.length === 0 && uploadedPhotos.length === 0;
        uploadedPhotos.push({ url, isCover });
      } catch (err) {
        addToast(`Failed to upload ${file.name}: ${err.message}`, 'error');
      }
    }

    setFormData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), ...uploadedPhotos],
      coverPhotoUrl: uploadedPhotos.find(p => p.isCover)?.url || prev.coverPhotoUrl || '',
    }));
    setUploading(false);
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => {
      const newPhotos = (prev.photos || []).filter((_, i) => i !== index);
      if (newPhotos.length > 0 && !newPhotos.some(p => p.isCover)) {
        newPhotos[0].isCover = true;
      }
      return { ...prev, photos: newPhotos };
    });
  };

  const handleSetCover = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).map((p, i) => ({ ...p, isCover: i === index })),
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        sizeSqFt: Number(formData.sizeSqFt),
        carpetAreaSqFt: Number(formData.carpetAreaSqFt),
        superAreaSqFt: Number(formData.superAreaSqFt),
        askingPrice: Number(formData.askingPrice),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        balconies: Number(formData.balconies),
        totalFloors: Number(formData.totalFloors),
        monthlyMaintenance: Number(formData.monthlyMaintenance),
        commissionPercent: Number(formData.commissionPercent),
        expectedRoi: Number(formData.expectedRoi),
        photos: (formData.photos || []).map(p => ({ url: p.url, isCover: p.isCover })),
        currency: formData.currency || 'USD',
      };

      await propertyApi.create(payload);
      addToast('Production listing created & dynamic Smart QR generated!');
      setShowAddModal(false);
      setActiveFormTab('basic');
      setFormData({
        ...formData,
        propertyCode: '',
        projectName: '',
        askingPrice: 420000,
        carpetAreaSqFt: 1950,
        amenities: ['Swimming Pool', 'Private Clubhouse', 'Modern Gym & Fitness Center', '24/7 Gated Security & CCTV', '100% Power Backup'],
        photos: [],
        coverPhotoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        currency: 'USD',
      });
      loadProperties();
    } catch (err) {
      addToast(err.message || 'Failed to create property', 'error');
    }
  };

  return (
    <div className="properties-page">
      <div className="page-title-row">
        <div>
          <h1>Property Portfolio</h1>
          <p className="text-muted">Master inventory records, configurations, dynamic QR links, and leads.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <FaPlus style={{ marginRight: 6 }} /> Add Listing
        </button>
      </div>

      {/* Filter Surface */}
      <div className="filter-surface">
        <form onSubmit={handleSearch} className="search-box-wrap">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by project, code (DD-PR-101), sector, or address..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-selects">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Under Offer">Under Offer</option>
            <option value="Sold">Sold</option>
            <option value="Rented">Rented</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="skeleton-grid">Loading portfolio listings...</div>
      ) : properties.length === 0 ? (
        <div className="clean-empty-container">
          <FaBuilding className="empty-icon" />
          <h3>No properties found</h3>
          <p>Get started by adding your first real estate listing.</p>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>Add Listing</button>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map(p => (
            <div key={p._id} className="property-card clickable" onClick={() => navigate(`/app/properties/${p._id}`)}>
              <div className="property-img-cover">
                <img 
                  src={p.photos?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} 
                  alt={p.projectName} 
                />
                <div className="prop-counts-pill">
                  <FaEye /> {p.viewCount || 0} &bull; <FaUserFriends /> {p.leadCount || 0}
                </div>
                <span className={`property-status-tag status-${p.status.toLowerCase().replace(' ', '-')}`}>
                  {p.status}
                </span>
                {p.possessionStatus && (
                  <span className="possession-tag">{p.possessionStatus}</span>
                )}
              </div>

              <div className="property-card-body">
                <div className="code-and-type">
                  <span className="prop-code">{p.propertyCode}</span>
                  <span className="prop-type">{p.propertyType}</span>
                </div>
                <h3 className="prop-title">{p.projectName}</h3>
                <p className="prop-address"><FaMapMarkerAlt style={{ marginRight: 4 }} />{p.address}</p>
                <div className="spec-row">
                  <span><FaBed /> {p.bedrooms} Beds</span>
                  <span><FaBath /> {p.bathrooms} Baths</span>
                  <span><FaRulerCombined /> {p.carpetAreaSqFt || p.sizeSqFt} sq.ft</span>
                </div>
                <div className="price-and-action">
                  <div className="price-block">
                    <span className="price-val">
                      {/* 🔥 FIX: Use getDisplayPrice for proper conversion */}
                      {getDisplayPrice(p)}
                    </span>
                    {p.isNegotiable && <span className="neg-hint">Negotiable</span>}
                  </div>
                  <select 
                    value={p.status} 
                    onClick={e => e.stopPropagation()} 
                    onChange={e => handleQuickStatusChange(p._id, e.target.value, e)}
                    className="prop-quick-status-select"
                    title="Quick Status Change"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Under Offer">Under Offer</option>
                    <option value="Sold">Sold</option>
                    <option value="Off Market">Off Market</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Production-Level Add Property Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-surface production-property-modal">
            <div className="modal-header">
              <div>
                <h3>Add Property Listing</h3>
                <p className="modal-subtitle">Complete architectural, financial, location, and legal parameters.</p>
              </div>
              <button className="btn-close" onClick={() => setShowAddModal(false)}><FaTimes /></button>
            </div>

            <div className="form-sections-nav">
              <button 
                type="button" 
                className={`section-tab-btn ${activeFormTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveFormTab('basic')}
              >
                1. Basic & Specs
              </button>
              <button 
                type="button" 
                className={`section-tab-btn ${activeFormTab === 'financials' ? 'active' : ''}`}
                onClick={() => setActiveFormTab('financials')}
              >
                2. Financials
              </button>
              <button 
                type="button" 
                className={`section-tab-btn ${activeFormTab === 'location' ? 'active' : ''}`}
                onClick={() => setActiveFormTab('location')}
              >
                3. Location
              </button>
              <button 
                type="button" 
                className={`section-tab-btn ${activeFormTab === 'media' ? 'active' : ''}`}
                onClick={() => setActiveFormTab('media')}
              >
                4. Media & Docs
              </button>
            </div>

            <form onSubmit={handleCreate} className="production-property-form">
              {activeFormTab === 'basic' && (
                <div className="form-tab-content">
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label>Project / Society Name *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. The Camellias Luxury Tower" 
                        value={formData.projectName} 
                        onChange={e => setFormData({ ...formData, projectName: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit / Property Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g. CAM-1802 (Auto if blank)" 
                        value={formData.propertyCode} 
                        onChange={e => setFormData({ ...formData, propertyCode: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Property Type</label>
                      <select value={formData.propertyType} onChange={e => setFormData({ ...formData, propertyType: e.target.value })}>
                        <option value="Apartment">Apartment</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Villa">Luxury Villa</option>
                        <option value="Builder Floor">Builder Floor</option>
                        <option value="Duplex">Duplex Residence</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Plot">Residential Plot</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Layout Configuration</label>
                      <select value={formData.configuration} onChange={e => setFormData({ ...formData, configuration: e.target.value })}>
                        <option value="1 BHK">1 BHK</option>
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="4 BHK">4 BHK</option>
                        <option value="5+ BHK">5+ BHK</option>
                        <option value="Duplex Penthouse">Duplex Penthouse</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Carpet Area (sq.ft) *</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.carpetAreaSqFt} 
                        onChange={e => setFormData({ ...formData, carpetAreaSqFt: e.target.value, sizeSqFt: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Super Built-Up Area (sq.ft)</label>
                      <input 
                        type="number" 
                        value={formData.superAreaSqFt} 
                        onChange={e => setFormData({ ...formData, superAreaSqFt: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Bedrooms</label>
                      <input type="number" min="0" value={formData.bedrooms} onChange={e => setFormData({ ...formData, bedrooms: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Bathrooms</label>
                      <input type="number" min="0" value={formData.bathrooms} onChange={e => setFormData({ ...formData, bathrooms: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Balconies</label>
                      <input type="number" min="0" value={formData.balconies} onChange={e => setFormData({ ...formData, balconies: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Floor Number</label>
                      <input type="text" placeholder="e.g. 18th Floor" value={formData.floor} onChange={e => setFormData({ ...formData, floor: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Total Tower Floors</label>
                      <input type="number" placeholder="e.g. 32" value={formData.totalFloors} onChange={e => setFormData({ ...formData, totalFloors: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Facing Orientation</label>
                      <select value={formData.facing} onChange={e => setFormData({ ...formData, facing: e.target.value })}>
                        <option value="East">East (Vastu Compliant)</option>
                        <option value="North-East">North-East</option>
                        <option value="North">North</option>
                        <option value="West">West</option>
                        <option value="South">South</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Furnishing Status</label>
                      <select value={formData.furnishing} onChange={e => setFormData({ ...formData, furnishing: e.target.value })}>
                        <option value="Fully Furnished">Fully Furnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Possession Timeline</label>
                      <select value={formData.possessionStatus} onChange={e => setFormData({ ...formData, possessionStatus: e.target.value })}>
                        <option value="Ready to Move">Ready to Move</option>
                        <option value="Under Construction">Under Construction</option>
                        <option value="New Launch">New Launch</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Listing Status</label>
                      <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                        <option value="Available">Available</option>
                        <option value="Under Offer">Under Offer</option>
                        <option value="Sold">Sold</option>
                        <option value="Rented">Rented</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'financials' && (
                <div className="form-tab-content">
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label>Transaction Type</label>
                      <select value={formData.transactionType} onChange={e => setFormData({ ...formData, transactionType: e.target.value })}>
                        <option value="Sale">Sale (Outright Purchase)</option>
                        <option value="Rent">Rent (Monthly Lease)</option>
                        <option value="Lease">Long-Term Corporate Lease</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Asking Price *</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.askingPrice} 
                        onChange={e => setFormData({ ...formData, askingPrice: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Listing Currency</label>
                      <select 
                        value={formData.currency || 'USD'} 
                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                      >
                        {PROPERTY_CURRENCIES.map(opt => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price Negotiation</label>
                      <select value={formData.isNegotiable ? 'yes' : 'no'} onChange={e => setFormData({ ...formData, isNegotiable: e.target.value === 'yes' })}>
                        <option value="yes">Price is Negotiable</option>
                        <option value="no">Fixed Price (Non-Negotiable)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Monthly Maintenance ({formData.currency || 'USD'})</label>
                      <input 
                        type="number" 
                        value={formData.monthlyMaintenance} 
                        onChange={e => setFormData({ ...formData, monthlyMaintenance: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Brokerage Commission (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={formData.commissionPercent} 
                        onChange={e => setFormData({ ...formData, commissionPercent: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Estimated ROI / Rental Yield (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={formData.expectedRoi} 
                        onChange={e => setFormData({ ...formData, expectedRoi: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'location' && (
                <div className="form-tab-content">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Street / Project Address *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.address} 
                        onChange={e => setFormData({ ...formData, address: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Sector / Neighborhood</label>
                      <input 
                        type="text" 
                        value={formData.sector} 
                        onChange={e => setFormData({ ...formData, sector: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input 
                        type="text" 
                        value={formData.city} 
                        onChange={e => setFormData({ ...formData, city: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal / PIN Code</label>
                      <input 
                        type="text" 
                        value={formData.postalCode} 
                        onChange={e => setFormData({ ...formData, postalCode: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="amenities-selection-box">
                    <label className="section-sub-label">Select Community & Property Amenities:</label>
                    <div className="amenities-checkboxes-grid">
                      {AMENITIES_LIST.map((am, idx) => {
                        const checked = formData.amenities.includes(am);
                        return (
                          <div 
                            key={idx} 
                            className={`amenity-badge-toggle ${checked ? 'checked' : ''}`}
                            onClick={() => toggleAmenity(am)}
                          >
                            <FaCheckCircle className="check-icon" />
                            <span>{am}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'media' && (
                <div className="form-tab-content">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Primary Cover Image URL</label>
                      <input 
                        type="text" 
                        value={formData.coverPhotoUrl} 
                        onChange={e => setFormData({ ...formData, coverPhotoUrl: e.target.value })} 
                        placeholder="https://..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Floor Plan Image / PDF URL</label>
                      <input 
                        type="text" 
                        value={formData.floorPlanUrl} 
                        onChange={e => setFormData({ ...formData, floorPlanUrl: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="media-upload-section">
                    <div 
                      className={`media-dropzone ${dragActive ? 'active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="media-dropzone-content">
                        <FaCloudUploadAlt className="media-dropzone-icon" />
                        <p>Drag & drop images here, or click to select</p>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={(e) => handleFileUpload(e.target.files)}
                          disabled={uploading}
                        />
                      </div>
                      {uploading && (
                        <div className="media-upload-progress">
                          <FaSpinner className="spinner" /> Uploading...
                        </div>
                      )}
                    </div>

                    {formData.photos && formData.photos.length > 0 && (
                      <div className="media-photo-grid">
                        {formData.photos.map((photo, idx) => (
                          <div key={idx} className="media-photo-item">
                            <img src={photo.url} alt={`Property ${idx+1}`} />
                            <div className="media-photo-actions">
                              <button 
                                type="button" 
                                className={`media-btn-cover ${photo.isCover ? 'active' : ''}`}
                                onClick={() => handleSetCover(idx)}
                                title={photo.isCover ? 'Cover Image' : 'Set as Cover'}
                              >
                                <FaStar />
                              </button>
                              <button 
                                type="button" 
                                className="media-btn-remove"
                                onClick={() => handleRemovePhoto(idx)}
                                title="Remove"
                              >
                                <FaTrash />
                              </button>
                            </div>
                            {photo.isCover && <span className="media-cover-badge">Cover</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label>Private Internal Brokerage Notes (Confidential)</label>
                    <textarea 
                      rows={3} 
                      value={formData.privateNotes} 
                      onChange={e => setFormData({ ...formData, privateNotes: e.target.value })}
                      placeholder="Owner contact details, lockbox codes, negotiation floor price, etc."
                    />
                  </div>
                </div>
              )}

              <div className="modal-actions-bar">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <div className="step-nav-btns">
                  {activeFormTab !== 'basic' && (
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        if (activeFormTab === 'media') setActiveFormTab('location');
                        else if (activeFormTab === 'location') setActiveFormTab('financials');
                        else if (activeFormTab === 'financials') setActiveFormTab('basic');
                      }}
                    >
                      Back
                    </button>
                  )}
                  {activeFormTab !== 'media' ? (
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        if (activeFormTab === 'basic') setActiveFormTab('financials');
                        else if (activeFormTab === 'financials') setActiveFormTab('location');
                        else if (activeFormTab === 'location') setActiveFormTab('media');
                      }}
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button type="submit" className="btn-primary">Save & Publish 🚀</button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
