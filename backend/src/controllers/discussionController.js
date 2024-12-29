const CreatorModel = require('../models/creatorModel');
const DiscussionModel = require('../models/discussionModel');
const UserLinkModel = require('../models/userLinkModel');
const CollectorModel = require('../models/collectorModel');
const CommentModel = require('../models/commentModel');
const VoteModel = require('../models/voteModel');
const { generateRandomString } = require('../utils/discussionUtils');
const { fetchVotingResultsForCollectors } = require('../utils/fetchVotingResultForCollectors');
const { sendEmail } = require('../services/emailService');
require('dotenv').config();

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
    return res.status(400).json({ error: error.message });
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
      consComments: consComments,
      selectedCollectorIds: discussion.selectedCollectorIds
    }

    return res.status(200).json({ message: discussionData });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  };
}

const createCollectorForDiscussion = async (req, res) => {
  const { discussionLink, adminLink } = req.params;
  const { emails } = req.body;
  const { type, collectorName } = req.query;

  console.log(`FILES: ${JSON.stringify(req.file)}`);
  let csvFile;
  if (req.file) csvFile = req.file;

  try {

    if (!['general', 'specific'].includes(type)) {
      return res.status(400).json({ error: 'Invalid collector type' });
    }
    if (type === 'specific' && emails) {
      if ((!Array.isArray(emails) || emails.length === 0)) {
        return res.status(400).json({ error: 'Emails must be provided as a non-empty array for specific collector type' });
      }
    }
    // if (type === 'specific' && csvFile ) {
    //   if((!Array.isArray(emails) || emails.length === 0)){
    //   return res.status(400).json({ error: 'Emails must be provided as a non-empty array for specific collector type' });
    //   }
    // }

    if (csvFile) {
      console.log("CSV File Uploaded:", csvFile);
    } else {
      console.log("No CSV file uploaded.");
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
    const emailSet = new Set(emails || []);

    if (type === 'general') {
      const generalLink = generateRandomString();
      listLinks.push(generalLink);

      userLinks.push({
        discussionId: discussion._id,
        linkUUID: generalLink,
      });

    }
    if (type === 'specific' && csvFile) {
      const csvParser = require('csv-parser');
      const fs = require('fs');

      const readStream = fs.createReadStream(csvFile.path);
      await new Promise((resolve, reject) => {
        readStream
          .pipe(csvParser())
          .on('data', (row) => {
            console.log("Row read from CSV:", row);
            const emailField = Object.keys(row).find((key) => key.trim().toLowerCase() === 'email');
            if (emailField && row[emailField].trim()) {
              console.log("csv email var in icine girdi")
              emailSet.add(row[emailField].trim());
            }
          })
          .on('end', () => {
            console.log("CSV parsing completed.");
            resolve();
          })
          .on('error', () => {
            console.log("CSV parse error");
            reject();
          })

      });
      if (emailSet.size === 0) {
        return res.status(400).json({ error: 'CSV file is empty or contains no valid email entries.' });
      }
    }



    if (type === 'specific' && emailSet.size > 0) {
      for (const email of emailSet) {
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
    try {
      if (type === 'specific') {
        for (const link of userLinks) {
          if (link.email) {
            const discussionUrl = `${process.env.FRONTEND_URL}/discussion/${discussion.dLink}/${link.linkUUID}`;
            const subject = `Invitation to the discussion: ${discussion.title}`;
            const text = `You are invited to the discussion "${discussion.title}". You can participate through this link: ${discussionUrl}`;

            await sendEmail({ to: link.email, subject, text });
            console.log(`Email sent to ${link.email}`);
          }
        }
      }
    } catch (error) {
      throw new Error("Collector createad but Could not send email!")
    }

    return res.status(200).json({ message: collector });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: `Duplicate email detected for discussion: ${emails}` });
    }
    return res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
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

    const userLinkData = await UserLinkModel.findOne({ linkUUID: adminLink, discussionId: discussion._id });

    if (adminLink !== discussion.adminLink && !userLinkData) {
      return res.status(403).json({ error: 'Unauthorized required' });
    }
    const isAdmin = adminLink === discussion.adminLink;

    const collectors = await CollectorModel.find({ discussionId: discussion._id });
    const userLinks = await UserLinkModel.find({ discussionId: discussion._id });

    // console.log(`COLLECTORS = ${JSON.stringify(collectors)}`);
    // console.log(`USER LINKS = ${JSON.stringify(userLinks)}`);

    if (!collectors.length) {
      return res.status(404).json({ error: 'No collectors found for this discussion.' });
    }

    let collectorInfo;
    if (isAdmin) {
      collectorInfo = collectors.map((collector) => {
        const linksForCollector = userLinks.filter(
          (link) => link.collectorId.toString() === collector._id.toString()
        );
        console.log(`linksForCollector = ${JSON.stringify(linksForCollector, null, 2)}`);
        const emails = linksForCollector
          .filter((link) => link.email)
          .map((link) => link.email);

        const links = linksForCollector.map((link) => link.linkUUID);


        return {
          collectorId: collector._id,
          name: collector.collectorName,
          type: collector.collectorType,
          emails: collector.collectorType === 'specific' ? emails : null,
          links: links,
        };
      });
    } else {

      collectorInfo = collectors.map((collector) => {
        const linksForCollector = userLinks.filter(
          (link) => link.collectorId.toString() === collector._id.toString()
        );

        const links = linksForCollector.map((link) => link.linkUUID);

        return {
          name: collector.collectorName,
          type: collector.collectorType,
          links: links,
        };
      });
    }

    // console.log(`collector info = ${JSON.stringify(collectorInfo)}`);

    return res.status(200).json({ message: collectorInfo });
  } catch (error) {
    console.error('Error fetching collectors with links:', error);
    return res.status(400).json({ error: error.message });
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
    return res.status(400).json({ error: error.message });
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

    if (!discussion.selectedCollectorIds && discussion.selectedCollectorIds.length === 0) {
      return res.status(400).json({ error: 'No results have been approved for this discussion.' });
    }
    console.log(`Selected collector IDs: ${discussion}`);
    const results = await fetchVotingResultsForCollectors(discussion.selectedCollectorIds);

    res.status(200).json({ results });
  } catch (error) {
    console.error('Error fetching results for participants:', error);
    return res.status(400).json({ error: error.message });
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
