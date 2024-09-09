// MainPage.js
import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HypeUpScreen from './HypeUpScreen';
import PaymentScreen from './PaymentScreen';
import ProfileScreen from './ProfileScreen';
import PeoplesScreen from './PeoplesScreen';
import AboutScreen from './AboutScreen';

const Tab = createBottomTabNavigator();

const MainPage = ({ route }) => {
  const { userData } = route.params;

  const getIconName = (route, focused) => {
    const icons = {
      Payment: 'card', // Custom icon name for the "Payment" route
      HypeUp: 'flame',
      Profile: 'person',
      Peoples: 'people',
      About: 'information-circle',
    };
    const outlineSuffix = focused ? '' : '-outline';
    const iconName = icons[route.name] || ''; // Get the icon name based on the route name
    return iconName + outlineSuffix; // Append outline suffix if needed
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name={getIconName(route, focused)} size={size} color={color} />
          ),
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            display: 'flex',
          },
        })}
      >
        <Tab.Screen name="Payment">
          {(props) => <PaymentScreen {...props} userData={userData} />}
        </Tab.Screen>
        <Tab.Screen name="HypeUp" initialParams={{ userData: userData }} component={HypeUpScreen} />
        <Tab.Screen name="Profile">
          {(props) => <ProfileScreen {...props} userData={userData} />}
        </Tab.Screen>
        <Tab.Screen name="Peoples">
          {(props) => <PeoplesScreen {...props} userData={userData} />}
        </Tab.Screen>
        <Tab.Screen name="About" component={AboutScreen} />
      </Tab.Navigator>
    </View>
  );
};

export default MainPage;
