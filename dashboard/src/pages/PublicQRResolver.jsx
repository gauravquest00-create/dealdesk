import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { qrApi } from '../services/api/services.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import {
  FaBuilding,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaCalendarAlt,
  FaClock,
  FaUserTie,
  FaTimes,
  FaCompass,
  FaCouch,
  FaShareAlt,
  FaGlobe,
  FaLanguage,
  FaUser,
  FaCalendar
} from 'react-icons/fa';
import './PublicQRResolver.css';

// Translation object with all keys used in page
const translations = {
  en: {
    smartQrTag: 'Smart QR:',
    soldNotice: 'Original Listing has been Sold or Reserved!',
    soldNoticeDesc: 'Our Smart QR resolver has automatically matched you to the best available alternative inventory in the same community:',
    connectTitle: 'Connect directly with the authorized listing advisor for private viewings.',
    connectDesc: 'Private walkthroughs, negotiable pricing terms, and official title documents.',
    advisorRole: 'Senior Real Estate Consultant',
    callAdvisor: 'Call Advisor',
    chatWhatsApp: 'Chat on WhatsApp',
    interestBtn: 'I Am Interested • Schedule Private Viewing',
    scheduleTour: 'Schedule Private Tour',
    scheduleDesc: 'Connect directly with the advisor for private viewings.',
    enquiryReceived: 'Enquiry Received! 🎉',
    enquirySuccessMsg: 'Thank you, {name}. Your private viewing inquiry for {property} has been logged directly with {advisor}.',
    advisorFollowup: 'Our advisor will contact you on {phone} shortly to confirm your viewing schedule.',
    continueWhatsApp: 'Continue to WhatsApp Chat',
    close: 'Close',
    yourName: 'Your Full Name *',
    phoneNumber: 'Phone Number (WhatsApp Ready) *',
    emailAddress: 'Email Address',
    preferredDate: 'Preferred Viewing Date',
    preferredTime: 'Preferred Time',
    questions: 'Questions / Specific Requirements (Optional)',
    cancel: 'Cancel',
    confirmRequest: 'Confirm & Request Viewing',
    submitting: 'Submitting Enquiry...',
    listingNotFound: 'Listing Not Found',
    listingNotFoundDesc: 'Smart QR code {qrId} is currently not mapped to an active property.',
    visitHome: 'Visit DealDesk Home',
    connecting: 'Connecting to property listing...',
    aboutResidence: 'About this Residence',
    keyFeatures: 'Key Features & Amenities',
    propertyType: 'Property Type',
    negotiable: 'Negotiable',
    beds: 'Beds',
    baths: 'Baths',
    carpetArea: 'Carpet Area',
    facing: 'Facing',
    furnishing: 'Furnishing',
    floorLevel: 'Floor Level',
    floor: 'Floor',
    verifiedListing: 'Verified Listing on DealDesk.',
  },
  hi: {
    smartQrTag: 'स्मार्ट QR:',
    soldNotice: 'मूल लिस्टिंग बिक गई या आरक्षित है!',
    soldNoticeDesc: 'हमारे स्मार्ट QR रिज़ॉल्वर ने आपको उसी समुदाय में सर्वोत्तम उपलब्ध वैकल्पिक संपत्ति से स्वचालित रूप से मिलान किया है:',
    connectTitle: 'निजी दर्शन के लिए अधिकृत सूची सलाहकार से सीधे संपर्क करें।',
    connectDesc: 'निजी वॉकथ्रू, परक्राम्य मूल्य शर्तें और आधिकारिक शीर्षक दस्तावेज।',
    advisorRole: 'वरिष्ठ रियल एस्टेट सलाहकार',
    callAdvisor: 'सलाहकार को कॉल करें',
    chatWhatsApp: 'व्हाट्सएप पर चैट करें',
    interestBtn: 'मुझे रुचि है • निजी दर्शन शेड्यूल करें',
    scheduleTour: 'निजी दौरा शेड्यूल करें',
    scheduleDesc: 'निजी दर्शन के लिए सलाहकार से सीधे संपर्क करें।',
    enquiryReceived: 'जांच प्राप्त हुई! 🎉',
    enquirySuccessMsg: 'धन्यवाद, {name}। {property} के लिए आपकी निजी दर्शन जांच {advisor} के साथ दर्ज कर ली गई है।',
    advisorFollowup: 'हमारा सलाहकार आपके दर्शन कार्यक्रम की पुष्टि करने के लिए {phone} पर जल्द ही संपर्क करेगा।',
    continueWhatsApp: 'व्हाट्सएप चैट पर जारी रखें',
    close: 'बंद करें',
    yourName: 'आपका पूरा नाम *',
    phoneNumber: 'फोन नंबर (व्हाट्सएप) *',
    emailAddress: 'ईमेल पता',
    preferredDate: 'पसंदीदा दर्शन तिथि',
    preferredTime: 'पसंदीदा समय',
    questions: 'प्रश्न / विशेष आवश्यकताएं (वैकल्पिक)',
    cancel: 'रद्द करें',
    confirmRequest: 'पुष्टि करें और दर्शन का अनुरोध करें',
    submitting: 'जांच सबमिट हो रही है...',
    listingNotFound: 'लिस्टिंग नहीं मिली',
    listingNotFoundDesc: 'स्मार्ट QR कोड {qrId} वर्तमान में किसी सक्रिय संपत्ति से मैप नहीं है।',
    visitHome: 'DealDesk होम पर जाएं',
    connecting: 'संपत्ति लिस्टिंग से कनेक्ट हो रहा है...',
    aboutResidence: 'इस निवास के बारे में',
    keyFeatures: 'प्रमुख विशेषताएं और सुविधाएं',
    propertyType: 'संपत्ति का प्रकार',
    negotiable: 'परक्राम्य',
    beds: 'बेडरूम',
    baths: 'बाथरूम',
    carpetArea: 'कारपेट एरिया',
    facing: 'दिशा',
    furnishing: 'फर्नीशिंग',
    floorLevel: 'मंजिल स्तर',
    floor: 'मंजिल',
    verifiedListing: 'DealDesk पर सत्यापित लिस्टिंग।',
  },
  ar: {
    smartQrTag: 'رمز QR الذكي:',
    soldNotice: 'القائمة الأصلية مباعة أو محجوزة!',
    soldNoticeDesc: 'قام محلل QR الذكي الخاص بنا بمطابقتك تلقائيًا مع أفضل مخزون بديل متاح في نفس المجتمع:',
    connectTitle: 'تواصل مباشرة مع مستشار القائمة المعتمد للجولات الخاصة.',
    connectDesc: 'جولات خاصة، شروط تسعير قابلة للتفاوض، ووثائق الملكية الرسمية.',
    advisorRole: 'كبار مستشار العقارات',
    callAdvisor: 'اتصل بالمستشار',
    chatWhatsApp: 'دردشة عبر واتساب',
    interestBtn: 'أنا مهتم • جدولة جولة خاصة',
    scheduleTour: 'جدولة جولة خاصة',
    scheduleDesc: 'تواصل مباشرة مع المستشار للجولات الخاصة.',
    enquiryReceived: 'تم استلام الاستفسار! 🎉',
    enquirySuccessMsg: 'شكراً لك، {name}. تم تسجيل استفسارك للجولة الخاصة لـ {property} مباشرة مع {advisor}.',
    advisorFollowup: 'سيتصل بك مستشارنا على {phone} قريباً لتأكيد جدول الجولة.',
    continueWhatsApp: 'مواصلة الدردشة عبر واتساب',
    close: 'إغلاق',
    yourName: 'الاسم الكامل *',
    phoneNumber: 'رقم الهاتف (واتساب) *',
    emailAddress: 'البريد الإلكتروني',
    preferredDate: 'التاريخ المفضل للجولة',
    preferredTime: 'الوقت المفضل',
    questions: 'أسئلة / متطلبات خاصة (اختياري)',
    cancel: 'إلغاء',
    confirmRequest: 'تأكيد وطلب جولة',
    submitting: 'جاري إرسال الاستفسار...',
    listingNotFound: 'القائمة غير موجودة',
    listingNotFoundDesc: 'رمز QR الذكي {qrId} غير مرتبط حالياً بأي عقار نشط.',
    visitHome: 'زيارة الصفحة الرئيسية',
    connecting: 'جارٍ الاتصال بقائمة العقار...',
    aboutResidence: 'حول هذا المسكن',
    keyFeatures: 'الميزات الرئيسية والمرافق',
    propertyType: 'نوع العقار',
    negotiable: 'قابل للتفاوض',
    beds: 'غرف نوم',
    baths: 'حمامات',
    carpetArea: 'المساحة',
    facing: 'اتجاه',
    furnishing: 'التأثيث',
    floorLevel: 'مستوى الطابق',
    floor: 'طابق',
    verifiedListing: 'قائمة تم التحقق منها على DealDesk.',
  },
};

