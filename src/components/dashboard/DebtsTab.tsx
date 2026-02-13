'use client';

import { useState } from 'react';
import {
    AlertTriangle,
    CheckCircle,
    Search,
    AlertCircle,
    ExternalLink,
    ShieldCheck,
    Loader2
} from 'lucide-react';

interface DebtFinding {
    source: string;
    type: string;
    description: string;
    urgency: 'high' | 'medium' | 'low';
}

interface DebtAnalysis {
    status: 'clean' | 'warning' | 'alerts_found';
    summary: string;
    findings: DebtFinding[];
    recommendations: string[];
}

interface DebtsTabProps {
    companyId: string;
}

export default function DebtsTab({ companyId }: DebtsTabProps) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<DebtAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkDebts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/compliance/debts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId }),
            });

            if (!response.ok) throw new Error('Error al consultar registros de deuda');

            const data = await response.json();
            setAnalysis(data);
        } catch (err: any) {
            setError(err.message || 'Error al realizar la consulta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            Verificador de Deudas y Sanciones
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Consulta registros públicos (BOE, AEAT, SS) para detectar posibles incidencias.
                        </p>
                    </div>
                    <button
                        onClick={checkDebts}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Consultando...
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                Iniciar Escaneo
                            </>
                        )}
                    </button>
                </div>

                {!analysis && !loading && !error && (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No se ha realizado ningún escaneo reciente.</p>
                        <p className="text-xs text-gray-400 mt-1">El proceso tarda unos segundos en analizar registros públicos.</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                {analysis && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Summary Banner */}
                        <div className={`p-4 rounded-lg border flex items-center gap-4 ${analysis.status === 'clean' ? 'bg-green-50 border-green-200 text-green-800' :
                                analysis.status === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                                    'bg-red-50 border-red-200 text-red-800'
                            }`}>
                            {analysis.status === 'clean' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                            <div>
                                <p className="font-bold">{analysis.summary}</p>
                                <p className="text-sm opacity-90">Resultado del análisis de registros públicos.</p>
                            </div>
                        </div>

                        {/* Findings */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Hallazgos Detectados</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {analysis.findings.length > 0 ? analysis.findings.map((finding, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold uppercase py-0.5 px-1.5 rounded bg-gray-100 text-gray-600">{finding.source}</span>
                                                <h5 className="font-semibold text-gray-900">{finding.type}</h5>
                                            </div>
                                            <p className="text-sm text-gray-600">{finding.description}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${finding.urgency === 'high' ? 'bg-red-100 text-red-700' :
                                                finding.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {finding.urgency}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg text-sm text-green-700">
                                        No se han encontrado registros de deudas o multas activas en los portales consultados.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                Recomendaciones de Cumplimiento
                            </h4>
                            <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
                                {analysis.recommendations.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
