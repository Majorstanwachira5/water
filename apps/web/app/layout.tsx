import type { Metadata } from 'next';
import './globals.css';
import ContentProtection from '../components/ContentProtection';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.michaforgeenterprises.com';

export const metadata: Metadata = {
  title: 'Michaforge Enterprises | Quality Plumbing & Hardware Materials Kenya',
  description:
    'Dealers in all plumbing materials: pipes, fittings, taps, valves, water tanks and hardware essentials in Kenya. Call or WhatsApp 0714843208 / 0721435772.',
  keywords: [
    'plumbing materials Kenya',
    'PVC pipes',
    'pipe fittings',
    'taps and faucets',
    'brass ball valves',
    'water tanks',
    'hardware supplies Nairobi',
    'Michaforge Enterprises',
    'Michaforge Enterprises and Hardware',
    'Gikomba plumbing supplies',
  ],
  authors: [{ name: 'Michaforge Enterprises and Hardware' }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Michaforge Enterprises and Hardware — Quality Plumbing Materials',
    description:
      'Your trusted supplier of plumbing materials, pipes, fittings, taps, valves and all hardware essentials in Kenya.',
    url: SITE_URL,
    siteName: 'Michaforge Enterprises and Hardware',
    images: [
      {
        url: '/images/hero_showroom_red_tap.jpg',
        width: 1200,
        height: 675,
        alt: 'Michaforge Enterprises and Hardware Showroom — Nairobi',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'HardwareStore',
  '@id': 'https://www.michaforgeenterprises.com/#store',
  name: 'Michaforge Enterprises and Hardware',
  alternateName: ['Michaforge Enterprises', 'Michaforge Plumbing & Hardware'],
  description:
    'Michaforge Enterprises is a trusted supplier and dealer in plumbing and hardware materials, committed to providing quality products at competitive prices.',
  url: 'https://www.michaforgeenterprises.com',
  telephone: ['+254714843208', '+254721435772'],
  priceRange: 'KES',
  currenciesAccepted: 'KES',
  paymentAccepted: 'Cash, M-Pesa, Credit Card',
  image: [
    'https://www.michaforgeenterprises.com/images/hero_showroom_red_tap.jpg',
    'https://www.michaforgeenterprises.com/images/about/showroom_corner_red_tap.jpg',
    'https://www.michaforgeenterprises.com/images/logo_clean.svg',
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kombo Munyiri Rd, Gikomba, next to Gold Stone Plaza',
    addressLocality: 'Nairobi',
    addressRegion: 'Nairobi County',
    postalCode: '00100',
    addressCountry: 'KE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -1.282029,
    longitude: 36.833892,
  },
  hasMap:
    'https://www.google.com/maps/search/?api=1&query=Michaforge+Enterprises+and+Hardware,+Kombo+Munyiri+Rd,+Nairobi',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '07:30',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday'],
      opens: '09:00',
      closes: '15:00',
      description: 'On Call / WhatsApp Orders',
    },
  ],
  sameAs: [
    'https://www.google.com/maps/search/?api=1&query=Michaforge+Enterprises+and+Hardware,+Kombo+Munyiri+Rd,+Nairobi',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ContentProtection />
        {children}
      </body>
    </html>
  );
}
