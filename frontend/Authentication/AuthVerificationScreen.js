import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';

const AuthVerificationScreen = ({ route, navigation }) => {
  const [authNumber, setAuthNumber] = useState('');
  const [favPerson, setFavPerson] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState(route.params.userData.email || '');
  const [userID, setUserID] = useState(route.params.userData.userID || route.params.userData._id);

  useEffect(() => {
    console.log('Route Params:', route.params);
    console.log('Initial User Data:', route.params.userData);
    console.log('Extracted User ID:', userID);
    console.log('Extracted Email:', email); // Added to check if email is correctly extracted
  }, [route.params]);

  const handleAuthVerification = async () => {
    if (authNumber.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit authentication number.');
      return;
    }

    const binaryCode = numberToBinaryString(authNumber);
    console.log('Binary Code:', binaryCode);

    const updatedUserData = {
      ...route.params.userData,
      userID,
      authNumber: binaryCode,
      favPerson,
      schoolName
    };

    console.log('Updated User Data:', updatedUserData);

    try {
      const response = await axios.post('http://192.168.127.187:3000/update-user-data', updatedUserData);

      console.log('Server Response:', response);

      if (response.status === 200) {
        // Decode authentication number
        const decodedNumber = decodeBinaryString(updatedUserData.authNumber);

        // Display decoded number in alert
        Alert.alert('Success', `Your information has been submitted.\nDecoded Authentication Number: ${decodedNumber}`);
        
        if (route.params.userData.userType === 'user') {
          navigation.navigate('UserLogin');
        } else if (route.params.userData.userType === 'promoter') {
          navigation.navigate('ApprovalForm', { email });
        } else {
          console.error('Invalid userType:', route.params.userData.userType);
        }
      } else {
        throw new Error('Failed to update user data.');
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message || 'Failed to update user data.');
      Alert.alert('Error', 'Failed to update user data. Please try again later.');
    }
  };

  const numberToBinaryString = (number) => {
    const binaryStr = Number(number).toString(2);
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?'; // Include the same special characters as in AuthVerificationScreen
    let encodedStr = '';
  
    for (let i = 0; i < binaryStr.length; i++) {
      encodedStr += binaryStr[i] + specialChars[i % specialChars.length];
    }
  
    return encodedStr;
  };
  

  const decodeBinaryString = (binaryString) => {
    const cleanBinaryStr = binaryString.replace(/[^01]/g, '');
    const decodedNumber = parseInt(cleanBinaryStr, 2);
    return decodedNumber;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Verification</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter 4-digit authentication number"
          value={authNumber}
          onChangeText={setAuthNumber}
          style={styles.input}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Your favorite person's name"
          value={favPerson}
          onChangeText={setFavPerson}
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Your school name"
          value={schoolName}
          onChangeText={setSchoolName}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAuthVerification}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AuthVerificationScreen;
