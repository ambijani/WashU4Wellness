import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import StatusBarComponent from '../../components/challengeBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChallengePage = ({ route }) => {
  const { challengeId } = route.params; // Get challengeId from route parameters
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');

        if (!email) {
          console.error('User email not found in local storage');
          return;
        }

        const response = await fetch(`http://localhost:3000/get-single-challenge/${challengeId.challengeId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        setChallenge(data.challenge);
      } catch (error) {
        console.error('Error fetching challenge data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Challenge...</Text>
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: Challenge data not available.</Text>
      </View>
    );
  }

  // Calculate participation and create a status bar component for each team
  const teamStatusBars = challenge.teams.map((team) => {
    const { teamTags, score } = team;
    const goal = challenge.goalAmount;

    // Calculate statusValue as a percentage
    const statusValue = (score / goal) * 100 || 0; // Prevent division by zero
    const largeText = Math.floor(statusValue); // Floor the percentage value

    return (
      <StatusBarComponent
        key={team._id} // Use team ID as a unique key
        primaryText={teamTags.join(', ')} // Join team tags with a comma
        secondaryText={challenge.challengeName} // Challenge name
        statusValue={statusValue} // Status value calculated
        largeText={largeText} // Floored value as percentage
      />
    );
  });

  // Prepare leaderboard data
  const { users } = challenge.leaderboard; // Extract users from leaderboard
  const topUsers = users.map((user) => (
    <View key={user._id} style={styles.leaderboardItem}>
      <Text style={styles.leaderboardText}>{user.userId}</Text>
      <Text style={styles.leaderboardText}>{user.score}</Text>
    </View>
  ));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{challenge.challengeName}</Text>
      {/* Render the status bar components for each team */}
      {teamStatusBars}

      {/* Leaderboard Section */}
      <View style={styles.leaderboardSection}>
        <Text style={styles.leaderboardHeader}>Leaderboard</Text>
        <View style={styles.leaderboardHeaderRow}>
          <Text style={styles.leaderboardHeaderText}>User ID</Text>
          <Text style={styles.leaderboardHeaderText}>Score</Text>
        </View>
        {topUsers}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 2, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  leaderboardHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  leaderboardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  leaderboardHeaderText: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  leaderboardText: {
    flex: 1,
    textAlign: 'center',
  },
});

export default ChallengePage;