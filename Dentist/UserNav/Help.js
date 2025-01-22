import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Help = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Help & Support</Text>

      {/* FAQ Section */}
      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      <View style={styles.card}>
        <Text style={styles.faqQuestion}>1. How do I reset my password?</Text>
        <Text style={styles.faqAnswer}>
          You can reset your password by going to Settings and clicking on "Reset Password".
        </Text>

        <Text style={styles.faqQuestion}>2. How do I contact support?</Text>
        <Text style={styles.faqAnswer}>
          You can contact our support team by sending an email to support@toothpix.com.
        </Text>

        <Text style={styles.faqQuestion}>3. How do I delete my account?</Text>
        <Text style={styles.faqAnswer}>
          To delete your account, please go to Settings → Account → Delete Account.
        </Text>
      </View>

      {/* Contact Section */}
      <Text style={styles.sectionTitle}>Contact Us</Text>
      <View style={styles.card}>
        <Text style={styles.contactText}>
          If you need further assistance, please reach out to our support team:
        </Text>
        <Text style={styles.contactText}>Email: support@toothpix.com</Text>
        <Text style={styles.contactText}>Phone: +123 456 789</Text>
      </View>

      {/* Instructions Section */}
      <Text style={styles.sectionTitle}>App Instructions</Text>
      <View style={styles.card}>
        <Text style={styles.instructionsText}>
          1. Navigate through the app using the bottom navigation bar.
        </Text>
        <Text style={styles.instructionsText}>
          2. Go to your profile to view and update your personal information.
        </Text>
        <Text style={styles.instructionsText}>
          3. Explore Settings to customize your experience.
        </Text>
      </View>

      {/* More Help Button */}
      <TouchableOpacity style={styles.button} onPress={() => alert('Redirecting to Help')}>
        <Text style={styles.buttonText}>More Help</Text>
      </TouchableOpacity>

      {/* App Credits */}
      <View style={styles.creditsContainer}>
        <Text style={styles.creditsHeader}>About Toothpix</Text>
        <Text style={styles.creditsText}>
          Toothpix is proudly developed by BSIT 3-1 students of PUPSJ:
        </Text>
        <Text style={styles.creditsText}>- Angel Fhaye Rafanan</Text>
        <Text style={styles.creditsText}>- Manilyn Catenza</Text>
        <Text style={styles.creditsText}>- Abigael Hitosis</Text>
        <Text style={styles.creditsText}>- Nicole Daniel Viray</Text>
        <Text style={styles.creditsText}>- Roselyn Kheem Redillas</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f3f3f3',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 30,
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#4a90e2',
  },
  backButtonText: {
    
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4a90e2',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  faqAnswer: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  contactText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  creditsContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  creditsHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 10,
  },
  creditsText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
});

export default Help;
