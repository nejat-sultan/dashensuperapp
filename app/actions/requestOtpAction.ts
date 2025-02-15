'use server';

import axios from 'axios';
import { cookies } from 'next/headers';

export async function requestOtpAction(username: string) {
  try {
    if (!username) {
      return { success: false, message: 'Username is required' };
    }
    const response = await axios.post(
      'https://sau.eaglelionsystems.com/v1.0/chatbirrapi/ldapotp/dash/request/dashops',
      { username },
      {
        headers: {
          'Content-Type': 'application/json',
          sourceapp: 'ldapportal',
          otpfor: 'login',
        },
      }
    );

    console.log('Response', response.data);

    const { accesstoken } = response.data;

    if (!accesstoken) {
      return {
        success: false,
        message: 'Access token not received. OTP request failed.',
      };
    }

    const cookieStore = await cookies();
    cookieStore.set('access-token', accesstoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, 
      path: '/',
    });

    return {
      success: true,
      message: 'OTP Sent',
      data: response.data,
      accesstoken,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        'OTP Request Error:',
        error.response?.data || error.message
      );
      return {
        success: false,
        message: 'Failed to send OTP',
        error: error.response?.data || error.message,
      };
    }

    console.error('Unexpected Error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}
