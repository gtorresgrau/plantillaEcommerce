'use client';
// src/hooks/usePickit.js — Hook para uso de Pickit desde el admin
import { useState } from 'react';
import Swal from 'sweetalert2';

const usePickit = () => {
  const [pickitLoading, setPickitLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetch = async (url, options = {}) => {
    setPickitLoading(true);
    setError(null);
    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/pdf')) {
        if (!response.ok) throw new Error(`Error Pickit status ${response.status}`);
        const blob = await response.blob();
        return { ok: true, data: blob, isPdf: true };
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }
      return { ok: true, data };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setPickitLoading(false);
    }
  };

  // Crear envío
  const createShipment = (orderId) =>
    handleFetch('/api/pickit/createShipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

  // Generar etiqueta y descargarla
  const generateLabel = async (transactionIds) => {
    const result = await handleFetch('/api/pickit/generateLabel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arrayTransactionId: transactionIds }),
    });
    if (result.isPdf) {
      const url = URL.createObjectURL(result.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `etiqueta-pickit.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
    return result;
  };

  // Crear envío + etiqueta en un paso y descargar el PDF
  const createShipmentWithLabel = async (orderId) => {
    const result = await handleFetch('/api/pickit/createShipmentWithLabel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    if (result.isPdf) {
      const url = URL.createObjectURL(result.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `etiqueta-${orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      Swal.fire({ icon: 'success', title: 'Etiqueta generada', text: 'El PDF se descargó correctamente', timer: 2500, showConfirmButton: false });
    }
    return result;
  };

  return {
    pickitLoading,
    error,
    createShipment,
    generateLabel,
    createShipmentWithLabel,
  };
};

export default usePickit;
