import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { ENV } from '../config/env.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import CommunicationTemplate from '../models/CommunicationTemplate.js';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import SmartQR from '../models/SmartQR.js';
import Deal from '../models/Deal.js';
import { hashPassword } from './hash.js';
import { ROLES, AGENT_SUB_ROLES } from '../constants/roles.js';
import { ACCOUNT_STATUS, ENTITLEMENT_STATUS, PROPERTY_STATUS, LEAD_STATUS, LEAD_TEMPERATURE, LEAD_SOURCE, DEAL_STAGE } from '../constants/statuses.js';

const seed = async () => {
  console.log('[DealDesk Seed] Starting initialization...');
  await connectDB();

  // 1. Seed Super Admin
  const superAdminEmail = (ENV.ADMIN_EMAIL || 'admin@dealdesk.com').toLowerCase();
  let superAdmin = await User.findOne({ email: superAdminEmail, role: ROLES.SUPERADMIN });

  if (!superAdmin) {
    const pwHash = await hashPassword(ENV.ADMIN_PASSWORD || 'dealdesk@2026!Secure');
    superAdmin = await User.create({
      name: 'DealDesk SuperAdmin',
      email: superAdminEmail,
      username: 'superadmin.dealdesk',
      passwordHash: pwHash,
      role: ROLES.SUPERADMIN,
      isActive: true,
      isEmailVerified: true,
    });
    console.log(`[DealDesk Seed] Created SuperAdmin account: ${superAdminEmail}`);
  } else {
    console.log(`[DealDesk Seed] SuperAdmin account exists: ${superAdminEmail}`);
  }

  // 2. Default System Communication Templates
  const templateCount = await CommunicationTemplate.countDocuments({ isSystemDefault: true });
  if (templateCount === 0) {
    await CommunicationTemplate.insertMany([
      {
        title: 'Property Introduction',
        channel: 'WhatsApp',
        isSystemDefault: true,
        body: `Hi {{client_name}}! This is {{agent_name}} from {{company_name}}. I came across an exceptional property that matches your criteria: {{property_name}} in {{location}}. Configuration: {{configuration}}. View details here: {{property_link}}. Would you like to view it this week?`,
      },
      {
        title: 'Viewing Confirmation',
        channel: 'WhatsApp',
        isSystemDefault: true,
        body: `Dear {{client_name}}, your viewing for {{property_name}} is confirmed. I will meet you at the site. If you need directions or have any questions, feel free to call me at {{agent_phone}}. See you soon!`,
      },
      {
        title: 'After Viewing Follow-up',
        channel: 'WhatsApp',
        isSystemDefault: true,
        body: `Hello {{client_name}}, thank you for taking the time to tour {{property_name}} today. How did you like the layout and amenities? I would love to hear your feedback or explore options if you have questions.`,
      },
      {
        title: 'Viewing Reminder',
        channel: 'Email',
        subject: 'Reminder: Viewing appointment for {{property_name}}',
        isSystemDefault: true,
        body: `Hi {{client_name}},

This is a quick reminder about our scheduled property viewing for {{property_name}}.

Project: {{project_name}}
Configuration: {{configuration}}
Location: {{location}}

Please reply or call {{agent_phone}} if you need to reschedule.

Best regards,
{{agent_name}}
{{company_name}}`,
      },
      {
        title: 'Property Sold / Alternative Recommendation',
        channel: 'WhatsApp',
        isSystemDefault: true,
        body: `Hi {{client_name}}, please note that {{property_name}} was just reserved/sold. However, I have identified a prime matching alternative in the exact same project: {{project_name}} ({{configuration}}). Check it out here: {{property_link}}. Let me know if you would like priority viewing!`,
      },
    ]);
    console.log('[DealDesk Seed] Seeded 5 system communication templates.');
  }

  // 3. Demo Workspace for initial walkthrough
  const demoEmail = 'demo@gurgaonprimerealty.com';
  let demoBiz = await Business.findOne({ email: demoEmail });
  if (!demoBiz) {
    const trialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    demoBiz = await Business.create({
      name: 'Gurgaon Prime Realty',
      slug: 'gurgaon-prime-realty',
      businessType: 'Boutique Real Estate Consultancy',
      country: 'India',
      city: 'Gurugram',
      currency: 'USD',
      timezone: 'Asia/Kolkata',
      email: demoEmail,
      phone: '+91 98765 43210',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      entitlementStatus: ENTITLEMENT_STATUS.TRIAL_ACTIVE,
      planId: 'professional',
      trialEndsAt: trialEnd,
      address: 'Golf Course Road, Sector 54, Gurugram, Haryana',
    });

    const demoAdminPw = await hashPassword('Admin@123456');
    const demoAdmin = await User.create({
      businessId: demoBiz._id,
      name: 'Gaurav Verma',
      email: demoEmail,
      username: 'gaurav.gurgaonprimerealty',
      passwordHash: demoAdminPw,
      role: ROLES.ADMIN,
      isActive: true,
      isEmailVerified: true,
    });

    const agentPw = await hashPassword('Agent@123456');
    const demoAgent = await User.create({
      businessId: demoBiz._id,
      name: 'Rahul Sharma',
      email: 'rahul@gurgaonprimerealty.com',
      username: 'rahulsharma.gurgaonprimerealty@dealdesk.com',
      passwordHash: agentPw,
      role: ROLES.AGENT,
      subRole: AGENT_SUB_ROLES.HYBRID_AGENT,
      department: 'Luxury Residential',
      isActive: true,
      mustChangePassword: false,
    });

    // Sample Properties
    const prop1 = await Property.create({
      businessId: demoBiz._id,
      propertyCode: 'DD-PR-101',
      projectName: 'The Camellias Luxury Tower',
      propertyType: 'Apartment',
      configuration: '4 BHK',
      bedrooms: 4,
      bathrooms: 5,
      sizeSqFt: 4800,
      floor: '18th Floor',
      askingPrice: 850000,
      address: 'DLF Phase 5, Golf Course Road, Gurugram',
      status: PROPERTY_STATUS.AVAILABLE,
      assignedAgentId: demoAgent._id,
      createdBy: demoAdmin._id,
      photos: [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', isCover: true }],
    });

    const prop2 = await Property.create({
      businessId: demoBiz._id,
      propertyCode: 'DD-PR-102',
      projectName: 'Ireo Grand Arch',
      propertyType: 'Apartment',
      configuration: '3 BHK',
      bedrooms: 3,
      bathrooms: 3,
      sizeSqFt: 2400,
      floor: '12th Floor',
      askingPrice: 380000,
      address: 'Sector 58, Golf Course Extension Road, Gurugram',
      status: PROPERTY_STATUS.AVAILABLE,
      assignedAgentId: demoAdmin._id,
      createdBy: demoAdmin._id,
      photos: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', isCover: true }],
    });

    // Sample Smart QR
    await SmartQR.create({
      businessId: demoBiz._id,
      qrId: '8F72K',
      label: 'The Camellias Entrance Board QR',
      currentPropertyId: prop1._id,
      status: 'Active',
      scanCount: 142,
      viewCount: 98,
      interestedCount: 34,
      leadCount: 12,
      createdBy: demoAdmin._id,
    });

    // Sample Leads
    const lead1 = await Lead.create({
      businessId: demoBiz._id,
      name: 'Amitabh Malhotra',
      email: 'amitabh.m@gmail.com',
      phone: '+91 99112 34567',
      source: LEAD_SOURCE.SMART_QR,
      status: LEAD_STATUS.QUALIFIED,
      temperature: LEAD_TEMPERATURE.HOT,
      score: 85,
      interestedPropertyId: prop1._id,
      assignedAgentId: demoAgent._id,
      requirements: {
        budgetMin: 700000,
        budgetMax: 950000,
        preferredLocations: ['Golf Course Road', 'DLF Phase 5'],
        propertyTypes: ['Apartment', 'Penthouse'],
        preferredConfigurations: ['4 BHK', '5+ BHK'],
        minSizeSqFt: 4000,
      },
      nextFollowUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      nextAction: 'Confirm negotiation terms with seller',
    });

    // Sample Deal
    await Deal.create({
      businessId: demoBiz._id,
      leadId: lead1._id,
      propertyId: prop1._id,
      agentId: demoAgent._id,
      dealValue: 840000,
      stage: DEAL_STAGE.OFFER_NEGOTIATION,
      commissionPercent: 2.0,
      commissionValue: 16800,
      expectedClosingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: 'Buyer made formal LOI at $840k. Awaiting seller board sign-off.',
      createdBy: demoAdmin._id,
    });

    console.log('[DealDesk Seed] Sample demo workspace "Gurgaon Prime Realty" seeded successfully.');
  }

  console.log('[DealDesk Seed] Completed successfully.');
  process.exit(0);
};

seed().catch(err => {
  console.error('[DealDesk Seed Error]', err);
  process.exit(1);
});
