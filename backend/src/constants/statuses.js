export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DEACTIVATED: 'DEACTIVATED',
};

export const ENTITLEMENT_STATUS = {
  TRIAL_ACTIVE: 'TRIAL_ACTIVE',
  ACTIVE_SUBSCRIPTION: 'ACTIVE_SUBSCRIPTION',
  PAST_DUE: 'PAST_DUE',
  EXPIRED: 'EXPIRED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
};

export const TRIAL_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CONVERTED: 'CONVERTED',
};

export const PROPERTY_STATUS = {
  AVAILABLE: 'Available',
  UNDER_OFFER: 'Under Offer',
  SOLD: 'Sold',
  RENTED: 'Rented',
  UNAVAILABLE: 'Unavailable',
};

export const LEAD_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  VIEWING_SCHEDULED: 'Viewing Scheduled',
  VIEWING_COMPLETED: 'Viewing Completed',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
};

export const LEAD_TEMPERATURE = {
  COLD: 'Cold',
  WARM: 'Warm',
  HOT: 'Hot',
};

export const LEAD_SOURCE = {
  SMART_QR: 'Smart QR',        // ✅ Already there
  SMART_QR_ALT: 'SMART_QR',    // ✅ ADD THIS — so both work
  OPEN_HOUSE: 'Open House',
  WEBSITE: 'Website',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  WHATSAPP: 'WhatsApp',
  PHONE: 'Phone',
  MANUAL: 'Manual',
  REFERRAL: 'Referral',
  SOCIAL_LINK: 'SOCIAL_LINK',
};

export const VIEWING_STATUS = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

export const DEAL_STAGE = {
  NEW: 'New',
  QUALIFIED: 'Qualified',
  VIEWING: 'Viewing',
  OFFER_NEGOTIATION: 'Offer/Negotiation',
  WON: 'Won',
  LOST: 'Lost',
};

export const COMMUNICATION_CHANNELS = {
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
};

export const QR_EVENT_TYPES = {
  QR_SCANNED: 'QR_SCANNED',
  PROPERTY_VIEWED: 'PROPERTY_VIEWED',
  INTERESTED_CLICKED: 'INTERESTED_CLICKED',
  ENQUIRY_STARTED: 'ENQUIRY_STARTED',
  ENQUIRY_SUBMITTED: 'ENQUIRY_SUBMITTED',
};
