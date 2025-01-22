import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Dashboard = () => {
  const [summary, setSummary] = useState({ totalAppointments: 0, totalClinicVisits: 0 });

  useEffect(() => {
    fetch('http://192.168.100.9:3000/api/app/summary')
      .then(response => response.json())
      .then(data => setSummary({
        totalAppointments: data.total_appointments,
        totalClinicVisits: data.total_clinic_visits,
      }))
      .catch(err => console.error('Error fetching summary:', err));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.bigText}>DASHBOARD</Text>
        <Text style={styles.grayText}>
          Our app enhances your dental care journey with cutting-edge AR-based dental visualization. See detailed images of
          your teeth and gums, making it easier to understand diagnoses and treatment plans. Manage appointments, view
          dental records, and stay in touch with your dentist, all from your smartphone. It's dental care made smarter, right at your fingertips!
        </Text>
        <Text style={styles.biggrayText}>Overview</Text>
        <View style={styles.overviewCardsContainer}>
          <View style={styles.card}>
            <FontAwesome name="heartbeat" size={40} color="#87CEFA" />
            <Text style={styles.cardNumber}>{summary.totalClinicVisits}</Text>
            <Text style={styles.cardText}>Total Clinic Visits</Text>
          </View>

          <View style={styles.card}>
            <FontAwesome name="calendar" size={40} color="#87CEFA" />
            <Text style={styles.cardNumber}>{summary.totalAppointments}</Text>
            <Text style={styles.cardText}>Appointments</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 28, backgroundColor: '#fff' },
  contentContainer: { paddingBottom: 80 },
  bigText: {marginTop: 10, marginBottom: 20, color: '#6bb8fa', fontSize: 35, fontWeight: 'bold', paddingHorizontal: 20 },
  grayText: { color: '#b0b0b0', fontSize: 13, paddingHorizontal: 20 },
  biggrayText: { marginTop:20, color: '#807e7e', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20 },
  overviewCardsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 25 },
  card: { backgroundColor: '#f0f8ff', borderRadius: 10, padding: 15, alignItems: 'center', width: '45%' },
  cardNumber: { fontSize: 24, fontWeight: 'bold', color: '#87CEFA', marginVertical: 5 },
  cardText: { fontSize: 12, color: '#808080', textAlign: 'center' },
});

export default Dashboard;
