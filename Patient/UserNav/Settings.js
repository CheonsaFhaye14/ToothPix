import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, useColorScheme } from 'react-native';

const Settings = () => {
  const [isEnabled, setIsEnabled] = React.useState(false); // Example for a switch toggle
  const [isDarkMode, setIsDarkMode] = React.useState(false); // Dark mode state

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const toggleDarkMode = () => setIsDarkMode(previousState => !previousState);

  const colorScheme = useColorScheme(); // Automatically detects system's theme

  // Dynamically set styles based on dark mode
  const styles = getStyles(isDarkMode ? 'dark' : 'light', colorScheme);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.bigText}>Settings</Text>

      {/* Dark Mode Toggle */}
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {/* Settings Options */}
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Account Settings</Text>
        <TouchableOpacity style={styles.button} onPress={() => alert('Account Settings')}>
          <Text style={styles.buttonText}>Go</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Notifications</Text>
        <Switch
          value={isEnabled}
          onValueChange={toggleSwitch}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Privacy</Text>
        <TouchableOpacity style={styles.button} onPress={() => alert('Privacy Settings')}>
          <Text style={styles.buttonText}>Go</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Help & Support</Text>
        <TouchableOpacity style={styles.button} onPress={() => alert('Help & Support')}>
          <Text style={styles.buttonText}>Go</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (theme, systemTheme) => {
  const isDark = theme === 'dark' || systemTheme === 'dark';

  return StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingTop: 30,
      backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3', // Use a lighter background for light mode
    },
    bigText: {
      color: '#4a90e2', // Keeping the same blue color for headings
      paddingTop: 25,
      fontSize: 36,
      fontWeight: 'bold',
      paddingHorizontal: 20,
      textAlign: 'center',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#444' : '#e2e2e2',
      paddingHorizontal: 20,
      backgroundColor: '#fff',
      marginVertical: 10,
      borderRadius: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    settingText: {
      fontSize: 18,
      color: isDark ? '#fff' : '#333', // Text color changes for dark mode
    },
    button: {
      backgroundColor: '#6bb8fa',
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
};

export default Settings;
