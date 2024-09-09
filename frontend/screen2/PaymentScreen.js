// frontend/screens2/PaymentScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaymentScreen = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility

  const handlePaymentPress = () => {
    // When the "Pay" button is pressed, show the modal
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
      <View style={styles.logoContainer}>
        <Ionicons name="logo-ionic" size={50} color="#007bff" />
        <Text style={styles.logoText}>Razorpay</Text>
      </View>
      <Text style={styles.title}>Card Info</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="card-outline" size={24} color="gray" style={styles.icon} />
        <TextInput
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChangeText={setCardNumber}
          style={styles.input}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="calendar-outline" size={24} color="gray" style={styles.icon} />
        <TextInput
          placeholder="MM / YY"
          value={expiryDate}
          onChangeText={setExpiryDate}
          style={styles.input}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="key-outline" size={24} color="gray" style={styles.icon} />
        <TextInput
          placeholder="CVC"
          value={cvc}
          onChangeText={setCvc}
          style={styles.input}
          keyboardType="numeric"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePaymentPress}>
        <Text style={styles.buttonText}>Pay - ₹100</Text>
      </TouchableOpacity>

      {/* Modal for Warning */}
      <CustomAlertModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    marginRight: 10,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  warningIconContainer: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  pointListContainer: {
    marginBottom: 20,
  },
  pointItem: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    marginBottom: 5,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default PaymentScreen;
