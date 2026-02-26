import { useEffect } from 'react';

export function SEOHead() {
  useEffect(() => {
    // Add JSON-LD structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Car Price Prediction System',
      description: 'Machine learning-powered car price prediction system providing accurate vehicle valuation forecasts based on specifications and market trends.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@type': 'Person',
        name: 'ASWIN S NAIR',
        email: 'aswinjr462005@gmail.com',
      },
      featureList: [
        'ML-powered price predictions',
        'Current and future price forecasts',
        '1, 3, and 5-year predictions',
        'Confidence score analysis',
        'Market trend analysis',
        'Depreciation calculations',
      ],
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