export const PublicQRResolver = () => {
  const { qrId } = useParams();
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: '15:00',
    message: '',
  });

  const t = translations[language] || translations.en;

  useEffect(() => {
    qrApi.resolve(qrId)
      .then(res => setData(res.data))
      .catch(err => console.error('QR Resolve Error:', err))
      .finally(() => setLoading(false));
  }, [qrId]);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please enter your name and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const activeProp = data?.isSoldFallback ? data?.replacementProperty : data?.property;
      const res = await qrApi.submitEnquiry({
        qrId,
        propertyId: activeProp?._id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        message: formData.message,
      });

      setEnquirySuccess(res.data);
    } catch (err) {
      alert(err.message || 'Failed to submit enquiry. Please try calling the advisor directly.');
    } finally {
      setSubmitting(false);
    }
  };

  // Language and currency options
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ar', label: 'العربية' },
  ];

  const currencyOptions = [
    { code: 'USD', label: 'USD $' },
    { code: 'INR', label: 'INR ₹' },
    { code: 'AED', label: 'AED' },
    { code: 'GBP', label: 'GBP £' },
    { code: 'EUR', label: 'EUR €' },
  ];

  if (loading) {
    return (
      <div className="public-qr-loading-screen">
        <div className="spinner"></div>
        <p>{t.connecting}</p>
      </div>
    );
  }

  if (!data || (!data.property && !data.replacementProperty)) {
    return (
      <div className="public-qr-error-screen">
        <FaBuilding className="error-icon" />
        <h2>{t.listingNotFound}</h2>
        <p>{t.listingNotFoundDesc.replace('{qrId}', qrId)}</p>
        <Link to="/" className="btn-return-home">{t.visitHome}</Link>
      </div>
    );
  }

  const prop = data?.isSoldFallback ? data?.replacementProperty : data?.property;
  const advisor = data?.advisor || prop?.assignedAgentId;
  const business = data?.business;

  const cleanPhone = (advisor?.phone || business?.phone || '+919876543210').replace(/[^0-9]/g, '');
  const advisorName = advisor?.name || 'Authorized Real Estate Advisor';
  const agencyName = business?.name || 'DealDesk Workspace';

  const defaultWhatsappMessage = `Hi ${advisorName}, I scanned the Smart QR code (${qrId}) for ${prop?.projectName} (${prop?.propertyCode}). I am interested and would like to schedule a private viewing.`;

  return (
    <div className="public-qr-page">
      {/* Brand Header with Language & Currency Selector */}
      <header className="public-qr-header">
        <div className="header-container">
          <div className="brand-logo-wrap">
            <FaBuilding />
            <span>{agencyName}</span>
          </div>
          <div className="header-controls">
            <div className="lang-currency-selectors">
              <div className="selector-group">
                <FaLanguage className="selector-icon" />
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="lang-select"
                >
                  {languageOptions.map(opt => (
                    <option key={opt.code} value={opt.code}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="selector-group">
                <FaGlobe className="selector-icon" />
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="currency-select"
                >
                  {currencyOptions.map(opt => (
                    <option key={opt.code} value={opt.code}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <span className="smart-qr-tag">{t.smartQrTag} {qrId}</span>
          </div>
        </div>
      </header>

      <main className="public-qr-main">
        {/* Replacement Inventory Notice if Original Property Sold */}
        {data.isSoldFallback && (
          <div className="sold-notice-banner">
            <FaExclamationTriangle className="alert-icon" />
            <div>
              <strong>{t.soldNotice}</strong>
              <p>
                {t.soldNoticeDesc} <strong>{prop?.projectName}</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="public-property-card">
          {/* Main Cover Image */}
          <div className="property-hero-image-wrap">
            <img 
              src={prop?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'} 
              alt={prop?.projectName} 
            />
            <div className="image-overlay-badges">
              <span className="badge-code">{prop?.propertyCode}</span>
              <span className={`badge-status ${prop?.status?.toLowerCase()}`}>{prop?.status}</span>
            </div>
          </div>

          <div className="property-content-body">
            {/* Title & Price Header */}
            <div className="property-header-row">
              <div>
                <span className="property-type-tag">{prop?.propertyType || 'Apartment'} • {prop?.configuration}</span>
                <h1 className="property-title">{prop?.projectName}</h1>
                <p className="property-address">{prop?.address}</p>
              </div>
              <div className="price-box">
                <span className="price-amount">{formatPrice(prop?.askingPrice)}</span>
                {prop?.isNegotiable && <span className="negotiable-pill">{t.negotiable}</span>}
              </div>
            </div>

            {/* Space Specs Matrix */}
            <div className="specs-matrix-grid">
              <div className="spec-tile">
                <FaBed className="spec-icon" />
                <div>
                  <span className="val">{prop?.bedrooms} {t.beds}</span>
                  <span className="lbl">{t.beds}</span>
                </div>
              </div>
              <div className="spec-tile">
                <FaBath className="spec-icon" />
                <div>
                  <span className="val">{prop?.bathrooms} {t.baths}</span>
                  <span className="lbl">{t.baths}</span>
                </div>
              </div>
              <div className="spec-tile">
                <FaRulerCombined className="spec-icon" />
                <div>
                  <span className="val">{prop?.sizeSqFt} sq.ft</span>
                  <span className="lbl">{t.carpetArea}</span>
                </div>
              </div>
              <div className="spec-tile">
                <FaCompass className="spec-icon" />
                <div>
                  <span className="val">{prop?.facing || 'East'}</span>
                  <span className="lbl">{t.facing}</span>
                </div>
              </div>
              <div className="spec-tile">
                <FaCouch className="spec-icon" />
                <div>
                  <span className="val">{prop?.furnishing || 'Semi-Furnished'}</span>
                  <span className="lbl">{t.furnishing}</span>
                </div>
              </div>
              <div className="spec-tile">
                <FaClock className="spec-icon" />
                <div>
                  <span className="val">{prop?.floor || 'Mid Floor'}</span>
                  <span className="lbl">{t.floorLevel}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {prop?.description && (
              <div className="description-section">
                <h3>{t.aboutResidence}</h3>
                <p>{prop?.description}</p>
              </div>
            )}

            {/* Amenities Pills */}
            {prop?.amenities && prop.amenities.length > 0 && (
              <div className="amenities-section">
                <h3>{t.keyFeatures}</h3>
                <div className="amenities-pills-list">
                  {prop.amenities.map((item, idx) => (
                    <span key={idx} className="amenity-chip">
                      <FaCheckCircle className="check" /> {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Advisor Contact Card */}
            <div className="advisor-contact-card">
              <div className="advisor-intro-header">
                <h3>{t.connectTitle}</h3>
                <p>{t.connectDesc}</p>
              </div>

              <div className="advisor-profile-row">
                <div className="advisor-avatar">
                  {advisor?.photoUrl ? (
                    <img src={advisor.photoUrl} alt={advisorName} />
                  ) : (
                    <FaUserTie />
                  )}
                </div>
                <div className="advisor-meta">
                  <h4>{advisorName}</h4>
                  <span className="advisor-role">{advisor?.department || t.advisorRole}</span>
                  <span className="advisor-agency">{agencyName}</span>
                </div>
              </div>

              <div className="advisor-direct-actions">
                {advisor?.phone && (
                  <a href={`tel:${advisor.phone}`} className="btn-advisor-action call">
                    <FaPhoneAlt /> {t.callAdvisor}
                  </a>
                )}
                <a 
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultWhatsappMessage)}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-advisor-action whatsapp"
                >
                  <FaWhatsapp /> {t.chatWhatsApp}
                </a>
              </div>

              {/* Primary CTA — Box-style like social link preview */}
              <button 
                className="btn-primary-interest box-style-btn"
                onClick={() => {
                  setEnquirySuccess(null);
                  setShowEnquiryModal(true);
                }}
              >
                <FaCalendarAlt style={{ marginRight: 8 }} />
                {t.interestBtn}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Enquiry Modal — Box-style form */}
      {showEnquiryModal && (
        <div className="modal-backdrop" onClick={() => setShowEnquiryModal(false)}>
          <div className="enquiry-modal-card box-style" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div>
                <h3>{t.scheduleTour}</h3>
                <p>{t.scheduleDesc}</p>
              </div>
              <button className="btn-close-modal" onClick={() => setShowEnquiryModal(false)}>
                <FaTimes />
              </button>
            </div>

            {enquirySuccess ? (
              <div className="enquiry-success-view">
                <div className="success-icon-wrap">
                  <FaCheckCircle />
                </div>
                <h3>{t.enquiryReceived}</h3>
                <p className="success-msg">
                  {t.enquirySuccessMsg
                    .replace('{name}', formData.name)
                    .replace('{property}', prop?.projectName)
                    .replace('{advisor}', advisorName)}
                </p>

                <div className="advisor-followup-box">
                  <p>{t.advisorFollowup.replace('{phone}', formData.phone)}</p>
                </div>

                <div className="modal-success-actions">
                  <a 
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${advisorName}, I just enquired about ${prop?.projectName} (${prop?.propertyCode}) via Smart QR ${qrId}. My name is ${formData.name}.`)}`}
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-whatsapp-chat"
                  >
                    <FaWhatsapp /> {t.continueWhatsApp}
                  </a>
                  <button className="btn-finish" onClick={() => setShowEnquiryModal(false)}>
                    {t.close}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="enquiry-modal-form box-style-form">
                <div className="form-field">
                  <label><FaUser className="form-icon" /> {t.yourName}</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Amitabh Malhotra" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  />
                </div>

                <div className="form-field">
                  <label><FaWhatsapp className="form-icon" /> {t.phoneNumber}</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. +91 98765 43210" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  />
                </div>

                <div className="form-field">
                  <label><FaEnvelope className="form-icon" /> {t.emailAddress}</label>
                  <input 
                    type="email" 
                    placeholder="e.g. name@domain.com" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-field">
                    <label><FaCalendar className="form-icon" /> {t.preferredDate}</label>
                    <input 
                      type="date" 
                      value={formData.preferredDate} 
                      onChange={e => setFormData({ ...formData, preferredDate: e.target.value })} 
                    />
                  </div>
                  <div className="form-field">
                    <label><FaClock className="form-icon" /> {t.preferredTime}</label>
                    <input 
                      type="time" 
                      value={formData.preferredTime} 
                      onChange={e => setFormData({ ...formData, preferredTime: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>{t.questions}</label>
                  <textarea 
                    rows={3} 
                    placeholder="Interested in price negotiation, floor plan details, or mortgage options..." 
                    value={formData.message} 
                    onChange={e => setFormData({ ...formData, message: e.target.value })} 
                  />
                </div>

                <div className="modal-footer-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowEnquiryModal(false)}>
                    {t.cancel}
                  </button>
                  <button type="submit" disabled={submitting} className="btn-submit-enquiry box-style-btn-primary">
                    {submitting ? t.submitting : t.confirmRequest}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <footer className="public-qr-footer">
        <p>© {new Date().getFullYear()} {agencyName}. {t.verifiedListing}</p>
      </footer>
    </div>
  );
};