const mongoose = require('mongoose');
const Challenge = require('../schemas/Challenge'); 
const User = require('../schemas/User');  
const Team = require('../schemas/Team');  

const updateLeaderboard = async (leaderboard, id, _scoreIncrement, idField = 'userId') => {
  scoreIncrement = parseInt(_scoreIncrement);
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

const getMyTeamsScore = async (userId, challengeId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const challenge = await Challenge.findOne({ challengeId });
  if (!challenge) throw new Error('Challenge not found');

  const userTeams = challenge.teams.filter(team => 
    team.teamTags.some(tag => user.tags.flat().includes(tag))
  );

  return userTeams.map(team => ({
    teamTags: team.teamTags,
    score: team.score
  }));
};

const getMyPersonalScore = async (userId, challengeId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const userChallenge = user.assignedChallenges.find(c => c.challengeId.toString() === challengeId.toString());
  if (!userChallenge) throw new Error('User not assigned to this challenge');

  return {
    score: userChallenge.score,
    assignedTags: userChallenge.assignedTags
  };
};

const getAllSingleChallengeInfo = async (challengeId, email) => {
  try {
    const challenge = await Challenge.findOne({ challengeId }).lean();
    if (!challenge) throw new Error(`Challenge with ID ${challengeId} not found`);

    const topUsers = await getTopUsersForChallenge(challenge._id);
    const topTeams = await getTopTeamsForChallenge(challenge._id);

    let personalScore = null;
    let myTeamsScore = null;

    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        try {
          personalScore = await getMyPersonalScore(user._id, challenge._id);
        } catch (error) {
          console.log('User not assigned to this challenge');
        }

        try {
          myTeamsScore = await getMyTeamsScore(user._id, challengeId);
        } catch (error) {
          console.log('No teams found for this user in this challenge');
        }
      } else {
        console.log('User not found with the provided email');
      }
    }

    return {
      ...challenge,
      topUsers,
      topTeams,
      personalScore,
      myTeamsScore
    };
  } catch (error) {
    console.error(`Error fetching challenge info for ID ${challengeId}:`, error);
    throw error;
  }
};

module.exports = {
  getAllSingleChallengeInfo
};