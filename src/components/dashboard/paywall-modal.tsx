'use client';

import { X, Lock, Sparkles } from 'lucide-react';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string | null;
    potentialValue?: number;
}

export function PaywallModal({ isOpen, onClose, title, message, potentialValue }: PaywallModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in fade-in zoom-in duration-200">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">
                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Desbloquea {title}</h2>
                    <div className="flex items-center justify-center space-x-2 text-blue-100">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium">Funcionalidad Premium</span>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-gray-600 text-lg leading-relaxed">
                            {message || "Esta funcionalidad está reservada para usuarios Pro."}
                        </p>

                        {potentialValue && potentialValue > 0 && (
                            <div className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4">
                                <p className="text-sm text-green-700 font-medium mb-1">Valor potencial detectado</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {potentialValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => alert('Redirect to Stripe/Payment')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-200"
                        >
                            Actualizar a PRO ahora
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-white hover:bg-gray-50 text-gray-500 font-medium py-3 px-6 rounded-xl transition-colors"
                        >
                            Quizás más tarde
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
