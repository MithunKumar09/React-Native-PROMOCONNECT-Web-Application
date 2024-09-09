import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, AppState } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../storage/AsyncStorageUtils'; // Update import for AsyncStorageUtils
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import uuidRandom from 'uuid-random';
import ScreenshotDetector from 'react-native-screenshot-detect';
import { BlurView } from 'react-native-blur';

const HypeUpScreen = ({ route }) => {
  const [content, setContent] = useState('');
  const [cost, setCost] = useState(100);
  const [isPosted, setIsPosted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [postedMessages, setPostedMessages] = useState([]);
  const [userId, setUserId] = useState('');
  const [promoterId, setPromoterId] = useState('');
  const [userType, setUserType] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isPostingDisabled, setIsPostingDisabled] = useState(false);
  const [postTimer, setPostTimer] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState('');
  const [isMediaSelected, setIsMediaSelected] = useState(false);
  const [releaseDate, setReleaseDate] = useState(new Date());
  const [displayedDate, setDisplayedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [receiverId, setReceiverId] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [ratings, setRatings] = useState({});
  const [ratingCounts, setRatingCounts] = useState({});
  const navigation = useNavigation(); // Get navigation object
  const [messages, setMessages] = useState([]);
  const [isAppActive, setIsAppActive] = useState(true);
  const blurViewRef = useRef(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await getToken();
        if (token) {
          setUserId(token.userID);
          setUserType(token.userType);
          if (token.userType === 'promoter') {
            setPromoterId(token.userID);
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
    fetchMessages();

    return () => {
      clearInterval(postTimer);
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        setIsAppActive(true);
      } else {
        setIsAppActive(false);
      }
    };

    const appStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);

    let unsubscribe;
    if (ScreenshotDetector && typeof ScreenshotDetector.subscribe === 'function') {
      unsubscribe = ScreenshotDetector.subscribe(() => {
        Alert.alert('Warning', 'Screenshots are not allowed in this app.');
      });
    }

    return () => {
      appStateChangeSubscription.remove();
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);



  const fetchMessages = async () => {
    try {
      const token = await getToken();
      if (token) {
        const response = await axios.get('http://192.168.127.187:3000/messages', {
          headers: {
            Authorization: `Bearer ${token.token}`,
            'Content-Type': 'application/json',
          },
          // Include any necessary request parameters here
          params: {
            userId: route.params.userId, // Assuming userId is required
            // Other parameters if needed
          },
        });
        if (response.status === 200) {
          const messagesWithImages = response.data.map(message => ({
            ...message,
            images: message.images ? message.images.filter(imageUrl => imageUrl.startsWith('http')) : [],
          }));

          // Initialize rating counts for each message with default values
          const defaultRatingCounts = {};
          messagesWithImages.forEach(message => {
            defaultRatingCounts[message.id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          });
          setRatingCounts(defaultRatingCounts);

          setMessages(messagesWithImages);

          setReceivedMessages(messagesWithImages);
          // Fetch and update rating counts for each message
          await Promise.all(messagesWithImages.map(async message => {
            try {
              const ratingResponse = await axios.get(`http://192.168.127.187:3000/messages/${message.id}/ratings`, {
                headers: {
                  Authorization: `Bearer ${token.token}`,
                },
              });
              if (ratingResponse.status === 200) {
                const updatedRatingCounts = { ...ratingCounts };
                updatedRatingCounts[message.id] = ratingResponse.data.ratingCounts;
                console.log('Rating counts retrieved for message', message.id, ':', ratingResponse.data.ratingCounts);
                setRatingCounts(updatedRatingCounts);
              } else {
                console.error('Failed to fetch updated rating counts for message:', message.id);
              }
            } catch (ratingError) {
              console.error('Error fetching updated rating counts for message:', message.id, ratingError);
            }
          }));
          console.log('Rating counts updated:', ratingCounts); // Add this line
        } else {
          console.error('Failed to fetch messages:', response.data.error);
          Alert.alert('Error', 'Failed to fetch messages');
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to fetch messages. Please check your internet connection.');
    }
  };

  const handleAddClick = () => {
    setCost(prevCost => prevCost + 10);
  };

  const handleMinusClick = () => {
    setCost(prevCost => Math.max(prevCost - 10, 0));
  };

  useEffect(() => {
    const noteTimer = setTimeout(() => {
      setShowNote(false);
    }, 10000);

    return () => clearTimeout(noteTimer);
  }, [showNote]);

  useEffect(() => {
    if (isPosted) {
      setPostTimer(setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000));
    } else {
      setElapsedTime(0);
    }

    return () => {
      clearInterval(postTimer);
    };
  }, [isPosted]);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert('Permission to access media library is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.cancelled && result.assets.length > 0 && result.assets[0].uri) {
        setSelectedMedia(result.assets[0].uri);
        setIsMediaSelected(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handlePost = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      let receiverId;
      if (userType === 'user' || userType === 'promoter') {
        receiverId = userType === 'user' ? userId : promoterId;
      } else {
        throw new Error('Invalid user type.');
      }

      // Check if receiverId is not empty
      if (!receiverId) {
        console.error('Receiver ID not provided');
        Alert.alert('Error', 'Receiver ID not provided.');
        return;
      }

      console.log('User Type:', token.userType);
      console.log('Receiver ID:', receiverId);

      const formData = new FormData();
      formData.append('content', content);
      formData.append('cost', cost.toString());
      formData.append('releaseDate', releaseDate.toISOString());
      if (selectedMedia) {
        formData.append('media', {
          uri: selectedMedia,
          type: 'image/jpeg',
          name: uuidRandom() + '.jpg',
        });
      }
      formData.append('userType', token.userType); // Set userType from token
      formData.append('receiverId', receiverId); // Set receiverId
      formData.append('ratings', JSON.stringify(ratings)); // Include ratings in the form data

      const response = await axios.post('http://192.168.127.187:3000/messages', formData, {
        headers: {
          Authorization: `Bearer ${token.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Posted Message Response:', response.data); // Log the response data

      if (response.status === 201) {
        setIsPosted(true);
        setContent('');
        setSelectedMedia('');
        setIsMediaSelected(false);
        setReleaseDate(new Date());
        setShowDatePicker(false);
        setIsFormVisible(false);
        setElapsedTime(0);
        fetchMessages(); // Fetch messages after posting

        // Extract message ID from the response data
        const messageId = response.data.newMessage._id;


      // Set a timer to notify the user 20 seconds before deletion
      const notifyTime = 3300000; // 20 seconds in milliseconds
      const deleteTime = 3600000; // 30 seconds in milliseconds

      const notifyTimer = setTimeout(() => {
        Alert.alert(
          'Deletion Notice',
          'Your message will be deleted in 10 seconds.',
          [
            {
              text: 'OK',
              onPress: () => {
                // User confirmed deletion
                handleDelete(messageId, token.token);
              },
            },
          ],
          { cancelable: false }
        );
      }, notifyTime);
      
      // Set a timeout to make the form visible again after 30 seconds
      setTimeout(() => {
        setIsFormVisible(true);
      }, deleteTime);
    } else {
      console.error('Failed to post message:', response.data.error);
      Alert.alert('Error', 'Failed to post message. Please try again.');
    }
  } catch (error) {
    console.error('Error posting message:', error);
    Alert.alert('Error', 'Failed to post message. Please try again.');
  }
};

const handleDelete = async (messageId, authToken) => {
  try {
    const response = await axios.delete(`http://192.168.127.187:3000/messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('Message and associated images deleted successfully after 30 seconds');
    fetchMessages(); // Fetch updated messages after deletion
  } catch (deleteError) {
    console.error('Error deleting message:', deleteError);
    Alert.alert('Error', 'Failed to delete message.');
  }
};

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Hide the date picker after selecting a date
    if (selectedDate) {
      const currentDate = new Date();
      if (selectedDate >= currentDate) { // Check if selected date is in the future
        setReleaseDate(selectedDate);
        setDisplayedDate(selectedDate.toLocaleDateString());
      } else {
        // Display an alert indicating that future dates are only allowed
        Alert.alert('Error', 'Please select a future date.');
      }
    }
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  useEffect(() => {
    setDisplayedDate(releaseDate.toLocaleDateString());
  }, [releaseDate]);

  const truncateUrl = (url) => {
    if (url.length > 50) {
      return url.substring(0, 50) + '...';
    }
    return url;
  };

  const handleStarPress = async (messageId, star) => {
    try {
      // Update the rating when a star is pressed locally
      const updatedRatings = { ...ratings };
      const updatedRatingCounts = { ...ratingCounts };

      // Check if the user or promoter has already rated this message
      console.log('Current ratings:', updatedRatings[messageId]);
      if (updatedRatings[messageId] === star) {
        // If the same rating is pressed again, remove the rating
        delete updatedRatings[messageId];
      } else {
        // Set the new rating
        updatedRatings[messageId] = star;
      }

      console.log('Updated ratings:', updatedRatings);

      // Update the rating count for the selected star
      const count = (updatedRatingCounts[messageId][star] || 0) + (updatedRatings[messageId] ? 1 : -1);
      updatedRatingCounts[messageId] = { ...updatedRatingCounts[messageId], [star]: Math.max(0, count) };

      console.log('Updated rating counts:', updatedRatingCounts);

      // Update rating counts in the state immediately
      setRatingCounts(updatedRatingCounts);

      // Send the rating to the backend only if it's a new rating or removed
      const token = await getToken();
      if (!token) return;

      const response = await axios.post(`http://192.168.127.187:3000/messages/${messageId}/ratings`, {
        userId: token.userID,
        rating: updatedRatings[messageId] || 0, // Send 0 if rating is removed
      }, {
        headers: {
          Authorization: `Bearer ${token.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 201) {
        console.error('Failed to store rating:', response.data.error);
        Alert.alert('Error', 'Failed to store rating. Please try again.');
      } else {
        console.log('Rating stored successfully:', response.data.message);

        // Fetch updated rating counts after rating action
        fetchUpdatedRatingCounts(messageId);
      }

    } catch (error) {
      console.error('Error storing rating:', error);
      Alert.alert('Error', 'Failed to store rating. Please try again.');
    }
  };

  // Inside fetchUpdatedRatingCounts function
  const fetchUpdatedRatingCounts = async (messageId) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await axios.get(`http://192.168.127.187:3000/messages/${messageId}/ratings`, {
        headers: {
          Authorization: `Bearer ${token.token}`,
        },
      });

      if (response.status === 200) {
        const updatedRatingCounts = { ...ratingCounts };
        updatedRatingCounts[messageId] = response.data.ratingCounts;
        setRatingCounts(updatedRatingCounts);
      } else {
        console.error('Failed to fetch updated rating counts for message:', messageId);
        console.error('Response:', response); // Log the full response for debugging
        Alert.alert('Error', `Failed to fetch updated rating counts for message: ${messageId}`);
      }
    } catch (error) {
      console.error('Error fetching updated rating counts for message:', messageId, error);
      Alert.alert('Error', `Failed to fetch updated rating counts for message: ${messageId}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isFormVisible && (
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Add Description"
              multiline
              numberOfLines={4}
              style={styles.input}
              value={content}
              onChangeText={setContent}
            />
            <TouchableOpacity style={styles.mediaPickerButton} onPress={handlePickImage}>
              <MaterialIcons name="photo" size={24} color="black" />
              <Text style={styles.mediaPickerButtonText}>Add Image</Text>
            </TouchableOpacity>
            {isMediaSelected && selectedMedia !== '' && (
              <Image source={{ uri: selectedMedia }} style={styles.selectedMedia} />
            )}

            <View style={styles.costContainer}>
              <TouchableOpacity style={styles.costButton} onPress={handleMinusClick}>
                <Text style={styles.costButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.costText}>${cost}</Text>
              <TouchableOpacity style={styles.costButton} onPress={handleAddClick}>
                <Text style={styles.costButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.datePickerButton} onPress={toggleDatePicker}>
              <Text style={styles.datePickerButtonText}>Pick Release Date</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={releaseDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()} // Set minimum date to today
              />
            )}
            <Text style={styles.displayedDate}>{displayedDate}</Text>
            <TouchableOpacity
              style={[styles.postButton, isPostingDisabled && styles.postButtonDisabled]}
              onPress={handlePost}
              disabled={isPostingDisabled}
            >
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        )}


        {receivedMessages.map((message, index) => (
          <View key={index} style={styles.messageContainer}>
            <View style={styles.messageHeader}>
              <Text style={[styles.senderName, message.userType === 'promoter' ? styles.promoter : styles.user]}>
                Sender name: {message.senderName}
              </Text>
              <Text style={[styles.userType, message.userType === 'promoter' ? styles.promoter : styles.user]}>
                User Type: {message.userType}
              </Text>
            </View>
            {/* Check if message contains images */}
            {message.images && message.images.length > 0 && (
              <View style={styles.imageContainer}>
                {/* Render each image */}
                {message.images.map((imageUrl, imageIndex) => (
                  <View key={imageIndex} style={styles.imageWrapper}>
                    {/* Display the image */}
                    <Image source={{ uri: imageUrl }} style={styles.messageImage} />
                    {/* Display image URI if image is not displaying */}
                    {!imageUrl.includes('http') && (
                      <Text style={styles.imageUriText}>{truncateUrl(imageUrl)}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            <View style={styles.ratingContainer}>
              <View style={styles.ratingRow}>
                {[...Array(5)].map((_, index) => {
                  // Check if ratings for the current message exist, otherwise initialize it with zeros
                  const messageRatings = ratings[message.id] || Array(5).fill(0);
                  // Determine if the current star should be filled or empty based on the current user's or promoter's ratings
                  const isFilled = messageRatings[index + 1] > 0 && (message.userType === userType || userType === 'promoter');
                  return (
                    <TouchableOpacity key={index} onPress={() => handleStarPress(message.id, index + 1)}>
                      <View style={styles.ratingItem}>
                        <MaterialIcons
                          name={isFilled ? 'star' : 'star-border'}
                          size={24}
                          color={isFilled ? 'gold' : 'gray'}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Display rating counts */}
              <View style={styles.ratingRow}>
                {Object.entries(ratingCounts[message.id] || {}).map(([star, count]) => (
                  <View key={star} style={styles.ratingCountItem}>
                    <Text style={styles.ratingCountText}>{count}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.messageContent}>Content: {message.content}</Text>
            <Text style={styles.messageContent}>
              Release Date: {message.releaseDate ? new Date(message.releaseDate).toLocaleDateString() : "Invalid Date"}
            </Text>
            <Text style={styles.messageContent}>Expected Cost: ${message.cost}</Text>


            {/* New button for cost demand */}
            <TouchableOpacity
              key={index}
              style={[
                styles.costDemandButton,
                message.receiverId === userId && { opacity: 0.5 }, // Disable button if current user is the receiver
              ]}
              onPress={() => {
                // Check if the current user is not the receiver of the message
                if (message.receiverId !== userId) {
                  navigation.navigate('Chat', {
                    userId: message.receiverId,
                    userName: message.senderName,
                    userType: userType, // Pass the recipient's type
                    messageType: 'reply',
                    messageContent: message.content,
                    expectedCost: message.cost,
                  });
                }
              }}
              disabled={message.receiverId === userId} // Disable button if current user is the receiver
            >
              <Text style={styles.costDemandButtonText}>Cost demand for this post</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  mediaPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mediaPickerButtonText: {
    marginLeft: 5,
  },
  selectedMedia: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  costButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
  },
  costButtonText: {
    fontSize: 20,
  },
  costText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  datePickerButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  postButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  messageContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageHeader: {
    marginBottom: 10,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userType: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  user: {
    color: '#007bff',
  },
  promoter: {
    color: '#28a745',
  },
  messageContent: {
    fontSize: 16,
    marginBottom: 5,
  },
  displayedDate: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  selectedMediaContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  messageImage: {
    width: 300,
    height: 400,
    resizeMode: 'cover',
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  ratingContainer: {
    flexDirection: 'column',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5, // Add some margin between the rows
  },
  ratingItem: {
    marginRight: 15, // Add some margin between the stars
    marginLeft: 10,
  },
  ratingCountItem: {
    marginRight: 16,
    marginLeft: 23, // Add some margin between the counts
  },
  costDemandButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'grey',
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  costDemandButtonText: {
    color: 'black',
  },
});

export default HypeUpScreen;
