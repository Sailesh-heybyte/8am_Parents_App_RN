import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home';
import ChildDetailsScreen from '../screens/ChildDetails';
import TripHistoryScreen from '../screens/TripHistory';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ChildDetails" component={ChildDetailsScreen} />
      <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
    </Stack.Navigator>
  );
}
