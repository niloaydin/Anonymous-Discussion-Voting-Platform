const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
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
  voteType: {
    type: String,
    enum: ['yes', 'no', 'abstention'],
    required: true,
  }
});

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;
