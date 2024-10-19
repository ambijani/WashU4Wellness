import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function ActivityMonitor() {
  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');

  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  const inputRefs = useRef([]);

  // Handle Workout Time Change
  const handleTimeChange = (value, setState, nextRefIndex) => {
    if (value.length === 2 && nextRefIndex !== null) {
      inputRefs.current[nextRefIndex].focus();
    }
    setState(value);
  };

  const handleAddCalories = () => {
    alert(`Calories Burned: ${calories}`);
    setCalories(''); // Clear input field
  };

  const handleAddSteps = () => {
    alert(`Steps Taken: ${steps}`);
    setSteps(''); // Clear input field
  };

  const handleAddWorkoutTime = () => {
    const workoutTime = `${hours}:${minutes}:${seconds}`;
    alert(`Workout Time: ${workoutTime}`);
    setHours(''); // Clear input fields
    setMinutes('');
    setSeconds('');
  };

  const handleAddDistance = () => {
    alert(`Distance: ${distance}`);
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
    height: 50, // Ensure the height is equal to the width to make it square
    textAlign: 'center',
  },
  colon: {
    fontSize: 24,
    marginHorizontal: 5,
  },
});
