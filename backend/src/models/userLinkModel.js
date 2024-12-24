const mongoose = require('mongoose');

const userLinkSchema = new mongoose.Schema({
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collector',
    required: true,
  },
  discussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true,
  },
  linkUUID: { type: String, required: true },
  email: { type: String, sparse: true },
});

userLinkSchema.index({ discussionId: 1, email: 1 },{ unique: true, partialFilterExpression: { email: { $exists: true } } });

const UserLink = mongoose.model('UserLink', userLinkSchema);
module.exports = UserLink;
