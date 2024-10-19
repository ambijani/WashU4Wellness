import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import * as Progress from 'react-native-progress';

// Get the width of the screen for scaling
const screenWidth = Dimensions.get('window').width;

const StatusBarComponent = ({ primaryText, secondaryText, statusValue, largeText }) => {
  return (
    <View style={styles.container}>
      {/* Top row with primary and secondary text */}
      <View style={styles.topRow}>
        <Text style={styles.primaryText}>{primaryText}</Text>
        <Text style={styles.secondaryText}>{secondaryText}</Text>
      </View>

      {/* Status bar and large text */}
      <View style={styles.statusBarRow}>
        {/* Status Bar */}
        <Progress.Bar
          progress={statusValue / 100}
          width={screenWidth * 0.6}
          height={30}
          color="#4caf50"
          unfilledColor="#e0e0e0"
          borderRadius={5}
        />
        {/* Large Text next to the Status Bar */}
        <Text style={styles.largeText}>{largeText}</Text>
      </View>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ensures text is left and right aligned
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left', // Explicit left alignment for primary text
    flex: 1, // Ensures it takes up available space
  },
  secondaryText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'right', // Right-align the secondary text
    flex: 1, // Ensures it takes up available space
  },
  statusBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  largeText: {
    fontSize: 24,
    marginLeft: 10, // Add space between progress bar and large text
  },
});

export default StatusBarComponent;
