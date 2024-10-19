const mongoose = require('mongoose');
const { Challenge, User } = require('./schemas');

const updateUserScore = async (userId, challengeId, scoreIncrement) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
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
      
      // Update leaderboard
      const userLeaderboardIndex = challenge.leaderboard.users.findIndex(u => u.userId.equals(userId));
      if (userLeaderboardIndex !== -1) {
        challenge.leaderboard.users[userLeaderboardIndex].score += scoreIncrement;
      } else {
        challenge.leaderboard.users.push({ userId, score: scoreIncrement });
      }
      challenge.leaderboard.users.sort((a, b) => b.score - a.score);

      const teamLeaderboardIndex = challenge.leaderboard.teams.findIndex(t => 
        t.teamTags.every(tag => challenge.teams[teamIndex].teamTags.includes(tag)));
      if (teamLeaderboardIndex !== -1) {
        challenge.leaderboard.teams[teamLeaderboardIndex].score += scoreIncrement;
      } else {
        challenge.leaderboard.teams.push({ 
          teamTags: challenge.teams[teamIndex].teamTags, 
          score: challenge.teams[teamIndex].score 
        });
      }
      challenge.leaderboard.teams.sort((a, b) => b.score - a.score);

      await challenge.save({ session });
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in updateUserScore:', error);
    throw error;
  } finally {
    session.endSession();
  }
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