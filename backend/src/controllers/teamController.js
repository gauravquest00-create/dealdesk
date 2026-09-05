import User from '../models/User.js';
import Business from '../models/Business.js';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import Viewing from '../models/Viewing.js';
import Deal from '../models/Deal.js';
import { hashPassword, generateRandomString } from '../utils/hash.js';
import { ROLES } from '../constants/roles.js';

export const listTeam = async (req, res, next) => {
  try {
    const users = await User.find({ businessId: req.businessId, role: { $ne: ROLES.SUPERADMIN } }).sort({ createdAt: -1 }).lean();

    const teamWithCounts = await Promise.all(users.map(async (u) => {
      const [leadsCount, propertiesCount, viewingsCount, dealsCount] = await Promise.all([
        Lead.countDocuments({ businessId: req.businessId, assignedAgentId: u._id }),
        Property.countDocuments({ businessId: req.businessId, assignedAgentId: u._id }),
        Viewing.countDocuments({ businessId: req.businessId, agentId: u._id }),
        Deal.countDocuments({ businessId: req.businessId, agentId: u._id }),
      ]);
      return {
        ...u,
        assignedCounts: {
          leads: leadsCount,
          properties: propertiesCount,
          viewings: viewingsCount,
          deals: dealsCount,
        }
      };
    }));

    res.json({ success: true, data: teamWithCounts });
  } catch (err) {
    next(err);
  }
};

export const addAgent = async (req, res, next) => {
  try {
    const { name, email, phone, role = ROLES.AGENT, subRole, department = 'Sales' } = req.body;
    const business = await Business.findById(req.businessId);

    const emailPrefix = email.split('@')[0].replace(/[^a-z0-9]/g, '');
    const cleanBiz = business.slug.replace(/[^a-z0-9]/g, '').slice(0, 12);
    const username = `${emailPrefix}.${cleanBiz}@dealdesk.com`;
    const tempPassword = `Pass@${generateRandomString(6)}!`;

    const passwordHash = await hashPassword(tempPassword);

    const agent = await User.create({
      businessId: req.businessId,
      name,
      email,
      username,
      passwordHash,
      phone,
      role,
      subRole,
      department,
      mustChangePassword: true,
      isActive: true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: {
        agent,
        credentials: {
          username,
          temporaryPassword: tempPassword,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateAgentStatus = async (req, res, next) => {
  try {
    const { isActive, permissions, role, subRole } = req.body;
    const agent = await User.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    if (isActive !== undefined) agent.isActive = isActive;
    if (permissions) agent.permissions = permissions;
    if (role) agent.role = role;
    if (subRole) agent.subRole = subRole;

    await agent.save();
    res.json({ success: true, message: 'Agent updated', data: agent });
  } catch (err) {
    next(err);
  }
};

// ✅ New: Toggle agent active status (for frontend toggle button)
export const toggleAgentStatus = async (req, res, next) => {
  try {
    const agent = await User.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    // Toggle status
    agent.isActive = !agent.isActive;
    await agent.save();

    res.json({
      success: true,
      message: `Agent ${agent.isActive ? 'activated' : 'deactivated'} successfully`,
      data: agent
    });
  } catch (err) {
    next(err);
  }
};