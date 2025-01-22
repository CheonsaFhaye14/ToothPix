

import React, { useEffect,useState, useCallback } from 'react';
import { View, Text,StyleSheet,TouchableOpacity,TextInput,ActivityIndicator,ScrollView,KeyboardAvoidingView,Platform, Keyboard, TouchableWithoutFeedback,} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignInScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // Clear token and reset inputs on screen focus
  useFocusEffect(
    useCallback(() => {
      //AsyncStorage.removeItem('token').catch((err) => console.error('Error clearing token:', err));
      AsyncStorage.clear().then(() => console.log('AsyncStorage cleared.'));
      setUsername('');
      setPassword('');
      setError(null);
    }, [])
  );
  useEffect(() => {
    const debugUserType = async () => {
      const storedUserType = await AsyncStorage.getItem('usertype');
      console.log('Stored User Type:', storedUserType);
    };
  
    debugUserType();
  }, []);
  useEffect(() => {
    const debugidUsers = async () => {
      await AsyncStorage.setItem('idUsers', idUsers.toString());
      console.log('Stored idUsers:', storedidUsers);
    };
  
    debugidUsers();
  }, []);
  

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
  
    setLoading(true);
    try {
      // Make API call to login 
      const response = await axios.post('http://192.168.100.9:3000/api/app/login', { username, password });
  
      const { token, usertype, idUsers } = response.data;
  
      if (!token || !usertype) {
        throw new Error('Invalid response from server.');
      }
  
      // Store token and usertype in AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('usertype', usertype); // Store usertype in AsyncStorage
      await AsyncStorage.setItem('idUsers', idUsers.toString());
      console.log('UserType:', usertype);
      console.log('idUsers:', idUsers);
      // Check usertype before navigating to Directory
      if (usertype === 'dentist' || usertype === 'patient') {
        // Navigate to the Directory screen (you can customize this if needed)

        navigation.navigate('Directory');
      } else {
        setError('Invalid user type.');
      }
    } catch (err) {
      console.error('Login error:', err);
  
      // Determine the error message based on response from server
      const errorMsg = err.response?.data?.message || err.message || 'Invalid username or password.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.bigText}>WELCOME</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputBox}
              placeholder="USERNAME"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="default"
            />
            <TextInput
              style={styles.inputBox}
              placeholder="PASSWORD"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              keyboardType="default"
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.rowContainer}>
            <Text style={styles.grayText}>Not yet registered?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkText}> Sign up here.</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SIGN IN</Text>}
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  bigText: {
    color: '#6bb8fa',
    fontSize: 35,
    fontWeight: 'bold',
    marginTop: 90,
  },
  inputContainer: {
    marginTop: 40,
    marginBottom: 80,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#87CEFA',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  grayText: {
    color: '#b0b0b0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#1E90FF',
    fontSize: 14,
  },
  inputBox: {
    backgroundColor: '#ededed',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 25,
    paddingVertical: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
export default SignInScreen;
