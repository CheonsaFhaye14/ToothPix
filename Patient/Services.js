import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, RefreshControl } from 'react-native';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch services from the API
  const fetchServices = () => {
    setLoading(true);
    fetch('http://192.168.100.9:3000/api/app/services')
      .then((response) => response.json())
      .then((data) => {
        setServices(data.services);
        setLoading(false);
        setRefreshing(false); // Stop refreshing when data is fetched
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        setRefreshing(false); // Stop refreshing if there's an error
      });
  };

  // Use useEffect to load data initially
  useEffect(() => {
    fetchServices();
  }, []);

  // Function to handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true); // Set refreshing state to true when pull is initiated
    fetchServices(); // Fetch the data again
  };

  const renderService = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => setSelectedService(selectedService?.idservice === item.idservice ? null : item)}
    >
      <Text style={styles.serviceName}>{item.name}</Text>
      <Text style={styles.servicePrice}>₱{item.price}</Text>

      {selectedService?.idservice === item.idservice && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={!!selectedService}
          onRequestClose={() => setSelectedService(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalServiceDetailsBox}>
              <ScrollView>
                <View style={styles.readOnlyContainer}>
                  <Text style={styles.readOnlyLabel}>Service ID:</Text>
                  <Text style={styles.readOnlyValue}>{selectedService.idservice}</Text>
                </View>
                <Text style={styles.serviceDescription}>{selectedService.description}</Text>
                <Text style={styles.servicePrice}>₱{selectedService.price}</Text>
              </ScrollView>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedService(null)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.bigText}>DENTAL SERVICES</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item) => item.idservice.toString()}
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
  serviceItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#d1eaf7', // Light blue theme
    borderRadius: 8,
    borderColor: '#a8c8e8',
    borderWidth: 1,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  servicePrice: {
    marginTop: 5,
    fontSize: 18,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dark transparent background
  },
  modalServiceDetailsBox: {
    padding: 20,
    backgroundColor: '#fff', // White background
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    width: '80%', // Fixed width same as other service details box
  },
  readOnlyContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  readOnlyLabel: {
    fontSize: 14,
    color: '#808080',
  },
  readOnlyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceDescription: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#6bb8fa',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Services;
