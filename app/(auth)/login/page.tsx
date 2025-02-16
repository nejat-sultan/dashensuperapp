'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { requestOtpAction } from '@/app/actions/requestOtpAction';
import { verifyOtpAction } from '@/app/actions/verifyOtpAction';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

 
  const requestOtpMutation = useMutation({
    mutationFn: requestOtpAction,
    onSuccess: (data) => {
      if (data.success) {
        setOtpToken(data.accesstoken);
        setStep(2);

        if (data.data.otpcode) {
          const otpDigits = data.data.otpcode.split('').slice(0, 6);
          setOtpCode([...otpDigits, ...Array(6 - otpDigits.length).fill('')]);
        }
      } else {
        setError(data.message);
      }
    },
    onError: () => {
      setError('Failed to send OTP. Try again.');
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtpAction,
    onSuccess: (data) => {
      if (data.success) {
        setOtpToken(data.data?.accesstoken);
        setStep(3);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    },
    onError: () => {
      setError('Invalid OTP or request failed.');
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
  };

  const handleRequestOtp = (values: { username: string }) => {
    requestOtpMutation.mutate(values.username);
  };

  const handleVerifyOtp = () => {
    const otpString = otpCode.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    if (!otpToken) {
      setError('OTP Token missing. Please request OTP again.');
      return;
    }

    verifyOtpMutation.mutate(otpString);
  };

  const handlePasswordLogin = async (values: { password: string }) => {
    setLoading(true);
    setError(null);

    if (!otpToken) {
      setError('Access token is missing. Please complete OTP verification.');
      setLoading(false);
      return;
    }

    const result = await signIn('credentials', {
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid password');
    } else {
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <div className="w-full md:w-1/2 bg-[#151d68] flex items-center justify-center relative h-40 md:h-auto">
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/wave.png')" }} />
        <div className="text-white text-center relative z-10">
          <p className="text-md md:text-lg">Welcome to</p>
          <h1 className="text-xl md:text-3xl font-bold">Dashen Super App Dashboard</h1>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-4 md:px-0">
        <div className="w-full max-w-md"> 
          <div className="flex justify-center mb-4">
            <Image src="/dashenbank.jpeg" alt="Dashen Bank Logo" width={150} height={150} />
          </div>

          <h1 className="text-2xl font-bold text-center">Login</h1>
          <p className="text-black text-center mt-2 mb-4">
            Welcome to Dashen Bank Dashboard!
          </p>

          {error && <p className="text-red-500 mb-3 text-center">{error}</p>}

          {step === 1 && (
            <Formik
            initialValues={{ username: '' }}
            validationSchema={Yup.object().shape({
              username: Yup.string().required('Username is required'),
            })}
            onSubmit={(values, { setSubmitting }) => {
              setSubmitting(true);
              handleRequestOtp(values);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <label className="text-gray-400 block text-sm font-medium">Username</label>
                <div className="relative">
                  <Field
                    name="username"
                    type="text"
                    placeholder="Username"
                    className="w-full p-2 pr-20 border rounded"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#151d68] text-white px-4 py-2 rounded"
                    disabled={isSubmitting} 
                  >
                    {isSubmitting ? 'Sending...' : 'Get OTP'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
          
          )}

          {step === 2 && (
            <>
              <p className="text-gray-400 text-center mb-4">Enter OTP sent to your phone</p>
              <div className="flex justify-center space-x-2">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-10 h-10 md:w-12 md:h-12 border border-[#151d68] rounded text-center text-lg md:text-xl"
                  />
                ))}
              </div>
              <button
                onClick={handleVerifyOtp}
                className="w-full mt-4 bg-[#151d68] text-white p-4 rounded"
                disabled={verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending ? 'Verifying OTP...' : 'Next'}
              </button>
            </>
          )}

          {step === 3 && (
            <Formik
              initialValues={{ password: '' }}
              validationSchema={Yup.object().shape({
                password: Yup.string().required('Password is required'),
              })}
              onSubmit={handlePasswordLogin}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <label className="text-gray-400 block text-sm font-medium">Enter Your Password</label>
                  <Field
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border rounded"
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#151d68] text-white p-4 rounded"
                    disabled={isSubmitting || loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
}
