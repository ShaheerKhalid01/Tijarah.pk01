import { Inter } from 'next/font/google';
import '../globals.css';
import { NotificationProvider } from '../contexts/NotificationContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
});

export const metadata = {
  title: 'Tijarah.pk',
  description: 'Your marketplace platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta charSet="utf-8" />
      </head>
      <body className={inter.variable}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}