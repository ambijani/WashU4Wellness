// Function to log an event
const mongoose = require('mongoose');
const Event = require('../schemas/Event');
const User = require('../schemas/User');
const Team = require('../schemas/Team');
const Challenge = require('../schemas/Challenge');
const { generateUsername } = require('../helper.js');

const logEvent = async (eventData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, eventName, activityType, value, dateTimeLogged } = eventData;
    value = parseInt(value);
    if (!email || !eventName || !activityType || !value) {
      throw new Error('Missing required fields');
    }

    const user = await User.findOne({ email }).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    const username = user.username || generateUsername(email);
    if (!user.username) {
      user.username = username;
      await user.save({ session });
    }

    const newEvent = new Event({
      username,
      eventName,
      activityType,
      value,
      dateTimeLogged: dateTimeLogged || new Date()
    });

    const savedEvent = await newEvent.save({ session });

    // Update user's score for all relevant challenges
    for (const userChallenge of user.assignedChallenges) {
      const challenge = await Challenge.findById(userChallenge.challengeId).session(session);
      if (challenge && challenge.challengeType === activityType) {
        userChallenge.score += value;
        user.totalScore += value;  // Update user's total score

        // Update challenge and team scores
        await updateChallengeAndTeamScores(challenge, user, value, session);
      }
    }

    await user.save({ session });
    await session.commitTransaction();
    return savedEvent;
  } catch (error) {
    await session.abortTransaction();
    console.error('Error logging event:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

const updateChallengeAndTeamScores = async (challenge, user, scoreIncrement, session) => {
  // Update user's score in the challenge leaderboard
  const userLeaderboardIndex = challenge.leaderboard.users.findIndex(u => u.userId.equals(user._id));
  if (userLeaderboardIndex !== -1) {
    challenge.leaderboard.users[userLeaderboardIndex].score += scoreIncrement;
  } else {
    challenge.leaderboard.users.push({ userId: user._id, score: scoreIncrement });
  }

  // Update team's score
  const userChallenge = user.assignedChallenges.find(c => c.challengeId.equals(challenge._id));
  const teamIndex = challenge.teams.findIndex(team =>
    team.teamTags.every(tag => userChallenge.assignedTags.includes(tag))
  );

  if (teamIndex !== -1) {
    challenge.teams[teamIndex].score += scoreIncrement;

    // Update team leaderboard
    const teamLeaderboardIndex = challenge.leaderboard.teams.findIndex(t =>
      t.teamTags.every(tag => challenge.teams[teamIndex].teamTags.includes(tag))
    );
    if (teamLeaderboardIndex !== -1) {
      challenge.leaderboard.teams[teamLeaderboardIndex].score += scoreIncrement;
    } else {
      challenge.leaderboard.teams.push({
        teamTags: challenge.teams[teamIndex].teamTags,
        score: scoreIncrement
      });
    }

    // Update Team document
    await Team.findOneAndUpdate(
      { teamTags: challenge.teams[teamIndex].teamTags },
      { $inc: { [`challenges.$[elem].score`]: scoreIncrement } },
      {
        arrayFilters: [{ "elem.challengeId": challenge._id }],
        session
      }
    );
  }

  await challenge.save({ session });
};

// Function to fetch logged events by user email (or userId)
const fetchUserLoggedEvents = async (email) => {
  try {
    const username = generateUsername(email);
    // Find all events logged by the user with the given email
    const events = await Event.find({ username });

    if (!events || events.length === 0) {
      throw new Error(`No events found for user with username ${username}`);
    }

    return events;
  } catch (error) {
    console.error(`Error fetching logged events for user with username ${username}:`, error);
    throw error;
  }
};

module.exports = { logEvent, fetchUserLoggedEvents };