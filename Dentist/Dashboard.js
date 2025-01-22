import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Dashboard = () => {
  const [appointments, setAppointments] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [loading, setLoading] = useState(true); // To manage loading state
  const [isRefreshing, setIsRefreshing] = useState(false); // To handle reload functionality

  const fetchData = async () => {
    try {
      if (!isRefreshing) setLoading(true); // Show spinner only if not refreshing
      
      // Simulated response for appointments
      const appointmentsResponse = await fetch('http://192.168.100.9:3000/api/app/appointments');
      const appointmentsData = await appointmentsResponse.json();
      setAppointments(appointmentsData.appointments.length); // Assuming appointments is an array
      
      // Fetch the total number of services
      const servicesResponse = await fetch('http://192.168.100.9:3000/api/app/services');
      const servicesData = await servicesResponse.json();
      setTotalServices(servicesData.services.length); // Assuming services is an array
  
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false); // Stop refreshing animation
    }
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#87CEFA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <Text style={styles.bigText}>DENTIST DASHBOARD</Text>
        <Text style={styles.grayText}>
          Our app enhances your dental care journey with cutting-edge AR-based dental visualization. See detailed images of
          your teeth and gums, making it easier to understand diagnoses and treatment plans. Manage appointments, view
          dental records, and stay in touch with your dentist, all from your smartphone. It's dental care made smarter, right at your fingertips!
        </Text>

        <Text style={styles.biggrayText}>Overview</Text>

        <View style={styles.overviewCardsContainer}>
          <View style={styles.card}>
            <FontAwesome name="calendar" size={40} color="#87CEFA" />
            <Text style={styles.cardNumber}>{appointments}</Text>
            <Text style={styles.cardText}>Appointments</Text>
          </View>

          <View style={styles.card}>
            <FontAwesome name="list-alt" size={40} color="#87CEFA" />
            <Text style={styles.cardNumber}>{totalServices}</Text>
            <Text style={styles.cardText}>Total Services</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 28,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 80,
  },
  bigText: {
    color: '#6bb8fa',
    paddingTop: 25,
    fontSize: 35,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  grayText: {
    paddingTop: 15,
    color: '#b0b0b0',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  biggrayText: {
    paddingTop: 20,
    color: '#807e7e',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  overviewCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '45%',
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#87CEFA',
    marginVertical: 5,
  },
  cardText: {
    fontSize: 12,
    color: '#808080',
    textAlign: 'center',
  },
});

export default Dashboard;
