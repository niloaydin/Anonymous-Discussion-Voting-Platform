
const DiscussionModel = require('../models/discussionModel');
const UserLinkModel = require('../models/userLinkModel');
const CreatorModel = require('../models/creatorModel');
const { sendEmail } = require('./emailService');
require('dotenv').config();

const checkDiscussionsForVoting = async () => {
    try {

        const now = new Date();

        const discussionsToUpdate = await DiscussionModel.find({
            endDate: { $lte: now },
            isVotingStarted: false,
            isEmailSent: false,
        });

        console.log(`discussionsToUpdate: ${discussionsToUpdate}`);

        if (discussionsToUpdate.length > 0) {
            await Promise.all(
                discussionsToUpdate.map(async (discussion) => {

                    discussion.isVotingStarted = true;
                    await discussion.save();

                    console.log(`Voting started for discussion: ${discussion.title}`);

                    const usersWithEmails = await UserLinkModel.find({
                        discussionId: discussion._id,
                        email: { $exists: true, $ne: null },
                        isCreator: false,
                    });

                    // Fetch creator's email
                    const creator = await CreatorModel.findById(discussion.creatorId);

                    // Add users and creator to the email list
                    const userDetails = [
                        ...usersWithEmails.map((user) => ({
                            email: user.email,
                            userLink: user.linkUUID,
                        })),
                        ...(creator ? [{ email: creator.email, userLink: '', isCreator: true }] : []),
                    ];

                    if (userDetails.length > 0) {
                        await Promise.all(
                            userDetails.map(({ email, userLink, isCreator }) => {
                                const discussionLink = process.env.BASE_URL + `/discussion/${discussion.dLink}/${userLink}/vote`
                                const adminLink = process.env.BASE_URL + `/discussion/${discussion.dLink}/a/${discussion.adminLink}`
                                const subject = isCreator
                                    ? `Your Discussion Voting Started: ${discussion.title}`
                                    : `Voting Started: ${discussion.title}`;

                                const text = isCreator
                                    ? `Hello, the voting for your discussion "${discussion.title}" has started!  <a href="${adminLink}">Click here</a> to see your discussion.`
                                    : `Hello, the voting for the discussion "${discussion.title}" has started! <a href="${discussionLink}">Click here</a> to vote.`;

                                sendEmail({
                                    to: email,
                                    subject,
                                    text
                                })
                            }
                            )
                        );
                        console.log(
                            `Emails sent!`
                        );

                        discussion.isEmailSent = true;
                        await discussion.save();
                        
                    } else {
                        console.log('No email addresses found for this discussion.');
                    }

                })
            );

        } else {
            console.log('No discussions need updates at this time.');
        }
    } catch (error) {
        console.error('Error checking discussions for voting:', error);
    }
};


// const discussionCheckTest = async () => {
//     try {

//         const now = new Date();

//         const discussionsToUpdate = await DiscussionModel.find({
//             isVotingStarted: true,
//         });

//         if (discussionsToUpdate.length > 0) {
//             await Promise.all(
//                 discussionsToUpdate.map(async (discussion) => {
//                     discussion.isVotingStarted = true;
//                     await discussion.save();
//                     console.log(`Voting started for discussion: ${discussion.title}`);

//                     const usersWithEmails = await UserLinkModel.find({
//                         discussionId: discussion._id,
//                         email: { $exists: true, $ne: null },
//                     });

//                     const userDetails = usersWithEmails.map((user) => ({
//                         email: user.email,
//                         userLink: user.linkUUID,
//                     }));

//                     if (userDetails.length > 0) {
//                         await Promise.all(
//                             userDetails.map(({ email, userLink }) => {
//                                 const discussionLink = process.env.BASE_URL + `/discussion/${discussion.dLink}/${userLink}/vote`
//                                 sendEmail({
//                                     to: email,
//                                     subject: `Voting Started: ${discussion.title}`,
//                                     text: `Hello, the voting for the discussion "${discussion.title}" has started!  <a href=${discussionLink}>click here</a> to vote.`,
//                                     html: `<p>Hello,</p><p>The voting for the discussion <strong>${discussion.title}</strong> has started!</p>`,
//                                 })
//                             }
//                             )
//                         );
//                         console.log(
//                             `Emails sent!`
//                         );
//                         discussion.isEmailSent = true;
//                         await discussion.save();
//                     } else {
//                         console.log('No email addresses found for this discussion.');
//                     }

//                 })
//             );

//         } else {
//             console.log('No discussions need updates at this time.');
//         }
//     } catch (error) {
//         console.error('Error checking discussions for voting:', error);
//     }
// };


module.exports = {
    checkDiscussionsForVoting,
    //  discussionCheckTest 
};
