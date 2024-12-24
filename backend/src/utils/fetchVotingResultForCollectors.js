const CollectorModel = require('../models/collectorModel');
const VoteModel = require('../models/voteModel');

const fetchVotingResultsForCollectors = async (collectorIds) => {
    const collectors = await CollectorModel.find({ _id: { $in: collectorIds } });
  
    if (!collectors.length) {
      throw new Error('No collectors found.');
    }
  
    const results = await Promise.all(
      collectors.map(async (collector) => {
        const votes = await VoteModel.aggregate([
          { $match: { collectorId: collector._id } },
          {
            $group: {
              _id: '$voteType',
              count: { $sum: 1 },
            },
          },
        ]);
  
        const voteSummary = votes.reduce((acc, vote) => {
          acc[vote._id] = vote.count;
          return acc;
        }, {});
  
        return {
          collectorId: collector._id,
          collectorName: collector.collectorName,
          totalVotes: votes.reduce((sum, vote) => sum + vote.count, 0),
          voteSummary, 
        };
      })
    );
  
    return results;
  };


module.exports = {fetchVotingResultsForCollectors};