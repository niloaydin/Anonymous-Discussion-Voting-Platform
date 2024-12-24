const mongoose = require('mongoose');

const emailCollectorVoteSchema = new mongoose.Schema({
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collector',
    required: true,
  },
  userLinkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserLink',
    required: true,
  }
});

const EmailCollectorVote = mongoose.model(
  'EmailCollectorVote',
  emailCollectorVoteSchema
);
module.exports = EmailCollectorVote;
