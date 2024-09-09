import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '../storage/AsyncStorageUtils';
import axios from 'axios';

const Chatting = ({ route }) => {
  const { userId, userName, userType, messageType, messageContent, expectedCost } = route.params;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchMessages(userId);
    }

    // Check if the message type, content, and expected cost are provided
    if (messageType && messageContent && expectedCost) {
      setShowAdditionalInfo(true);
    }
  }, [userId, messageType, messageContent, expectedCost]);

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      return;
    }

    try {
      const formattedMessage = formatMessage(message); // Format the message
      const apiUrl = 'http://192.168.127.187:3000/chat/send-message';
      const token = await getToken();

      let messageTypeToSend = ''; // Variable to store the messageType

      // Determine the messageType based on the condition
      if (messageType === 'reply') {
        messageTypeToSend = 'reply';
      } else {
        messageTypeToSend = 'regular';
      }

      console.log('Sending message with messageType:', messageTypeToSend);

      const requestData = {
        senderId: token.userID,
        receiverId: userId,
        message: formattedMessage, // Use the formatted message
        messageType: messageTypeToSend, // Use the determined messageType
        senderName: token.name,
        senderType: token.userType,
      };

      // Include messageContent and expectedCost only if messageType is not regular
      if (messageTypeToSend !== 'regular') {
        requestData.messageContent = messageContent;
        requestData.expectedCost = expectedCost;
      }

      console.log('Sending message request data:', requestData);

      const response = await axios.post(apiUrl, requestData);

      console.log('Response data:', response.data);

      if (response.status === 201) {
        console.log('Message sent successfully');
        setMessage('');
        await fetchMessages(userId);
      } else {
        console.error('Failed to send message:', response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessage = (text) => {
    return text.replace(/(\d+)/g, (match, p1) => {
      if (p1.length > 2) {
        return `$${p1}`;
      } else {
        return match;
      }
    });
  };

  const fetchMessages = async (userId) => {
    try {
      const token = await getToken();
      if (token) {
        const response = await axios.post('http://192.168.127.187:3000/chat/messages', {
          currentUserId: token.userID,
          userId: userId,
        });

        if (response.status === 200) {
          // Filter messages to include those where senderId matches the current user's ID and receiverId matches the selected user's ID,
          // or senderId matches the selected user's ID and receiverId matches the current user's ID
          const filteredMessages = response.data.filter(msg =>
            (msg.senderId === token.userID && msg.receiverId === userId) ||
            (msg.senderId === userId && msg.receiverId === token.userID)
          );
          setMessages(filteredMessages); // Update the messages state with filtered messages
        } else {
          console.error('Failed to fetch messages');
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  

  // Inside the renderMessage function
  const renderMessage = (msg) => {
    console.log('Rendering message:', msg);

    // Check if msg is null or undefined
    if (!msg || !msg.message) {
      return null; // Return null if msg is null or undefined
    }

    console.log('Message type:', msg.messageType); // Log messageType

    const parts = msg.message.split(/(\$[0-9]+)/); // Split the message into parts based on the dollar symbol followed by numbers
    return (
      <Text>
        {parts.map((part, index) => {
          if (part.match(/^\$[0-9]+$/)) {
            // If the part starts with a dollar symbol and followed by numbers, make it touchable and green
            return (
              <TouchableOpacity key={index} onPress={() => handleNumberPress(part)}>
                <Text style={styles.greenText}>{part}</Text>
              </TouchableOpacity>
            );
          } else {
            return <Text key={index}>{part}</Text>; // Otherwise, render the part as regular text
          }
        })}
        {msg.messageType !== 'regular' && msg.messageType && ( // Include additional fields if messageType is not 'regular'
          <>
            {"\n"}
            {msg.messageType}
            {"\n"}
            Post Description: {msg.messageContent}
            {"\n"}
            expected cost: {msg.expectedCost}
            {"\n"}
          </>
        )}
      </Text>
    );
  };

  const handleNumberPress = (number) => {
    setModalVisible(true);
  };

  const CustomAlertModal = ({ visible, onClose }) => (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.warningIconContainer}>
            <Ionicons name="warning" size={40} color="red" />
          </View>
          <Text style={styles.modalTitle}>Warning</Text>
          <Text style={styles.modalMessage}>
            Your new Expo version is not supported for Razorpay payment integration. The version may have changed or expired. Please check the Razorpay documentation for compatibility issues and update your Expo version accordingly.
          </Text>
          <View style={styles.pointListContainer}>
            <Text style={styles.pointItem}>1. Check Razorpay's documentation for compatibility issues.</Text>
            <Text style={styles.pointItem}>2. Ensure your Expo version is up to date.</Text>
            <Text style={styles.pointItem}>3. Verify that your Razorpay credentials are correct.</Text>
            <Text style={styles.pointItem}>4. Contact support if the issue persists.</Text>
            <Text style={styles.pointItem}>5. Keep an eye on Expo and Razorpay updates for any changes.</Text>
          </View>
          <Pressable style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
  
  


  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Text style={styles.profileText}>{userName}</Text>
        <Text style={styles.profileText}>{userType}</Text>
      </View>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <View key={index} style={msg.senderId === userId ? styles.receiverMessage : styles.senderMessage}>
            {renderMessage(msg)} 
            <Text style={styles.messageTime}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity onPress={handleSendMessage}>
          <Ionicons name="send" size={24} color="black" style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
      {showAdditionalInfo && (
        <Text style={styles.additionalInfo}>
          Message Type: {messageType}, Content: {messageContent}, Expected Cost: {expectedCost}
        </Text>
      )}
      <CustomAlertModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profileText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileErrorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 8,
  },
  senderMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  receiverMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAEAEA',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  messageInfo: {
    color: 'blue',
  },
  messageTime: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginRight: 10,
  },
  sendIcon: {
    marginRight: 5,
  },
  additionalInfo: {
    alignSelf: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#777',
  },
  greenText: {
    color: 'green',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'red',
    borderRadius: 10,
    alignItems: 'center',
  },
  warningIconContainer: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: 'lightgrey',
    textAlign: 'center',
    marginBottom: 20,
  },
  pointListContainer: {
    marginBottom: 20,
  },
  pointItem: {
    fontSize: 14,
    color: 'lightgrey',
    textAlign: 'left',
    marginBottom: 5,
  },
  modalButton: {
    backgroundColor: 'darkred',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default Chatting;
