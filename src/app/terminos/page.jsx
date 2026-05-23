// src/app/terminos/page.jsx — Términos y Condiciones
import { connectDB } from '@/lib/mongodb';
import Configuracion from '@/models/Configuracion';
import BrandingConfig from '@/models/BrandingConfig';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';

const TEXTO_DEFAULT = `
## Términos y Condiciones

**Última actualización:** ${new Date().toLocaleDateString('es-AR')}

### 1. Aceptación de los términos
Al utilizar nuestro sitio web y realizar compras, aceptás estos Términos y Condiciones en su totalidad.

### 2. Productos y precios
Los precios están expresados en pesos argentinos (ARS) e incluyen IVA. Nos reservamos el derecho de modificar precios sin previo aviso.

### 3. Proceso de compra
Para comprar, agregá los productos al carrito, completá el checkout con tus datos y elegí el método de pago. Tu pedido se confirma una vez acreditado el pago.

### 4. Envíos
Los tiempos de entrega son estimativos y pueden variar según la zona geográfica y el servicio de envío seleccionado.

### 5. Devoluciones y cambios
Tenés 30 días desde la recepción para solicitar cambios o devoluciones. El producto debe estar en condiciones originales y sin uso.

### 6. Garantía
Todos nuestros productos cuentan con garantía del fabricante. Para hacer válida la garantía, conservá el comprobante de compra.

### 7. Responsabilidad
No somos responsables por daños indirectos derivados del uso de los productos adquiridos.

### 8. Jurisdicción
Ante cualquier disputa, las partes se someten a la jurisdicción de los tribunales de la Ciudad Autónoma de Buenos Aires.

### 9. Contacto
Para consultas sobre estos términos, escribinos a través de nuestro formulario de contacto.
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
  return { title: 'Términos y Condiciones' };
}

export default async function TerminosPage() {
  const { branding, config } = await getData();
  const texto  = config?.politicas?.terminos || TEXTO_DEFAULT;
  const nombre = branding?.nombreTienda || config?.nombreEmpresa || 'Mi Tienda';

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
            <h1 className="text-3xl font-extrabold text-brand-text">Términos y Condiciones</h1>
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
