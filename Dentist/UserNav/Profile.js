import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [contact, setContact] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [idUsers, setidUsers] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const idUsers = await AsyncStorage.getItem('idUsers');

        if (!token || !idUsers) {
          Alert.alert('Error', 'User not logged in or missing credentials.');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://192.168.100.9:3000/api/app/profile/${idUsers}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'Failed to fetch profile.');
          setLoading(false);
          return;
        }

        const profileData = await response.json();
        const profile = profileData.profile;

        setUserData(profile);
        setFirstname(profile.firstname || '');
        setLastname(profile.lastname || '');
        setBirthdate(profile.birthdate || '');
        setContact(profile.contact || '');
        setGender(profile.gender || '');
        setEmail(profile.email || '');
        setUsername(profile.username || '');
        setidUsers(profile.idUsers || '');
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred while fetching the profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You are not logged in. Please log in again.');
        return;
      }

      const updatedData = {
        firstname: firstname || userData.firstname,
        lastname: lastname || userData.lastname,
        birthdate: birthdate || userData.birthdate,
        contact: contact || userData.contact,
        gender: gender || userData.gender,
        email: email || userData.email,
        username: username || userData.username,
      };

      const response = await fetch(`http://192.168.100.9:3000/api/app/profile`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        let errorMessage = 'Failed to update profile.';
        if (errorResponse.errors) {
          errorMessage = errorResponse.errors.map(err => `${err.param}: ${err.msg}`).join(', ');
        } else if (errorResponse.message) {
          errorMessage = errorResponse.message;
        }
        Alert.alert('Error', errorMessage);
      } else {
        const updatedProfileData = await response.json();
        setUserData(updatedProfileData.profile);
        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred while updating the profile.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6bb8fa" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.bigText}>Profile</Text>

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="First Name" value={firstname} onChangeText={setFirstname} editable={isEditing} />
          <TextInput style={styles.input} placeholder="Last Name" value={lastname} onChangeText={setLastname} editable={isEditing} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} editable={isEditing} />
          <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} editable={isEditing} />
          <TextInput style={styles.input} placeholder="Birthdate (YYYY-MM-DD)" value={birthdate} onChangeText={setBirthdate} editable={isEditing} />
          <TextInput style={styles.input} placeholder="Contact" value={contact} onChangeText={setContact} editable={isEditing} />
          <TextInput style={styles.input} placeholder="Gender" value={gender} onChangeText={setGender} editable={isEditing} />
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={isEditing ? handleSaveData : () => setIsEditing(true)}>
            <Text style={styles.actionButtonText}>{isEditing ? 'Save Changes' : 'Edit Profile'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  scrollContent: {
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4a90e2',
  },
  bigText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4a90e2',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  buttonsContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#6bb8fa',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Profile;
