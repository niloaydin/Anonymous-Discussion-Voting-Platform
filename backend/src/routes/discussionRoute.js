const express = require('express');
const discussionController = require('../controllers/discussionController');
const voteController = require('../controllers/voteController');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.post('/create', discussionController.createDiscussion);
router.get('/:discussionLink/:userLink', discussionController.getSingleDiscussion);
// router.get('/:discussionLink/a/:adminLink', discussionController.getSingleDiscussion);
// router.put('/:discussionLink/update', discussionController.updateDiscussion);
router.post(
    '/:discussionLink/a/:adminLink/create-collector',
    discussionController.createCollectorForDiscussion
);
router.get('/:discussionLink/a/:adminLink/collectors', discussionController.getCollectorInfo);

router.post('/:discussionLink/:userLink/vote', voteController.voteForDiscussion);

// router.post('/:discussionLink/a/:adminLink/comment', commentController.commentOnDiscussion);
router.post('/:discussionLink/:userLink/comment', commentController.commentOnDiscussion);

router.post('/:discussionLink/a/:adminLink/end-voting', voteController.endVotingPeriod);

router.get(
    '/:discussionLink/a/:adminLink/results',
    discussionController.getVotingResultsForCollectors
  );

router.get('/:discussionLink/:userLink/results', discussionController.getResultsForParticipants);

router.post('/:discussionLink/a/:adminLink/results/selection', discussionController.setResultsForParticipants);
// router.get('/:discussionLink/:userLink/comment', commentController.getCommentsForDiscussion);

// router.delete('/:discussionLink/:userLink/vote/:voteId', voteController.removeVoteForDiscussion);

module.exports = router;