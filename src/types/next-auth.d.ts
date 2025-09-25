import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      companyName?: string;
      userType?: string;
      subscriptionTier?: string;
    } & DefaultSession['user'];
    accessToken?: string;
    provider?: string;
  }

  interface User extends DefaultUser {
    id: string;
    role?: string;
    companyName?: string;
    userType?: string;
    subscriptionTier?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role?: string;
    companyName?: string;
    userType?: string;
    subscriptionTier?: string;
    accessToken?: string;
    provider?: string;
  }
}