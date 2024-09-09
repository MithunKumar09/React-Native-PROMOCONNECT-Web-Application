import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ResetPasswordWithAuthScreen = ({ route }) => {
  const [email, setEmail] = useState(route.params?.userData?.email || '');
  const [authNumber, setAuthNumber] = useState('');
  const [favPerson, setFavPerson] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUserDataFetched, setIsUserDataFetched] = useState(false);
  const navigation = useNavigation();

  const sanitizeKey = (key) => key.replace(/[@.]/g, (match) => (match === '@' ? '-' : '_'));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (email) {
          const key = sanitizeKey(email);
          const storedUserData = await SecureStore.getItemAsync(key);

          if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);

            if (parsedUserData.userID && parsedUserData.userType) {
              setUserData(parsedUserData);
              setIsUserDataFetched(true);
            } else {
              setIsUserDataFetched(false);
            }
          } else {
            setIsUserDataFetched(false);
          }
        } else {
          setIsUserDataFetched(false);
        }
      } catch (error) {
        setIsUserDataFetched(false);
      }
    };

    fetchUserData();
  }, [email]);

  const numberToBinaryString = (number) => {
    const binaryStr = Number(number).toString(2);
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?'; // Include the same special characters as in the backend
    let encodedStr = '';

    for (let i = 0; i < binaryStr.length; i++) {
      encodedStr += binaryStr[i] + specialChars[i % specialChars.length];
    }

    return encodedStr;
  };

  const transformBinaryCode = (binaryCode) => {
    // No transformation needed since binaryCode is already in 'N!a@N#' format
    return binaryCode;
  };

  const decodeBinaryString = (binaryString) => {
    const cleanBinaryStr = binaryString.replace(/[^01]/g, ''); // Remove all non-binary characters
    const decodedNumber = parseInt(cleanBinaryStr, 2); // Convert binary string to decimal
    return decodedNumber;
  };

  const handleVerify = async () => {
    const apiUrl = 'http://192.168.127.187:3000/reset-password-with-auth/verify';

    try {
      if (!email || !authNumber || !favPerson || !schoolName) {
        throw new Error("All fields are required");
      }

      if (!userData) {
        throw new Error("User data is incomplete");
      }

      const binaryCode = numberToBinaryString(authNumber);
      console.log('Binary Code:', binaryCode);

      const transformedBinaryCode = transformBinaryCode(binaryCode);
      console.log('Transformed Binary Code:', transformedBinaryCode);

      // Decode the transformed binary code to check
      const decodedAuthNumber = decodeBinaryString(transformedBinaryCode);

      if (decodedAuthNumber !== parseInt(authNumber, 10)) {
        throw new Error("Decoded authentication number does not match the original");
      }

      const requestData = {
        email,
        authNumber: transformedBinaryCode,
        favPerson,
        schoolName,
        userID: userData.userID,
        userType: userData.userType,
      };

      const verifyResponse = await axios.post(apiUrl, requestData);

      if (verifyResponse.status === 200 && verifyResponse.data.message === "Authentication successful") {
        setIsAuthenticated(true);
        Alert.alert('Success', 'Authentication successful. Please enter your new password.');
        // Proceed to password reset
        handleResetPassword();
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      Alert.alert('Verification failed', error.response ? error.response.data.error : error.message);
    }
  };

  const authenticate = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      Alert.alert('Error', 'Your device does not support biometric authentication.');
      return false;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      Alert.alert('Error', 'No biometric credentials found. Please enroll in your device settings.');
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to reset password',
      fallbackLabel: 'Enter device PIN',
    });

    if (result.success) {
      return true;
    } else {
      Alert.alert('Authentication failed', 'Could not authenticate. Please try again.');
      return false;
    }
  };

  const handleResetPassword = async () => {
    const apiUrl = 'http://192.168.127.187:3000/reset-password-with-auth';

    try {
      if (!newPassword) {
        throw new Error("New password is required");
      }

      const isAuthenticated = await authenticate();
      if (!isAuthenticated) return;

      const binaryCode = numberToBinaryString(authNumber);
      const transformedBinaryCode = transformBinaryCode(binaryCode);

      const requestData = {
        email,
        binaryCode: transformedBinaryCode,
        favPerson,
        schoolName,
        newPassword,
        userID: userData.userID,
        userType: userData.userType,
      };

      const resetResponse = await axios.post(apiUrl, requestData);

      if (resetResponse.status === 200) {
        Alert.alert('Success', 'Password has been reset successfully', [
          { text: 'OK', onPress: () => navigateBasedOnUserType() } // Navigate based on userType after OK is pressed
        ]);
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Reset password failed', error.response ? error.response.data.error : error.message);
    }
  };

  const navigateBasedOnUserType = () => {
    if (userData && userData.userType === 'user') {
      navigation.navigate('UserLogin'); // Navigate to UserLogin if userType is user
    } else if (userData && userData.userType === 'promoter') {
      navigation.navigate('PromoterLogin'); // Navigate to PromoterLogin if userType is promoter
    } else {
      console.error('Invalid userType');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="gray" style={styles.icon} />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCompleteType="email"
            textContentType="emailAddress"
          />
        </View>
        {email && !isUserDataFetched ? (
          <Text style={styles.errorText}>Failed to retrieve user data</Text>
        ) : null}
        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={24} color="gray" style={styles.icon} />
          <TextInput
            placeholder="Enter Authentication Number"
            value={authNumber}
            onChangeText={setAuthNumber}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={24} color="gray" style={styles.icon} />
          <TextInput
            placeholder="Favourite Person"
            value={favPerson}
            onChangeText={setFavPerson}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="school-outline" size={24} color="gray" style={styles.icon} />
          <TextInput
            placeholder="Name of your school"
            value={schoolName}
            onChangeText={setSchoolName}
            style={styles.input}
          />
        </View>
        {isAuthenticated ? (
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="gray" style={styles.icon} />
            <TextInput
              placeholder="Enter New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  card: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default ResetPasswordWithAuthScreen;
