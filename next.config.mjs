/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Resolve async metadata into the initial head for every user agent. Streaming
  // head updates can race hydration across authenticated route/viewport checks.
  htmlLimitedBots: /.*/,

  serverExternalPackages: ["pdfjs-dist"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Same-origin print/preview frames remain permitted; unrelated sites cannot frame account pages.
          ...(process.env.VERCEL_ENV === "production"
            ? [{ key: "X-Frame-Options", value: "SAMEORIGIN" }]
            : []),
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  outputFileTracingIncludes: {
    "/api/qb/extract-pdf": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
    "/api/marketplace/*/sample": ["./public/fonts/HindSiliguri-Regular.ttf"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // ৭,০০০ শব্দ ও ছবিযুক্ত বড় পোস্টের জন্য লিমিট বৃদ্ধি
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        canvas: false,
      };
    }
    return config;
  },
};

export default nextConfig;
