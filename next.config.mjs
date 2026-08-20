const env = process.env;

console.log('[DEBUG ENV]', {
	OPENWEATHER_URL: process.env.OPENWEATHER_API_URL,
	OPENWEATHER_KEY: process.env.OPENWEATHER_API_KEY,
	OPENROUTE_URL: process.env.OPENROUTE_API_URL,
	OPENROUTE_KEY: process.env.OPENROUTE_API_KEY,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		return [
			{
				source: '/api/arcgis/:path*',
				destination: `${env.ARCGIS_API_URL}/:path*?token=${env.ARCGIS_API_KEY}`,
			},
			{
				source: '/api/tracestrack/:path*',
				destination: `${env.TRACETRACK_API_URL}/:path*?key=${env.TRACETRACK_API_KEY}`,
			},
			{
				source: '/api/thunderforest/:path*',
				destination: `${env.THUNDERFOREST_API_URL}/:path*?apikey=${env.THUNDERFOREST_API_KEY}`,
			},
			{
				source: '/api/openroute/:path*',
				destination: `${env.OPENROUTE_API_URL}/:path*?api_key=${env.OPENROUTE_API_KEY}`,
			},
			{
				source: '/api/gmaps/:path*',
				destination: `${env.GMAPS_API_URL}/:path*?key=${env.GMAPS_API_KEY}`,
			},
			{
				source: '/api/overpass',
				destination: `${env.OVERPASS_API_URL}`,
			},
			{
				source: '/api/opentopo',
				destination: `${env.OPENTOPO_API_URL}`,
			},
			{
				source: '/openweather/icon/:icon',
				destination: `${env.OPENWEATHER_ICON_URL}/:icon`,
			},
			{
				source: '/api/openweather/:path*',
				destination: `${env.OPENWEATHER_API_URL}/:path*?appid=${env.OPENWEATHER_API_KEY}`,
			},
		]
	}
};

export default nextConfig;
