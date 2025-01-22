import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ScrollView } from 'react-native';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [showInputs, setShowInputs] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    setLoading(true);
    fetch('http://192.168.100.9:3000/api/app/services')
      .then((response) => response.json())
      .then((data) => {
        setServices(data.services);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleAddService = async () => {
    if (!name || !description || !price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    // Ensure the price is properly formatted when submitting (only add .00 on submit)
    const formattedPrice = parseFloat(price).toFixed(2);
  
    const newService = { name, description, price: formattedPrice };
  
    try {
      const response = await fetch('http://192.168.100.9:3000/api/app/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newService),
      });
  
      const data = await response.json();
  
      if (response.ok && data.message === 'Service added successfully') {
        if (data.service && data.service.idservice) {
          setServices((prevServices) => [
            ...prevServices,
            { ...newService, idservice: data.service.idservice },
          ]);
          setName('');
          setDescription('');
          setPrice('');
          setShowInputs(false);
          Alert.alert('Success', 'Service added successfully');
        } else {
          Alert.alert('Error', 'Service ID is missing in the response');
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to add service');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      Alert.alert('Error', 'Failed to add service');
    }
  };
  
  const handleEditService = async () => {
    if (!selectedService || !selectedService.name || !selectedService.description || !selectedService.price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    // Ensure price is a decimal with two decimal places
    const formattedPrice = parseFloat(selectedService.price).toFixed(2);
  
    // Create the updated service object
    const updatedService = { ...selectedService, price: formattedPrice };
  
    try {
      // Make the PUT request to the backend to update the service
      const response = await fetch(`http://192.168.100.9:3000/api/app/services/${updatedService.idservice}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedService.name,
          description: updatedService.description,
          price: updatedService.price,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Update the local state if the backend update is successful
        setServices((prevServices) =>
          prevServices.map((service) =>
            service.idservice === updatedService.idservice ? updatedService : service
          )
        );
  
        // Close the modal and show success alert
        setIsEditable(false);
        setSelectedService(null);
        Alert.alert('Success', 'Service updated successfully');
      } else {
        // Show error if the update fails
        Alert.alert('Error', data.message || 'Failed to update service');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert('Error', 'Failed to update service');
    }
  };
  
  
  
  
  const handleDeleteService = async (id) => {
    try {
      const response = await fetch(`http://192.168.100.9:3000/api/app/services/${id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        setServices(services.filter(service => service.idservice !== id));
        Alert.alert('Success', 'Service deleted successfully');
        fetchServices();  // Refresh services list
      } else {
        Alert.alert('Error', 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      Alert.alert('Error', 'Failed to delete service');
    }
  };
  
  const renderService = ({ item }) => {
    console.log('Rendering service:', item); // Debugging log
  
    return (
      <TouchableOpacity
        style={styles.serviceItem}
        onPress={() => {
          console.log('Selected service:', item); // Debugging log
          setSelectedService((prev) => (prev?.idservice === item.idservice ? prev : item));
        }}
      >
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.servicePrice}>₱{item.price}</Text>
  
        {selectedService?.idservice === item.idservice && (
          <Modal transparent={true} animationType="slide" visible={!!selectedService}>
            <View style={styles.modalContainer}>
              <View style={styles.modalServiceDetailsBox}>
                <ScrollView>
                  <View style={styles.readOnlyContainer}>
                    <Text style={styles.readOnlyLabel}>Service ID:</Text>
                    <Text style={styles.readOnlyValue}>{selectedService.idservice}</Text>
                  </View>
  
                  {/* Name input (readonly or editable) */}
                  <TextInput
                    style={styles.input}
                    placeholder="SERVICE NAME"
                    value={selectedService.name}
                    onChangeText={(text) => setSelectedService({ ...selectedService, name: text })}
                    editable={isEditable}
                  />
  
                  {/* Description input (readonly or editable) */}
                  <TextInput
                    style={[styles.inputdesc, { height: 100 }]} // Adjust height as needed
                    placeholder="DESCRIPTION"
                    value={selectedService?.description}
                    onChangeText={(text) =>
                      setSelectedService({ ...selectedService, description: text })
                    }
                    editable={isEditable} // Only editable if isEditable is true
                    multiline={true} // Enable multiline input
                    numberOfLines={4} // Define number of lines for the input box (optional)
                    textAlignVertical="top" // Align text to the top of the input field
                  />
  
                  {/* Price input (readonly or editable) */}
                  <TextInput
                    style={styles.input}
                    placeholder="PRICE"
                    keyboardType="numeric"
                    value={selectedService.price.toString()}
                    onChangeText={(text) =>
                      setSelectedService({ ...selectedService, price: parseFloat(text) })
                    }
                    editable={isEditable} // Only editable if isEditable is true
                  />
  
                  {/* Buttons */}
                  {isEditable ? (
                    <TouchableOpacity style={styles.selectDateButton} onPress={handleEditService}>
                      <Text style={styles.selectDateText}>Save Changes</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.selectDateButton} onPress={() => setIsEditable(true)}>
                      <Text style={styles.selectDateText}>Edit Service</Text>
                    </TouchableOpacity>
                  )}
  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteService(selectedService.idservice)}
                  >
                    <Text style={styles.deleteButtonText}>Delete Service</Text>
                  </TouchableOpacity>
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedService(null)}  // Close modal only when explicitly clicked
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </TouchableOpacity>
    );
  };
  

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.bigText}>DENTAL SERVICES</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
         <FlatList
  data={services}
  renderItem={renderService}
  keyExtractor={(item) => item.idservice.toString()}
  refreshing={refreshing}
  onRefresh={onRefresh}
  initialNumToRender={10}  // Render the first 10 items initially
  maxToRenderPerBatch={5}  // Render the next 5 items in a batch
/>


          {showInputs && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="SERVICE NAME"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="DESCRIPTION"
                value={description}
                onChangeText={setDescription}
              />
           <TextInput
  style={styles.input}
  placeholder="PRICE"
  keyboardType="numeric"
  value={price}
  onChangeText={(text) => {
    // Ensure only numeric input and allow decimal point
    const formattedText = text.replace(/[^0-9.]/g, ''); // Removes any non-numeric characters (except .)
    setPrice(formattedText);
  }}
/>


              <TouchableOpacity style={styles.selectDateButton} onPress={handleAddService}>
                <Text style={styles.selectDateText}>Add Service</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setShowInputs((prev) => !prev)}
          >
            <Text style={styles.floatingButtonText}>{showInputs ? '>' : '+'}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  // ... your other styles here ...
  floatingButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#87CEFA',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
  serviceDescription: {
    fontSize: 16,
    color: '#333',
  },
  serviceId: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
    inputdesc: {
    height: 100,  // Increase the height for multiline input
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    textAlignVertical: 'top',  // Align text to the top for better readability
  },
  
    input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  selectDateButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#87CEFA',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    alignItems: 'center',
  },
  selectDateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#FF6347',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dark transparent background
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