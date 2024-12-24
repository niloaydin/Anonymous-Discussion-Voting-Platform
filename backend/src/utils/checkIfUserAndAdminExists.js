const models = require('./models');

async function checkIfUserAndAdminExistsForDiscussion(dLink, adminLink) {
    try {

        const discussion = await models.DiscussionModel.findOne({ dLink: dLink });
        if (!discussion) {
            throw new Error('Discussion not found.');
        }

        const userLinkData = await models.DiscussionModel.findOne({ linkUUID: adminLink, discussionId: discussion._id });

        if (!userLinkData && adminLink !== discussion.adminLink) {
           return false
        }
        return true
    } catch (error) {
        throw new Error(error.message);
    }  
}