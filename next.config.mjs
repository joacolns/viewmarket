import dotenv from 'dotenv';
dotenv.config({ path: './credentials.env' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['arima'],
  images: {
    domains: ['cryptocompare.com', 'logo.clearbit.com'],
  },
};

export default nextConfig;
