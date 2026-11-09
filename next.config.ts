import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/login/app/dashboard", destination: "/sealed-products", permanent: false },
      { source: "/marketplace/:path*", destination: "/sealed-products", permanent: true },
      { source: "/marketplace", destination: "/sealed-products", permanent: true },
      { source: "/events/:path*", destination: "/guides", permanent: true },
      { source: "/events", destination: "/guides", permanent: true },
      { source: "/offers/:path*", destination: "/guides", permanent: true },
      { source: "/offers", destination: "/guides", permanent: true },
      { source: "/portfolio/:path*", destination: "/guides", permanent: true },
      { source: "/portfolio", destination: "/guides", permanent: true },
      { source: "/wants/:path*", destination: "/guides", permanent: true },
      { source: "/wants", destination: "/guides", permanent: true },
      { source: "/sell/:path*", destination: "/shopify", permanent: true },
      { source: "/sell", destination: "/shopify", permanent: true },
      { source: "/collection-selling/:path*", destination: "/shopify", permanent: true },
      { source: "/collection-selling", destination: "/shopify", permanent: true },
      { source: "/seller/:path*", destination: "/shopify", permanent: true },
      { source: "/seller", destination: "/shopify", permanent: true },
      { source: "/seller-calculator", destination: "/shopify", permanent: true },
      { source: "/trade/:path*", destination: "/guides", permanent: true },
      { source: "/trade", destination: "/guides", permanent: true },
      { source: "/trust/:path*", destination: "/guides", permanent: true },
      { source: "/trust", destination: "/guides", permanent: true }
    ];
  }
};

export default nextConfig;
