const mongoose = require('mongoose');

const collectorSchema = new mongoose.Schema({
  discussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true,
  },
  collectorName: { type: String, required: true },
  listLinks: [{ type: String }],
  collectorType: {
    type: String,
    enum: ['specific', 'general'], 
    required: true, 
  },
});

collectorSchema.index({ discussionId: 1, collectorName: 1 }, { unique: true });

const Collector = mongoose.model('Collector', collectorSchema);
module.exports = Collector;
