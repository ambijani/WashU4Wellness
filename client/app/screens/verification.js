// screens/VerificationScreen.js
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerificationScreen({ navigation }) {
  const [code, setCode] = useState(['', '', '', '', '', '']); // 6 digits state
  const [email, setEmail] = useState(''); // To store the email from AsyncStorage

  // Create refs for each input box
  const inputRefs = useRef([]);

  // Get email from local storage on component mount
  useEffect(() => {
    const getEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    };

    getEmail();
  }, []);

  // Function to handle text change for each input
  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Move to the next input if there is a valid number
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // If the user removes input, move back to the previous box
    if (!text && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length === 6) {
      try {
        const response = await fetch(`http://localhost:3000/verify-token/${verificationCode}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          // Handle successful verification (you can navigate or show a success message)
          Alert.alert('Success', 'Code verified successfully!');
          navigation.navigate('Activity'); // Navigate on successful verification
        } else {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'Verification failed.');
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to verify the code. Please try again.');
        console.error(error);
      }
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit code.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter 6-Digit Verification Code</Text>
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            ref={(ref) => (inputRefs.current[index] = ref)}
          />
        ))}
      </View>
      <Button title="Verify Code" onPress={handleVerify} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    marginRight: 5,
  },
});
