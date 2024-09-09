// frontend/Dashboard/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import axios from 'axios';
import { BarChart } from 'react-native-chart-kit';

const Tab = createMaterialTopTabNavigator();

const UsersTab = ({ users }) => (
  <FlatList
    data={users}
    renderItem={({ item }) => (
      <View style={styles.item}>
        <Text style={styles.userInfo}>Name: {item.name}</Text>
        <Text style={styles.userInfo}>Email: {item.email}</Text>
        <Text style={styles.userInfo}>Country: {item.country}</Text>
        <Text style={styles.userInfo}>State: {item.state}</Text>
        <Text style={styles.userInfo}>Registered At: {item.registeredAt}</Text>
        <Text style={styles.userInfo}>User ID: {item.userID}</Text>
      </View>
    )}
    keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
  />
);

const PromotersTab = ({ promoters }) => (
  <FlatList
    data={promoters}
    renderItem={({ item }) => (
      <View style={styles.item}>
        <Text style={styles.userInfo}>Name: {item.name}</Text>
        <Text style={styles.userInfo}>Email: {item.email}</Text>
        <Text style={styles.userInfo}>Country: {item.country}</Text>
        <Text style={styles.userInfo}>State: {item.state}</Text>
        <Text style={styles.userInfo}>Registered At: {item.registeredAt}</Text>
        <Text style={styles.userInfo}>User ID: {item.userID}</Text>
      </View>
    )}
    keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
  />
);

const VisualizedViewTab = ({ users, promoters }) => {
  // Calculate the number of registered users and promoters
  const numUsers = users.length;
  const numPromoters = promoters.length;

  // Data for the chart
  const chartData = {
    labels: ['Users', 'Promoters'],
    datasets: [
      {
        data: [numUsers, numPromoters],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visualized View</Text>
      <View style={styles.chartContainer}>
        <View style={styles.chartWrapper}>
          <BarChart
            data={chartData}
            width={350}
            height={200}
            yAxisLabel=""
            chartConfig={{
              backgroundGradientFrom: '#f0f0f0',
              backgroundGradientTo: '#f0f0f0',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
                borderWidth: 1, // Add border
                borderColor: '#ccc', // Border color
                shadowColor: '#000', // Shadow color
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              },
              barPercentage: 0.5, // Adjust bar width
              propsForLabels: {
                fontSize: 12,
              },
              propsForVerticalLabels: {
                fontSize: 12,
              },
              propsForHorizontalLabels: {
                fontSize: 12,
              },
              fillShadowGradient: '#000', // Add shadow for bars
              fillShadowGradientOpacity: 0.2, // Adjust shadow opacity
              propsForBackgroundLines: {
                strokeWidth: 0.5,
              },
              propsForDots: {
                r: '3',
              },
              color: (opacity = 1) => `rgba(76, 187, 23, ${opacity})`, // Green color for users
              propsForBars: {
                fill: 'rgba(255, 0, 0, 0.8)', // Red color for promoters
              },
            }}
            style={styles.chart}
          />
        </View>
      </View>
    </View>
  );
};

const AdminDashboard = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [promoters, setPromoters] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://192.168.127.187:3000/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchPromoters = async () => {
      try {
        const response = await axios.get('http://192.168.127.187:3000/promoters');
        setPromoters(response.data);
      } catch (error) {
        console.error('Error fetching promoters:', error);
      }
    };

    fetchUsers();
    fetchPromoters();
  }, []);

  const handleLogout = () => {
    // Implement logout logic here
    // Navigate to the admin login screen
    navigation.navigate('UserLogin');
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator>
        <Tab.Screen name="Users">
          {() => <UsersTab users={users} />}
        </Tab.Screen>
        <Tab.Screen name="Promoters">
          {() => <PromotersTab promoters={promoters} />}
        </Tab.Screen>
        <Tab.Screen name="Visualized View">
          {() => <VisualizedViewTab users={users} promoters={promoters} />}
        </Tab.Screen>
      </Tab.Navigator>
      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    borderRadius: 16,
    borderWidth: 1, // Add border
    borderColor: '#ccc', // Border color
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chart: {
    marginTop: 20,
    borderRadius: 16,
  },
});

export default AdminDashboard;
