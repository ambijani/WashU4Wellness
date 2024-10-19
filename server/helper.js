const mongoose = require('mongoose');
const { User, Challenge} = require('./schema');
const Team = require('./schema/Team');

const generateUsername = email => email.split('@')[0];
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

const assignChallengesToNewUser = async userId => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the user
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    // Fetch all active challenges
    const currentDate = new Date();
    const activeChallenges = await Challenge.find({
      startDateTime: { $lte: currentDate },
      endDateTime: { $gte: currentDate }
    }).session(session);

    // Array to store challenges to be assigned
    const challengesToAssign = [];

    // Check each challenge against user tags
    for (const challenge of activeChallenges) {
      for (const challengeTagSet of challenge.challengeTags) {
        // Check if any of the user's tag sets fully match this challenge tag set
        const matchFound = user.tags.some(userTagSet =>
          challengeTagSet.every(tag => userTagSet.includes(tag))
        );

        if (matchFound) {
          challengesToAssign.push({
            challengeId: challenge._id,
            assignedTags: challengeTagSet,
            score: 0
          });

          // Update or create team
          await Team.findOneAndUpdate(
            { teamTags: challengeTagSet },
            {
              $addToSet: { challenges: { challengeId: challenge._id, score: 0 } }
            },
            { upsert: true, new: true, session }
          );

          // Update challenge leaderboard
          await Challenge.findByIdAndUpdate(
            challenge._id,
            {
              $addToSet: {
                'leaderboard.users': { userId: user._id, score: 0 },
                'leaderboard.teams': { teamTags: challengeTagSet, score: 0 }
              }
            },
            { session }
          );

          break; // Move to next challenge once a match is found
        }
      }
    }

    // Assign matched challenges to the user
    if (challengesToAssign.length > 0) {
      await User.findByIdAndUpdate(
        userId,
        { $push: { assignedChallenges: { $each: challengesToAssign } } },
        { session }
      );
    }

    await session.commitTransaction();
    console.log(`Assigned ${challengesToAssign.length} challenges to user ${userId}`);
    return challengesToAssign;
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in assignChallengesToNewUser:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = { generateUsername, range, assignChallengesToNewUser };