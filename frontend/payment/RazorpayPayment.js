// frontend/payment/RazorpayPayment.js
import React from 'react';
import { Button, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_KEY_ID } from '@env';

const RazorpayPayment = () => {
  const handlePayment = () => {
    console.log('RAZORPAY_KEY_ID:', RAZORPAY_KEY_ID); // Debugging statement
    if (!RAZORPAY_KEY_ID) {
      Alert.alert('Error', 'Razorpay Key ID is undefined');
      return;
    }

    const options = {
      description: 'Credits towards consultation',
      image: 'https://your-logo-url.com',
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
      amount: '5000', // Amount in paise (5000 paise = 50 INR)
      name: 'Acme Corp',
      prefill: {
        email: 'test@example.com',
        contact: '9191919191',
        name: 'Test User'
      },
      theme: { color: '#F37254' }
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        Alert.alert('Success', `Payment ID: ${data.razorpay_payment_id}`);
      })
      .catch((error) => {
        Alert.alert('Error', `Code: ${error.code} | Description: ${error.description}`);
      });
  };

  return (
    <Button title="Pay with Razorpay" onPress={handlePayment} />
  );
};

export default RazorpayPayment;
