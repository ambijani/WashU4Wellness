const mongoose = require('mongoose');
//incorrect
// const { Challenge } = require('../schemas/Challenge'); 
//correct
const Challenge = require('../schemas/Challenge');
const User = require('../schemas/User');
const Team = require('../schemas/Team');

const createChallenge = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newChallenge = new Challenge({
      challengeName: data.challengeName,
      challengeType: data.challengeType,
      challengeDescription: data.challengeDescription,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      goalAmount: data.goalAmount,
      challengeTags: data.challengeTags,
      teams: data.challengeTags.map(tags => ({ teamTags: tags, score: 0 })),
      leaderboard: { users: [], teams: [] }
    });

    await newChallenge.save({ session });
    console.log(`New challenge created with id ${newChallenge.challengeId}`);
    await updateUserAssignments(newChallenge, session);
    await session.commitTransaction();
    return newChallenge;
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in createChallenge:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

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

// Function to get a user's challenges based on their email
const fetchUserChallengesByEmail = async (email) => {
  try {
    // Validate email
    if (!email) {
      throw new Error('Email is required');
    }

    // Find the user by email and populate the assigned challenges
    const user = await User.findOne({ email }).populate({
      path: 'assignedChallenges.challengeId', // Populate challenge details
      model: Challenge
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Return the user's assigned challenges
    return user.assignedChallenges;
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    throw error;
  }
};

// Function to fetch all challenges
const fetchAllChallenges = async () => {
  try {
    // Find all challenges in the Challenge collection
    const challenges = await Challenge.find();
    return challenges;
  } catch (error) {
    console.error('Error fetching all challenges:', error);
    throw error;
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

module.exports = { createChallenge, updateChallenge, fetchUserChallengesByEmail, fetchAllChallenges};