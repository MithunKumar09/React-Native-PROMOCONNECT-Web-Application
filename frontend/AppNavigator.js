// AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import AdminDashboardScreen from './Dashboard/AdminDashboard';
import MainPage from './screen2/MainPage';
import RegistrationScreen from './components/RegistrationScreen';
import UserLoginScreen from './components/UserLoginScreen';
import PromoterLoginScreen from './components/PromoterLoginScreen';
import ResetPasswordWithAuthScreen from './Authentication/ResetPasswordWithAuthScreen';
import OtherProfileScreen from './screen2/OtherProfileScreen';
import Chatting from './chat/Chatting';
import AboutScreen from './screen2/AboutScreen';
import AuthVerificationScreen from './Authentication/AuthVerificationScreen';
import ApprovalForm from './Authentication/ApprovalForm';
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="MainPage" component={MainPage} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen name="UserLogin" component={UserLoginScreen} />
      <Stack.Screen name="PromoterLogin" component={PromoterLoginScreen} />
      <Stack.Screen name="AuthVerification" component={AuthVerificationScreen} />
      <Stack.Screen name="ResetPasswordWithAuth" component={ResetPasswordWithAuthScreen} />
      <Stack.Screen name="Chat" component={Chatting} />
      <Stack.Screen name="OtherProfileScreen" component={OtherProfileScreen} /> 
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="ApprovalForm" component={ApprovalForm} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
