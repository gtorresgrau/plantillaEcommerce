/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — imágenes de productos, logos y banners
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Google / Firebase — avatares de usuarios con Google OAuth
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      // Picsum — imágenes de los productos de demostración (modo sin DB)
      { protocol: 'https', hostname: 'picsum.photos' },
      // Placeholder genérico (algunos servicios de placeholder)
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
  experimental: {
    // pdfkit necesita acceso a módulos de Node.js fuera del bundle de Next
    serverComponentsExternalPackages: ['pdfkit'],
  },
};

export default nextConfig;
