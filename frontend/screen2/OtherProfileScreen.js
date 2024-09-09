import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OtherProfileScreen = ({ route }) => {
  const { name, email, country, state, userType } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.profileIconContainer}>
        <Ionicons name="person-circle-outline" size={100} color="blue" />
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.userInfo}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="person" size={24} color="black" style={styles.icon} />
            <Text style={styles.text}>{name}</Text>
          </View>
        </View>
        <View style={styles.line} />
        <View style={styles.userInfo}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="mail" size={24} color="black" style={styles.icon} />
            <Text style={styles.text}>{email}</Text>
          </View>
        </View>
        <View style={styles.line} />
        <View style={styles.userInfo}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="earth" size={24} color="black" style={styles.icon} />
            <Text style={styles.text}>{country}, {state}</Text>
          </View>
        </View>
        <View style={styles.line} />
        <View style={styles.userInfo}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="person-circle" size={24} color="black" style={styles.icon} />
            <Text style={styles.text}>User Type: {userType}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileIconContainer: {
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginBottom: 10,
  },
});

export default OtherProfileScreen;
