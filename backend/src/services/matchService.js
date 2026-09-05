import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import Match from '../models/Match.js';
import { SMART_MATCH_WEIGHTS } from '../constants/weights.js';
import { PROPERTY_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

export const calculateMatchScore = (lead, property) => {
  let budgetScore = 50;
  let locationScore = 50;
  let configScore = 50;
  let typeScore = 50;
  let sizeScore = 50;
  let transactionScore = 50;
  let otherScore = 50;
  const whyMatched = [];

  const req = lead.requirements || {};

  // 1. Budget (30%)
  if (req.budgetMin && req.budgetMax) {
    if (property.askingPrice >= req.budgetMin && property.askingPrice <= req.budgetMax) {
      budgetScore = 100;
      whyMatched.push(`Price ($${property.askingPrice.toLocaleString()}) falls squarely within client budget ($${req.budgetMin.toLocaleString()} - $${req.budgetMax.toLocaleString()})`);
    } else if (property.askingPrice <= req.budgetMax * 1.15 && property.askingPrice >= req.budgetMin * 0.85) {
      budgetScore = 75;
      whyMatched.push(`Price is within 15% margin of client target budget`);
    } else {
      budgetScore = 20;
    }
  } else if (req.budgetMax) {
    budgetScore = property.askingPrice <= req.budgetMax ? 100 : 30;
    if (budgetScore === 100) whyMatched.push(`Within maximum budget cap of $${req.budgetMax.toLocaleString()}`);
  }

  // 2. Location (25%)
  if (req.preferredLocations && req.preferredLocations.length > 0) {
    const matchedLoc = req.preferredLocations.some(loc => 
      property.address.toLowerCase().includes(loc.toLowerCase()) || 
      property.projectName.toLowerCase().includes(loc.toLowerCase())
    );
    if (matchedLoc) {
      locationScore = 100;
      whyMatched.push(`Project located in preferred sector/neighborhood: ${property.projectName}`);
    } else {
      locationScore = 30;
    }
  }

  // 3. Configuration (20%)
  if (req.preferredConfigurations && req.preferredConfigurations.length > 0) {
    if (req.preferredConfigurations.includes(property.configuration)) {
      configScore = 100;
      whyMatched.push(`Matches requested layout: ${property.configuration}`);
    } else {
      configScore = 25;
    }
  }

  // 4. Property Type (10%)
  if (req.propertyTypes && req.propertyTypes.length > 0) {
    if (req.propertyTypes.includes(property.propertyType)) {
      typeScore = 100;
      whyMatched.push(`Requested property style: ${property.propertyType}`);
    } else {
      typeScore = 40;
    }
  }

  // 5. Size (5%)
  if (req.minSizeSqFt && req.minSizeSqFt > 0) {
    sizeScore = property.sizeSqFt >= req.minSizeSqFt ? 100 : 40;
    if (sizeScore === 100) whyMatched.push(`Carpet area ${property.sizeSqFt} sq.ft meets minimum size requirement`);
  }

  // 6. Transaction Type (5%)
  if (req.transactionType) {
    transactionScore = req.transactionType.toLowerCase() === property.transactionType.toLowerCase() ? 100 : 30;
  }

  // Total weighted score
  const totalScore = Math.round(
    budgetScore * SMART_MATCH_WEIGHTS.BUDGET +
    locationScore * SMART_MATCH_WEIGHTS.LOCATION +
    configScore * SMART_MATCH_WEIGHTS.CONFIGURATION +
    typeScore * SMART_MATCH_WEIGHTS.PROPERTY_TYPE +
    sizeScore * SMART_WEIGHTS_SIZE(sizeScore) +
    transactionScore * SMART_MATCH_WEIGHTS.TRANSACTION +
    otherScore * SMART_MATCH_WEIGHTS.OTHER
  );

  return {
    matchScore: Math.min(100, Math.max(0, totalScore)),
    scoreBreakdown: {
      budgetScore,
      locationScore,
      configScore,
      propertyTypeScore: typeScore,
      sizeScore,
      transactionScore,
      otherScore,
    },
    whyMatched,
    recommendedAction: totalScore >= 75 ? 'Schedule Viewing' : 'Suggest Property via WhatsApp',
  };
};

function SMART_WEIGHTS_SIZE(score) {
  return 0.05;
}

/**
 * Sanitizes property data if viewing agent is NOT assigned to it
 */
export const sanitizePropertyForAgentPreview = (property, requestingUser) => {
  if (requestingUser.role === ROLES.ADMIN || requestingUser.role === ROLES.SUPERADMIN) {
    return property;
  }
  const isAssigned = property.assignedAgentId && String(property.assignedAgentId) === String(requestingUser._id);
  if (isAssigned) {
    return property;
  }

  // Limited Preview for unassigned agents
  return {
    _id: property._id,
    propertyCode: property.propertyCode,
    projectName: property.projectName,
    propertyType: property.propertyType,
    configuration: property.configuration,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sizeSqFt: property.sizeSqFt,
    floor: property.floor,
    askingPrice: property.askingPrice,
    currency: property.currency,
    address: property.address.split(',')[0], // general area only
    status: property.status,
    photos: property.photos ? property.photos.filter(p => p.isCover) : [],
    isLimitedPreview: true,
  };
};

/**
 * Sanitizes lead data if viewing agent is NOT assigned to it
 */
export const sanitizeLeadForAgentPreview = (lead, requestingUser) => {
  if (requestingUser.role === ROLES.ADMIN || requestingUser.role === ROLES.SUPERADMIN) {
    return lead;
  }
  const isAssigned = lead.assignedAgentId && String(lead.assignedAgentId._id || lead.assignedAgentId) === String(requestingUser._id);
  if (isAssigned) {
    return lead;
  }

  return {
    _id: lead._id,
    name: lead.name,
    temperature: lead.temperature,
    score: lead.score,
    status: lead.status,
    requirements: lead.requirements,
    phone: lead.phone ? `${lead.phone.slice(0, 4)}***${lead.phone.slice(-3)}` : 'Confidential',
    email: lead.email ? `${lead.email.slice(0, 3)}***@***` : 'Confidential',
    isLimitedPreview: true,
  };
};
