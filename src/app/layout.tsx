import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { site } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Lelwak Stars CBO",
    "youth led organisation Kenya",
    "tree nursery",
    "reforestation",
    "agripreneurship",
    "school mentorship",
    "community based organisation",
    "climate action Kenya",
    "youth empowerment",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ["/images/og-cover.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#14532D",
  width: "device-width",
  initialScale: 1,
};

/**
 * JSON-LD structured data.
 * Helps sponsors and search engines understand Lelwak Stars is a real,
 * registered NGO/CBO — this materially improves credibility signals.
 */
const organisationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: site.legalName,
  alternateName: site.shortName,
  description: site.description,
  url: site.url,
  slogan: site.tagline,
  logo: `${site.url}/logo.png`,
  image: `${site.url}/images/og-cover.jpg`,
  areaServed: site.location.region,
  knowsAbout: [
    "Reforestation",
    "Tree nurseries",
    "Agripreneurship",
    "Youth mentorship",
    "Environmental conservation",
    "Community capacity building",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "partnerships",
    email: site.contact.email,
    availableLanguage: ["en", "sw"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-cream-200 text-navy-700">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
        />
        {children}
        <Script id="reveal-on-scroll" strategy="afterInteractive">
          {`(function(){var els=document.querySelectorAll('[data-reveal]');if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('is-visible')});return}var io=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('is-visible');io.unobserve(en.target)}})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});els.forEach(function(e,i){e.style.transitionDelay=(Math.min(i,6)*70)+'ms';io.observe(e)});var watch=function(n){if(n.nodeType!==1||n.classList.contains('is-visible'))return;n.style.transitionDelay='0ms';io.observe(n)};var mo=new MutationObserver(function(muts){muts.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.hasAttribute&&n.hasAttribute('data-reveal'))watch(n);if(n.querySelectorAll)n.querySelectorAll('[data-reveal]').forEach(watch);});});});mo.observe(document.body,{childList:true,subtree:true});})();`}
        </Script>
      </body>
    </html>
  );
}
