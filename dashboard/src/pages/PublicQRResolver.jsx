import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { qrApi } from '../services/api/services.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { DealDeskLogo } from '../components/DealDeskLogo.jsx';
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
  FaGlobe,
  FaLanguage,
  FaUser,
  FaMoneyBillWave,
  FaCircle
} from 'react-icons/fa';
import './PublicQRResolver.css';

const translations = {
  en: {
    smartQrTag: 'Smart QR:',
    soldNotice: 'This property is no longer available',
    soldNoticeDesc: 'Here are similar available properties in the same project:',
    noAlternatives: 'No exact alternatives available. But we can help you find the perfect property.',
    connectTitle: 'Connect directly with the authorized listing advisor for private viewings.',
    connectDesc: 'Private walkthroughs, negotiable pricing terms, and official title documents.',
    advisorRole: 'Senior Real Estate Consultant',
    callAdvisor: 'Call Advisor',
    chatWhatsApp: 'Chat on WhatsApp',
    interestBtn: 'I Am Interested • Schedule Private Viewing',
    scheduleTour: 'Schedule Private Tour',
    scheduleDesc: 'Connect directly with the advisor for private viewings.',
    enquiryReceived: 'Enquiry Received! 🎉',
    enquirySuccessMsg: 'Thank you, {name}. Your enquiry for {property} has been logged directly with {advisor}.',
    advisorFollowup: 'Our advisor will contact you on {phone} shortly.',
    continueWhatsApp: 'Continue to WhatsApp Chat',
    close: 'Close',
    yourName: 'Your Full Name *',
    phoneNumber: 'Phone Number (WhatsApp Ready) *',
    emailAddress: 'Email Address',
    budget: 'Preferred Budget Range',
    interestedProperty: 'Interested Property',
    selectProperty: 'Select a property...',
    cancel: 'Cancel',
    confirmRequest: 'Submit Enquiry',
    submitting: 'Submitting...',
    listingNotFound: 'Listing Not Found',
    listingNotFoundDesc: 'Smart QR code {qrId} is currently not mapped to an active property.',
    visitHome: 'Visit DealDesk Home',
    connecting: 'Connecting to property listing...',
    aboutResidence: 'About this Residence',
    keyFeatures: 'Key Features & Amenities',
    negotiable: 'Negotiable',
    beds: 'Beds',
    baths: 'Baths',
    carpetArea: 'Carpet Area',
    facing: 'Facing',
    furnishing: 'Furnishing',
    floorLevel: 'Floor Level',
    verifiedListing: 'Verified Listing on DealDesk.',
    exploreDealDesk: 'Explore DealDesk',
    backToHome: 'Back to Home',
    viewAlternatives: 'Similar Available Properties',
    selectAlternative: 'Select this property',
    soldStatus: 'SOLD',
    availableStatus: 'AVAILABLE',
    selected: 'SELECTED',
  },
  hi: {
    smartQrTag: 'स्मार्ट QR:',
    soldNotice: 'यह संपत्ति अब उपलब्ध नहीं है',
    soldNoticeDesc: 'इसी प्रोजेक्ट में समान उपलब्ध संपत्तियाँ:',
    noAlternatives: 'कोई सटीक विकल्प नहीं है। लेकिन हम आपको सही संपत्ति ढूंढने में मदद कर सकते हैं।',
    connectTitle: 'निजी दर्शन के लिए अधिकृत सूची सलाहकार से सीधे संपर्क करें।',
    connectDesc: 'निजी वॉकथ्रू, परक्राम्य मूल्य शर्तें और आधिकारिक शीर्षक दस्तावेज।',
    advisorRole: 'वरिष्ठ रियल एस्टेट सलाहकार',
    callAdvisor: 'सलाहकार को कॉल करें',
    chatWhatsApp: 'व्हाट्सएप पर चैट करें',
    interestBtn: 'मुझे रुचि है • निजी दर्शन शेड्यूल करें',
    scheduleTour: 'निजी दौरा शेड्यूल करें',
    scheduleDesc: 'निजी दर्शन के लिए सलाहकार से सीधे संपर्क करें।',
    enquiryReceived: 'जांच प्राप्त हुई! 🎉',
    enquirySuccessMsg: 'धन्यवाद, {name}। {property} के लिए आपकी जांच {advisor} के साथ दर्ज कर ली गई है।',
    advisorFollowup: 'हमारा सलाहकार आपसे {phone} पर जल्द ही संपर्क करेगा।',
    continueWhatsApp: 'व्हाट्सएप चैट पर जारी रखें',
    close: 'बंद करें',
    yourName: 'आपका पूरा नाम *',
    phoneNumber: 'फोन नंबर (व्हाट्सएप) *',
    emailAddress: 'ईमेल पता',
    budget: 'पसंदीदा बजट रेंज',
    interestedProperty: 'रुचि वाली संपत्ति',
    selectProperty: 'एक संपत्ति चुनें...',
    cancel: 'रद्द करें',
    confirmRequest: 'जांच सबमिट करें',
    submitting: 'सबमिट हो रहा है...',
    listingNotFound: 'लिस्टिंग नहीं मिली',
    listingNotFoundDesc: 'स्मार्ट QR कोड {qrId} वर्तमान में किसी सक्रिय संपत्ति से मैप नहीं है।',
    visitHome: 'DealDesk होम पर जाएं',
    connecting: 'संपत्ति लिस्टिंग से कनेक्ट हो रहा है...',
    aboutResidence: 'इस निवास के बारे में',
    keyFeatures: 'प्रमुख विशेषताएं और सुविधाएं',
    negotiable: 'परक्राम्य',
    beds: 'बेडरूम',
    baths: 'बाथरूम',
    carpetArea: 'कारपेट एरिया',
    facing: 'दिशा',
    furnishing: 'फर्नीशिंग',
    floorLevel: 'मंजिल स्तर',
    verifiedListing: 'DealDesk पर सत्यापित लिस्टिंग।',
    exploreDealDesk: 'DealDesk एक्सप्लोर करें',
    backToHome: 'होम पर जाएं',
    viewAlternatives: 'समान उपलब्ध संपत्तियाँ',
    selectAlternative: 'यह संपत्ति चुनें',
    soldStatus: 'बिक गई',
    availableStatus: 'उपलब्ध',
    selected: 'चुना गया',
  },
  ar: {
    smartQrTag: 'رمز QR الذكي:',
    soldNotice: 'هذا العقار غير متوفر الآن',
    soldNoticeDesc: 'إليك عقارات مماثلة متاحة في نفس المشروع:',
    noAlternatives: 'لا توجد بدائل دقيقة. لكن يمكننا مساعدتك في العثور على العقار المثالي.',
    connectTitle: 'تواصل مباشرة مع مستشار القائمة المعتمد للجولات الخاصة.',
    connectDesc: 'جولات خاصة، شروط تسعير قابلة للتفاوض، ووثائق الملكية الرسمية.',
    advisorRole: 'كبار مستشار العقارات',
    callAdvisor: 'اتصل بالمستشار',
    chatWhatsApp: 'دردشة عبر واتساب',
    interestBtn: 'أنا مهتم • جدولة جولة خاصة',
    scheduleTour: 'جدولة جولة خاصة',
    scheduleDesc: 'تواصل مباشرة مع المستشار للجولات الخاصة.',
    enquiryReceived: 'تم استلام الاستفسار! 🎉',
    enquirySuccessMsg: 'شكراً لك، {name}. تم تسجيل استفسارك لـ {property} مباشرة مع {advisor}.',
    advisorFollowup: 'سيتصل بك مستشارنا على {phone} قريباً.',
    continueWhatsApp: 'مواصلة الدردشة عبر واتساب',
    close: 'إغلاق',
    yourName: 'الاسم الكامل *',
    phoneNumber: 'رقم الهاتف (واتساب) *',
    emailAddress: 'البريد الإلكتروني',
    budget: 'نطاق الميزانية المفضل',
    interestedProperty: 'العقار المهتم به',
    selectProperty: 'اختر عقاراً...',
    cancel: 'إلغاء',
    confirmRequest: 'إرسال الاستفسار',
    submitting: 'جاري الإرسال...',
    listingNotFound: 'القائمة غير موجودة',
    listingNotFoundDesc: 'رمز QR الذكي {qrId} غير مرتبط حالياً بأي عقار نشط.',
    visitHome: 'زيارة الصفحة الرئيسية',
    connecting: 'جارٍ الاتصال بقائمة العقار...',
    aboutResidence: 'حول هذا المسكن',
    keyFeatures: 'الميزات الرئيسية والمرافق',
    negotiable: 'قابل للتفاوض',
    beds: 'غرف نوم',
    baths: 'حمامات',
    carpetArea: 'المساحة',
    facing: 'اتجاه',
    furnishing: 'التأثيث',
    floorLevel: 'مستوى الطابق',
    verifiedListing: 'قائمة تم التحقق منها على DealDesk.',
    exploreDealDesk: 'استكشف DealDesk',
    backToHome: 'العودة إلى الصفحة الرئيسية',
    viewAlternatives: 'البدائل المتاحة المماثلة',
    selectAlternative: 'اختر هذا العقار',
    soldStatus: 'مباع',
    availableStatus: 'متاح',
    selected: 'محدد',
  },
};

