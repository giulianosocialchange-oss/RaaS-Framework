/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	async rewrites() {
		return [
			// Proxy verso Orion Context Broker (NGSI-LD)
			{
				source: '/api/fiware/:path*',
				destination: `${process.env.FIWARE_ORION_URL || 'http://localhost:1026'}/ngsi-ld/v1/:path*`,
			},
			// Proxy opzionale verso il motore di routing Python locale
			{
				source: '/api/router/:path*',
				destination: `${process.env.ROUTER_BACKEND_URL || 'http://localhost:8000'}/:path*`,
			},
		];
	},
};

export default nextConfig;