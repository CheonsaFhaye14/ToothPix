import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Dashboard from './Dashboard';
import Record from './Records';
import Appointment from './Appointment';
import Services from './Services';
import Notif from './Notif'; // Notifications Screen
import User from './UserNav/User'; // Sidebar content

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DefaultDashboardHeader = ({ onToggleSidebar }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.whiteSpace}></View>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={onToggleSidebar}>
          <FontAwesome
            name="user-circle"
            size={24}
            color="white"
            style={styles.headerIconLeft}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Notif')}>
          <MaterialIcons
            name="notifications"
            size={24}
            color="white"
            style={styles.headerIconRight}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DirectoryTabs = ({ onToggleSidebar }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => {
          if (route.name === 'Dashboard') {
            return <DefaultDashboardHeader onToggleSidebar={onToggleSidebar} />;
          }
          return null;
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Records') {
            iconName = 'book';
          } else if (route.name === 'Appointment') {
            iconName = 'calendar';
          } else if (route.name === 'Services') {
            iconName = 'cog';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#f0f0f0',
        tabBarStyle: styles.tabBar,
      })}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Records" component={Record} />
      <Tab.Screen name="Appointment" component={Appointment} />
      <Tab.Screen name="Services" component={Services} />
    </Tab.Navigator>
  );
};

const Directory = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useState(
    new Animated.Value(-Dimensions.get('window').width)
  )[0];

  const toggleSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(slideAnim, {
        toValue: -Dimensions.get('window').width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleGesture = (event) => {
    if (event.nativeEvent.translationX < -100) {
      toggleSidebar();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs">
          {() => <DirectoryTabs onToggleSidebar={toggleSidebar} />}
        </Stack.Screen>
        <Stack.Screen
          name="Notif"
          component={Notif}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#6bb8fa' },
            headerTintColor: '#fff',
            headerTitle: 'Notifications',
          }}
        />
      </Stack.Navigator>

      {/* Sidebar with Gesture Support */}
      <GestureHandlerRootView style={styles.sidebarContainer}>
        <PanGestureHandler onGestureEvent={handleGesture}>
          <Animated.View
            style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
            <User /> {/* Sidebar content */}
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: '#6bb8fa',
  },
  whiteSpace: {
    height: 40,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  headerIconLeft: {
    marginLeft: 5,
  },
  headerIconRight: {
    marginRight: 5,
  },
  tabBar: {
    backgroundColor: '#87CEFA',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: 65,
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: Dimensions.get('window').width * 0.75,
    backgroundColor: '#6bb8fa',
  },
});

export default Directory;
