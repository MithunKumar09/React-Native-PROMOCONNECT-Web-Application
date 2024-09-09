import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../storage/AsyncStorageUtils';

const PeoplesScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [promoters, setPromoters] = useState([]);
  const [userType, setUserType] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { token, userType, userID, name, email } = await getToken();
        console.log('Token:', token);
        console.log('User Type:', userType);
        console.log('User ID:', userID);
        console.log('User Name:', name);
        console.log('User Email:', email);
        setCurrentUserId(userID); // Set the current user's ID
        setUserType(userType);

        if (userType === 'user') {
          const promoterResponse = await fetch('http://192.168.127.187:3000/promoters', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const promoterData = await promoterResponse.json();
          setPromoters(promoterData);
        }

        if (userType === 'promoter') {
          const userResponse = await fetch('http://192.168.127.187:3000/users', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const userData = await userResponse.json();
          setUsers(userData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const toggleDropdown = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const isExpanded = (userId) => {
    return expandedUserId === userId;
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const filteredPromoters = promoters.filter(promoter =>
    promoter.name?.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const handleChat = (recipientId, name, email, userType, messageData = {}) => {
    // Get the current date and time
    const currentTime = new Date().toISOString().slice(0, 10);

    // Create the message object with regular messageType format
    const message = {
      messageType: 'regular',
      senderType: userType,
      senderName: name,
      message: messageData.message || '', // Use the provided message or an empty string
      time: currentTime,
      ...messageData // Spread the additional message data if provided
    };

    // Navigate to the chat screen with the selected user ID and profile information
    console.log("Selected User Data:", { userId: recipientId, userName: name, userEmail: email, userType: userType, messageData: message });
    navigation.navigate('Chat', {
      userId: recipientId,
      userName: name,
      userEmail: email,
      userType: userType,
      messageData: message,
    });
  };

  const handleProfile = (userData) => {
    console.log("User Data:", userData);
    console.log("User Type:", userData.userType);
    navigation.navigate('OtherProfileScreen', {
      userId: userData.userID,
      name: userData.name,
      email: userData.email,
      country: userData.country,
      state: userData.state,
      userType: userData.userType,
    });
  };

  return (
    <View>
      {userType !== 'user' && (
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Users</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>
      )}
      <View>
        {filteredUsers.map(user => (
          <TouchableOpacity key={user.userID} onPress={() => handleProfile(user, 'user')} style={[styles.card, isExpanded(user.userID) && styles.expandedCard]}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={24} color="black" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleDropdown(user.userID)} style={styles.dropdownIcon}>
              <Ionicons name={isExpanded(user.userID) ? 'caret-up' : 'caret-down'} size={24} color="black" />
            </TouchableOpacity>
            {isExpanded(user.userID) && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropdownOption} onPress={() => handleChat(user.userID, user.name, user.email, 'user')}>
                  <Text>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownOption}>
                  <Text>Payment</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {userType !== 'promoter' && (
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Promoters</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>
      )}
      <View>
        {filteredPromoters.map(promoter => (
          <TouchableOpacity key={promoter.userID} onPress={() => handleProfile(promoter, 'promoter')} style={[styles.card, isExpanded(promoter.userID) && styles.expandedCard]}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={24} color="black" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{promoter.name}</Text>
              <Text style={styles.userEmail}>{promoter.email}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleDropdown(promoter.userID)} style={styles.dropdownIcon}>
              <Ionicons name={isExpanded(promoter.userID) ? 'caret-up' : 'caret-down'} size={24} color="black" />
            </TouchableOpacity>
            {isExpanded(promoter.userID) && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropdownOption} onPress={() => handleChat(promoter.userID, promoter.name, promoter.email, 'promoter')}>
                  <Text>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownOption}>
                  <Text>Payment</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 6,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  expandedCard: {
    marginBottom: 50,
  },
  profileIcon: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: 'gray',
  },
  dropdownIcon: {
    padding: 8,
  },
  dropdown: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 8,
  },
  dropdownOption: {
    paddingVertical: 8,
  },
});

export default PeoplesScreen;
