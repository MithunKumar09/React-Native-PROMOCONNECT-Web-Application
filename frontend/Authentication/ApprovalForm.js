import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../storage/AsyncStorageUtils';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import uuidRandom from 'uuid-random';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { CheckBox } from 'react-native-elements';

const ApprovalForm = ({ route }) => {
  const email = route.params.email; // Extracting email from route params
  const [instagramName, setInstagramName] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [youtubeName, setYoutubeName] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [selectedInstagramMedia, setSelectedInstagramMedia] = useState(null);
  const [selectedYoutubeMedia, setSelectedYoutubeMedia] = useState(null);
  const [isInstagramMediaSelected, setIsInstagramMediaSelected] = useState(false);
  const [isYoutubeMediaSelected, setIsYoutubeMediaSelected] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  
  useEffect(() => {
    console.log('Email:', email); // Log email to verify it's retrieved correctly
  }, [email]);

  const handlePickImage = async (setSelectedMedia, setIsMediaSelected) => {
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

      if (!result.canceled && result.assets[0].uri) {
        setSelectedMedia(result.assets[0].uri);
        setIsMediaSelected(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!isTermsAccepted) {
      Alert.alert('Error', 'You must accept the terms and conditions.');
      return;
    }
    
    if (!selectedInstagramMedia && !selectedYoutubeMedia) {
      Alert.alert('Error', 'Please upload at least one screenshot.');
      return;
    }
  
    try {
      setLoading(true); // Set loading state to true
      const token = await getToken();
      if (!token) return;
  
      const formData = new FormData();
      formData.append('instagramName', instagramName);
      formData.append('instagramLink', instagramLink);
      formData.append('youtubeName', youtubeName);
      formData.append('youtubeLink', youtubeLink);
      formData.append('email', email);
  
      if (selectedInstagramMedia) {
        const fileExtension = selectedInstagramMedia.split('.').pop();
        formData.append('instagramScreenshot', {
          uri: selectedInstagramMedia,
          type: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
          name: `${email}_instagram_${uuidRandom()}.${fileExtension}`,
        });
      }
  
      if (selectedYoutubeMedia) {
        const fileExtension = selectedYoutubeMedia.split('.').pop();
        formData.append('youtubeScreenshot', {
          uri: selectedYoutubeMedia,
          type: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
          name: `${email}_youtube_${uuidRandom()}.${fileExtension}`,
        });
      }
  
      const response = await axios.post('http://192.168.127.187:3000/update-promoter', formData, {
        headers: {
          Authorization: `Bearer ${token.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setLoading(false); // Set loading state to false after response
      if (response.status === 200) {
        Alert.alert(
          'Success',
          'Identification details submitted successfully. Verification will be completed within 2 days.',
          [{ text: 'OK', onPress: () => navigation.navigate('PromoterLogin') }]
        );
      } else {
        console.error('Failed to submit details:', response.data.error);
        Alert.alert('Error', 'Failed to submit details. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error submitting details:', error);
      Alert.alert('Error', 'Failed to submit details. Please try again.');
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerText}>Why this form is required:</Text>
        <Text style={styles.infoText}>1. Promoter verification and authenticity.</Text>
        <Text style={styles.infoText}>2. Fraud prevention.</Text>
        <Text style={styles.infoText}>3. User satisfaction and trust.</Text>
        <Text style={styles.infoText}>4. Approval process takes up to 2 days.</Text>
      </View>

      <Text style={styles.termsHeader}>Terms and Conditions:<Text style={{ color: 'red' }}> *</Text></Text>
      <Text style={styles.termsText}>
        By submitting this form, you agree to our terms and conditions. Your information will be used to verify your identity and prevent fraudulent activities. The approval process may take up to 2 days. For more information, please contact our support team.
      </Text>

      <CheckBox
        title="I accept the terms and conditions"
        checked={isTermsAccepted}
        onPress={() => setIsTermsAccepted(!isTermsAccepted)}
        containerStyle={styles.checkboxContainer}
      />

      <View style={styles.card}>
        <View style={styles.inputContainer}>
          <Ionicons name="logo-instagram" size={24} color="#C13584" style={styles.icon} />
          <TextInput
            placeholder="Instagram Name"
            value={instagramName}
            onChangeText={setInstagramName}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="link-outline" size={24} color="#C13584" style={styles.icon} />
          <TextInput
            placeholder="Instagram Link"
            value={instagramLink}
            onChangeText={setInstagramLink}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome name="youtube-play" size={24} color="#FF0000" style={styles.icon} />
          <TextInput
            placeholder="YouTube Name"
            value={youtubeName}
            onChangeText={setYoutubeName}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="link-outline" size={24} color="#FF0000" style={styles.icon} />
          <TextInput
            placeholder="YouTube Link"
            value={youtubeLink}
            onChangeText={setYoutubeLink}
            style={styles.input}
          />
        </View>
        <Text style={styles.verificationPoint}>Add your username of our application (PromoConnect) in your Instagram bio while taking a screenshot and do not remove it for 2 days.</Text>
        <Text style={styles.verificationPoint}>We will verify your details within 2 days.</Text>
        <TouchableOpacity
          style={styles.mediaPickerButton}
          onPress={() => handlePickImage(setSelectedInstagramMedia, setIsInstagramMediaSelected)}
        >
          <Text style={styles.mediaPickerButtonText}>Pick Instagram Image</Text>
        </TouchableOpacity>
        {isInstagramMediaSelected && selectedInstagramMedia && (
          <Image source={{ uri: selectedInstagramMedia }} style={styles.selectedMedia} />
        )}
        <TouchableOpacity
          style={styles.mediaPickerButton}
          onPress={() => handlePickImage(setSelectedYoutubeMedia, setIsYoutubeMediaSelected)}
        >
          <Text style={styles.mediaPickerButtonText}>Pick YouTube Image</Text>
        </TouchableOpacity>
        {isYoutubeMediaSelected && selectedYoutubeMedia && (
          <Image source={{ uri: selectedYoutubeMedia }} style={styles.selectedMedia} />
        )}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit for Approval</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  headerCard: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  termsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 20,
  },
  card: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    paddingBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  verificationPoint: {
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 34,
    color: '#666',
  },
  mediaPickerButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  mediaPickerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedMedia: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ApprovalForm;
