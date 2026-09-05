import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentApi, propertyApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { 
  FaFolder, 
  FaPlus, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaFilePdf, 
  FaEye, 
  FaDownload, 
  FaBuilding, 
  FaTimes, 
  FaCloudUploadAlt 
} from 'react-icons/fa';
import './DocumentsPage.css';

export const DocumentsPage = () => {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'Legal',
    propertyId: '',
    fileUrl: '',
    status: 'Verified',
  });

  const loadData = () => {
    setLoading(true);
    propertyApi.list().then(res => {
      const propList = res.data || [];
      setProperties(propList);
      const propId = selectedPropertyId || propList[0]?._id;
      if (propId) {
        setSelectedPropertyId(propId);
        setUploadForm(prev => ({ ...prev, propertyId: propId }));
        documentApi.getChecklist(propId).then(c => setChecklist(c.data || null)).catch(() => {});
        documentApi.list({ propertyId: propId }).then(d => setDocuments(d.data || [])).catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId]);

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    try {
      await documentApi.create({
        ...uploadForm,
        propertyId: uploadForm.propertyId || selectedPropertyId,
      });
      addToast('Document added to compliance checklist!');
      setShowUploadModal(false);
      setUploadForm({
        name: '',
        category: 'Legal',
        propertyId: selectedPropertyId,
        fileUrl: '',
        status: 'Verified',
      });
      loadData();
    } catch (err) {
      addToast(err.message || 'Error uploading document', 'error');
    }
  };

  const currentProperty = properties.find(p => p._id === selectedPropertyId);

  return (
    <div className="docs-page">
      {/* Header */}
      <div className="docs-header">
        <div>
          <h1>Document Vault & Compliance</h1>
          <p className="docs-subtitle">Track title deeds, floor plans, RERA approvals, and KYC checklist for fast closing escrow.</p>
        </div>
        <button className="docs-btn-primary" onClick={() => setShowUploadModal(true)}>
          <FaPlus /> Upload Document
        </button>
      </div>

      {/* Property Picker */}
      <div className="docs-filter">
        <div className="docs-filter-select">
          <label>Select Listing for Checklist Audit:</label>
          <select value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}>
            {properties.map(p => (
              <option key={p._id} value={p._id}>{p.projectName} ({p.propertyCode})</option>
            ))}
          </select>
        </div>
        {currentProperty && (
          <Link to={`/app/properties/${currentProperty._id}`} className="docs-prop-link">
            <FaBuilding /> View Property Details ({currentProperty.propertyCode}) →
          </Link>
        )}
      </div>

      {/* Checklist Summary */}
      {checklist && (
        <div className="docs-checklist">
          <span className="docs-pill verified"><FaCheckCircle /> {checklist.verified} Verified</span>
          <span className="docs-pill pending"><FaExclamationCircle /> {checklist.pending} In Review</span>
          <span className="docs-pill missing">{checklist.missing} Missing</span>
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div className="docs-loading">Loading vault records...</div>
      ) : documents.length === 0 ? (
        <div className="docs-empty">
          <FaFolder className="docs-empty-icon" />
          <h3>No documents uploaded for this property yet</h3>
          <p>Add floor plans, sale agreements, and title registry papers.</p>
          <button className="docs-btn-primary" onClick={() => setShowUploadModal(true)}>Upload First Document</button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="docs-table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Category</th>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Uploaded By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(d => (
                  <tr key={d._id}>
                    <td>
                      <div className="docs-title">
                        <FaFilePdf className="docs-pdf-icon" />
                        <strong>{d.name}</strong>
                      </div>
                    </td>
                    <td><span className="docs-category">{d.category}</span></td>
                    <td>
                      <Link to={`/app/properties/${d.propertyId?._id || selectedPropertyId}`} className="docs-prop-link-table">
                        {d.propertyId?.projectName || currentProperty?.projectName || 'Property'}
                      </Link>
                    </td>
                    <td>
                      <span className={`docs-status docs-status-${d.status === 'Verified' ? 'verified' : 'pending'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>{d.uploadedBy?.name || 'Administrator'}</td>
                    <td>
                      <div className="docs-actions">
                        {d.fileUrl && (
                          <a href={d.fileUrl} target="_blank" rel="noreferrer" className="docs-btn-action view" title="Preview">
                            <FaEye /> Preview
                          </a>
                        )}
                        {d.fileUrl && (
                          <a href={d.fileUrl} download target="_blank" rel="noreferrer" className="docs-btn-action download" title="Download">
                            <FaDownload />
                          </a>
                        )}
                        <Link to={`/app/properties/${d.propertyId?._id || selectedPropertyId}`} className="docs-btn-action prop" title="View Property">
                          <FaBuilding />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="docs-cards">
            {documents.map(d => (
              <div key={d._id} className="docs-card">
                <div className="docs-card-top">
                  <div className="docs-title">
                    <FaFilePdf className="docs-pdf-icon" />
                    <strong>{d.name}</strong>
                  </div>
                  <span className={`docs-status docs-status-${d.status === 'Verified' ? 'verified' : 'pending'}`}>
                    {d.status}
                  </span>
                </div>
                <div className="docs-card-details">
                  <span><span className="docs-label">Category:</span> {d.category}</span>
                  <span><span className="docs-label">Property:</span> {d.propertyId?.projectName || currentProperty?.projectName || 'Property'}</span>
                  <span><span className="docs-label">Uploaded by:</span> {d.uploadedBy?.name || 'Administrator'}</span>
                </div>
                <div className="docs-card-actions">
                  {d.fileUrl && (
                    <a href={d.fileUrl} target="_blank" rel="noreferrer" className="docs-btn-action view">
                      <FaEye /> Preview
                    </a>
                  )}
                  {d.fileUrl && (
                    <a href={d.fileUrl} download target="_blank" rel="noreferrer" className="docs-btn-action download">
                      <FaDownload /> Download
                    </a>
                  )}
                  <Link to={`/app/properties/${d.propertyId?._id || selectedPropertyId}`} className="docs-btn-action prop">
                    <FaBuilding /> Property
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="docs-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="docs-modal docs-modal-upload" onClick={e => e.stopPropagation()}>
            <div className="docs-modal-header">
              <h3>Upload Compliance Document</h3>
              <button type="button" className="docs-modal-close" onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            <form onSubmit={handleUploadDocument} className="docs-modal-form">
              <div className="docs-form-group">
                <label>Select Property Listing *</label>
                <select 
                  required 
                  value={uploadForm.propertyId || selectedPropertyId} 
                  onChange={e => setUploadForm({ ...uploadForm, propertyId: e.target.value })}
                >
                  {properties.map(p => (
                    <option key={p._id} value={p._id}>{p.projectName} ({p.propertyCode})</option>
                  ))}
                </select>
              </div>

              <div className="docs-form-group">
                <label>Document Title *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Registered Sale Deed Page 1-14" 
                  value={uploadForm.name} 
                  onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })} 
                />
              </div>

              <div className="docs-form-row">
                <div className="docs-form-group">
                  <label>Document Category</label>
                  <select value={uploadForm.category} onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}>
                    <option value="Ownership">Ownership / Sale Deed</option>
                    <option value="Layout">Approved Floor Plan</option>
                    <option value="Compliance">RERA & Approvals</option>
                    <option value="Legal">Legal & Encumbrance</option>
                    <option value="Brokerage">Brokerage Mandate & KYC</option>
                  </select>
                </div>
                <div className="docs-form-group">
                  <label>Verification Status</label>
                  <select value={uploadForm.status} onChange={e => setUploadForm({ ...uploadForm, status: e.target.value })}>
                    <option value="Verified">Verified & Validated</option>
                    <option value="Pending">Pending Review</option>
                  </select>
                </div>
              </div>

              <div className="docs-form-group">
                <label>Cloud Document URL / File Link *</label>
                <input 
                  type="url" 
                  required 
                  placeholder="https://drive.google.com/... or cloud document link" 
                  value={uploadForm.fileUrl} 
                  onChange={e => setUploadForm({ ...uploadForm, fileUrl: e.target.value })} 
                />
              </div>

              <div className="docs-modal-actions">
                <button type="button" className="docs-btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="docs-btn-primary">Save to Vault</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};