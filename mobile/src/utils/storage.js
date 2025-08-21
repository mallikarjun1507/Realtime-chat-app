// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'chatapp_token';
const USER_KEY  = 'chatapp_user';

export const saveAuth = async (token, user) => {
  try {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token || ''],
      [USER_KEY, user ? JSON.stringify(user) : '']
    ]);
  } catch (err) {
    console.error("Error saving auth:", err);
  }
};

export const clearAuth = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch (err) {
    console.error("Error clearing auth:", err);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.error("Error getting token:", err);
    return null;
  }
};

export const getUser = async () => {
  try {
    const s = await AsyncStorage.getItem(USER_KEY);
    if (!s || s === 'undefined' || s === 'null' || s === '') return null;
    return JSON.parse(s);
  } catch (err) {
    console.warn('Invalid user JSON in storage');
    return null;
  }
};
