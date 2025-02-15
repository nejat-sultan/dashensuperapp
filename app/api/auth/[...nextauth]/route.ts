import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';
import axios from 'axios';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

interface CustomJWT extends JWT {
  id: string;
  userName: string;
  fullname: string;
  roleId: string;
  phoneNumber: string;
  branchcode: string[];
  branchName: string;
  loginTime: number;
  accessToken: string;
}

interface UserToken {
  id: string;
  userName: string;
  fullname: string;
  roleId: string;
  phoneNumber: string;
  branchcode: string[];
  branchName: string;
  loginTime: number;
  accessToken: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const cookieStore = await cookies();
        const accesstoken = cookieStore.get('access-token')?.value;

        if (!credentials?.password || !accesstoken) {
          throw new Error('Missing credentials or access token');
        }

        try {
          const response = await axios.post(
            'https://sau.eaglelionsystems.com/v1.0/chatbirrapi/ldapauth/dash/pinops/passwordLogin',
            { password: credentials.password },
            {
              headers: {
                'Content-Type': 'application/json',
                sourceapp: 'ldapportal',
                otpfor: 'login',
                Authorization: `Bearer ${accesstoken}`,
              },
            }
          );

          const { token, user } = response.data;

          if (!token || !user) {
            throw new Error('Invalid login response');
          }

          return {
            id: user.userId,
            userName: user.userName,
            fullname: user.fullname,
            roleId: user.roleId,
            phoneNumber: user.phoneNumber,
            branchcode: user.branchcode,
            branchName: user.branchName,
            loginTime: user.loginTime,
            accessToken: token,
          };
        } catch (error) {
          console.error('Login Error:', error);
          throw new Error('Invalid credentials');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: UserToken }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          userName: user.userName,
          fullname: user.fullname,
          roleId: user.roleId,
          phoneNumber: user.phoneNumber,
          branchcode: user.branchcode,
          branchName: user.branchName,
          loginTime: user.loginTime,
          accessToken: user.accessToken,
        } as CustomJWT;
      }
      return token as CustomJWT;
    },
    async session({ session, token }: { session: Session; token: CustomJWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.userName = token.userName;
        session.user.fullname = token.fullname;
        session.user.roleId = token.roleId;
        session.user.phoneNumber = token.phoneNumber;
        session.user.branchcode = token.branchcode;
        session.user.branchName = token.branchName;
        session.user.loginTime = token.loginTime;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
