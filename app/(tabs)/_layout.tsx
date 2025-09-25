import { Redirect } from 'expo-router';
import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import DashboardScreen from '../../screens/DashboardScreen';

export default function TabLayout() {
  const { user } = useAuth();

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  // Return the dashboard screen directly without tabs
  return <DashboardScreen />;
}
