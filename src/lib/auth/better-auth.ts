import { betterAuth } from 'better-auth'

// Derive the base URL — in production this must exactly match what the browser sees
const productionURL = 'https://autonomous-agent-platform-nine.vercel.app'
const appUrl = process.env.BETTER_AUTH_URL
  ?? process.env.NEXT_PUBLIC_APP_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  ?? productionURL

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.ENCRYPTION_SECRET!,
  baseURL: appUrl,
  trustedOrigins: [
    productionURL,
    'http://localhost:3000',
    'http://localhost:3001',
    // Also trust any Vercel preview URL for this project
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
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
