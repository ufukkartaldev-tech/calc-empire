/**
 * @file structured-data.ts
 * @description JSON-LD structured data generators for SEO
 */

import { routing } from '@/i18n/routing';

interface WebsiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  inLanguage: string[];
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    '@type': string;
    email: string;
    contactType: string;
  };
}

interface WebApplicationSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: string;
    ratingCount: string;
  };
}

export function generateWebsiteSchema(locale: string): WebsiteSchema {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://calcempire.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CalcEmpire',
    description: 'Professional engineering calculators — precise, fast, multilingual.',
    url: `${baseUrl}/${locale}`,
    inLanguage: [...routing.locales],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/${locale}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema(): OrganizationSchema {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://calcempire.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CalcEmpire',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      'https://twitter.com/calcempire',
      'https://github.com/calcempire',
      'https://linkedin.com/company/calcempire',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@calcempire.com',
      contactType: 'Customer Support',
    },
  };
}

export function generateWebApplicationSchema(): WebApplicationSchema {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://calcempire.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CalcEmpire',
    description:
      'Professional engineering calculators for electrical, mechanical, civil, and statistical calculations.',
    url: baseUrl,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  };
}

export function generateBreadcrumbSchema(
  locale: string,
  items: Array<{ name: string; url: string }>
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://calcempire.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

export function generateSoftwareApplicationSchema(
  toolName: string,
  description: string,
  category: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://calcempire.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: toolName,
    description: description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    url: baseUrl,
    category: category,
  };
}
