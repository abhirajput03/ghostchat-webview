import apiClient from './apiClient';

/**
 * Send OTP to the provided mobile number to begin verification.
 * @param {Object} data - The request payload { mobile, country_code, is_coach }
 * @returns {Promise<any>}
 */
export const sendOtp = async (data) => {
  const response = await apiClient.post('/login', data);
  return response.data;
};


/**
 * Verify the OTP entered by the user.
 * @param {Object} data - The request payload { session_id, otp }
 * @returns {Promise<any>}
 */
export const verifyOtp = async (data) => {
  const response = await apiClient.post('/login/verify', data);
  return response.data;
};

/**
 * Permanently delete the authenticated user's account.
 * Requires a valid auth token in localStorage (set after OTP verification).
 * @returns {Promise<{ message: string }>}
 */
export const deleteAccount = async () => {
  const response = await apiClient.delete('/user');
  return response.data;
};
