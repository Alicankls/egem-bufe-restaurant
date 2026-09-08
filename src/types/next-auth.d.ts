import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}

// `next-auth/jwt` yalnızca `@auth/core/jwt`'yi yeniden export ediyor;
// NextAuthConfig callback'leri `JWT` tipini doğrudan `@auth/core/jwt`'den
// aldığı için augmentation'ın oraya da uygulanması gerekiyor.
declare module '@auth/core/jwt' {
  interface JWT {
    id: string
  }
}
