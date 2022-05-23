db.User.updateMany({ role: { $nin: ['SuperAdmin', 'Admin', 'User'] } }, { $set: { role: 'User' } });
