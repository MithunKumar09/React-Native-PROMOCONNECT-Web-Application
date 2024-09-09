import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = ({ navigation }) => {
  const [showIcons, setShowIcons] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const animatedValue = new Animated.Value(0);
  const animatedUnderlineWidth = new Animated.Value(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !showIcons) {
      startUnderlineAnimation();
    }
  }, [showIcons]);

  const animateIcons = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowIcons(!showIcons);
    Animated.timing(animatedValue, {
      toValue: showIcons ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimating(false);
    });
  };

  const iconContainerStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };

  const startUnderlineAnimation = () => {
    Animated.timing(animatedUnderlineWidth, {
      toValue: 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const stopUnderlineAnimation = () => {
    Animated.timing(animatedUnderlineWidth, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const icons = [
    { name: 'user-plus', route: 'Registration', color: '#FF6F61' },
    { name: 'users', route: 'UserLogin', color: '#6BBCFD' },
    { name: 'user', route: 'PromoterLogin', color: '#6BBCFD' },
    { name: 'info', route: 'About', color: '#6BBCFD' }, // New icon for About
  ];

  const labels = [
    { label: 'Register' },
    { label: 'Users' },
    { label: 'Promoter' },
    { label: 'About' }, // New label for About
  ];

  const handleNavigation = async (route) => {
    try {
      await navigation.navigate(route);
      // Delay the animation by 500 milliseconds
      setTimeout(() => {
        animateIcons();
      }, 500);
    } catch (error) {
      Alert.alert('Error', 'Navigation failed');
      console.error('Navigation failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          <Text style={[styles.bigLetter, styles.glowText]}>P̳̿͟͞</Text>
          romo
          <Text style={[styles.bigLetter, { color: '#00FF00' }]}>C</Text>
          onnect
        </Text>
        <View style={styles.underlineContainer}>
          <Animated.View
            style={[
              styles.underline,
              {
                width: animatedUnderlineWidth,
              },
            ]}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.toggleButton} onPress={animateIcons}>
        <FontAwesome5 name="bars" size={24} color="#0E263A" />
      </TouchableOpacity>
      {/* Toggle button */}
      <View style={styles.iconContainer}>
        {/* First row of icons */}
        <View style={styles.row}>
          {showIcons &&
            icons.slice(0, 3).map((icon, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleNavigation(icon.route)}
                activeOpacity={0.8}
                style={[styles.icon, { backgroundColor: icon.color }]}
              >
                <FontAwesome5 name={icon.name} size={36} color="#FFF" />
                {/* Label */}
                <View style={styles.labelButton}>
                  <View style={styles.labelBackground}>
                    <Text style={styles.labelText}>{labels[index].label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </View>
        {/* Second row of icons */}
        <View style={styles.row}>
          {showIcons &&
            icons.slice(3).map((icon, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleNavigation(icon.route)}
                activeOpacity={0.8}
                style={[styles.icon, { backgroundColor: icon.color }]}
              >
                <FontAwesome5 name={icon.name} size={36} color="#FFF" />
                {/* Label */}
                <View style={styles.labelButton}>
                  <View style={styles.labelBackground}>
                    <Text style={styles.labelText}>{labels[index + 3].label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </View>
      <View style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>|Bridge Between Users and Promoters|</Text>
        <Text style={styles.bottomText}>| HypeUp |</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
    backgroundColor: '#FFF', // White background
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    color: '#000',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  bigLetter: {
    fontSize: 90,
    fontWeight: 'bold',
  },
  underlineContainer: {
    width: 100,
    height: 2,
    marginTop: 5,
    backgroundColor: '#000',
  },
  underline: {
    height: '100%',
    backgroundColor: '#000',
  },
  toggleButton: {
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row', // Allow icons to wrap onto the next line
    flexWrap: 'wrap', // Allow icons to wrap onto the next line
    justifyContent: 'space-around',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 30, // Adjusted marginBottom to create space between icons
    marginLeft: 20, // Add marginLeft for space between icons
    marginRight: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  labelButton: {
    alignItems: 'center',
    marginTop: 10, // Adjusted marginTop for space above the label
  },
  labelBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 5, // Adjusted paddingVertical for better spacing
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  labelText: {
    color: '#fff',
    marginTop: 3,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  bottomTextContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 16,
    color: '#000',
  },
  glowText: {
    textShadowColor: 'rgba(255,0,0,1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default HomeScreen;
