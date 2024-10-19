// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LoginScreen from '@/app/screens/login.js';
import SignupScreen from '@/app/screens/signup.js';
import VerificationScreen from '@/app/screens/verification.js'
import ActivityScreen from '@/app/screens/activity.js'
import HomeScreen from '@/app/screens/home.js';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  return (
    // <NavigationContainer independent={true}>
    //   <Stack.Navigator initialRouteName="Home">
    //     <Stack.Screen name="Home" component={HomeScreen} />
    //     <Stack.Screen name="Login" component={LoginScreen} />
    //     <Stack.Screen name="Signup" component={SignupScreen} />
    //     <Stack.Screen name="Verification" component={VerificationScreen} />
    //     <Stack.Screen name="Activity" component={ActivityScreen} />
    //   </Stack.Navigator>
    // </NavigationContainer>
    <NavigationContainer independent={true}>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Activity" component={ActivityScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
