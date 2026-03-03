import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'TaskFlow — Modern Task Management',
  description: 'Streamline your workflow with TaskFlow — a powerful task management platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="noise">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#12121c',
                color: '#f1f0ff',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                borderRadius: '12px',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.875rem',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#12121c' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#12121c' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
