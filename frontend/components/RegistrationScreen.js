import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { storeToken } from 'C:/Promo/frontend/storage/AsyncStorageUtils'; // Update with your actual path
import * as SecureStore from 'expo-secure-store';

const RegistrationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('Select Country');
  const [state, setState] = useState('Select State');
  const [userType, setUserType] = useState('Select User Type');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle user registration
  const handleRegister = async () => {
    console.log('Registration button pressed');

    // Validate passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    // Validate all required fields are filled
    if (!name || !email || !password || country === 'Select Country' || state === 'Select State' || userType === 'Select User Type') {
      Alert.alert('Error', 'Please fill all fields before submitting');
      return;
    }

    const apiUrl = 'http://192.168.127.187:3000/register';
    console.log('Sending request to:', apiUrl);    
    const userData = {
      name,
      email,
      password,
      country,
      state,
      userType
    };

    setIsLoading(true); // Start loading

    try {
      const response = await axios.post(apiUrl, userData);

      console.log('Response data:', response.data);

      if (response.status === 201) {
        const { user, token } = response.data;
        const registrationDate = new Date(user.registeredAt);
        const formattedDate = registrationDate.toLocaleString();
        Alert.alert(
          'Success',
          `Registration successful!\nRegistered At: ${formattedDate}`,
        );

        // Store token and user data securely
        if (token) {
          const userDataToStore = { token, userType: user.userType, userID: user._id, name: user.name, email: user.email };
          storeToken(userDataToStore);

          // Store credentials based on platform
          if (Platform.OS === 'web') {
            const cred = new PasswordCredential({
              id: email,
              name: name,
              password: password,
            });
            navigator.credentials.store(cred).then(() => {
              console.log('Credentials saved to the browser.');
            }).catch(error => {
              console.error('Error saving credentials to the browser:', error);
            });
          }

          if (Platform.OS === 'android') {
            try {
              await SecureStore.setItemAsync('email', email);
              await SecureStore.setItemAsync('password', password);
              console.log('Credentials saved in SecureStore.');
            } catch (error) {
              console.error('Error saving credentials to SecureStore:', error);
            }
          }

          console.log('User Registered:', user);
          console.log('Retrieved Token:', token); // Console log to check if token is retrieved correctly
          navigation.navigate('AuthVerification', { userData: userDataToStore });
        } else {
          throw new Error('Token not found in response');
        }
      }
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response) {
        console.error('Server responded with status:', error.response.status);
        console.error('Response data:', error.response.data);
        Alert.alert('Registration failed', error.response.data.message || 'Failed to register');
      } else if (error.request) {
        console.error('No response received:', error.request);
        Alert.alert('Registration failed', 'No response received from server');
      } else {
        console.error('Request setup error:', error.message);
        Alert.alert('Registration failed', 'Error setting up request');
      }
    } finally {
      setIsLoading(false); // Stop loading
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Registration</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCompleteType="name"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCompleteType="email"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            autoCompleteType="password"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Text>{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            autoCompleteType="password"
          />
        </View>
        <Picker
          selectedValue={country}
          style={styles.picker}
          onValueChange={(itemValue) => {
            setCountry(itemValue);
            if (itemValue !== "Select Country") {
              setState('Select State');
            }
          }}
        >
          <Picker.Item label="Select Country" value="Select Country" />
          <Picker.Item label="India" value="India" />
        </Picker>
        <Picker
          selectedValue={state}
          style={styles.picker}
          onValueChange={setState}
          enabled={country !== "Select Country"}
        >
          <Picker.Item label="Select State" value="Select State" />
          {country === "India" && <Picker.Item label="Karnataka" value="Karnataka" />}
        </Picker>
        <Picker
          selectedValue={userType}
          style={styles.picker}
          onValueChange={setUserType}
        >
          <Picker.Item label="Select User Type" value="Select User Type" />
          <Picker.Item label="User" value="user" />
          <Picker.Item label="Promoter" value="promoter" />
        </Picker>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button title="Register" onPress={handleRegister} />
        )}
        <TouchableOpacity onPress={() => navigation.navigate('UserLogin')}>
          <Text style={styles.redirectText}>Already a user? User Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('PromoterLogin')}>
          <Text style={styles.redirectText}>Already a promoter? Promoter Login</Text>
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
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    padding: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
  },
  picker: {
    height: 50,
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  redirectText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#888',
    textDecorationLine: 'underline',
  },
});

export default RegistrationScreen;
