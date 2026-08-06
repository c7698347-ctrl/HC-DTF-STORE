import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

// Print credentials detection status in server console
console.log('--------------------------------------------------');
console.log('🔑 [NextAuth OAuth Configuration Status Check]');
console.log(`- NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`);
console.log(`- Callback URL: http://localhost:3000/api/auth/callback/google`);
console.log(`- GOOGLE_CLIENT_ID detected: ${Boolean(googleClientId)} (${googleClientId ? googleClientId.slice(0, 12) + '...' : 'MISSING'})`);
console.log(`- GOOGLE_CLIENT_SECRET detected: ${Boolean(googleClientSecret)} (${googleClientSecret ? '******' : 'MISSING'})`);
console.log('--------------------------------------------------');

const authOptions = {
  providers: [
    ...(googleClientId && googleClientSecret ? [
      GoogleProvider({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        authorization: {
          params: {
            prompt: 'select_account',
            access_type: 'offline',
            response_type: 'code'
          }
        }
      })
    ] : [])
  ],
  secret: process.env.NEXTAUTH_SECRET || 'hcdtfstore_nextauth_secret_key_987654321',
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/api/auth/signin',
    error: '/api/auth/error'
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
