import React, { useEffect, useState } from 'react';
import { SafeAreaView, TouchableOpacity, Alert, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StatusBarComponent from '../../components/challengeBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [challenges, setChallenges] = useState([]);

  // Function to fetch user challenges from the backend
  const fetchUserChallenges = async (email) => {
    try {
      const response = await fetch('http://localhost:3000/get-user-challenges/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      console.log('User Challenges Data:', data);

      if (data.challenges) {
        setChallenges(data.challenges);
      }
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  };

  // Fetch the user's email from local storage
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (email) {
          fetchUserChallenges(email);
        } else {
          Alert.alert('Error', 'No email found in local storage');
        }
      } catch (error) {
        console.error('Error getting user email from local storage:', error);
      }
    };

    getUserEmail();
  }, []);

  // Function to calculate the team's score
  const calculateTeamScore = (challenge) => {
    const assignedTags = challenge.assignedTags.join(',');
    const matchingTeam = challenge.challengeId.teams.find(
      (team) =>
        JSON.stringify(team.teamTags.sort()) === JSON.stringify(challenge.assignedTags.sort())
    );
    const score = matchingTeam ? matchingTeam.score : 0;
    const goalAmount = challenge.challengeId.goalAmount;
    const statusValue = (score / goalAmount) * 100;
    const largeText = Math.floor(statusValue) + '%';

    return { assignedTags, statusValue, largeText };
  };

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <ScrollView>
        {/* Personal Section */}
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Personal</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Personalization')}>
          <StatusBarComponent
            primaryText="No goals set"
            secondaryText="Click to set goals"
            statusValue={0}
            largeText="0%"
          />
        </TouchableOpacity>

        {/* Horizontal Bar (hbar) */}
        <View style={{ height: 2, backgroundColor: 'gray', marginVertical: 20 }} />

        {/* Team Goals Section */}
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Team Goals</Text>
        {challenges.map((challenge, index) => {
  const { assignedTags, statusValue, largeText } = calculateTeamScore(challenge);

  return (
    <TouchableOpacity
      key={index}
      onPress={() => navigation.navigate('ChallengePage', { challengeId: challenge.challengeId })}
    >
      <StatusBarComponent
        primaryText={challenge.challengeId.challengeName}
        secondaryText={assignedTags}
        statusValue={statusValue}
        largeText={largeText}
      />
    </TouchableOpacity>
  );
})}

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
