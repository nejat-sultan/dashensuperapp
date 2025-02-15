import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      userName: string;
      fullname: string;
      roleId: string;
      phoneNumber: string;
      branchcode: string[];
      branchName: string;
      loginTime: number;
    } & DefaultSession['user'];
    accessToken: string;
  }

  interface User extends DefaultUser {
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
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
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
}
