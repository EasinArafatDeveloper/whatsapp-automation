import type { Metadata, Viewport } from 'next';
import LiveSupportWidget from '@/components/LiveSupportWidget';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const siteUrl = 'https://whatsapp-automation.scaleupweb.xyz';

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Free WhatsApp Automation Platform | AI Auto Reply Bot for Business — Sohoj Reply',
    template: '%s | Free WhatsApp Automation — Sohoj Reply',
  },
  description:
    '100% Free WhatsApp Automation software & AI Auto Reply Engine for WhatsApp Business. Connect your WhatsApp number instantly via QR code scan. Automate DeepSeek AI customer support replies, pricing queries, product details & lead capture 24/7 without paid Meta API fees.',
  keywords: [
    'Free WhatsApp Automation',
    'Free WhatsApp Business Automation',
    'Free WhatsApp Auto Reply Bot',
    'WhatsApp AI Customer Support',
    'Free WhatsApp Chatbot SaaS',
    'Free WhatsApp Marketing Tool',
    'WhatsApp Automation Software',
    'WhatsApp Business API Free',
    'DeepSeek WhatsApp AI Bot',
    'WhatsApp Auto Responder Free',
    'WhatsApp Automation Bangladesh',
    'Free WhatsApp Chatbot for E-commerce',
    'Baileys WhatsApp Multi-Session',
    'Sohoj Reply WhatsApp',
  ],
  authors: [{ name: 'Sohoj Reply Team', url: siteUrl }],
  creator: 'Sohoj Reply',
  publisher: 'Sohoj Reply',
  category: 'Technology & Business Software',
  classification: 'Free WhatsApp Automation Software',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Free WhatsApp Automation Platform | AI Auto Reply Bot for WhatsApp Business',
    description:
      'Automate your WhatsApp Business customer service 24/7 with DeepSeek AI & Baileys socket. Free QR scan setup—no paid Meta API required.',
    url: siteUrl,
    siteName: 'Sohoj Reply — Free WhatsApp Automation',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free WhatsApp Automation Platform | Sohoj Reply',
    description: 'Automate WhatsApp customer support 24/7 with DeepSeek AI. Free QR scan setup—no Meta API fees.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'googleac6a232a81a9a8f3',
  },
};

import { Suspense } from 'react';
import PageProgressBar from '@/components/PageProgressBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Multi-Schema JSON-LD for Google Search & AI Engine Trust (ChatGPT / Gemini / Perplexity / Bing)
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Free WhatsApp Automation — Sohoj Reply',
    operatingSystem: 'All (Web-based SaaS)',
    applicationCategory: 'BusinessApplication',
    url: siteUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '128',
    },
    description:
      'Free multi-tenant SaaS platform enabling business owners to connect WhatsApp via QR code scan and automate customer support replies using DeepSeek AI and Baileys.',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sohoj Reply',
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    sameAs: ['https://whatsapp-automation.scaleupweb.xyz'],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this WhatsApp Automation software 100% free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Sohoj Reply provides free WhatsApp Business automation with zero setup fees and no per-message costs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need a paid WhatsApp Business Meta API account?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No Meta API approval or credit card is needed. You can connect your existing WhatsApp Business number instantly via a QR code scan.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the AI auto-reply feature work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The platform integrates DeepSeek V3 AI with your custom business knowledge base (products, pricing, FAQs). When customers message your WhatsApp, AI answers instantly 24/7.',
        },
      },
    ],
  };

  return (
    <html lang="en" className="light">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="antialiased selection:bg-blue-600 selection:text-white bg-slate-50 text-slate-900">
        <Suspense fallback={null}>
          <PageProgressBar />
        </Suspense>
        <Toaster position="top-right" />
        {children}
        <LiveSupportWidget />
      </body>
    </html>
  );
}
