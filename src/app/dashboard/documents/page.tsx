'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
    FileText,
    Download,
    Calendar,
    Search,
    Building2,
    FileCheck,
    ArrowLeft
} from 'lucide-react';

interface GeneratedDocument {
    id: string;
    title: string;
    document_type: string;
    created_at: string;
    content: string;
    version: number;
}

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Obtener empresa del usuario
            const { data: company } = await supabase
                .from('companies')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (company) {
                const { data } = await supabase
                    .from('generated_documents')
                    .select('*')
                    .eq('company_id', company.id)
                    .order('created_at', { ascending: false });

                setDocuments(data || []);
            }
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            grant_application: 'Solicitud de Subvención',
            compliance_report: 'Informe de Compliance',
            policy_document: 'Política Interna',
            action_guide: 'Guía de Acción',
            other: 'Otro'
        };
        return types[type] || type;
    };

    const handleDownload = (doc: GeneratedDocument) => {
        const element = document.createElement('a');
        const file = new Blob([doc.content], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = `${doc.title.replace(/\s+/g, '_')}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver al dashboard
                </button>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Documentos Generados</h1>
                        <p className="text-gray-600 mt-1">Gestión y descarga de tu documentación legal</p>
                    </div>
                </div>

                {/* Search & Filter Bar (Placeholder) */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar documentos..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                    </div>
                    <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900">
                        <option value="all">Todos los tipos</option>
                        <option value="grant">Subvenciones</option>
                        <option value="compliance">Compliance</option>
                    </select>
                </div>

                {documents.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No hay documentos generados</h3>
                        <p className="text-gray-500 mt-2">Los documentos generados por IA aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Documento
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                                                    <div className="text-xs text-gray-500">Versión {doc.version}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {getTypeLabel(doc.document_type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(doc.created_at).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDownload(doc)}
                                                className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                            >
                                                <Download className="w-4 h-4 mr-1" />
                                                Descargar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
