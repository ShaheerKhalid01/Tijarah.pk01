import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const useSecureCookies = process.env.NODE_ENV === 'production';
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

// Helper to wrap promise with a timeout
const withTimeout = (promise, ms, label) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label || 'Operation'} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        console.log("[Auth] Authorize started for:", credentials?.email);

        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // 1. Connect to DB with timeout
          console.log("[Auth] Connecting to DB...");
          await withTimeout(connectToDatabase(), 5000, "Database Connection");
          console.log("[Auth] DB connected");

          // 2. Find User with timeout
          console.log("[Auth] Finding user...");
          const user = await withTimeout(
            User.findOne({ email: credentials.email.toLowerCase().trim() }).select("+password"),
            3000,
            "User Lookup"
          );

          if (!user) {
            console.log("[Auth] User not found:", credentials.email);
            throw new Error("Invalid email or password");
          }

          // 3. Compare Passwords with timeout
          console.log("[Auth] Comparing passwords...");
          const isMatch = await withTimeout(
            bcrypt.compare(credentials.password, user.password),
            4000,
            "Password Verification"
          );

          if (!isMatch) {
            console.log("[Auth] Password mismatch");
            throw new Error("Invalid email or password");
          }

          // 4. Check User Role based on Context
          if (credentials.role === 'admin' && user.role !== 'admin') {
            console.log("[Auth] Non-admin user attempted admin login:", user.email);
            throw new Error("Invalid email or password"); // Keep error generic for security
          }

          console.log("[Auth] Success:", user.email);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error("[Auth] Error:", error.message);
          // Return a user-friendly error string that NextAuth will pass to the client
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: "/en/admin-auth/login",
    error: "/en/admin-auth/login"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
};
