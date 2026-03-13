# SEO Implementation Guide

This document explains the SEO enhancements added to CalcEmpire.

## What Was Added

### 1. Meta Tags (src/app/[locale]/layout.tsx)
- **Title & Description**: Dynamic per locale
- **Keywords**: Engineering-related keywords
- **Authors & Creator**: CalcEmpire attribution
- **Format Detection**: Disabled for better UX
- **Canonical URLs**: Proper canonical tags for each locale
- **Language Alternates**: All 16 supported languages

### 2. Open Graph Tags
- **Type**: Website
- **Locale**: Dynamic per language
- **Images**: 1200x630 OG image
- **Site Name**: CalcEmpire
- **URL**: Proper canonical URLs

### 3. Twitter Card
- **Card Type**: summary_large_image
- **Images**: Optimized for Twitter
- **Creator**: @calcempire

### 4. Robots Meta
- **Index**: Enabled
- **Follow**: Enabled
- **GoogleBot**: Max preview settings
- **Image Preview**: Large
- **Snippet**: Unlimited

### 5. Structured Data (JSON-LD)
Created `src/lib/structured-data.ts` with:
- **WebSite Schema**: Search action, multilingual support
- **Organization Schema**: Contact info, social links
- **WebApplication Schema**: App category, pricing, ratings
- **Breadcrumb Schema**: Navigation structure
- **SoftwareApplication Schema**: Individual tool schemas

### 6. Sitemap (src/app/sitemap.ts)
- Dynamic sitemap generation
- All 16 locales included
- Change frequency: weekly
- Priority: 1.0 for homepage
- Language alternates for each URL

### 7. Robots.txt (public/robots.txt)
- Allow all crawlers
- Sitemap location specified
- Ready for future admin paths

### 8. Web App Manifest (src/app/manifest.ts)
- PWA-ready configuration
- App name and description
- Theme colors
- Icons (192x192, 512x512)
- Categories: education, utilities, productivity

### 9. Open Graph Image (src/app/[locale]/opengraph-image.tsx)
- Dynamic OG image generation
- 1200x630 dimensions
- Gradient background
- CalcEmpire branding

### 10. Environment Variables (.env.example)
- NEXT_PUBLIC_BASE_URL
- Google Analytics ID (optional)
- Verification codes (optional)

## How to Use

### 1. Set Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_BASE_URL=https://calcempire.com
```

### 2. Add Icons
Create these files in `/public`:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `logo.png` (for organization schema)

### 3. Verify Implementation
After deployment:
- Check robots.txt: `https://calcempire.com/robots.txt`
- Check sitemap: `https://calcempire.com/sitemap.xml`
- Check manifest: `https://calcempire.com/manifest.json`
- Test OG image: `https://calcempire.com/en/opengraph-image`

### 4. Google Search Console
1. Add property: `https://calcempire.com`
2. Verify ownership (use verification code in layout.tsx)
3. Submit sitemap: `https://calcempire.com/sitemap.xml`

### 5. Social Media
Update these in `src/lib/structured-data.ts`:
```typescript
sameAs: [
  'https://twitter.com/calcempire',
  'https://github.com/calcempire',
  'https://linkedin.com/company/calcempire',
],
```

## Testing

### Local Testing
```bash
npm run build
npm run start
```

Visit:
- http://localhost:3000/robots.txt
- http://localhost:3000/sitemap.xml
- http://localhost:3000/manifest.json

### SEO Tools
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Schema.org Validator](https://validator.schema.org/)

## Performance Impact
- Structured data: ~2KB per page
- OG image: Generated on-demand (edge runtime)
- Sitemap: Static generation
- No runtime performance impact

## Future Enhancements
1. Add individual tool pages with specific schemas
2. Implement breadcrumb navigation
3. Add FAQ schema for common questions
4. Create video tutorials with VideoObject schema
5. Add HowTo schema for calculator usage guides

## Verification Checklist
- [ ] robots.txt accessible
- [ ] sitemap.xml generated
- [ ] manifest.json valid
- [ ] OG images rendering
- [ ] Meta tags in HTML
- [ ] JSON-LD in page source
- [ ] Canonical URLs correct
- [ ] Language alternates working
- [ ] Google Search Console verified
- [ ] Social media cards tested
