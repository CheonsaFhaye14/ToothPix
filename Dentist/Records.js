import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';

const Records = () => {
  const [records, setRecords] = useState([]); // Initialize as an empty array
  const [refreshing, setRefreshing] = useState(false); // State to manage refreshing state

  // Function to fetch patient records from the API
  const fetchRecords = async () => {
    try {
      const response = await axios.get('http://192.168.100.9:3000/api/app/patients');
      console.log('Fetched records:', response.data); // Log the entire response
  
      // Check if patients exists and is an array
      if (response.data && Array.isArray(response.data.patients)) {
        setRecords(response.data.patients); // Use the patients array
      } else {
        console.error('patients is not an array or is missing:', response.data.patients);
      }
    } catch (error) {
      console.error('Error fetching patient records:', error);
    }
  };
  
  // Fetch records when the component mounts
  useEffect(() => {
    fetchRecords();
    console.log(records);  // Check the data in the state
  }, []);
  
  // Handle the refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
            <Text style={styles.bigText}>PATIENT'S RECORD</Text>
      
      {records.length === 0 ? (
        <Text style={styles.noRecordsText}>No records found</Text>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.idUsers.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recordBox}>
              <Text style={styles.recordName}>{item.firstname} {item.lastname}</Text>
              <Text style={styles.recordID}>Patient ID: {item.idUsers}</Text>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
  },
  noRecordsText: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  bigText: {
    color: '#6bb8fa',
    paddingTop: 25,
    fontSize: 35,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  recordBox: {
    padding: 20,
    marginBottom: 15,
    backgroundColor: '#6bb8fa',
    borderColor: '#5a9bd3',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // For shadow on Android
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginTop: 5,
  },
  recordName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  recordID: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
  },
});

export default Records;
