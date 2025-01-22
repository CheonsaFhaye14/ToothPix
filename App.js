import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Animated, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

// Import Screens
import Screen1 from './screens/Screen1';
import SignInScreen from './screens/SignInScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import PatientDashboard from './Patient/Dashboard';
import PatientRecord from './Patient/Records';
import PatientAppointment from './Patient/Appointment';
import PatientServices from './Patient/Services';
import PatientNotif from './Patient/Notif';
import PatientProfile from './Patient/UserNav/Profile';
import PatientSettings from './Patient/UserNav/Settings';
import PatientHelp from './Patient/UserNav/Help';
import DentistDashboard from './Dentist/Dashboard';
import DentistRecord from './Dentist/Records';
import DentistAppointment from './Dentist/Appointment';
import DentistServices from './Dentist/Services';
import DentistNotif from './Dentist/Notif';
import DentistProfile from './Dentist/UserNav/Profile';
import DentistSettings from './Dentist/UserNav/Settings';
import DentistHelp from './Dentist/UserNav/Help';

// Create Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const Sidebar = ({ isVisible, onClose, navigation, userType, currentScreen }) => {
  const screenWidth = Dimensions.get('window').width;
  const translateX = new Animated.Value(isVisible ? 0 : -screenWidth);

  Animated.timing(translateX, {
    toValue: isVisible ? 0 : -screenWidth,
    duration: 300,
    useNativeDriver: true,
  }).start();

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>
          {/* Dentist-Specific Items */}
          {userType === 'dentist' && (
            <>
              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  navigation.navigate('DentistProfile');
                  onClose();
                }}
              >
                <FontAwesome name="user-circle" size={20} color="#6bb8fa" />
                <Text style={styles.sidebarText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  navigation.navigate('DentistSettings');
                  onClose();
                }}
              >
                <FontAwesome name="cogs" size={20} color="#6bb8fa" />
                <Text style={styles.sidebarText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  navigation.navigate('DentistHelp');
                  onClose();
                }}
              >
                <FontAwesome name="question-circle" size={20} color="#6bb8fa" />
                <Text style={styles.sidebarText}>Help</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Patient-Specific Items */}
          {userType === 'patient' && (
            <>
              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  navigation.navigate('PatientProfile');
                  onClose();
                }}
              >
                <FontAwesome name="user-circle" size={20} color="#6bb8fa" />
                <Text style={styles.sidebarText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  navigation.navigate('PatientSettings');
                  onClose();
                }}
              >
                <FontAwesome name="cogs" size={20} color="#6bb8fa" />
                <Text style={styles.sidebarText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  navigation.navigate('PatientHelp');
                  onClose();
                }}
              >
                <FontAwesome name="question-circle" size={20} color="#6bb8fa" />
                <Text style={styles.sidebarText}>Help</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const DirectoryTabsPatient = ({ navigation }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('PatientDashboard');

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          header: () => (
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setSidebarVisible(true)}>
                <FontAwesome name="user-circle" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('PatientNotif')}>
                <MaterialIcons name="notifications" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ),
          tabBarIcon: ({ color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Dashboard':
                iconName = 'dashboard';
                break;
              case 'Records':
                iconName = 'book';
                break;
              case 'Appointment':
                iconName = 'calendar';
                break;
              case 'Services':
                iconName = 'cogs';
                break;
            }
            return <FontAwesome name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#f0f0f0',
          tabBarStyle: styles.tabBar,
        })}
      >
        <Tab.Screen name="Dashboard" component={PatientDashboard} />
        <Tab.Screen name="Records" component={PatientRecord} />
        <Tab.Screen name="Appointment" component={PatientAppointment} />
        <Tab.Screen name="Services" component={PatientServices} />
      </Tab.Navigator>

      {sidebarVisible && (
        <Sidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        userType="patient" // Pass userType here
        currentScreen={currentScreen}
      />
      )}
    </View>
  );
};

const DirectoryTabsDentist = ({ navigation }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('DentistDashboard');

  useFocusEffect(
    useCallback(() => {
      // Update current screen when the tab changes
      const unsubscribe = navigation.addListener('focus', () => {
        const routeName = navigation.getState().routeNames[navigation.getState().index];
        setCurrentScreen(routeName);
      });

      return unsubscribe;
    }, [navigation])
  );

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          header: () => (
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setSidebarVisible(true)}>
                <FontAwesome name="user-circle" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('DentistNotif')}>
                <MaterialIcons name="notifications" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ),
          tabBarIcon: ({ color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Dashboard':
                iconName = 'dashboard';
                break;
              case 'Records':
                iconName = 'book';
                break;
              case 'Appointment':
                iconName = 'calendar';
                break;
              case 'Services':
                iconName = 'cogs';
                break;
            }
            return <FontAwesome name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#f0f0f0',
          tabBarStyle: styles.tabBar,
        })}
      >
        <Tab.Screen name="Dashboard" component={DentistDashboard} />
        <Tab.Screen name="Records" component={DentistRecord} />
        <Tab.Screen name="Appointment" component={DentistAppointment} />
        <Tab.Screen name="Services" component={DentistServices} />
      </Tab.Navigator>

      {sidebarVisible && (
        <Sidebar
          isVisible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          navigation={navigation}
          userType="dentist" // Pass userType as 'dentist'
          currentScreen={currentScreen} // Pass current screen to Sidebar
        />
      )}
    </View>
  );
};

function App() {
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserType = async () => {
      const storedUserType = await AsyncStorage.getItem('usertype');
      console.log('Stored User Type on directory picks:', storedUserType); // Debugging userType
      setUserType(storedUserType);
      setLoading(false); // Stop loading after setting the user type
    };

    getUserType();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Screen1} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={CreateAccountScreen} />
        <Stack.Screen name="Directory">
  {(props) => {
    useEffect(() => {
      const getUserType = async () => {
        const storedUserType = await AsyncStorage.getItem('usertype');
        console.log('Stored User Type:', storedUserType); // Debugging userType
        setUserType(storedUserType);
      };

      getUserType(); // Call getUserType when navigating to Directory screen
    }, []); // Empty dependency array ensures this runs only on mount

    console.log('User Type in Directory Screen:', userType); // Log userType here
    return userType === 'patient' ? (
      <DirectoryTabsPatient {...props} />
    ) : (
      <DirectoryTabsDentist {...props} />
    );
  }}
</Stack.Screen>

        {/* Dentist-specific screens */}
        <Stack.Screen name="DentistProfile" component={DentistProfile} />
        <Stack.Screen name="DentistSettings" component={DentistSettings} />
        <Stack.Screen name="DentistHelp" component={DentistHelp} />
        <Stack.Screen name="DentistNotif" component={DentistNotif} />
        
        {/* Patient-specific screens */}
        <Stack.Screen name="PatientProfile" component={PatientProfile} />
        <Stack.Screen name="PatientSettings" component={PatientSettings} />
        <Stack.Screen name="PatientHelp" component={PatientHelp} />
        <Stack.Screen name="PatientNotif" component={PatientNotif} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6bb8fa',
    padding: 15,
    marginTop: 25,
  },
  tabBar: {
    backgroundColor: '#87CEFA',
    borderTopWidth: 0,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 100,
    paddingLeft: 20,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  sidebarText: {
    fontSize: 18,
    marginLeft: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default App;