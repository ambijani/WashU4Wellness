import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker, Alert, ScrollView, ActivityIndicator } from 'react-native';
import DatePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

const createEmptyTeam = (tagChoices) => {
  const team = {};
  Object.keys(tagChoices).forEach((key) => {
    team[key] = '';  // Initialize each field with an empty string
  });
  return team;
};

export default function CreateEventScreen() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: dayjs(),
    endDate: dayjs().add(1, 'day'),
  });
  const [teams, setTeams] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagChoices, setTagChoices] = useState({});

  // Fetch event types and tag choices when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventTypesResponse, tagChoicesResponse] = await Promise.all([
          fetch('http://localhost:3000/get-all-activities').then((res) => res.json()),
          fetch('http://localhost:3000/get-all-tag-choices').then((res) => res.json()),
        ]);

        setEventTypes(eventTypesResponse);
        setType(eventTypesResponse[0] || ''); // Set default event type if available
        setTagChoices(tagChoicesResponse); // Dynamically set tag choices
        setTeams([createEmptyTeam(tagChoicesResponse)]); // Initialize the first team based on available choices
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle Date Range Change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Handle Goal Input (Only numeric)
  const handleGoalChange = (text) => {
    if (/^\d*$/.test(text)) {
      setGoal(text);
    } else {
      Alert.alert('Invalid input', 'Goal must be a numeric value.');
    }
  };

  // Add a new team
  const handleAddTeam = () => {
    setTeams([...teams, createEmptyTeam(tagChoices)]);
  };

  // Handle team change dynamically
  const handleTeamChange = (value, teamIndex, field) => {
    const updatedTeams = [...teams];
    updatedTeams[teamIndex][field] = value;
    setTeams(updatedTeams);
  };

  const handleSubmit = async () => {
    const { startDate, endDate } = dateRange;
  
    if (teams.length === 0 || !teams[0]) {
      Alert.alert('Error', 'You must add at least one team.');
      return;
    }
  
    // Map teams to a string array of tag choices
    const formattedTeams = teams.map((team) =>
      Object.values(team).filter((tag) => tag !== '') // Remove empty fields
    );
  
    // Structure the data to match the API endpoint's expected format
    const payload = {
      challengeName: name,
      challengeType: type,
      challengeDescription: description,
      startDateTime: startDate.format('YYYY-MM-DDTHH:mm:ssZ'), // Use ISO format
      endDateTime: endDate.format('YYYY-MM-DDTHH:mm:ssZ'), // Use ISO format
      goalAmount: goal,
      challengeTags: formattedTeams, // Send formatted tag values
    };
  
    try {
      const response = await fetch('http://localhost:3000/create-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        navigation.navigate('Home');
        Alert.alert('Success', 'Challenge created successfully!');
        console.log('Response from server:', result);
      } else {
        Alert.alert('Error', `Failed to create challenge: ${result.message}`);
        console.error('Error from server:', result);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      Alert.alert('Error', 'An error occurred while creating the challenge.');
    }
  };
  


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Event Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event name"
        value={name}
        onChangeText={(text) => setName(text)}
      />

      <Text style={styles.label}>Event Type</Text>
      {eventTypes.length > 0 ? (
        <Picker
          selectedValue={""}
          style={styles.picker}
          onValueChange={(itemValue) => setType(itemValue)}
        >
          {/* Add a blank entry */}
          <Picker.Item label="" value="" />
          {eventTypes.map((eventType, index) => (
            <Picker.Item key={index} label={eventType} value={eventType} />
          ))}
        </Picker>
      ) : (
        <Text>No event types available</Text>
      )}


      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event description"
        value={description}
        onChangeText={(text) => setDescription(text)}
        multiline
      />

      <Text style={styles.label}>Event Date Range</Text>
      <DatePicker
        mode="range"
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={handleDateRangeChange}
      />

      <Text style={styles.label}>Event Goal</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event goal (numeric)"
        value={goal}
        keyboardType="numeric"
        onChangeText={handleGoalChange}
      />

      <Button title="+ Add Team" onPress={handleAddTeam} />

      {teams.map((team, index) => (
        <View key={index} style={styles.teamContainer}>
          <Text style={styles.teamTitle}>Team {index + 1}</Text>

          {/* Dynamically render pickers for each category */}
          {Object.keys(tagChoices).map((category) => (
            <View key={category}>
              <Text style={styles.label}>{category}</Text>
              <Picker
                selectedValue={team[category]}
                style={styles.picker}
                onValueChange={(itemValue) => handleTeamChange(itemValue, index, category)}
              >
                {/* Add a blank entry */}
                <Picker.Item label="" value="" />
                {tagChoices[category].map((option, idx) => (
                  <Picker.Item key={idx} label={option.toString()} value={option} />
                ))}
              </Picker>
            </View>
          ))}
        </View>
      ))}

      <Button title="Create Event" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  teamContainer: {
    marginBottom: 20,
  },
  teamTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});