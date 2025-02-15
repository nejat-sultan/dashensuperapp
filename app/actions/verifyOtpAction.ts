'use server';

import axios from 'axios';
import { cookies } from 'next/headers';

export async function verifyOtpAction(otpcode: string) {
  try {
    if (!otpcode) {
      return { success: false, message: 'Username and OTP are required' };
    }

    const cookieStore = await cookies();
    const accesstoken = cookieStore.get('access-token')?.value;

    if (!accesstoken) {
      return {
        success: false,
        message: 'Access token is missing. Please request OTP again.',
      };
    }

    const response = await axios.post(
      'https://sau.eaglelionsystems.com/v1.0/chatbirrapi/ldapotp/dash/confirm/dashops',
      { otpcode },
      {
        headers: {
          'Content-Type': 'application/json',
          sourceapp: 'ldapportal',
          otpfor: 'login',
          Authorization: `Bearer ${accesstoken}`,
        },
      }
    );

    console.log('OTP Verification Success:', response.data);

    return {
      success: true,
      message: 'OTP verified successfully',
      data: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'OTP Verification Error:',
        error.response?.data || error.message
      );
      return {
        success: false,
        message: 'Invalid OTP or request failed',
        error: error.response?.data || error.message,
      };
    }

    console.error('Unexpected OTP Error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}
