import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button, Picker, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileSettings() {
  const [graduatingClass, setGraduatingClass] = useState('');
  const [selectedMajors, setSelectedMajors] = useState([]);
  const [residentialHall, setResidentialHall] = useState('');
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [dailyGoalCategory, setDailyGoalCategory] = useState('');
  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const inputRefs = useRef([]);

  const [goalCategories, setGoalCategories] = useState([]);
  const [tagChoices, setTagChoices] = useState({});
  const [currentTags, setCurrentTags] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (storedEmail) {
          setEmail(storedEmail);
          fetchUserChallenges(storedEmail);
        } else {
          Alert.alert('Error', 'No email found in local storage');
        }
      } catch (error) {
        console.error('Error getting user email from local storage:', error);
      }
    };

    getUserEmail();
  }, []);

  const fetchUserChallenges = async (email) => {
    try {
      const response = await fetch('http://localhost:3000/get-user-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      const tags = data.tags ? data.tags.flat() : [];
      setCurrentTags(tags);
      console.log(tags); // Log the tags to verify
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalCategoriesResponse, tagChoicesResponse] = await Promise.all([
          fetch('http://localhost:3000/get-all-activities').then((res) => res.json()),
          fetch('http://localhost:3000/get-all-tag-choices').then((res) => res.json()),
        ]);
        setGoalCategories(goalCategoriesResponse);
        setTagChoices(tagChoicesResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // New useEffect to update fields based on currentTags
  useEffect(() => {
    if (currentTags.length === 0) return;

    // Check if currentTags contains elements for each field and update accordingly
    const graduatingClassTag = currentTags.find(tag => tagChoices.yearOf?.includes(tag));
    const residentialHallTag = currentTags.find(tag => tagChoices.housing?.includes(tag));
    const majorTags = currentTags.filter(tag => tagChoices.major?.includes(tag));
    const clubTags = currentTags.filter(tag => tagChoices.clubs?.includes(tag));

    if (graduatingClassTag) setGraduatingClass(graduatingClassTag);
    if (residentialHallTag) setResidentialHall(residentialHallTag);
    setSelectedMajors(majorTags);
    setSelectedClubs(clubTags);
  }, [currentTags, tagChoices]);

  const handleTimeChange = (value, setState, nextRefIndex) => {
    if (value.length === 2 && nextRefIndex !== null) {
      inputRefs.current[nextRefIndex].focus();
    }
    setState(value);
  };

  const handleUpdate = async (label, value) => {
    let updatedTags = [...currentTags];

    // If updating the graduating class, replace the old tag
    if (label === 'Graduating Class') {
      // Remove the old graduating class tag if it exists
      updatedTags = updatedTags.filter(tag => !tagChoices.yearOf?.includes(tag));
      if (value) {
        updatedTags.push(value);
      }
    }
    // Handle updates for majors, clubs, etc.
    else if (label === 'Selected Majors') {
      updatedTags = updatedTags.filter(tag => !tagChoices.major?.includes(tag));
      updatedTags.push(...value);
    } else if (label === 'Residential Hall') {
      updatedTags = updatedTags.filter(tag => !tagChoices.housing?.includes(tag));
      updatedTags.push(value);
    } else if (label === 'Selected Clubs') {
      updatedTags = updatedTags.filter(tag => !tagChoices.clubs?.includes(tag));
      updatedTags.push(...value);
    }

    try {
      const response = await fetch('http://localhost:3000/update-user-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          tags: updatedTags,
        }),
      });

      if (response.ok) {
        setCurrentTags(updatedTags);
        fetchUserChallenges(email);
        Alert.alert(`Updated ${label}: ${JSON.stringify(updatedTags)}`);

      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to update. Please try again.');
      console.error(error);
    }
  };

  const handleRemoveTag = (tagArray, setTagArray, index) => {
    const i = currentTags.indexOf(tagArray[index]);
    currentTags.splice(i, 1);
    handleUpdate('Removed', '');
  };




  return (
    <View style={styles.container}>
      <Text style={styles.label}>Graduating Class</Text>
      <Picker selectedValue={graduatingClass} onValueChange={setGraduatingClass} style={styles.picker}>
        <Picker.Item label="Select Graduating Class" value="" />
        {tagChoices.yearOf?.map((year, index) => (
          <Picker.Item key={index} label={year} value={year} />
        ))}
      </Picker>
      <Button title="Update Graduating Class" onPress={() => handleUpdate('Graduating Class', graduatingClass)} />

      <Text style={styles.label}>Majors</Text>
      <Picker
        selectedValue={selectedMajors[0] || ''}
        onValueChange={(value) => value && setSelectedMajors([...selectedMajors, value])}
        style={styles.picker}
      >
        <Picker.Item label="Select a Major" value="" />
        {tagChoices.major?.map((major, index) => (
          <Picker.Item key={index} label={major} value={major} />
        ))}
      </Picker>
      <Button title="Update Majors" onPress={() => handleUpdate('Selected Majors', selectedMajors)} />

      <FlatList
        data={selectedMajors.filter(major => currentTags.includes(major))} // Filter majors
        renderItem={({ item, index }) => (
          <View style={styles.tagContainer}>
            <Text>{item}</Text>
            <Button title="Remove" onPress={() => handleRemoveTag(selectedMajors, setSelectedMajors, index)} />
          </View>
        )}
        keyExtractor={(item) => item}
      />

      <Text style={styles.label}>Residential Hall</Text>
      <Picker selectedValue={residentialHall} onValueChange={setResidentialHall} style={styles.picker}>
        <Picker.Item label="Select Residential Hall" value="" />
        {tagChoices.housing?.map((hall, index) => (
          <Picker.Item key={index} label={hall} value={hall} />
        ))}
      </Picker>
      <Button title="Update Residential Hall" onPress={() => handleUpdate('Residential Hall', residentialHall)} />

      <Text style={styles.label}>Clubs</Text>
      <Picker
        selectedValue={selectedClubs[0] || ''}
        onValueChange={(value) => value && setSelectedClubs([...selectedClubs, value])}
        style={styles.picker}
      >
        <Picker.Item label="Select a Club" value="" />
        {tagChoices.clubs?.map((club, index) => (
          <Picker.Item key={index} label={club} value={club} />
        ))}
      </Picker>
      <Button title="Update Clubs" onPress={() => handleUpdate('Selected Clubs', selectedClubs)} />

      <FlatList
        data={selectedClubs.filter(club => currentTags.includes(club))} // Filter clubs
        renderItem={({ item, index }) => (
          <View style={styles.tagContainer}>
            <Text>{item}</Text>
            <Button title="Remove" onPress={() => handleRemoveTag(selectedClubs, setSelectedClubs, index)} />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <Text style={styles.label}>Daily Goals</Text>
      <Picker selectedValue={dailyGoalCategory} onValueChange={setDailyGoalCategory} style={styles.picker}>
        <Picker.Item label="Select a Goal Category" value="" />
        {goalCategories.map((category, index) => (
          <Picker.Item key={index} label={category} value={category} />
        ))}
      </Picker>

      {dailyGoalCategory === 'calories' && (
        <>
          <TextInput style={styles.input} placeholder="Enter calories" value={calories} keyboardType="numeric" onChangeText={setCalories} />
          <Button title="Add Calories" onPress={() => console.log('Calories Burned', calories)} />
        </>
      )}

      {dailyGoalCategory === 'steps' && (
        <>
          <TextInput style={styles.input} placeholder="Enter steps" value={steps} keyboardType="numeric" onChangeText={setSteps} />
          <Button title="Add Steps" onPress={() => console.log('Steps Taken', steps)} />
        </>
      )}

      {dailyGoalCategory === 'distance' && (
        <>
          <TextInput style={styles.input} placeholder="Enter distance (miles)" value={distance} keyboardType="numeric" onChangeText={setDistance} />
          <Button title="Add Distance" onPress={() => console.log('Distance Traveled', distance)} />
        </>
      )}

      {dailyGoalCategory === 'time' && (
        <View style={styles.timeInputContainer}>
          <TextInput style={[styles.input, styles.timeInput]} keyboardType="numeric" maxLength={2} placeholder="HH" value={hours} onChangeText={(value) => handleTimeChange(value, setHours, 1)} ref={(ref) => (inputRefs.current[0] = ref)} />
          <Text style={styles.colon}>:</Text>
          <TextInput style={[styles.input, styles.timeInput]} keyboardType="numeric" maxLength={2} placeholder="MM" value={minutes} onChangeText={(value) => handleTimeChange(value, setMinutes, 2)} ref={(ref) => (inputRefs.current[1] = ref)} />
          <Text style={styles.colon}>:</Text>
          <TextInput style={[styles.input, styles.timeInput]} keyboardType="numeric" maxLength={2} placeholder="SS" value={seconds} onChangeText={(value) => handleTimeChange(value, setSeconds, null)} ref={(ref) => (inputRefs.current[2] = ref)} />
          <Button title="Add Time" onPress={() => console.log('Time Tracked', `${hours}:${minutes}:${seconds}`)} />
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  picker: {
    height: 50,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 50,
    textAlign: 'center',
  },
  colon: {
    fontSize: 18,
  },
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
});