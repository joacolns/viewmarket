import dotenv from 'dotenv';
dotenv.config({ path: './credentials.env' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cryptocompare.com', 'logo.clearbit.com'],
  },
};

export default nextConfig;
