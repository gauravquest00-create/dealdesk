import Business from '../models/Business.js';

export const getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.businessId);
    res.json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
};

export const updateBusiness = async (req, res, next) => {
  try {
    const allowed = ['name', 'businessType', 'country', 'city', 'currency', 'timezone', 'language', 'locale', 'dateFormat', 'timeFormat', 'logoUrl', 'phone', 'website', 'address', 'state', 'postalCode', 'settings'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const updated = await Business.findByIdAndUpdate(req.businessId, update, { new: true });
    res.json({ success: true, message: 'Business settings updated', data: updated });
  } catch (err) {
    next(err);
  }
};
