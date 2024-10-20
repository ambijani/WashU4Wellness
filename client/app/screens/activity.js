import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ActivityMonitor() {
  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [email, setEmail] = useState(''); // State to store email

  const inputRefs = useRef([]);

  // Fetch email when component mounts
  useEffect(() => {
    const fetchEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    };
    fetchEmail();
  }, []);

  const logEvent = async (eventName, activityType, value) => {
    const eventData = {
      email: email,
      eventName,
      activityType,
      value,
    };


    try {
      const response = await fetch('http://localhost:3000/log-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event: eventData }),
      });

      if (!response.ok) {
        throw new Error('Failed to log event');
      }
      Alert.alert(`${eventName} logged successfully!`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to log event');
    }
  };

  const handleAddCalories = () => {
    logEvent('Calories Burned', 'calories', calories);
    setCalories(''); // Clear input field
  };

  const handleAddSteps = () => {
    logEvent('Steps Taken', 'steps', steps);
    setSteps(''); // Clear input field
  };

  const handleAddWorkoutTime = () => {
    const workoutTime = `${hours}:${minutes}:${seconds}`;
    logEvent('Workout Time', 'time', workoutTime);
    setHours(''); // Clear input fields
    setMinutes('');
    setSeconds('');
  };

  const handleAddDistance = () => {
    logEvent('Distance Covered', 'distance', distance);
    setDistance(''); // Clear input field
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Monitor</Text>

      {/* Calories Burned Input */}
      <Text style={styles.label}>Calories Burned:</Text>
      <View style={styles.rowContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter calories burned"
          value={calories}
          onChangeText={setCalories}
        />
        <Button title="+ Add" onPress={handleAddCalories} />
      </View>

      {/* Steps Taken Input */}
      <Text style={styles.label}>Steps Taken:</Text>
      <View style={styles.rowContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter steps taken"
          value={steps}
          onChangeText={setSteps}
        />
        <Button title="+ Add" onPress={handleAddSteps} />
      </View>

      {/* Workout Time Input */}
      <Text style={styles.label}>Workout Time (hh:mm:ss):</Text>
      <View style={styles.timeInputContainer}>
        <TextInput
          style={[styles.input, styles.timeInput]}
          keyboardType="numeric"
          maxLength={2}
          placeholder="HH"
          value={hours}
          onChangeText={(value) => handleTimeChange(value, setHours, 1)}
          ref={(ref) => (inputRefs.current[0] = ref)}
        />
        <Text style={styles.colon}>:</Text>
        <TextInput
          style={[styles.input, styles.timeInput]}
          keyboardType="numeric"
          maxLength={2}
          placeholder="MM"
          value={minutes}
          onChangeText={(value) => handleTimeChange(value, setMinutes, 2)}
          ref={(ref) => (inputRefs.current[1] = ref)}
        />
        <Text style={styles.colon}>:</Text>
        <TextInput
          style={[styles.input, styles.timeInput]}
          keyboardType="numeric"
          maxLength={2}
          placeholder="SS"
          value={seconds}
          onChangeText={(value) => handleTimeChange(value, setSeconds, null)}
          ref={(ref) => (inputRefs.current[2] = ref)}
        />
        <Button title="+ Add" onPress={handleAddWorkoutTime} />
      </View>

      {/* Distance Input */}
      <Text style={styles.label}>Distance (miles):</Text>
      <View style={styles.rowContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter distance"
          value={distance}
          onChangeText={setDistance}
        />
        <Button title="+ Add" onPress={handleAddDistance} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 18,
    marginBottom: 10,
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 50,
    height: 50,
    textAlign: 'center',
  },
  colon: {
    fontSize: 24,
    marginHorizontal: 5,
  },
});
