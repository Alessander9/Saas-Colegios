/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cole/ui-components', '@cole/domain-types'],
};

module.exports = nextConfig;
