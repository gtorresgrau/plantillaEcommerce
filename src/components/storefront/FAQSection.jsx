'use client';
// src/components/storefront/FAQSection.jsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_DEFAULT = [
  {
    id: 1,
    pregunta: '¿Cómo realizo un pedido?',
    respuesta: 'Agregá los productos que querés al carrito, luego completá el checkout con tus datos de entrega y elegí el método de pago que prefieras.',
  },
  {
    id: 2,
    pregunta: '¿Qué métodos de pago aceptan?',
    respuesta: 'Aceptamos pagos con MercadoPago (tarjetas de crédito/débito, transferencia), transferencia bancaria directa y efectivo (en punto de retiro).',
  },
  {
    id: 3,
    pregunta: '¿Cómo es el proceso de envío?',
    respuesta: 'Enviamos a todo el país a través de Pickit. Una vez confirmado el pago, preparamos tu pedido y te enviamos el número de seguimiento por email.',
  },
  {
    id: 4,
    pregunta: '¿Puedo retirar mi pedido en persona?',
    respuesta: 'Sí, ofrecemos la opción de retiro en nuestro local sin costo adicional. Al realizar el checkout elegí la opción "Retiro en local".',
  },
  {
    id: 5,
    pregunta: '¿Cuál es la política de devoluciones?',
    respuesta: 'Tenés 30 días desde la entrega para realizar cambios o devoluciones. El producto debe estar en condiciones originales. Contactanos y te guiamos en el proceso.',
  },
  {
    id: 6,
    pregunta: '¿Cómo puedo seguir mi pedido?',
    respuesta: 'Desde tu cuenta en "Mis pedidos" podés ver el estado en tiempo real. También te enviamos notificaciones por email en cada cambio de estado.',
  },
];

export default function FAQSection({ faqs }) {
  const items = faqs?.length ? faqs : FAQ_DEFAULT;
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <section id="faq" className="py-16 px-4 bg-brand-bg">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-brand-primary uppercase tracking-wide">
          Preguntas frecuentes
        </h2>

        <div className="space-y-3">
          {items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left font-medium text-brand-text hover:bg-gray-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{item.pregunta}</span>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 ml-3 text-brand-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-brand-muted leading-relaxed">{item.respuesta}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
