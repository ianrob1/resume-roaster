/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Browsers often request /favicon.ico first; serve our crisp 32px PNG so production shows it
      { source: "/favicon.ico", destination: "/favicon-32.png" },
    ];
  },
  async headers() {
    return [
      {
        source: "/favicon.ico",
        headers: [
          { key: "Content-Type", value: "image/png" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/favicon-32.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        source: "/favicon-16.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
