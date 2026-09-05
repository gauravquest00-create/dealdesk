import Notification from '../models/Notification.js';

export const listNotifications = async (req, res, next) => {
  try {
    let notifications = await Notification.find({
      businessId: req.businessId,
    }).sort({ createdAt: -1 }).limit(30).lean();

    // Auto-seed initial welcome notification if empty
    if (!notifications || notifications.length === 0) {
      await Notification.create({
        businessId: req.businessId,
        userId: req.user._id,
        title: 'Workspace Active & Ready',
        message: 'Your DealDesk workspace deal room is fully configured and ready for listings.',
        type: 'INFO',
        link: '/app',
        isRead: false,
      });

      notifications = await Notification.find({
        businessId: req.businessId,
      }).sort({ createdAt: -1 }).lean();
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      }
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, businessId: req.businessId },
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { businessId: req.businessId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
