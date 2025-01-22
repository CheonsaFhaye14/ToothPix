import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';

const CreateAccountScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usertype, setUsertype] = useState('patient'); // Default usertype is 'patient'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const handleSignUp = async () => {
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!username || !email || !trimmedPassword || !trimmedConfirmPassword) {
      alert('All fields are required!');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (trimmedPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://192.168.100.9:3000/api/app/register', {
        username,
        email,
        password: trimmedPassword,
        usertype,
      });

      alert('Registration successful! Please log in.');
      navigation.navigate('SignIn');
    } catch (err) {
      console.error('Error during registration:', err.response || err);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
  style={styles.container}
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.inner}>
        <Text style={styles.bigText}>CREATE ACCOUNT</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputBox}
            placeholder="USERNAME"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.inputBox}
            placeholder="EMAIL"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.inputBox}
            placeholder="PASSWORD"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.inputBox}
            placeholder="CONFIRM PASSWORD"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUsertype('patient')}
            >
              <Text
                style={usertype === 'patient' ? styles.selectedText : styles.deselectedText}
              >
                Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUsertype('dentist')}
            >
              <Text
                style={usertype === 'dentist' ? styles.selectedText : styles.deselectedText}
              >
                Dentist
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.row}>
          <Text style={styles.grayText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.linkText}> Sign in here.</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SIGN UP</Text>}
        </TouchableOpacity>
      </View>
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
  inner: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  bigText: {
    color: '#6bb8fa',
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 90,
  },
  inputContainer: {
    marginTop: 40,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 50,
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
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  radioButton: {
    padding: 10,
  },
  selectedText: {
    color: '#6bb8fa',
    fontWeight: 'bold',
  },
  deselectedText: {
    color: '#b0b0b0',
  },
});

export default CreateAccountScreen;
