const CreatorModel = require('../models/creatorModel');
const DiscussionModel = require('../models/discussionModel');
const UserLinkModel = require('../models/userLinkModel');
const CollectorModel = require('../models/collectorModel');
const CommentModel = require('../models/commentModel');
const VoteModel = require('../models/voteModel');
const { generateRandomString } = require('../utils/discussionUtils');
const { fetchVotingResultsForCollectors } = require('../utils/fetchVotingResultForCollectors');

const createDiscussion = async (req, res) => {

  const { email, title, description, duration } = req.body;
  try {

    let creator = await CreatorModel.findOne({ email: email });

    if (!creator) {
      creator = await CreatorModel.create({
        email: email
      })
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 1 * 60 * 1000);

    const dLink = generateRandomString();
    const adminLink = generateRandomString();

    console.log("dLink", dLink);
    console.log("adminLink", adminLink);

    const discussion = await DiscussionModel.create({
      title: title,
      description: description,
      startDate: startDate,
      endDate: endDate,
      dLink: dLink,
      adminLink: adminLink,
      creatorId: creator._id,
      isVotingStarted: false
    })

    return res.status(200).json({ message: discussion });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getSingleDiscussion = async (req, res) => {
  const { discussionLink, userLink } = req.params;
  try {


    const discussion = await DiscussionModel.findOne({ dLink: discussionLink });
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const userLinkData = await UserLinkModel.findOne({ linkUUID: userLink, discussionId: discussion._id });

    if (!userLinkData && userLink !== discussion.adminLink) {
      return res.status(404).json({ error: 'You cannot review this discussion!' });
    }

    const comments = await CommentModel.find({ discussionId: discussion._id });
    const prosComments = comments.filter((comment) => comment.commentType === 'pros').map((comment) => comment.content);
    const consComments = comments.filter((comment) => comment.commentType === 'cons').map((comment) => comment.content);


    const discussionData = {
      title: discussion.title,
      description: discussion.description,
      startDate: discussion.startDate,
      endDate: discussion.endDate,
      isVotingStarted: discussion.isVotingStarted,
      isVotingEnded: discussion.isVotingEnded,
      isEmailSent: discussion.isEmailSent,
      prosComments: prosComments,
      consComments: consComments
    }

    return res.status(200).json({ message: discussionData });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  };
}

const createCollectorForDiscussion = async (req, res) => {
  const { discussionLink, adminLink } = req.params;
  const { collectorName, emails, type } = req.body;

  try {

    if (!['general', 'specific'].includes(type)) {
      return res.status(400).json({ error: 'Invalid collector type' });
    }
    if (type === 'specific' && (!Array.isArray(emails) || emails.length === 0)) {
      return res.status(400).json({ error: 'Emails must be provided as a non-empty array for specific collector type' });
    }
    const discussion = await DiscussionModel.findOne({ dLink: discussionLink });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    if (adminLink !== discussion.adminLink) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const existingCollector = await CollectorModel.findOne({
      discussionId: discussion._id,
      collectorName: collectorName,
    });
    if (existingCollector) {
      return res.status(400).json({ error: `Collector with name "${collectorName}" already exists for this discussion.` });
    }

    let listLinks = [];
    const userLinks = [];

    if (type === 'general') {
      const generalLink = generateRandomString();
      listLinks.push(generalLink);

      userLinks.push({
        discussionId: discussion._id,
        linkUUID: generalLink,
      });

    } else if (type === 'specific' && emails && emails.length > 0) {

      for (const email of emails) {
        const personalizedLink = generateRandomString();

        listLinks.push(personalizedLink);
        userLinks.push({
          discussionId: discussion._id,
          email: email,
          linkUUID: personalizedLink,
        });

      }
    }

    const collector = await CollectorModel.create({
      discussionId: discussion._id,
      collectorName: collectorName,
      collectorType: type,
      listLinks: listLinks
    })

    userLinks.forEach((link) => {
      link.collectorId = collector._id;
    });
    await UserLinkModel.insertMany(userLinks);

    return res.status(200).json({ message: collector });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `Duplicate email detected for discussion: ${emails}` });
    }
    return res.status(400).json({ message: error.message });
  }
};


const getVotingResultsForCollectors = async (req, res) => {
  try {
    const { discussionLink, adminLink } = req.params;
    const { collectorIds } = req.query;

    const discussion = await DiscussionModel.findOne({ dLink: discussionLink });
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found.' });
    }


    if (adminLink !== discussion.adminLink) {
      return res.status(403).json({ error: 'Unauthorized access.' });
    }


    const collectorQuery = { discussionId: discussion._id };
    if (collectorIds) {
      const collectorIdArray = collectorIds.split(" ")
      collectorQuery._id = { $in: collectorIdArray };
    }

    const collectors = await CollectorModel.find(collectorQuery);
    if (!collectors.length) {
      return res.status(404).json({ error: 'No collectors found.' });
    }
    const collectorIdsToFetch = collectors.map((collector) => collector._id);

    const results = await fetchVotingResultsForCollectors(collectorIdsToFetch);

    res.status(200).json({ message: results })
  } catch (error) {
    console.error('Error fetching voting results:', error);
    res.status(500).json({ error: error.message });
  }
};


