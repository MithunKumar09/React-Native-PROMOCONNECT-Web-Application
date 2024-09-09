import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>PromoConnect: Bridging Creators and Promoters</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>About PromoConnect</Text>
        <Text style={styles.text}>
          PromoConnect is a platform designed to enhance the promotion of content by connecting creators and promoters through social media. Whether you're a filmmaker, influencer, or content creator, PromoConnect helps you amplify your reach and engage with your audience more effectively.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Why Use PromoConnect?</Text>
        <Text style={styles.text}>
          PromoConnect streamlines the promotional process, making it easier for creators to collaborate with promoters. By leveraging the power of social media, PromoConnect ensures that your content reaches a wider and more engaged audience. The platform is designed to foster trust and transparency, providing real-time feedback and secure transactions.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Features</Text>
        <Text style={styles.subheading}>For Creators</Text>
        <Text style={styles.text}>
          - Connect with a network of promoters who can help amplify your content.
          - Receive real-time feedback on your promotional efforts.
          - Manage all your promotions from a centralized platform.
        </Text>

        <Text style={styles.subheading}>For Promoters</Text>
        <Text style={styles.text}>
          - Discover and collaborate with talented creators.
          - Provide valuable feedback to help creators improve their content.
          - Engage with a diverse audience and enhance your promotional strategies.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>How to Use PromoConnect</Text>
        <Text style={styles.subheading}>For Users and Creators</Text>
        <Text style={styles.text}>
          1. Sign up and create your profile.
          2. Upload your content and set your promotional goals.
          3. Connect with promoters and start promoting your content.
          4. Monitor feedback and analytics to optimize your promotional strategy.
        </Text>

        <Text style={styles.subheading}>For Promoters</Text>
        <Text style={styles.text}>
          1. Sign up and create your profile.
          2. Browse and discover creators whose content aligns with your promotional expertise.
          3. Connect with creators and start collaborating on promotional campaigns.
          4. Provide feedback and engage with the audience to maximize reach and impact.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#6200EE',
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#6200EE',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
});

export default AboutScreen;
