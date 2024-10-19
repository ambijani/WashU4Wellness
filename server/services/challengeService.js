const mongoose = require('mongoose');
const { Challenge, User, Team } = require('./schemas');  // Ensure this path is correct

const updateChallenge = async (challengeId, data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedChallenge = await Challenge.findOneAndUpdate(
      { challengeId: challengeId },
      {
        $set: {
          challengeName: data.challengeName,
          challengeType: data.challengeType,
          challengeDescription: data.challengeDescription,
          startDateTime: data.startDateTime,
          endDateTime: data.endDateTime,
          goalAmount: data.goalAmount,
          challengeTags: data.challengeTags,
          teams: data.challengeTags.map(tags => ({ teamTags: tags, score: 0 })),
          leaderboard: { users: [], teams: [] }
        }
      },
      { new: true, runValidators: true, session }
    );

    if (!updatedChallenge) {
      throw new Error(`Challenge with id ${challengeId} not found`);
    }

    console.log(`Challenge ${challengeId} updated successfully`);
    await updateUserAssignments(updatedChallenge, session);

    await session.commitTransaction();
    return updatedChallenge;
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in updateChallenge:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

const updateUserAssignments = async (challenge, session) => {
  try {
    // Remove the challenge from all users who were previously assigned
    await User.updateMany(
      { 'assignedChallenges.challengeId': challenge._id },
      { $pull: { assignedChallenges: { challengeId: challenge._id } } },
      { session }
    );

    // Find and assign users based on new tags
    const assignedUsers = await assignUsersToChallenge(challenge, session);
    console.log(`Updated challenge assignment: ${assignedUsers} users in total`);
  } catch (error) {
    console.error('Error updating user assignments:', error);
    throw error;
  }
};

const assignUsersToChallenge = async (challenge, session) => {
  let assignedUsers = 0;

  for (const teamTags of challenge.challengeTags) {
    const users = await User.find({
      tags: { $elemMatch: { $all: teamTags } }
    }).session(session);

    if (users.length > 0) {
      await User.updateMany(
        { _id: { $in: users.map(user => user._id) } },
        {
          $push: {
            assignedChallenges: {
              challengeId: challenge._id,
              assignedTags: teamTags,
              score: 0
            }
          }
        },
        { session }
      );

      // Create or update team
      await Team.findOneAndUpdate(
        { teamTags: teamTags },
        {
          $setOnInsert: { teamTags: teamTags },
          $push: {
            challenges: {
              challengeId: challenge._id,
              score: 0
            }
          }
        },
        { upsert: true, new: true, session }
      );

      assignedUsers += users.length;
    }
  }

  return assignedUsers;
};

module.exports = { updateChallenge };