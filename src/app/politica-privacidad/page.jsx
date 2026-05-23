// src/app/politica-privacidad/page.jsx
import { connectDB } from '@/lib/mongodb';
import Configuracion from '@/models/Configuracion';
import BrandingConfig from '@/models/BrandingConfig';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';

const TEXTO_DEFAULT = `
## Política de Privacidad

**Última actualización:** ${new Date().toLocaleDateString('es-AR')}

### 1. Información que recopilamos
Recopilamos información que nos proporcionás directamente, como tu nombre, email, dirección y datos de pago al realizar una compra.

### 2. Uso de la información
Usamos tu información para procesar pedidos, enviarte notificaciones sobre tu compra, mejorar nuestros servicios y, con tu consentimiento, enviarte comunicaciones comerciales.

### 3. Compartir información
No vendemos ni compartimos tu información personal con terceros, excepto cuando sea necesario para procesar tu pago (MercadoPago) o tu envío (Pickit).

### 4. Seguridad
Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal.

### 5. Tus derechos
Podés acceder, corregir o eliminar tu información personal contactándonos a través de nuestro formulario de contacto.

### 6. Cookies
Usamos cookies para mejorar tu experiencia de navegación. Podés desactivarlas en la configuración de tu navegador.

### 7. Contacto
Para consultas sobre esta política, escribinos a través de nuestro formulario de contacto.
`.trim();

async function getData() {
  await connectDB();
  const [branding, config] = await Promise.all([
    BrandingConfig.findOne({ activo: true }).lean(),
    Configuracion.findOne({ activo: true }).lean(),
  ]);
  return { branding, config };
}

export async function generateMetadata() {
  return { title: 'Política de Privacidad' };
}

export default async function PoliticaPrivacidadPage() {
  const { branding, config } = await getData();
  const texto = config?.politicas?.privacidad || TEXTO_DEFAULT;
  const nombre = branding?.nombreTienda || config?.nombreEmpresa || 'Mi Tienda';

  // Parseo básico de markdown para renderizar
  const html = texto
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-brand-text mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-brand-text mt-8 mb-3">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p class="mb-4 text-brand-muted leading-relaxed">')
    .replace(/^/, '<p class="mb-4 text-brand-muted leading-relaxed">')
    .concat('</p>');

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar branding={branding} />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-brand-text">Política de Privacidad</h1>
            <p className="text-brand-muted mt-2">{nombre}</p>
          </div>
          <div className="card p-8 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </main>
      <Footer branding={branding} config={config} />
    </div>
  );
}
