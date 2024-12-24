
const DiscussionModel = require('../models/discussionModel');
const UserLinkModel = require('../models/userLinkModel');
const VoteModel = require('../models/voteModel');
const EmailCollectorVoteModel = require('../models/emailCollectorVoteModel');
const { CollectorModel } = require('../models');

const voteForDiscussion = async (req, res) => {

    const { discussionLink, userLink } = req.params;
    const { voteType } = req.body;

    try {

        if (!['yes', 'no', 'abstention'].includes(voteType)) {
            return res.status(400).json({ error: 'Invalid vote type' });
        }

        const discussion = await DiscussionModel.findOne({ dLink: discussionLink });
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found.' });
        }

        const userLinkData = await UserLinkModel.findOne({ linkUUID: userLink, discussionId: discussion._id });
        if (!userLinkData && userLink !== discussion.adminLink) {
            return res.status(404).json({ error: 'You cannot review this discussion!' });
        }

        if (!discussion.isVotingStarted || discussion.isVotingEnded) {
            return res.status(400).json({ message: 'You cannot vote for this discussion!' });
        }

        const collectorInfo = await CollectorModel.findOne({ _id: userLinkData.collectorId });

        const emailCollectorVote = await EmailCollectorVoteModel.findOne({ userLinkId: userLinkData._id });

        console.log(emailCollectorVote)

        if (emailCollectorVote) {
            return res.status(400).json({ message: 'You have already voted for this discussion.' });
        }

        await VoteModel.create({
            collectorId: userLinkData.collectorId,
            discussionId: discussion._id,
            voteType: voteType
        })

        if (collectorInfo.collectorType === 'specific') {

            await EmailCollectorVoteModel.create({
                userLinkId: userLinkData._id,
                collectorId: userLinkData.collectorId
            })
        }

        return res.status(200).json({ message: 'Vote has been casted successfully!' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const removeVoteForDiscussion = async (req, res) => {
    console.log("removeVoteForDiscussion controller");
    return res.status(200).json({ message: 'removeVoteForDiscussion controller' });
}


const endVotingPeriod = async (req, res) => {
    const { discussionLink, adminLink } = req.params;

    try {
        const discussion = await DiscussionModel.findOne({ dLink: discussionLink });
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found.' });
        }

        if (discussion.adminLink !== adminLink) {
            return res.status(403).json({ message: 'Invalid admin access!' });
        }

        if (discussion.isVotingEnded || !discussion.isVotingStarted) {
            return res.status(400).json({ message: 'Cannot end the voting period for this discussion' });
        }

        discussion.isVotingEnded = true;
        await discussion.save();

        return res.status(200).json({ message: 'Voting period has ended successfully!' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

module.exports = {
    voteForDiscussion,
    removeVoteForDiscussion,
    endVotingPeriod
}