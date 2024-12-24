const CreatorModel = require('../models/creatorModel');
const DiscussionModel = require('../models/discussionModel');
const UserLinkModel = require('../models/userLinkModel');
const CollectorModel = require('../models/collectorModel');
const CommentModel = require('../models/commentModel');

const commentOnDiscussion = async (req, res) => {
    const { discussionLink, userLink } = req.params;

    const { content, commentType } = req.body;

    try {
        const discussion = await DiscussionModel.findOne({ dLink: discussionLink });
        if (!discussion) {
          return res.status(404).json({ error: 'Discussion not found' });
        }
        const userLinkData = await UserLinkModel.findOne({ linkUUID: userLink, discussionId: discussion._id });

        if (!userLinkData && userLink !== discussion.adminLink) {
          return res.status(404).json({ error: 'You cannot comment this discussion!' });
        }

        if (!content || !['pros', 'cons'].includes(commentType)) {
            return res.status(400).json({ message: 'Invalid comment data.' });
        }
        
        await CommentModel.create({
            discussionId: discussion._id,
            content: content,
            commentType: commentType
        })

        return res.status(200).json({ message: "comment created!" });
    
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const getCommentsForDiscussion = async (req, res) => {
    console.log("getCommentsForDiscussion controller");
    return res.status(200).json({ message: 'getCommentsForDiscussion controller' });
}

module.exports = {
    commentOnDiscussion,
    getCommentsForDiscussion
}