import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LEZIT Transports — Transportation Management System',
  description: 'LEZIT Transport Management System MVP: register owners, drivers and vehicles, manage routes, schedules and trips.',
  icons: { icon: '/lezit-logo.jpg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
