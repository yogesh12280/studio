import type { Metadata } from 'next'
import './globals.css'
import { cn } from '@/lib/utils'
import { UserProvider } from '@/contexts/user-context'
import { AuthChecker } from '@/components/auth-checker'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'SembConnect',
  description: 'Efficient and targeted bulletin delivery for your organization.',
  icons: {
    icon: {
      url: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M22 2 11 13'/%3e%3cpath d='m22 2-7 20-4-9-9-4 20-7z'/%3e%3c/svg%3e",
      type: 'image/svg+xml',
    }
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <UserProvider>
            <AuthChecker>
                {children}
            </AuthChecker>
            </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
