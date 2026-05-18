// scripts/seed-config.mjs
// Crea la configuración inicial y el branding por defecto
// Uso: npm run seed:config
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) { console.error('MONGODB_URI no definida'); process.exit(1); }

async function main() {
  await mongoose.connect(uri);
  console.log('✅ Conectado a MongoDB');

  // BrandingConfig
  const BrandingConfig = mongoose.model('BrandingConfig', new mongoose.Schema({
    nombreTienda: String, slogan: String,
    colores: mongoose.Schema.Types.Mixed,
    tipografia: mongoose.Schema.Types.Mixed,
    seo: mongoose.Schema.Types.Mixed,
    textos: mongoose.Schema.Types.Mixed,
    secciones: mongoose.Schema.Types.Mixed,
    activo: { type: Boolean, default: true },
  }, { timestamps: true }));

  const existsBranding = await BrandingConfig.findOne({ activo: true });
  if (!existsBranding) {
    await BrandingConfig.create({
      nombreTienda: 'Mi Tienda',
      slogan: 'Los mejores productos al mejor precio',
      colores: {
        primary: '#3B82F6', secondary: '#1E40AF', accent: '#F59E0B',
        bg: '#F9FAFB', surface: '#FFFFFF', text: '#111827', textMuted: '#6B7280',
        nav: '#1E40AF', navText: '#FFFFFF', footer: '#111827', footerText: '#D1D5DB',
        danger: '#EF4444', success: '#10B981', warning: '#F59E0B',
      },
      tipografia: { fuente: 'Inter', fuenteURL: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', borderRadius: '0.5rem' },
      seo: { titulo: 'Mi Tienda Online', descripcion: 'La mejor tienda online.', keywords: '' },
      textos: {
        botonComprar: 'Comprar ahora', botonCarrito: 'Agregar al carrito',
        botonContacto: '¡Contáctanos!', textoBienvenida: 'Bienvenido a nuestra tienda',
        textoHero: 'Los mejores productos al mejor precio', textoCTA: 'Ver productos',
        mensajeWhatsapp: 'Hola, me gustaría consultar sobre: ',
      },
      secciones: {
        mostrarDestacados: true, mostrarCategorias: true,
        mostrarNovedades: true,  mostrarBanner: true, mostrarTestimonios: false,
      },
      activo: true,
    });
    console.log('✅ BrandingConfig creado con valores por defecto');
  } else {
    console.log('ℹ️  BrandingConfig ya existe');
  }

  await mongoose.disconnect();
  console.log('🎉 Listo! Ahora podés loguearte con el superAdmin y personalizar la tienda.');
}

main().catch(e => { console.error(e); process.exit(1); });
