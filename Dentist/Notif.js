import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Notif = () => {
  const navigation = useNavigation();

  // Example list of notifications (you can replace with dynamic data)
  const notifications = [
    { id: 1, message: 'You have a new appointment scheduled.' },
    { id: 2, message: 'Reminder: Your records have been updated.' },
    { id: 3, message: 'You received a message from your dentist.' },
  ];

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Notifications</Text>

      <ScrollView contentContainerStyle={styles.notificationList}>
        {notifications.map((notif) => (
          <View key={notif.id} style={styles.notificationItem}>
            <Text style={styles.notificationText}>{notif.message}</Text>
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Mark as read</Text>
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
    backgroundColor: '#87CEFA', // Light blue background
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjust padding for iOS
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#4a90e2',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  notificationList: {
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
  },
  readMoreButton: {
    marginTop: 10,
    backgroundColor: '#6bb8fa',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 14,
    color: '#fff',
  },
});

export default Notif;
