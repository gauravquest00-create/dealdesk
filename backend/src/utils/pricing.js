// pricing.js — used for seeding and conversion

export const PLANS = [
  {
    planId: 'starter',
    name: 'Starter',
    monthlyPriceUSD: 25,
    annualPriceUSD: 250,
    popular: true,
    desc: 'Perfect for solo agents and small teams. 3 agent seats, basic lead capture.',
    features: [
      '3 Agent Seats',
      '100 Properties',
      '500 Leads / Month',
      '50 Smart QR Codes',
      '10 Social Links',
      '5 Open Houses / Month',
      '100 Documents',
      '50 Viewings / Month',
      '1:1 WhatsApp & Email Outreach',
      '7-Factor Smart Match',
      'Deals Pipeline',
      'Team Management',
      'Theme & Localization',
    ],
    limits: {
      agents: 3,
      properties: 100,
      leadsPerMonth: 500,
      qrs: 50,
      socialLinks: 10,
      openHousesPerMonth: 5,
      documents: 100,
      viewingsPerMonth: 50,
      bulkWhatsApp: false,
      emailCampaigns: false,
      customBranding: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  {
    planId: 'professional',
    name: 'Professional',
    monthlyPriceUSD: 59,
    annualPriceUSD: 590,
    popular: true,
    desc: 'For growing brokerages with active deals. 10 agent seats, unlimited everything.',
    features: [
      '10 Agent Seats',
      'Unlimited Properties',
      'Unlimited Leads',
      'Unlimited Smart QR Codes',
      'Unlimited Social Links',
      'Unlimited Open Houses',
      'Unlimited Documents',
      'Unlimited Viewings',
      'Bulk WhatsApp Broadcast',
      'Email Campaigns',
      'Onboarding Call',
      'All Starter Features',
    ],
    limits: {
      agents: 10,
      properties: -1,
      leadsPerMonth: -1,
      qrs: -1,
      socialLinks: -1,
      openHousesPerMonth: -1,
      documents: -1,
      viewingsPerMonth: -1,
      bulkWhatsApp: true,
      emailCampaigns: true,
      customBranding: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  {
    planId: 'business',
    name: 'Business',
    monthlyPriceUSD: 129,
    annualPriceUSD: 1290,
    popular: false,
    desc: 'For large agencies needing full control. Unlimited agents, premium features.',
    features: [
      'Unlimited Agents',
      'Unlimited Everything',
      'Custom Branding (Logo + Domain)',
      'Priority WhatsApp Support',
      'Full API Access',
      'Dedicated Account Manager',
      'All Professional Features',
    ],
    limits: {
      agents: -1,
      properties: -1,
      leadsPerMonth: -1,
      qrs: -1,
      socialLinks: -1,
      openHousesPerMonth: -1,
      documents: -1,
      viewingsPerMonth: -1,
      bulkWhatsApp: true,
      emailCampaigns: true,
      customBranding: true,
      prioritySupport: true,
      apiAccess: true,
    },
  },
];

// Currency conversion rates (USD → others)
export const CURRENCY_RATES = {
  USD: 1,
  INR: 83,
  AED: 3.67,
  GBP: 0.78,
  EUR: 0.92,
  CAD: 1.35,
  AUD: 1.49,
};

export const calculatePrice = (planId, billingCycle, currency) => {
  const plan = PLANS.find(p => p.planId === planId);
  if (!plan) throw new Error('Invalid plan');
  const usdPrice = billingCycle === 'annual' ? plan.annualPriceUSD : plan.monthlyPriceUSD;
  const rate = CURRENCY_RATES[currency] || 1;
  return {
    amount: Math.round(usdPrice * rate),
    currency,
    planName: plan.name,
  };
};

export const calculateConverted = (usdAmount, currency) => {
  const rate = CURRENCY_RATES[currency] || 1.0;
  return Math.round(usdAmount * rate);
};