const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  adminLink: { type: String, unique: true },
  dLink: { type: String, required: true, unique: true },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true,
  },
  isVotingStarted: { type: Boolean, default: false },
  isVotingEnded: { type: Boolean, default: false },
  isEmailSent:{type:Boolean,default:false},
  selectedCollectorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collector' }],
});

const Discussion = mongoose.model('Discussion', discussionSchema);
module.exports = Discussion;
