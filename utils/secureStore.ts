import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const BIOMETRIC_KEY = 'biometric_enabled'; // 'true' | 'false'

export async function saveTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access, { keychainService: 'auth' });
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh, { keychainService: 'auth' });
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY, { keychainService: 'auth' });
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY, { keychainService: 'auth' });
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY, { keychainService: 'auth' });
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, { keychainService: 'auth' });
}

export async function setBiometricEnabled(v: boolean) {
  await SecureStore.setItemAsync(BIOMETRIC_KEY, v ? 'true' : 'false');
}

export async function isBiometricEnabled() {
  const v = await SecureStore.getItemAsync(BIOMETRIC_KEY);
  return v === 'true';
}