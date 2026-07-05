import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import AuthProvider from '@/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Shopper - Premium 3D Shopping Experience',
  description: 'Shop with AI-powered recommendations and immersive 3D product views',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background scroll-smooth">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
