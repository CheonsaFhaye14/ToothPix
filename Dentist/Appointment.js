import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView, RefreshControl} from 'react-native';
import moment from 'moment';
import axios from 'axios';

const Appointment = () => {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [appointmentsByDate, setAppointmentsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const updatePastAppointments = async () => {
    try {
      await axios.put('http://192.168.100.9:3000/api/app/appointments/update-past');
      console.log('Past appointments updated successfully');
    } catch (error) {
      console.error('Error updating past appointments:', error);
    }
  };
  
  const fetchAppointments = async () => {
    try {
      // Update past appointments first
      await updatePastAppointments();
  
      // Fetch all appointments
      const response = await axios.get('http://192.168.100.9:3000/api/app/appointments');
      const appointments = response.data.appointments;
  
      // Group appointments by date
      const groupedAppointments = appointments.reduce((acc, appointment) => {
        const date = moment(appointment.date).format('YYYY-MM-DD');
        if (!acc[date]) acc[date] = [];
        acc[date].push(appointment);
        return acc;
      }, {});
  
      setAppointmentsByDate(groupedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };
  
 

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
    setTimeout(() => setRefreshing(false), 1000);
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
  

  const renderDay = (day) => {
    const isCurrentMonth = day.isSame(currentMonth, 'month');
    const dayFormatted = day.format('YYYY-MM-DD');
    const isPastDate = day.isBefore(moment(), 'day');
    const appointments = appointmentsByDate[dayFormatted] || [];
    const isSelected = selectedDate === dayFormatted;
  
    return (
      <TouchableOpacity
        key={dayFormatted}
        style={[
          styles.dayContainer,
          !isCurrentMonth && styles.blockedDay,
          isPastDate && styles.pastDay,
          isSelected && styles.selectedDay,
        ]}
        onPress={() => setSelectedDate(dayFormatted)}
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
  
  

  const changeMonth = (direction) => {
    setCurrentMonth((prev) => prev.clone().add(direction, 'months'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.bigText}>APPOINTMENT</Text>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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
              <Text key={index} style={styles.weekDayText}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>

            {generateMonthDays().map((day) => renderDay(day))}
          </View>
          
        </View>
        {selectedDate && (
  <View style={styles.scheduleNote}>
    <Text style={styles.scheduleNoteTitle}>
      Appointments for {selectedDate}:
    </Text>
    {appointmentsByDate[selectedDate]?.length > 0 ? (
      appointmentsByDate[selectedDate].map((appointment, index) => (
        <View key={index} style={styles.appointmentContainer}>
          <Text style={styles.appointmentText}>
            Patient ID: {appointment.idpatient}
          </Text>
          <Text style={styles.appointmentText}>
            Dentist ID: {appointment.iddentist}
          </Text>
          <Text style={styles.appointmentText}>
            Service ID: {appointment.idservice}
          </Text>
          <Text style={styles.appointmentText}>
            Notes: {appointment.notes || 'No notes provided'}
          </Text>
          <Text style={styles.appointmentText}>
            Status: {appointment.status}
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


      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
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
  scheduleNote: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 10,
    backgroundColor: '#87CEFA',
    borderRadius: 10,
  },
  scheduleNoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  appointmentText: {
    fontSize: 14,
    color: 'white',
    marginBottom: 5,
  },
  noAppointmentsText: {
    fontSize: 14,
    color: 'white',
    fontStyle: 'italic',
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 28,
  },
  bigText: {
    color: '#6bb8fa',
    paddingTop: 25,
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  calendarBox: {
    margin: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d9d9d9',
  },
  pastDay: {
  backgroundColor: '#ffe6e6', // Light red background for past dates
  borderColor: '#ffcccc',
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
  blockedDay: {
    backgroundColor: '#d3d3d3',
    borderColor: '#a9a9a9',
  },
  blockedDayText: {
    color: '#696969',
  },
  nonSelectableDay: {
    backgroundColor: '#f2f2f2',
    borderColor: '#cccccc',
  },
  nonSelectableDayText: {
    color: '#aaaaaa',
  },
  selectedDay: {
    backgroundColor: '#6bb8fa',
    borderColor: '#5a9bd3',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },

  scheduleNoteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  appointmentForm: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  redX: {
    position: 'absolute',
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
    bottom: 5,
    right: 5,
  },
  
});

export default Appointment
