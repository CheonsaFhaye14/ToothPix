import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Make sure to import AsyncStorage
import axios from 'axios';
import moment from 'moment';

const Records = () => {
  const [appointments, setAppointments] = useState([]); // State to hold list of appointments
  const [selectedRecord, setSelectedRecord] = useState(null); // State to hold selected record for details
  const [idpatient, setIdPatient] = useState(null); // State to hold the patient ID

  useEffect(() => {
    const fetchIdPatient = async () => {
      const storedIdUsers = await AsyncStorage.getItem('idUsers');
      if (storedIdUsers) {
        setIdPatient(storedIdUsers);
      } else {
        console.log('No idpatient found');
      }
    };
  
    const fetchAppointments = async () => {
      if (idpatient) {
        try {
          const response = await axios.get(`http://192.168.100.9:3000/api/app/appointmentsrecord/${idpatient}`);
          console.log('Fetched Appointments:', response.data.appointments);  // Check the response here
  
          if (response.data.appointments && response.data.appointments.length > 0) {
            setAppointments(response.data.appointments);
          } else {
            console.log('No appointments found.');
          }
        } catch (error) {
          console.error('Error fetching appointments:', error);
        }
      }
    };
  
    fetchIdPatient();
    fetchAppointments();
  }, [idpatient]);
  
  // Function to handle clicking a record
  const handleRecordClick = (record) => {
    setSelectedRecord(record);
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedRecord(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.bigText}>Records</Text>

        {/* List of Appointments */}
        {appointments.length > 0 ? (
          appointments.map((record) => (
            <TouchableOpacity
              key={record.idappointment}
              style={styles.recordBox}
              onPress={() => handleRecordClick(record)}
            >
              <Text style={styles.recordName}>Appointment #{record.idappointment}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No appointments available</Text>
        )}
      </ScrollView>

      {/* Modal to show detailed information of the selected record */}
      {selectedRecord && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={selectedRecord !== null}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Appointment #{selectedRecord.idappointment}</Text>
              <Text style={styles.modalDetail}>Notes: {selectedRecord.notes}</Text>
              <Text style={styles.modalDetail}>Price: ${selectedRecord.service_price}</Text>

              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 28,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  bigText: {
    color: '#6bb8fa',
    fontSize: 35,
    fontWeight: 'bold',
    paddingBottom: 15,
  },
  contentContainer: {
    paddingBottom: 50,
  },
  recordBox: {
    padding: 20,
    marginBottom: 15,
    backgroundColor: '#6bb8fa',
    borderColor: '#5a9bd3',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#6bb8fa',
  },
  modalDetail: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#87CEFA',
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Records;
