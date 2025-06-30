import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ViewAllScreen() {
  const { section } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World - View All Screen</Text>
      <Text style={styles.subText}>Section: {section}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});