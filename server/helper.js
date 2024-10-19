const generateUsername = email => email.split('@')[0];

const range = (start, end) =>  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const User = require('./schema/User');
const Challenge = require('./schema/Challenge');

const assignChallengesToNewUser = async userId => {
  try {
    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Fetch all active challenges
    const currentDate = new Date();
    const activeChallenges = await Challenge.find({
      startDateTime: { $lte: currentDate },
      endDateTime: { $gte: currentDate }
    });

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
            assignedTags: challengeTagSet
          });
          break; // Move to next challenge once a match is found
        }
      }
    }

    // Assign matched challenges to the user
    if (challengesToAssign.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $push: { assignedChallenges: { $each: challengesToAssign } }
      });
    }

    console.log(`Assigned ${challengesToAssign.length} challenges to user ${userId}`);
    return challengesToAssign;
  } catch (error) {
    console.error('Error in assignChallengesToNewUser:', error);
    throw error;
  }
};

module.exports = { generateUsername, range, assignChallengesToNewUser };
