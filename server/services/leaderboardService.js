const mongoose = require('mongoose');
const { Challenge } = require('../schemas/Challenge'); 
const { User } = require('../schemas/User');  
const { Team } = require('../schemas/Team');  

const updateUserScore = async (email, challengeId, scoreIncrement) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOne({ email }).session(session);
    if (!user) throw new Error('User not found');

    const challenge = await Challenge.findById(challengeId).session(session);
    if (!challenge) throw new Error('Challenge not found');

    // Update user's score for the specific challenge
    const userChallenge = user.assignedChallenges.find(c => c.challengeId.equals(challengeId));
    if (!userChallenge) throw new Error('User not assigned to this challenge');

    userChallenge.score += scoreIncrement;
    user.totalScore += scoreIncrement;  // Update user's total score
    await user.save({ session });

    // Update team score in the challenge
    const teamIndex = challenge.teams.findIndex(team =>
      team.teamTags.every(tag => userChallenge.assignedTags.includes(tag))
    );

    if (teamIndex !== -1) {
      challenge.teams[teamIndex].score += scoreIncrement;
     
      // Update user leaderboard
      await updateLeaderboard(challenge.leaderboard.users, user._id, scoreIncrement);

      // Update team leaderboard
      await updateLeaderboard(challenge.leaderboard.teams, challenge.teams[teamIndex].teamTags, scoreIncrement, 'teamTags');

      await challenge.save({ session });

      // Update Team document
      await Team.findOneAndUpdate(
        { teamTags: challenge.teams[teamIndex].teamTags },
        { $inc: { [`challenges.$[elem].score`]: scoreIncrement } },
        {
          arrayFilters: [{ "elem.challengeId": challengeId }],
          session
        }
      );
    }

    await session.commitTransaction();
    return { message: 'Score updated successfully' };
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in updateUserScore:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

const updateLeaderboard = async (leaderboard, id, scoreIncrement, idField = 'userId') => {
  const index = leaderboard.findIndex(item => 
    idField === 'userId' ? item[idField].equals(id) : item[idField].every(tag => id.includes(tag))
  );

  if (index !== -1) {
    leaderboard[index].score += scoreIncrement;
  } else {
    leaderboard.push({ [idField]: id, score: scoreIncrement });
  }

  leaderboard.sort((a, b) => b.score - a.score);
};

const getTopUsersForChallenge = async (challengeId, limit = 10) => {
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) throw new Error('Challenge not found');

  return challenge.leaderboard.users.slice(0, limit).map(user => ({
    userId: user.userId,
    score: user.score
  }));
};

const getTopTeamsForChallenge = async (challengeId, limit = 10) => {
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) throw new Error('Challenge not found');

  return challenge.leaderboard.teams.slice(0, limit).map(team => ({
    teamTags: team.teamTags,
    score: team.score
  }));
};

module.exports = {
  updateUserScore,
  getTopUsersForChallenge,
  getTopTeamsForChallenge
};