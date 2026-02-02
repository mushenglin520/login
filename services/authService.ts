import { User, AuthResponse } from '../types';

// The Google Apps Script Web App URL provided by the user
const API_URL = 'https://script.google.com/macros/s/AKfycby8saLrgXiKAECkBqrD_s9dPqt2XZ94XI-w6fabWBEXOXdL9CTrt4i7HkUvdCbTARoR/exec';

/**
 * Sends a POST request to the Google Apps Script API.
 * We use text/plain to avoid CORS preflight (OPTIONS) requests which GAS handles poorly.
 */
const callGasApi = async (payload: any): Promise<AuthResponse> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      // Important: Do NOT set 'Content-Type': 'application/json'. 
      // Letting it default to text/plain prevents a preflight OPTIONS request.
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { 
      success: false, 
      message: '無法連線到伺服器，請檢查網路或稍後再試。' 
    };
  }
};

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  return callGasApi({
    action: 'login',
    username,
    password
  });
};

export const registerUser = async (username: string, password: string): Promise<AuthResponse> => {
  return callGasApi({
    action: 'register',
    username,
    password
  });
};