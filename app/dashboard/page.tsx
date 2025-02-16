'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session || !session.user) {
    return <p>Redirecting...</p>;
  }

  return (
    <div className="p-4 flex justify-center mt-10 bg-white">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {session.user.fullname}
        </h1>
        <p className="text-gray-600">Username: {session.user.userName}</p>
        <p className="text-gray-600">Role: {session.user.roleId}</p>
        <p className="text-gray-600">Phone: {session.user.phoneNumber}</p>
        <p className="text-gray-600">Branch: {session.user.branchName}</p>
        <p className="text-gray-600">
          Branch Code: {session.user.branchcode.join(', ')}
        </p>
        <p className="text-gray-600">
          Login Time: {new Date(session.user.loginTime).toLocaleString()}
        </p>

        <button
          onClick={() => signOut()}
          className="mt-4  bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
