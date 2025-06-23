/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // WILDCARD FOR ANY HOSTNAME (USE WITH EXTREME CAUTION IN PRODUCTION)
            {
                protocol: 'https',
                hostname: '**', // Allows any HTTPS hostname
            },
            {
                protocol: 'http', // If you need to allow HTTP sources too (less secure)
                hostname: '**', // Allows any HTTP hostname
            },
        ],
    },
};

export default nextConfig;
