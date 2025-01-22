import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const Screen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../logo.png')} style={styles.logo} />

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SignIn')} // Navigate to Details screen
      >
        <Text style={styles.buttonText}>GET STARTED</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center elements vertically
    alignItems: 'center', // Center elements horizontally
    backgroundColor: '#fff', // Background color
  },
  logo: {
    width: 400, // Width of the logo
    height: 400, // Height of the logo
    marginBottom: 50, // Add space between the logo and the button
  },
  button: {
    backgroundColor: '#87CEFA', // Button color
    borderRadius: 20, // Rounder corners
    paddingVertical: 20, // Vertical padding
    paddingHorizontal: 50, // Horizontal padding
    alignItems: 'center', // Center the text
    shadowColor: '#000', // Add shadow for depth
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 3, // Shadow blur
    elevation: 5, // Elevation for Android
  },
  buttonText: {
    color: '#fff', // White text
    fontSize: 18, // Font size
    fontWeight: 'bold', // Bold text
  },
});

export default Screen1;
