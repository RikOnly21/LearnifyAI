import React from 'react';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env')
}
const App = () => {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkLoaded>
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/loginImage.png')}
          style={styles.headerImage}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Chào mừng bạn đến với</Text>
        <Text style={styles.appName}>LearnifyAI</Text>
        <Text style={styles.loginText}>Đăng nhập/Đăng ký</Text>
        <TouchableOpacity style={styles.googleButton}>
          <Image
            source={{ uri: 'https://your-image-url.com/google-icon.png' }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Đăng nhập bằng Google</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ClerkLoaded>
    </ClerkProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  content: {
    flex: 2,
    alignItems: 'center',
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 16,
    marginBottom: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default App;