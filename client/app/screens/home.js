import React from 'react';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StatusBarComponent from '../../components/challengeBar';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('Details');
  };

  return (
    <SafeAreaView>
      {/* Make this instance clickable */}
      <TouchableOpacity onPress={handlePress}>
        <StatusBarComponent
          primaryText="Task Progress"
          secondaryText="Remaining"
          statusValue={75}
          largeText="75%"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;