// ---- Helper to get currency symbol ----
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

export const PublicQRResolver = () => {
  const { qrId } = useParams();
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency, rates, formatPrice } = useCurrency();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [originalProperty, setOriginalProperty] = useState(null);
  const [fallbackList, setFallbackList] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    budget: '',
  });

  const t = translations[language] || translations.en;

  const goHome = () => {
    const landingUrl = import.meta.env.VITE_LANDING_URL || '/';
    window.location.href = landingUrl;
  };

  const getDisplayPrice = (amount, propCurrency = 'USD') => {
    const targetCurrency = currency;
    const val = amount || 0;
    if (!val) return '—';
    if (propCurrency === targetCurrency) {
      const symbol = getCurrencySymbol(propCurrency);
      return `${symbol}${val.toLocaleString()}`;
    }
    if (!rates[propCurrency] || !rates[targetCurrency]) {
      const symbol = getCurrencySymbol(propCurrency);
      return `${symbol}${val.toLocaleString()}`;
    }
    const usdAmount = val / rates[propCurrency];
    const converted = usdAmount * rates[targetCurrency];
    const symbol = getCurrencySymbol(targetCurrency);
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  };

  useEffect(() => {
    qrApi.resolve(qrId)
      .then(res => {
        const result = res.data;
        setData(result);

        const originalProp = result.property || null;
        let alternatives = result.fallbackProperties || [];

        // 🔥 Filter alternatives to match the same configuration if original exists
        if (originalProp && originalProp.configuration) {
          const sameConfig = alternatives.filter(a => a.configuration === originalProp.configuration);
          if (sameConfig.length > 0) {
            alternatives = sameConfig;
          }
          // else keep all alternatives
        }

        setOriginalProperty(originalProp);
        setFallbackList(alternatives);

        // Determine selected property
        if (originalProp && (originalProp.status !== 'Sold' && originalProp.status !== 'Under Offer')) {
          // Normal available property
          setSelectedProperty(originalProp);
          setSelectedPropertyId(originalProp._id);
        } else if (alternatives.length > 0) {
          // Sold or no original, but alternatives exist
          setSelectedProperty(alternatives[0]);
          setSelectedPropertyId(alternatives[0]._id);
        } else {
          // Sold with no alternatives, or no original and no alternatives
          setSelectedProperty(null);
          setSelectedPropertyId(null);
        }
      })
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
      const res = await qrApi.submitEnquiry({
        qrId,
        propertyId: selectedPropertyId || null,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        budget: formData.budget,
        source: 'Smart QR',
      });
      setEnquirySuccess(res.data);
    } catch (err) {
      alert(err.message || 'Failed to submit enquiry. Please try calling the advisor directly.');
    } finally {
      setSubmitting(false);
    }
  };

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

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', budget: '' });
    setEnquirySuccess(null);
    setShowEnquiryModal(false);
  };

  const handlePropertySelect = (prop) => {
    setSelectedProperty(prop);
    setSelectedPropertyId(prop._id);
  };

  const getBudgetOptions = () => {
    const symbol = getCurrencySymbol(currency);
    return [
      { value: 'under-50k', label: `Under ${symbol}50K` },
      { value: '50k-100k', label: `${symbol}50K - ${symbol}100K` },
      { value: '100k-200k', label: `${symbol}100K - ${symbol}200K` },
      { value: '200k-500k', label: `${symbol}200K - ${symbol}500K` },
      { value: '500k-1m', label: `${symbol}500K - ${symbol}1M` },
      { value: '1m-2m', label: `${symbol}1M - ${symbol}2M` },
      { value: 'above-2m', label: `Above ${symbol}2M` },
    ];
  };

  if (loading) {
    return (
      <div className="public-qr-loading-screen">
        <div className="spinner"></div>
        <p>{t.connecting}</p>
      </div>
    );
  }

  // If no data or no property and no alternatives, show not found
  if (!data || (!data.property && fallbackList.length === 0 && !data.fallbackProperties?.length)) {
    return (
      <div className="public-qr-error-screen">
        <FaBuilding className="error-icon" />
        <h2>{t.listingNotFound}</h2>
        <p>{t.listingNotFoundDesc.replace('{qrId}', qrId)}</p>
        <Link to="/" className="btn-return-home">{t.visitHome}</Link>
      </div>
    );
  }

  const advisor = data?.advisor || originalProperty?.assignedAgentId;
  const business = data?.business;
  const cleanPhone = (advisor?.phone || business?.phone || '+91 8130839987').replace(/[^0-9]/g, '');
  const advisorName = advisor?.name || 'Authorized Real Estate Advisor : ';
  const agencyName = business?.name || 'DealDesk Workspace';
  const projectName = originalProperty?.projectName || data?.projectName || 'Property';

  const defaultWhatsappMessage = `Hi ${advisorName}, I scanned the Smart QR code (${qrId}) for ${projectName}. I am interested and would like to schedule a private viewing.`;

  // Determine display modes
  const isSoldProperty = originalProperty && (originalProperty.status === 'Sold' || originalProperty.status === 'Under Offer');
  const hasAlternatives = fallbackList.length > 0;
  const showNormalProperty = originalProperty && !isSoldProperty;
  const showSoldProperty = originalProperty && isSoldProperty;
  const showProjectEnquiry = !originalProperty && hasAlternatives; // If no original but alternatives exist (QR mapped to project)

  return (
    <div className="public-qr-page">
      {/* Header */}
      <header className="public-qr-header">
        <div className="header-container">
          <div className="brand-logo-wrap" onClick={goHome} style={{ cursor: 'pointer' }} title={t.backToHome}>
            <DealDeskLogo size="sm" theme="dark" />
          </div>
          <div className="header-controls">
            <div className="lang-currency-selectors">
              <div className="selector-group">
                <FaLanguage className="selector-icon" />
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="lang-select">
                  {languageOptions.map(opt => (
                    <option key={opt.code} value={opt.code}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="selector-group">
                <FaGlobe className="selector-icon" />
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="currency-select">
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
        {/* CASE 1: Normal available property */}
        {showNormalProperty && (
          <div className="public-property-card">
            <div className="property-hero-image-wrap">
              <img
                src={originalProperty?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
                alt={originalProperty?.projectName}
              />
              <div className="image-overlay-badges">
                {/* 🔥 No property code badge */}
                <span className={`badge-status ${originalProperty?.status?.toLowerCase()}`}>
                  {originalProperty?.status || 'Available'}
                </span>
              </div>
            </div>
            <div className="property-content-body">
              <div className="property-header-row">
                <div>
                  <span className="property-type-tag">{originalProperty?.propertyType || 'Apartment'} • {originalProperty?.configuration}</span>
                  <h1 className="property-title">{originalProperty?.projectName}</h1>
                  <p className="property-address">{originalProperty?.address}</p>
                </div>
                <div className="price-box">
                  <span className="price-amount">{getDisplayPrice(originalProperty?.askingPrice, originalProperty?.currency || 'USD')}</span>
                  {originalProperty?.isNegotiable && <span className="negotiable-pill">{t.negotiable}</span>}
                </div>
              </div>
              <div className="specs-matrix-grid">
                <div className="spec-tile">
                  <FaBed className="spec-icon" />
                  <div><span className="val">{originalProperty?.bedrooms} {t.beds}</span><span className="lbl">{t.beds}</span></div>
                </div>
                <div className="spec-tile">
                  <FaBath className="spec-icon" />
                  <div><span className="val">{originalProperty?.bathrooms} {t.baths}</span><span className="lbl">{t.baths}</span></div>
                </div>
                <div className="spec-tile">
                  <FaRulerCombined className="spec-icon" />
                  <div><span className="val">{originalProperty?.sizeSqFt} sq.ft</span><span className="lbl">{t.carpetArea}</span></div>
                </div>
                <div className="spec-tile">
                  <FaCompass className="spec-icon" />
                  <div><span className="val">{originalProperty?.facing || 'East'}</span><span className="lbl">{t.facing}</span></div>
                </div>
                <div className="spec-tile">
                  <FaCouch className="spec-icon" />
                  <div><span className="val">{originalProperty?.furnishing || 'Semi-Furnished'}</span><span className="lbl">{t.furnishing}</span></div>
                </div>
                <div className="spec-tile">
                  <FaClock className="spec-icon" />
                  <div><span className="val">{originalProperty?.floor || 'Mid Floor'}</span><span className="lbl">{t.floorLevel}</span></div>
                </div>
              </div>
              {originalProperty?.description && (
                <div className="description-section">
                  <h3>{t.aboutResidence}</h3>
                  <p>{originalProperty?.description}</p>
                </div>
              )}
              {originalProperty?.amenities && originalProperty.amenities.length > 0 && (
                <div className="amenities-section">
                  <h3>{t.keyFeatures}</h3>
                  <div className="amenities-pills-list">
                    {originalProperty.amenities.map((item, idx) => (
                      <span key={idx} className="amenity-chip">
                        <FaCheckCircle className="check" /> {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Advisor card */}
              <div className="advisor-contact-card">
                <div className="advisor-intro-header">
                  <h3>{t.connectTitle}</h3>
                  <p>{t.connectDesc}</p>
                </div>
                <div className="advisor-profile-row">
                  <div className="advisor-avatar">
                    {advisor?.photoUrl ? <img src={advisor.photoUrl} alt={advisorName} /> : <FaUserTie />}
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
        )}

        {/* CASE 2: Sold property (with or without alternatives) */}
        {showSoldProperty && (
          <>
            {/* 🔥 Sold notice banner placed at the top */}
            <div className="sold-notice-banner">
              <FaExclamationTriangle className="alert-icon" />
              <div>
                <strong>{t.soldNotice}</strong>
                <p>{hasAlternatives ? t.soldNoticeDesc : t.noAlternatives}</p>
              </div>
            </div>

            {/* Sold property card */}
            <div className="public-property-card sold-property-card">
              <div className="property-hero-image-wrap">
                <img
                  src={originalProperty?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
                  alt={originalProperty?.projectName}
                />
                <div className="image-overlay-badges">
                  {/* 🔥 No property code badge, only SOLD status */}
                  <span className="badge-status sold">SOLD</span>
                </div>
              </div>
              <div className="property-content-body">
                <div className="property-header-row">
                  <div>
                    <span className="property-type-tag">{originalProperty?.propertyType || 'Apartment'} • {originalProperty?.configuration}</span>
                    <h1 className="property-title">{originalProperty?.projectName}</h1>
                    <p className="property-address">{originalProperty?.address}</p>
                  </div>
                  <div className="price-box">
                    <span className="price-amount">{getDisplayPrice(originalProperty?.askingPrice, originalProperty?.currency || 'USD')}</span>
                    {originalProperty?.isNegotiable && <span className="negotiable-pill">{t.negotiable}</span>}
                  </div>
                </div>
                <div className="specs-matrix-grid">
                  <div className="spec-tile">
                    <FaBed className="spec-icon" />
                    <div><span className="val">{originalProperty?.bedrooms} {t.beds}</span><span className="lbl">{t.beds}</span></div>
                  </div>
                  <div className="spec-tile">
                    <FaBath className="spec-icon" />
                    <div><span className="val">{originalProperty?.bathrooms} {t.baths}</span><span className="lbl">{t.baths}</span></div>
                  </div>
                  <div className="spec-tile">
                    <FaRulerCombined className="spec-icon" />
                    <div><span className="val">{originalProperty?.sizeSqFt} sq.ft</span><span className="lbl">{t.carpetArea}</span></div>
                  </div>
                  <div className="spec-tile">
                    <FaCompass className="spec-icon" />
                    <div><span className="val">{originalProperty?.facing || 'East'}</span><span className="lbl">{t.facing}</span></div>
                  </div>
                  <div className="spec-tile">
                    <FaCouch className="spec-icon" />
                    <div><span className="val">{originalProperty?.furnishing || 'Semi-Furnished'}</span><span className="lbl">{t.furnishing}</span></div>
                  </div>
                  <div className="spec-tile">
                    <FaClock className="spec-icon" />
                    <div><span className="val">{originalProperty?.floor || 'Mid Floor'}</span><span className="lbl">{t.floorLevel}</span></div>
                  </div>
                </div>
                {originalProperty?.description && (
                  <div className="description-section">
                    <h3>{t.aboutResidence}</h3>
                    <p>{originalProperty?.description}</p>
                  </div>
                )}
                {originalProperty?.amenities && originalProperty.amenities.length > 0 && (
                  <div className="amenities-section">
                    <h3>{t.keyFeatures}</h3>
                    <div className="amenities-pills-list">
                      {originalProperty.amenities.map((item, idx) => (
                        <span key={idx} className="amenity-chip">
                          <FaCheckCircle className="check" /> {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Alternatives List (if any) */}
            {hasAlternatives && (
              <div className="alternatives-section">
                <h4 className="alternatives-title">{t.viewAlternatives}</h4>
                <div className="alternatives-list">
                  {fallbackList.map((alt) => {
                    const isSelected = alt._id === selectedPropertyId;
                    return (
                      <div
                        key={alt._id}
                        className={`alternative-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handlePropertySelect(alt)}
                      >
                        <div className="alt-image">
                          <img src={alt.photos?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80'} alt={alt.projectName} />
                        </div>
                        <div className="alt-details">
                          <div className="alt-header">
                            <span className="alt-name">{alt.projectName}</span>
                            <span className="alt-status available">AVAILABLE</span>
                          </div>
                          <p className="alt-address">{alt.address}</p>
                          <div className="alt-specs">
                            <span>{alt.bedrooms} {t.beds}</span>
                            <span>•</span>
                            <span>{alt.bathrooms} {t.baths}</span>
                            <span>•</span>
                            <span>{alt.sizeSqFt} sq.ft</span>
                          </div>
                          <div className="alt-price">
                            <span className="price-amount">{getDisplayPrice(alt.askingPrice, alt.currency || 'USD')}</span>
                          </div>
                        </div>
                        <div className="alt-select-indicator">
                          {isSelected ? (
                            <FaCheckCircle className="selected-icon" />
                          ) : (
                            <FaCircle className="unselected-icon" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Advisor card (always shown for sold property) */}
            <div className="advisor-contact-card">
              <div className="advisor-intro-header">
                <h3>{t.connectTitle}</h3>
                <p>{t.connectDesc}</p>
              </div>
              <div className="advisor-profile-row">
                <div className="advisor-avatar">
                  {advisor?.photoUrl ? <img src={advisor.photoUrl} alt={advisorName} /> : <FaUserTie />}
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
          </>
        )}

        {/* CASE 3: Project Enquiry (no original property, but alternatives exist - QR mapped to project) */}
        {showProjectEnquiry && (
          <div className="project-enquiry-card">
            <div className="public-property-card">
              <div className="project-enquiry-header">
                <FaBuilding className="project-icon" />
                <h2>{data?.projectName || 'Luxury Residences'}</h2>
                <p>{data?.projectDescription || 'Exclusive residences in a premium location. Contact us for more details.'}</p>
              </div>
              <div className="advisor-contact-card">
                <div className="advisor-intro-header">
                  <h3>{t.connectTitle}</h3>
                  <p>{t.connectDesc}</p>
                </div>
                <div className="advisor-profile-row">
                  <div className="advisor-avatar">
                    {advisor?.photoUrl ? <img src={advisor.photoUrl} alt={advisorName} /> : <FaUserTie />}
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
                <button
                  className="btn-primary-interest box-style-btn"
                  onClick={() => {
                    setSelectedPropertyId(null);
                    setSelectedProperty(null);
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
        )}
      </main>

      {/* Enquiry Modal */}
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
                    .replace('{property}', selectedProperty?.projectName || projectName)
                    .replace('{advisor}', advisorName)}
                </p>

                <div className="advisor-followup-box">
                  <p>{t.advisorFollowup.replace('{phone}', formData.phone)}</p>
                </div>

                <div className="modal-success-actions">
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${advisorName}, I just enquired about ${selectedProperty?.projectName || projectName} via Smart QR ${qrId}. My name is ${formData.name}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-whatsapp-chat"
                  >
                    <FaWhatsapp /> {t.continueWhatsApp}
                  </a>
                  <button className="btn-finish" onClick={resetForm}>
                    {t.close}
                  </button>
                  <button className="btn-finish btn-submit-another" onClick={resetForm}>
                    Submit Another Enquiry
                  </button>
                  <button className="btn-finish" onClick={goHome}>
                    {t.exploreDealDesk}
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

                {/* Show property selection only if alternatives exist */}
                {hasAlternatives && (
                  <div className="form-field">
                    <label><FaBuilding className="form-icon" /> {t.interestedProperty}</label>
                    <select
                      value={selectedPropertyId || ''}
                      onChange={(e) => {
                        const prop = fallbackList.find(p => p._id === e.target.value);
                        if (prop) handlePropertySelect(prop);
                      }}
                    >
                      <option value="">{t.selectProperty}</option>
                      {fallbackList.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.projectName} - {getDisplayPrice(p.askingPrice, p.currency || 'USD')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-field">
                  <label><FaMoneyBillWave className="form-icon" /> {t.budget}</label>
                  <select
                    value={formData.budget}
                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                  >
                    <option value="">Select budget range</option>
                    {getBudgetOptions().map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
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
