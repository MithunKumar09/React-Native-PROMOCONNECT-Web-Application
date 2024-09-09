import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getToken, removeToken } from '../storage/AsyncStorageUtils';
import { useNavigation } from '@react-navigation/native';
import { CheckBox as ThemedCheckBox } from 'react-native-elements';

const ProfileScreen = ({ userData: initialUserData }) => {
  const navigation = useNavigation();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [gender, setGender] = useState(initialUserData.gender || '');
  const [instagrammer, setInstagrammer] = useState(initialUserData.instagrammer || false);
  const [youtuber, setYoutuber] = useState(initialUserData.youtuber || false);
  const [token, setToken] = useState('');
  const [updating, setUpdating] = useState(false);
  const [userData, setUserData] = useState(initialUserData);

  useEffect(() => {
    const fetchTokenAndUserInfo = async () => {
      try {
        const tokenData = await getToken();
        if (tokenData && tokenData.token) {
          setToken(tokenData.token);
        } else {
          console.log('Token not found');
        }
      } catch (error) {
        console.error('Error fetching token:', error.message);
      }
    };

    fetchTokenAndUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await removeToken();
      navigation.reset({
        index: 0,
        routes: [{ name: userData?.userType === 'user' ? 'UserLogin' : 'PromoterLogin' }],
      });
    } catch (error) {
      console.error('Error logging out:', error.message);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleAddDetails = () => {
    setShowEditProfile(true);
  };

  const handleUpdateDetails = async () => {
    try {
      const response = await fetch(`http://192.168.127.187:3000/profile/${userData.userType}/${userData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gender, instagrammer, youtuber }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Details updated successfully');
        setUpdating(true);
        setTimeout(() => {
          setUserData({ ...userData, gender, instagrammer, youtuber });
          setShowEditProfile(false);
          setUpdating(false);
          Alert.alert('Success', 'Details updated successfully');
        }, 2000);
      } else {
        console.error('Failed to update details:', data.error || 'Unknown error');
        Alert.alert('Error', 'Failed to update details');
      }
    } catch (error) {
      console.error('Error updating details:', error.message || 'Unknown error');
      Alert.alert('Error', 'Failed to update details');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Colored Icon as Logo */}
        <Ionicons name="person-circle-outline" size={80} color="#FF6347" />
        {userData.userType === 'promoter' && (
          <View style={styles.verifiedContainer}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#00FF00" style={styles.verifiedIcon} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        {userData && (
          <>
            <View style={styles.detailContainer}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.detail}>{userData.name}</Text>
            </View>
            <View style={styles.detailContainer}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.detail}>{userData.email}</Text>
            </View>
            <View style={styles.detailContainer}>
              <Text style={styles.label}>Country:</Text>
              <Text style={styles.detail}>{userData.country}</Text>
            </View>
            <View style={styles.detailContainer}>
              <Text style={styles.label}>State:</Text>
              <Text style={styles.detail}>{userData.state}</Text>
            </View>
            {userData.userType && (
              <View style={styles.detailContainer}>
                <Text style={styles.label}>User Type:</Text>
                <Text style={styles.detail}>{userData.userType}</Text>
              </View>
            )}
            {gender !== '' && (
              <View style={styles.detailContainer}>
                <Text style={styles.label}>Gender:</Text>
                <Text style={styles.detail}>{gender}</Text>
              </View>
            )}
            {instagrammer && (
              <View style={styles.detailContainer}>
                <Text style={styles.label}>Instagrammer:</Text>
                <Ionicons name="logo-instagram" size={24} color="#FF6347" />
              </View>
            )}
            {youtuber && (
              <View style={styles.detailContainer}>
                <Text style={styles.label}>Youtuber:</Text>
                <Ionicons name="logo-youtube" size={24} color="#FF6347" />
              </View>
            )}
          </>
        )}
        {!showEditProfile && (
          <TouchableOpacity onPress={handleAddDetails} style={styles.button}>
            <Text style={styles.buttonText}>Add More Details</Text>
          </TouchableOpacity>
        )}
        {showEditProfile && (
          <>
            <View style={styles.formContainer}>
              <Text style={[styles.label, styles.text]}>Gender:</Text>
              <View style={styles.radioButtonGroup}>
                <TouchableOpacity
                  style={[styles.radioButton, gender === 'male' && styles.radioButtonSelected]}
                  onPress={() => setGender('male')}>
                  <Text>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, gender === 'female' && styles.radioButtonSelected]}
                  onPress={() => setGender('female')}>
                  <Text>Female</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, gender === 'other' && styles.radioButtonSelected]}
                  onPress={() => setGender('other')}>
                  <Text>Other</Text>
                </TouchableOpacity>
              </View>
              <ThemedCheckBox
                title="Instagrammer"
                checked={instagrammer}
                onPress={() => setInstagrammer(!instagrammer)}
              />
              <ThemedCheckBox
                title="Youtuber"
                checked={youtuber}
                onPress={() => setYoutuber(!youtuber)}
              />
            </View>
            <TouchableOpacity onPress={handleUpdateDetails} disabled={updating} style={styles.button}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <Text style={styles.buttonText}>Logout</Text>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  verifiedIcon: {
    marginRight: 5,
  },
  verifiedText: {
    color: '#00FF00',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    width: 80,
  },
  detail: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  formContainer: {
    marginTop: 20,
    width: '100%',
  },
  radioButtonGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radioButton: {
    marginRight: 20,
    borderWidth: 1,
    padding: 10,
  },
  radioButtonSelected: {
    backgroundColor: 'lightblue',
  },
});

export default ProfileScreen;
