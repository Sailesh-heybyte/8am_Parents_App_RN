import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home';
import ChildDetailsScreen from '../screens/ChildDetails';
import TripHistoryScreen from '../screens/TripHistory';
import TripDetailScreen from '../screens/TripDetail';
import AnnouncementsScreen from '../screens/Announcements';
import ComplaintsScreen from '../screens/Complaints';
import AlertSettingsScreen from '../screens/AlertSettings';
import TrackBus from '../screens/TrackBus';
import HomeLocation from '../screens/HomeLocation';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ChildDetails" component={ChildDetailsScreen} />
      <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="Complaints" component={ComplaintsScreen} />
      <Stack.Screen name="AlertSettings" component={AlertSettingsScreen} />
      <Stack.Screen name="TrackBus" component={TrackBus} />
      <Stack.Screen name="HomeLocation" component={HomeLocation} />
    </Stack.Navigator>
  );
}
