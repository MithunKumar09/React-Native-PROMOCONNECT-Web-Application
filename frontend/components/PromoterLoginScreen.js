import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '../storage/AsyncStorageUtils';

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

const PromoterLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const apiUrl = 'http://192.168.127.187:3000/login'; // Update API URL to your local server
    let userData;

    // Check if the input resembles an email address
    const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Determine whether to use email or name for login
    if (isEmailFormat) {
      userData = {
        email,
        password,
        userType: 'promoter'
      };
    } else {
      userData = {
        name: email, // Assuming name is used
        password,
        userType: 'promoter'
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

        console.log('Promoter Logged in:', user);
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
      <View style={styles.card}>
        <Ionicons name="person-circle-outline" size={100} color="#FF4500" style={styles.logo} />
        <Text style={styles.title}>Promoter Login</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="#FF4500" style={styles.icon} />
          <TextInput
            placeholder="Email/Username"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCompleteType="email"
            textContentType="emailAddress"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#FF4500" style={styles.icon} />
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
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerText}>Don't have an account? Register now</Text>
        </TouchableOpacity>
      </View>
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
  card: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
  button: {
    width: '100%',
    backgroundColor: '#FF4500',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    marginTop: 15,
    color: 'blue',
  },
  registerText: {
    marginTop: 10,
    color: 'blue',
  },
});

export default PromoterLoginScreen;
