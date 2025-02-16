'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Welcome, {session.user.fullname}
        </h1>
        <p className="text-center text-gray-500 text-lg">Dashboard</p>

        <div className="mt-6 border-t pt-4">
          <div className="space-y-3">
            <p className="text-gray-700">
              <span className="font-semibold">Username:</span> {session.user.userName}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Role:</span> {session.user.roleId}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Phone:</span> {session.user.phoneNumber}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Branch:</span> {session.user.branchName}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Branch Code:</span>{' '}
              {session.user.branchcode.join(', ')}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Login Time:</span>{' '}
              {new Date(session.user.loginTime).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg text-lg font-semibold transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
