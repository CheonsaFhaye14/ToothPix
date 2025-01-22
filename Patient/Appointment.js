import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, Modal, ScrollView, RefreshControl } from 'react-native';
import moment from 'moment';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Appointment = () => {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [scheduleMessage, setScheduleMessage] = useState('');
  const [idservice, setIdService] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
  const [idpatient, setidpatient] = useState('');
  const [iddentist, setiddentist] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [appointmentsByDate, setAppointmentsByDate] = useState({});

  useEffect(() => {
    const fetchIdPatient = async () => {
      const storedIdUsers = await AsyncStorage.getItem('idUsers');
      if (storedIdUsers) {
        setidpatient(storedIdUsers);
      } else {
        console.log('No idpatient found');
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`http://192.168.100.9:3000/api/app/appointments`);
        const filteredAppointments = response.data.appointments.filter(
          (app) => app.idpatient === idpatient // Only appointments for the current idpatient
        );

        // Group appointments by date
        const groupedAppointments = filteredAppointments.reduce((acc, appointment) => {
          const date = moment(appointment.date).format('YYYY-MM-DD'); // Format the date as key
          if (!acc[date]) acc[date] = [];
          acc[date].push(appointment); // Add the appointment to the corresponding date
          return acc;
        }, {});

        setAppointmentsByDate(groupedAppointments); // Store grouped appointments by date
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchIdPatient();
    fetchAppointments();
  }, [idpatient]);

  useEffect(() => {
    axios.get('http://192.168.100.9:3000/api/app/dentists')
      .then(response => {
        setDentists(response.data.dentists);
      })
      .catch(error => {
        console.error('Error fetching dentists:', error);
      });

    axios.get('http://192.168.100.9:3000/api/app/services')
      .then(response => {
        setServices(response.data.services);
      })
      .catch(error => {
        console.error('Error fetching services:', error);
      });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(`http://192.168.100.9:3000/api/app/appointments`);
      const filteredAppointments = response.data.appointments.filter(
        (app) => app.idpatient === idpatient
      );

      const groupedAppointments = filteredAppointments.reduce((acc, appointment) => {
        const date = moment(appointment.date).format('YYYY-MM-DD');
        if (!acc[date]) acc[date] = [];
        acc[date].push(appointment);
        return acc;
      }, {});
      setAppointmentsByDate(groupedAppointments);
    } catch (error) {
      console.error('Error refreshing appointments:', error);
    }
    setRefreshing(false);
  };

  const handleSubmitAppointment = () => {
    if (!idservice || !iddentist || !selectedDate || !idpatient) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    const today = moment().startOf('day');
    const selectedMoment = moment(selectedDate, 'YYYY-MM-DD');
  
    // Prevent appointments on past dates
    if (selectedMoment.isBefore(today)) {
      Alert.alert('Error', 'You cannot create an appointment on a past date');
      return;
    }
  
    // Check if there's already an appointment on the selected date
    if (appointmentsByDate[selectedDate]?.length > 0) {
      Alert.alert('Error', 'You already have an appointment scheduled on this day');
      return;
    }
  
    // Find selected dentist details
    const selectedDentist = dentists.find((dentist) => dentist.idUsers === iddentist);
  
    // Find selected service details
    const selectedService = services.find((service) => service.idservice === idservice);
  
    if (!selectedDentist || !selectedService) {
      Alert.alert('Error', 'Selected dentist or service not found');
      return;
    }
  
    const appointmentData = {
      idpatient,
      iddentist,
      idservice,
      date: selectedDate,
      status: 'N',
      notes: `Schedule with Dr.${selectedDentist.firstname} ${selectedDentist.lastname} for ${selectedService.name} on ${selectedDate}`,
    };
  
    axios.post('http://192.168.100.9:3000/api/app/appointments', appointmentData)
      .then(() => {
        Alert.alert('Success', 'Appointment saved!');
        setIsFormVisible(false);
        setScheduleMessage(
          `Scheduled with Dr.${selectedDentist.firstname} ${selectedDentist.lastname} for ${selectedService.name} on ${selectedDate}`
        );
  
        // Update appointments state after adding
        onRefresh();
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to create appointment');
        console.error('Error creating appointment:', error);
      });
  };
  
  const generateMonthDays = () => {
    const startOfMonth = currentMonth.clone().startOf('month').startOf('week');
    const endOfMonth = currentMonth.clone().endOf('month').endOf('week');
    const days = [];
    let day = startOfMonth.clone();

    while (day.isBefore(endOfMonth, 'day') || days.length % 7 !== 0) {
      days.push(day.clone());
      day.add(1, 'day');
    }

    return days;
  };

  const monthDays = generateMonthDays();

  const renderDay = (day) => {
    const isCurrentMonth = day.isSame(currentMonth, 'month');
    const isSelected = selectedDate === day.format('YYYY-MM-DD');
    const isPastDate = day.isBefore(moment(), 'day');
    const appointments = appointmentsByDate[day.format('YYYY-MM-DD')] || [];

    return (
      <TouchableOpacity
        key={day.format('YYYY-MM-DD')}
        style={[
          styles.dayContainer,
          !isCurrentMonth && styles.blockedDay,
          isPastDate && styles.pastDay,
          isSelected && styles.selectedDay,
        ]}
        onPress={() => setSelectedDate(day.format('YYYY-MM-DD'))}
      >
        <Text style={[styles.dayText, !isCurrentMonth && styles.blockedDayText]}>
          {day.format('D')}
        </Text>
        {isPastDate && <Text style={styles.redX}>X</Text>}
        {appointments.length > 0 && (
          <View style={styles.appointmentIndicator}>
            <Text style={styles.appointmentCount}>{appointments.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  const cancelAppointment = async (appointmentId) => {
    if (!appointmentId || isNaN(appointmentId)) {
      Alert.alert("Error", "Invalid Appointment ID");
      return;
    }
    
    Alert.alert(
      "Are you sure?",
      "Do you want to cancel this appointment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const response = await axios.delete(`http://192.168.100.9:3000/api/app/appointments/${appointmentId}`);
              Alert.alert("Success", "Appointment canceled successfully");
              fetchAppointments(); // Refresh the appointments list
            } catch (error) {
              console.error("Error canceling appointment:", error);
              console.error("Error Details:", error.response ? error.response.data : "No response data");
              Alert.alert("Error", "Failed to cancel the appointment. Please try again.");
            }
          },
        },
      ]
    );
  };
  const changeMonth = (direction) => {
    setCurrentMonth((prev) => prev.clone().add(direction, 'months'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.bigText}>APPOINTMENT</Text>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.calendarBox}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrow}>
              <Text style={styles.arrowText}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>{currentMonth.format('MMMM YYYY')}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrow}>
              <Text style={styles.arrowText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.weekDaysRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={index} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>{monthDays.map((day) => renderDay(day))}</View>
        </View>

        {selectedDate && (
  <View style={styles.scheduleNote}>
    <Text style={styles.scheduleNoteTitle}>
      Notes for appointments on {selectedDate}:
    </Text>
    {appointmentsByDate[selectedDate]?.length > 0 ? (
      appointmentsByDate[selectedDate].map((appointment, index) => (
        <View key={index} style={styles.appointmentContainer}>
          <Text style={styles.appointmentText}>
            {appointment.notes || 'No notes provided'}
          </Text>
          <Text style={styles.appointmentStatus}>
            Status: {appointment.status === 'N' ? 'Not Done' : 'Done'}
          </Text>
           {appointment.status !== "D" ? (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => cancelAppointment(appointment.idappointment)}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.appointmentText}>
                        Cannot cancel: Status is "D"
                      </Text>
                    )}
        </View>
      ))
    ) : (
      <Text style={styles.noAppointmentsText}>No appointments</Text>
    )}
  </View>
)}


        {selectedDate && !moment(selectedDate, 'YYYY-MM-DD').isBefore(moment().startOf('day')) && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setIsFormVisible(true)}
          >
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        )}

        <Modal
          animationType="fade"
          transparent={true}
          visible={isFormVisible}
          onRequestClose={() => setIsFormVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.appointmentForm}>
              {/* Dentist Selection */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputsmall}
                  placeholder="Select Dentist"
                  value={
                    dentists.find((dentist) => dentist.idUsers === iddentist)?.firstname
                      ? `${dentists.find((dentist) => dentist.idUsers === iddentist)?.firstname} ${dentists.find((dentist) => dentist.idUsers === iddentist)?.lastname}`
                      : ''
                  }
                  editable={false}
                />
                <RNPickerSelect
                  onValueChange={(value) => setiddentist(value)}
                  items={dentists.map((dentist) => ({
                    label: `Dr. ${dentist.firstname} ${dentist.lastname}`,
                    value: dentist.idUsers,
                  }))}
                  value={iddentist}
                  style={{ inputIOS: styles.input, inputAndroid: styles.input }}
                  placeholder={{ label: 'Select Dentist', value: '' }}
                />
              </View>

              {/* Service Selection */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputsmall}
                  placeholder="Select Service"
                  value={services.find((service) => service.idservice === idservice)?.name || ''}
                  editable={false}
                />
                <RNPickerSelect
                  onValueChange={(value) => setIdService(value)}
                  items={services.map((service) => ({
                    label: service.name,
                    value: service.idservice,
                  }))}
                  value={idservice}
                  style={{ inputIOS: styles.input, inputAndroid: styles.input }}
                  placeholder={{ label: 'Select Service', value: '' }}
                />
              </View>

              {/* Submit and Cancel Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAppointment}>
                  <Text style={styles.submitButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsFormVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 28,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  inputsmall: {
    width: '80%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  bigText: {
    color: '#6bb8fa',
    paddingTop: 25,
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  appointmentIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  appointmentCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  calendarBox: {
    margin: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d9d9d9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#6bb8fa',
    borderRadius: 5,
  },
  headerText: {
    fontSize: 18,
    color: '#e6f7ff',
    fontWeight: 'bold',
  },
  arrow: {
    padding: 5,
  },
  arrowText: {
    fontSize: 18,
    color: '#e6f7ff',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6bb8fa',
    textAlign: 'center',
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 10,
  },
  dayContainer: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  outsideDay: {
    backgroundColor: '#f0f0f0',
  },
  outsideDayText: {
    color: '#999',
  },
  selectedDay: {
    backgroundColor: '#6bb8fa',
    borderColor: '#5a9bd3',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pastDay: {
    backgroundColor: '#ffe6e6', // Light red background for past dates
    borderColor: '#ffcccc',
  },
  pastDayText: {
    color: '#d9534f', // Dark red text for past dates
  },
  redX: {
    position: 'absolute',
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
    bottom: 5,
    right: 5,
  },
  scheduleNote: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 10,
    backgroundColor: '#87CEFA',
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#d9534f',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scheduleNoteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scheduleNoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4a90e2',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000099',
  },
  appointmentForm: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#6bb8fa',
    paddingVertical: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

});

export default Appointment;
