import { betterAuth } from 'better-auth'

const appUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.ENCRYPTION_SECRET!,
  baseURL: appUrl,
  trustedOrigins: [
    appUrl,
    'http://localhost:3000',
    'https://autonomous-agent-platform-nine.vercel.app',
    'https://autonomous-agent-platform.vercel.app',
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
})