const getCollectorInfo = async (req, res) => {
  const { discussionLink, adminLink } = req.params;

  try {
    const discussion = await DiscussionModel.findOne({ dLink: discussionLink });
    console.log("discussion", discussion._id);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    console.log("adminLink", adminLink);
    console.log("discussion.adminLink", discussion.adminLink);

    if (adminLink !== discussion.adminLink) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }


    const collectors = await CollectorModel.find({ discussionId: discussion._id });

    if (!collectors.length) {
      return res.status(404).json({ error: 'No collectors found for this discussion.' });
    }

    return res.status(200).json({ message: collectors });
  } catch (error) {
    console.error('Error fetching collectors with links:', error);
    return res.status(500).json({ error: error.message });
  }
}

const setResultsForParticipants = async (req, res) => {
  try {
    const { discussionLink, adminLink } = req.params;
    const { collectorIds } = req.body;

    const discussion = await DiscussionModel.findOne({ dLink: discussionLink });
    if (!discussion) {
      return res.status(400).json({ error: 'Discussion not found.' });
    }

    if (adminLink !== discussion.adminLink) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required.' });
    }
    if (!discussion.isVotingEnded) {
      return res.status(400).json({ error: 'Voting period has not ended!' });
    }

    if (!collectorIds || !Array.isArray(collectorIds) || collectorIds.length === 0) {
      return res.status(400).json({ error: 'No collectors selected.' });
    }

    discussion.selectedCollectorIds = collectorIds;
    await discussion.save();

    return res.status(200).json({ message: 'Results selection saved successfully.' });
  } catch (error) {
    console.error('Error setting results for participants:', error);
    return res.status(500).json({ error: error.message });
  }
}

const getResultsForParticipants = async (req, res) => {
  const { discussionLink, userLink } = req.params;
  try {
    const discussion = await DiscussionModel.findOne({ dLink: discussionLink });
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const userLinkData = await UserLinkModel.findOne({ linkUUID: userLink, discussionId: discussion._id });

    if (!userLinkData && userLink !== discussion.adminLink) {
      return res.status(404).json({ error: 'You cannot review this discussion!' });
    }

    if (!discussion.selectedCollectorIds || discussion.selectedCollectorIds.length === 0) {
      return res.status(400).json({ error: 'No results have been approved for this discussion.' });
    }

    const results = await fetchVotingResultsForCollectors(discussion.selectedCollectorIds);

    res.status(200).json({ results });
  } catch (error) {
    console.error('Error fetching results for participants:', error);
    return res.status(500).json({ error: error.message });
  }

}


















// const updateDiscussion = async (req, res) => {
//   const { discussionLink } = req.params; // Get the discussion ID from the URL parameters
//   const { title, description, duration, isVotingStarted } = req.body; // Extract fields from the request body

//   try {
//     // Find the discussion by ID
//     const discussion = await DiscussionModel.findOne({ dLink: discussionLink });

//     if (!discussion) {
//       return res.status(404).json({ message: 'Discussion not found.' });
//     }

//     // Update title if provided
//     if (title) {
//       discussion.title = title;
//     }

//     // Update description if provided
//     if (description) {
//       discussion.description = description;
//     }

//     // Update duration (startDate and endDate) if provided
//     if (duration) {
//       const startDate = discussion.startDate || new Date(); // Use existing startDate or current date
//       const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000); // Calculate new endDate
//       discussion.endDate = endDate;
//     }

//     // Update isVotingStarted flag if provided
//     if (typeof isVotingStarted === 'boolean') {
//       discussion.isVotingStarted = isVotingStarted;
//     }

//     // Save the updated discussion
//     await discussion.save();

//     return res.status(200).json({ message: 'Discussion updated successfully.', discussion });
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({ message: error.message });
//   }
// };
// const createDiscussionGeneralLink = async (req, res) => {
//     console.log('createDiscussionGeneralLink controller');
//     return res.status(200).json({ message: 'createDiscussionGeneralLink controller' });
// };

// const createPersonalizedDiscussionLink = async (req, res) => {
//     console.log('createPersonalizedDiscussionLink controller');
//     return res.status(200).json({ message: 'createPersonalizedDiscussionLink controller' });
// };


module.exports = {
  createDiscussion,
  getSingleDiscussion,
  createCollectorForDiscussion,
  getVotingResultsForCollectors,
  getCollectorInfo,
  setResultsForParticipants,
  getResultsForParticipants
  // updateDiscussion
};
