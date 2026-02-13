'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';

function MatchingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company_id');
  const [status, setStatus] = useState('Analizando tu empresa...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!companyId) {
      router.push('/onboarding');
      return;
    }

    const runMatching = async () => {
      try {
        setStatus('Identificando requisitos de compliance...');
        setProgress(25);

        // Llamar al API de matching
        const response = await fetch('/api/matching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId }),
        });

        if (!response.ok) {
          throw new Error('Error en el matching');
        }

        setProgress(50);
        setStatus('Buscando subvenciones aplicables...');

        await new Promise(resolve => setTimeout(resolve, 1000));

        setProgress(75);
        setStatus('Calculando tu Compliance Score...');

        await new Promise(resolve => setTimeout(resolve, 1000));

        setProgress(100);
        setStatus('¡Análisis completado!');

        await new Promise(resolve => setTimeout(resolve, 500));

        // Redirigir al dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error en matching:', error);
        setStatus('Error al analizar la empresa');
      }
    };

    runMatching();
  }, [companyId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          {progress < 100 ? (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-2">{status}</h2>
          <p className="text-gray-600 mb-6">
            Estamos evaluando tu situación de compliance y buscando oportunidades
          </p>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-sm text-gray-500">{progress}% completado</div>
        </div>
      </div>
    </div>
  );
}

export default function MatchingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    }>
      <MatchingContent />
    </Suspense>
  );
}
