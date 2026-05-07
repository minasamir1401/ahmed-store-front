// Allow self-signed certificates for Traefik
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [];
  }
};

export default nextConfig;
