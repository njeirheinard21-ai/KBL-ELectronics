import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  schema?: Record<string, unknown>;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description = "Discover premium electronics, gaming gear, and tech accessories at KBL Electronics.",
  canonical,
  ogImage = "https://firebasestorage.googleapis.com/v0/b/jo-accessories-44ffa.firebasestorage.app/o/ChatGPT%20Image%20Aug%207%2C%202026%2C%2012_53_42%20PM.png?alt=media&token=608eabdf-92b4-4620-8210-8f1cddd92c38",
  schema
}) => {
  const fullTitle = title ? `${title} | KBL Electronics` : 'KBL Electronics | Premium Tech & Gaming';
  const siteUrl = 'https://kbl-electronics.com'; // Replace with actual domain when ready
  const currentUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
