import React, { useState } from 'react';
import type { Document } from '../types';
import { mockData } from '../constants';
import { X, Edit, Info, File, Link as LinkIcon, BookOpen, History, AlertTriangle, CheckCircle, Download, ExternalLink } from 'lucide-react';

interface DocumentDetailPanelProps {
    document: Document;
    onClose: () => void;
    onEdit: (d: Document) => void;
    onShowValidation: (d: Document) => void;
    onShowRelations: (entity: any, entityType: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

const RelationItem: React.FC<{ item: any; icon: React.ElementType, onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer text-left">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </button>
);

const DocumentDetailPanel: React.FC<DocumentDetailPanelProps> = ({ document, onClose, onEdit, onShowValidation, onShowRelations }) => {
    const [activeTab, setActiveTab] = useState('metadata');
    
    const linkedRisks = mockData.risques.filter(r => document.risqueIds?.includes(r.id));
    const linkedControls = mockData.controles.filter(c => document.controleIds?.includes(c.id));

    return (
        <div className="w-full max-w-md bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={document.nom}>{document.nom}</h2>
                    <p className="text-sm text-gray-500">{document.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onShowRelations(document, 'documents')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(document)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="border-b">
                <nav className="flex space-x-1 sm:space-x-2 px-2 sm:px-4">
                    {[
                        { id: 'metadata', label: 'Métadonnées', icon: Info },
                        { id: 'content', label: 'Contenu', icon: File },
                        { id: 'relations', label: 'Relations', icon: LinkIcon },
                        { id: 'history', label: 'Historique', icon: History }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                {activeTab === 'metadata' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-white border rounded-lg">
                            <p className="text-sm font-semibold text-gray-700">Validation</p>
                            <p className={`text-sm font-semibold mt-1 ${document.statut === 'en_validation' ? 'text-yellow-600' : (document.statut === 'publie' || document.statut === 'valide') ? 'text-green-600' : 'text-gray-600'}`}>
                                {document.statut === 'en_validation' ? 'En cours de validation' : 'Validé'}
                            </p>
                            <button onClick={() => onShowValidation(document)} className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium p-2 bg-blue-50 rounded-md mt-2">
                                Voir le flux de validation
                            </button>
                        </div>
                        <DetailItem label="Version" value={document.version} />
                        <DetailItem label="Statut" value={document.statut === 'publie' ? "Publié" : "Version de travail"} />
                        <DetailItem label="Date d'échéance" value={document.champsLibres?.dateEcheance ? new Date(document.champsLibres.dateEcheance).toLocaleDateString('fr-FR') : 'Aucune'} />
                         <DetailItem label="Catégories" value={
                            <div className="flex flex-wrap gap-1">
                                {mockData.categoriesDocuments.filter(c=>document.categorieIds.includes(c.id)).map(c => <span key={c.id} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">{c.nom}</span>)}
                            </div>
                        } />
                    </div>
                )}
                {activeTab === 'content' && (
                    <div className="space-y-4">
                         <DetailItem label="Source" value={document.source} />
                         {document.source === 'Fichier' && (
                            <div className="space-y-2">
                                <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"><Download className="h-4 w-4" /><span>Télécharger (PDF)</span></button>
                                <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"><Edit className="h-4 w-4" /><span>Ouvrir pour édition (Word)</span></button>
                            </div>
                         )}
                         {document.source === 'Lien' && (
                             <a href={document.lien} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                                <ExternalLink className="h-4 w-4" /><span>Ouvrir le lien</span>
                             </a>
                         )}
                         {document.source === 'Description' && (
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Contenu</h4>
                                <div className="p-3 bg-white border rounded-md text-sm whitespace-pre-wrap">{document.description}</div>
                            </div>
                         )}
                    </div>
                )}
                {activeTab === 'relations' && (
                     <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Risques Liés ({linkedRisks.length})</h4>
                            <div className="space-y-2">{linkedRisks.map(r => <RelationItem key={r.id} item={r} icon={AlertTriangle} onClick={() => onShowRelations(r, 'risques')} />)}</div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Contrôles Liés ({linkedControls.length})</h4>
                            <div className="space-y-2">{linkedControls.map(c => <RelationItem key={c.id} item={c} icon={CheckCircle} onClick={() => onShowRelations(c, 'controles')} />)}</div>
                        </div>
                    </div>
                )}
                 {activeTab === 'history' && (
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start space-x-3"><Info className="h-4 w-4 mt-0.5 text-gray-500"/><p>Créé par <strong>{mockData.personnes.find(p=>p.id === document.auteurId)?.nom}</strong> le {document.dateCreation.toLocaleDateString('fr-FR')}</p></div>
                        <div className="flex items-start space-x-3"><Edit className="h-4 w-4 mt-0.5 text-gray-500"/><p>Modifié le {document.dateModification.toLocaleDateString('fr-FR')}</p></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentDetailPanel;