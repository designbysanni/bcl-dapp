/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Disable Next.js dev indicators and Vercel toolbar overlay */
  devIndicators: false,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": require.resolve(
        "./src/lib/asyncStorageShim.js"
      ),
    };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
