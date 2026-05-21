'use client';
// src/components/storefront/WhatsAppButton.jsx
// Botón flotante de WhatsApp — se oculta si no hay número configurado

export default function WhatsAppButton({ numero, codigoPais = 54, mensaje = '¡Hola! Quiero consultar sobre un producto.' }) {
  if (!numero) return null;

  const clean = numero.replace(/\D/g, '');
  const href  = `https://wa.me/${codigoPais}${clean}?text=${encodeURIComponent(mensaje)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
      style={{ backgroundColor: '#25D366' }}
    >
      {/* Ícono SVG de WhatsApp */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-8 h-8 fill-white"
        aria-hidden="true"
      >
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.825.736 5.478 2.027 7.785L0 32l8.448-2.01A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333c-2.614 0-5.053-.71-7.143-1.946l-.512-.302-5.013 1.194 1.235-4.879-.333-.529A13.294 13.294 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.29-10.001c-.399-.2-2.36-1.165-2.727-1.298-.367-.133-.634-.2-.9.2-.267.4-1.033 1.298-1.267 1.565-.233.267-.467.3-.866.1-.4-.2-1.687-.622-3.213-1.982-1.188-1.06-1.99-2.37-2.223-2.77-.233-.4-.025-.617.175-.816.18-.179.4-.467.6-.7.2-.234.267-.4.4-.667.133-.267.067-.5-.033-.7-.1-.2-.9-2.167-1.233-2.967-.325-.778-.655-.673-.9-.685l-.767-.013c-.267 0-.7.1-1.067.5-.366.4-1.4 1.367-1.4 3.334 0 1.966 1.433 3.866 1.633 4.133.2.267 2.82 4.308 6.831 6.036.955.412 1.7.657 2.282.84.958.305 1.832.262 2.52.159.769-.115 2.36-.965 2.693-1.897.333-.933.333-1.733.233-1.9-.1-.166-.366-.266-.766-.466z"/>
      </svg>
    </a>
  );
}
