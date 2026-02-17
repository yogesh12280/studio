import type { Metadata } from 'next'
import './globals.css'
import { cn } from '@/lib/utils'
import { UserProvider } from '@/contexts/user-context'
import { AuthChecker } from '@/components/auth-checker'
import { ThemeProvider } from '@/components/theme-provider'
import { Sidebar } from '@/components/sidebar'

export const metadata: Metadata = {
  title: 'SembConnect',
  description: 'Internet Bill Reimbursement Management',
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
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex-1 flex flex-col">
                    {children}
                  </div>
                </div>
              </AuthChecker>
            </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
