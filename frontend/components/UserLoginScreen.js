// UserLoginScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image  } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const storeToken = async ({ token, userType, userID, name, email }) => {
  try {
    const key = email.replace(/[@.]/g, (match) => (match === '@' ? '-' : '_'));
    const userData = { token, userType, userID, name, email };
    await SecureStore.setItemAsync(key, JSON.stringify(userData));
    console.log('Token, userType, userID, name, and email stored successfully');
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
};

const UserLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Hardcoded admin credentials for inbuilt authentication
    const adminCredentials = {
      email: 'admin',
      password: 'admin123',
    };
  
    // Check if provided credentials match the admin credentials
    if (email === adminCredentials.email && password === adminCredentials.password) {
      // Simulate token generation for successful login
      const token = 'simulated_token';
  
      // Store the token in AsyncStorage or secure storage for future use
      storeToken(token);
  
      // Navigate to the AdminDashboard screen
      navigation.navigate('AdminDashboard');
      return;
    }
  
    // Regular user login process
    const apiUrl = 'http://192.168.127.187:3000/login';
    let userData;
  
    // Check if the input resembles an email address
    const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
    // Determine whether to use email or name for login
    if (isEmailFormat) {
      userData = {
        email,
        password,
        userType: 'user' // Assuming it's for user login
      };
    } else {
      userData = {
        name: email, // Assuming name is used
        password,
        userType: 'user' // Assuming it's for user login
      };
    }
  
    try {
      const response = await axios.post(apiUrl, userData);
  
      if (response.status === 200) {
        const { user, token } = response.data; // Extract user and token from response

        // Ensure token, userType, and userID exist before storing
        if (token && user.userType && user._id && user.name && user.email) {
          // Store the token, userType, userID, name, and email in AsyncStorage or secure storage for future use
          await storeToken({ token, userType: user.userType, userID: user._id, name: user.name, email: user.email });
        } else {
          console.error('Token, userType, or userID not found in response');
        }
        console.log('User Logged in:', user);
          // Navigate to MainPage with user data
          navigation.navigate('MainPage', { userData: user }); // Pass user data to MainPage
        } else {
          throw new Error('Failed to login');
        }
      } catch (error) {
        console.error('Login failed:', error.message || 'Failed to login');
        Alert.alert('Login failed', error.message || 'Failed to login');
      }
    };
  

  // Function to handle navigation to the registration page
  const handleRegister = () => {
    // Navigate to the Registration page
    navigation.navigate('Registration');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ResetPasswordWithAuth', {
      userData: { email }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Login</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCompleteType="email"
          textContentType="email"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          autoCompleteType="password"
          textContentType="password"
        />
      </View>
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleRegister}>
        <Text style={styles.registerText}>Don't have an account? Register now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    width: 300,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
  },
  registerText: {
    marginTop: 10,
    color: 'blue', // Customize the text color
  },
  forgotPasswordText: {
    marginTop: 10,
    color: 'blue',
  },
});

export default UserLoginScreen;
