import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Michaforge Enterprises | Quality Plumbing & Hardware Materials Kenya',
  description:
    'Dealers in all plumbing materials: pipes, fittings, taps, valves, water tanks and hardware essentials in Kenya. Call or WhatsApp 0714843208.',
  keywords: [
    'plumbing materials Kenya',
    'PVC pipes',
    'pipe fittings',
    'taps and faucets',
    'brass ball valves',
    'water tanks',
    'hardware supplies Nairobi',
    'Michaforge Enterprises',
  ],
  authors: [{ name: 'Michaforge Enterprises' }],
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'Michaforge Enterprises — Dealers in all Plumbing Materials',
    description:
      'Your trusted supplier of plumbing materials, pipes, fittings, taps, valves and all hardware essentials in Kenya.',
    url: 'http://localhost:3000',
    siteName: 'Michaforge Enterprises',
    images: [
      {
        url: '/images/hero_plumbing_supplies.png',
        width: 1200,
        height: 630,
        alt: 'Michaforge Enterprises Plumbing Supplies',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
