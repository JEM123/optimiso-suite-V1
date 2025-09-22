

import React, { useState, useMemo } from 'react';
import { mockData } from '../constants';
import type { Entite, Personne, Poste, Risque, CustomFieldDef } from '../types';
import { Users, Briefcase, Link as LinkIcon, Edit, Plus, ChevronDown, ChevronRight, Building, Layers, Component, Shield, List, Workflow, Search, Filter, Trash2, ArrowUp, ArrowDown, History, Download, FileSpreadsheet, Image } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { EntiteFormModal } from './EntiteFormModal';

// --- UTILITY FUNCTIONS & CONSTANTS ---
const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows || rows.length === 0) {
        alert("Aucune donnée à exporter.");
        return;
    }
    const separator = ';';
    const keys = Object.keys(rows[0]);
    const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
                cell = String(cell).replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};


const buildTree = (entities: Entite[], parentId?: string): (Entite & { children: any[] })[] => {
  return entities
    .filter(entity => entity.parentId === parentId)
    .sort((a, b) => a.ordre - b.ordre)
    .map(entity => ({ ...entity, children: buildTree(entities, entity.id) }));
};

const ENTITY_TYPE_COLORS: Record<Entite['type'], string> = { 'Direction': 'border-blue-500', 'Division': 'border-purple-500', 'Service': 'border-green-500', 'Équipe': 'border-teal-500', 'Autre': 'border-gray-500' };
const ENTITY_TYPE_ICONS: Record<Entite['type'], React.ElementType> = { 'Direction': Building, 'Division': Layers, 'Service': Component, 'Équipe': Users, 'Autre': Shield };
const ENTITY_STATUS_COLORS: Record<Entite['statut'], string> = {
    'brouillon': 'bg-gray-100 text-gray-800',
    'en_cours': 'bg-yellow-100 text-yellow-800',
    'valide': 'bg-green-100 text-green-800',
    'archive': 'bg-red-100 text-red-800',
    'à_créer': 'bg-blue-100 text-blue-800',
    'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800',
    'figé': 'bg-indigo-100 text-indigo-800',
    'planifié': 'bg-cyan-100 text-cyan-800',
    'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-200 text-red-900',
    'clôturé': 'bg-gray-300 text-gray-800',
    'a_faire': 'bg-yellow-100 text-yellow-800',
    'en_retard': 'bg-red-200 text-red-900',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

// --- SUB-COMPONENTS ---

const OrgNode: React.FC<{ node: Entite & { children: any[] }; onSelect: (entity: Entite) => void; selectedId?: string; onEdit: (e: Entite) => void; onAddSub: (e: Entite) => void; }> = ({ node, onSelect, selectedId, onEdit, onAddSub }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const Icon = ENTITY_TYPE_ICONS[node.type];

    return (
        <div className="relative pl-8 py-1">
            <div className="absolute top-0 left-4 w-px h-full bg-gray-200"></div>
            <div className="absolute top-1/2 left-4 w-4 h-px bg-gray-200"></div>
            <div className="flex items-center space-x-2 relative group">
                <div onClick={() => onSelect(node)} className={`flex-grow p-2 pr-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 flex items-center ${ENTITY_TYPE_COLORS[node.type]} ${selectedId === node.id ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-white'}`}>
                    <Icon className="h-5 w-5 mx-2 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{node.nom}</p>
                        <p className="text-xs text-gray-500">{node.code}</p>
                    </div>
                    {node.children.length > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="ml-2 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"><ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} /></button>
                    )}
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white/50 backdrop-blur-sm rounded-md p-1 space-x-1">
                     <button onClick={() => onAddSub(node)} title="Ajouter une sous-entité" className="p-1 hover:bg-gray-200 rounded"><Plus className="h-4 w-4 text-green-600"/></button>
                     <button onClick={() => onEdit(node)} title="Modifier" className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                </div>
            </div>
            {isExpanded && node.children.length > 0 && <div className="mt-1">{node.children.map(child => <OrgNode key={child.id} {...{node: child, onSelect, selectedId, onEdit, onAddSub}}/>)}</div>}
        </div>
    );
};

const EntityDetailPanel: React.FC<{ entity: Entite; onClose: () => void; onEdit: (e: Entite) => void; onAddSub: (e: Entite) => void; onReorder: (childId: string, direction: 'up' | 'down') => void; allEntities: Entite[] }> = ({ entity, onClose, onEdit, onAddSub, onReorder, allEntities }) => {
    const [activeTab, setActiveTab] = useState('details');
    const { settings } = useAppContext();
    const { personnes, postes, risques } = mockData;
    
    const responsable = personnes.find(p => p.id === entity.responsableId);
    const parent = allEntities.find(p => p.id === entity.parentId);
    const children = allEntities.filter(c => c.parentId === entity.id).sort((a,b) => a.ordre - b.ordre);

    const customFieldDefs = settings.customFields.entites || [];
    const hasCustomFields = customFieldDefs.length > 0 && entity.champsLibres && Object.keys(entity.champsLibres).some(key => entity.champsLibres[key]);

    const attachments = useMemo(() => ({
        personnes: personnes.filter(p => p.entiteIds.includes(entity.id)),
        postes: postes.filter(p => p.entiteId === entity.id),
        risques: (risques as Risque[]).filter(r => r.entiteIds.includes(entity.id)),
    }), [entity.id, personnes, postes, risques]);
    
    const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
        <div><p className="text-sm font-semibold text-gray-700">{label}</p><div className="text-sm text-gray-900 mt-1">{value || '-'}</div></div>
    );
    
    return (
        <div className="w-full max-w-md bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{entity.nom}</h2>
                    <p className="text-sm text-gray-500">{entity.code}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(entity)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md">X</button>
                </div>
            </div>
            <div className="border-b"><nav className="flex space-x-4 px-4">
                {['details', 'hierarchy', 'attachments', 'history'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`py-2 px-1 text-sm font-medium capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>{tab === 'hierarchy' ? 'Hiérarchie' : tab === 'attachments' ? 'Rattachements' : tab === 'history' ? 'Historique' : 'Détails'}</button>
                ))}
            </nav></div>
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                {activeTab === 'details' && <div className="space-y-4">
                    <DetailItem label="Type" value={entity.type} />
                    <DetailItem label="Responsable" value={responsable ? `${responsable.prenom} ${responsable.nom}` : 'Non assigné'} />
                    <DetailItem label="Statut" value={<span className={`px-2 py-0.5 text-xs rounded-full capitalize ${ENTITY_STATUS_COLORS[entity.statut]}`}>{entity.statut.replace(/_/g, ' ')}</span>} />
                    <DetailItem label="Confidentialité" value={entity.confidentialite} />
                    <DetailItem label="Email de contact" value={entity.emailContact} />
                    <DetailItem label="Téléphone" value={entity.telephoneContact} />
                    <DetailItem label="Adresse" value={entity.siteAdresse} />

                    {hasCustomFields && (
                        <div className="pt-4 mt-4 border-t">
                             <h4 className="text-base font-semibold text-gray-800 mb-3">Informations complémentaires</h4>
                             <div className="space-y-3">
                                {customFieldDefs.map(field => {
                                    const value = entity.champsLibres?.[field.name];
                                    if (!value) return null;
                                    return <DetailItem key={field.id} label={field.name} value={String(value)} />;
                                })}
                            </div>
                        </div>
                    )}
                </div>}
                 {activeTab === 'hierarchy' && <div className="space-y-4">
                     <DetailItem label="Parent" value={parent ? `${parent.nom} (${parent.code})` : 'Aucun (racine)'} />
                     <div>
                         <p className="text-sm font-semibold text-gray-700">Sous-entités ({children.length})</p>
                         <div className="space-y-1 mt-1">
                            {children.map((child, index) => (
                                <div key={child.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                    <span className="text-sm">{child.nom}</span>
                                    <div className="flex items-center">
                                        <button onClick={() => onReorder(child.id, 'up')} disabled={index === 0} className="p-1 disabled:opacity-25"><ArrowUp className="h-4 w-4"/></button>
                                        <button onClick={() => onReorder(child.id, 'down')} disabled={index === children.length - 1} className="p-1 disabled:opacity-25"><ArrowDown className="h-4 w-4"/></button>
                                    </div>
                                </div>
                            ))}
                         </div>
                         <button onClick={() => onAddSub(entity)} className="w-full mt-2 flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 text-sm"><Plus className="h-4 w-4" /><span>Ajouter une sous-entité</span></button>
                     </div>
                </div>}
                 {activeTab === 'attachments' && <div className="space-y-3">
                     {[ {icon: Users, title: 'Personnes', data: attachments.personnes}, {icon: Briefcase, title: 'Postes', data: attachments.postes}, {icon: LinkIcon, title: 'Risques', data: attachments.risques} ].map(item => (
                         <div key={item.title}><div className="flex items-center space-x-2 text-gray-700 text-sm font-medium"><item.icon className="h-4 w-4"/><span>{item.title} ({item.data.length})</span></div>
                         {item.data.length > 0 && <div className="pl-6 text-sm text-gray-600 border-l-2 ml-2 mt-1">{item.data.map((d: any) => <p key={d.id}>- {d.nom || d.intitule}</p>)}</div>}
                         </div>
                     ))}
                </div>}
                {activeTab === 'history' && <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3"><History className="h-4 w-4 mt-0.5 text-gray-500"/><p>Créé par <strong>{personnes.find(p=>p.id === entity.auteurId)?.nom}</strong> le {entity.dateCreation.toLocaleDateString('fr-FR')}</p></div>
                    <div className="flex items-start space-x-3"><Edit className="h-4 w-4 mt-0.5 text-gray-500"/><p>Modifié par <strong>{personnes.find(p=>p.id === entity.auteurId)?.nom}</strong> le {entity.dateModification.toLocaleDateString('fr-FR')}</p></div>
                </div>}
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---

export const EntitiesPage: React.FC = () => {
    const [view, setView] = useState<'list' | 'organigram'>('organigram');
    const [selectedEntity, setSelectedEntity] = useState<Entite | null>(null);
    const [entities, setEntities] = useState<Entite[]>(mockData.entites as Entite[]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ type: string, statut: string }>({ type: 'all', statut: 'all' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntity, setEditingEntity] = useState<Partial<Entite> | null>(null);

    const entityTree = useMemo(() => buildTree(entities), [entities]);
    
    const filteredEntities = useMemo(() => {
        return entities.filter(e => 
            (e.nom.toLowerCase().includes(searchTerm.toLowerCase()) || e.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.type === 'all' || e.type === filters.type) &&
            (filters.statut === 'all' || e.statut === filters.statut)
        );
    }, [entities, searchTerm, filters]);
    
    const handleReorderChild = (childId: string, direction: 'up' | 'down') => {
        // This is a mock implementation. A real app would have a more robust state management.
        console.log(`Reordering ${childId} ${direction}`);
    };
    
    const handleOpenModal = (entity?: Partial<Entite>) => {
        setEditingEntity(entity || {});
        setIsModalOpen(true);
    };

    const handleAddSub = (parentEntity: Entite) => {
        handleOpenModal({ parentId: parentEntity.id });
    };

    const handleSaveEntity = (entityToSave: Entite) => {
        if (entityToSave.id) {
            const updatedEntity = { ...entities.find(e => e.id === entityToSave.id), ...entityToSave, dateModification: new Date() } as Entite;
            setEntities(entities.map(e => e.id === entityToSave.id ? updatedEntity : e));
            if(selectedEntity?.id === updatedEntity.id) setSelectedEntity(updatedEntity);
        } else {
            const newEntity = { ...entityToSave, id: `ent-${Date.now()}`, reference: entityToSave.code || `E${Date.now()}` } as Entite;
            setEntities([...entities, newEntity]);
        }
        setIsModalOpen(false);
    };

    const handleExportCsv = () => {
        const dataToExport = filteredEntities.map(entity => {
            const responsable = mockData.personnes.find(p => p.id === entity.responsableId);
            return {
                Reference: entity.reference,
                Nom: entity.nom,
                Code: entity.code,
                Type: entity.type,
                Responsable: responsable ? `${responsable.prenom} ${responsable.nom}` : '',
                Statut: entity.statut.replace(/_/g, ' '),
                Confidentialite: entity.confidentialite,
            };
        });
        exportToCsv('export_entites.csv', dataToExport);
    };
    
    const handleExportPng = () => {
        alert("La fonctionnalité d'export PNG est en cours de développement.");
    };

    return (
        <div className="flex flex-col md:flex-row bg-gray-50 h-[calc(100vh-150px)] rounded-lg border relative overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-3">
                            <Building className="h-8 w-8 text-gray-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Entités</h1>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setView('list')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><List className="h-4 w-4"/>Liste</button>
                            <button onClick={() => setView('organigram')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${view === 'organigram' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><Workflow className="h-4 w-4"/>Organigramme</button>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm"><Plus className="h-4 w-4" /><span>Ajouter une entité</span></button>
                        <div className="relative group">
                            <button className="flex items-center space-x-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm"><Download className="h-4 w-4" /><span>Exporter</span></button>
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity z-10">
                                <button onClick={handleExportCsv} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm"><FileSpreadsheet className="h-4 w-4 text-green-600"/>Exporter la liste (CSV)</button>
                                {view === 'organigram' && 
                                    <button onClick={handleExportPng} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm"><Image className="h-4 w-4 text-blue-600"/>Exporter l'arbre (PNG)</button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                 {view === 'list' && (
                    <div className="p-2 border-b bg-white flex flex-wrap items-center gap-2">
                        <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                        <select onChange={e => setFilters(f => ({...f, type: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les types</option>{Object.keys(ENTITY_TYPE_ICONS).map(t => <option key={t} value={t}>{t}</option>)}</select>
                        <select onChange={e => setFilters(f => ({...f, statut: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les statuts</option>{Object.keys(ENTITY_STATUS_COLORS).map(s => <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>)}</select>
                    </div>
                )}
                <div className="flex-1 overflow-auto p-4">
                    {view === 'organigram' && entityTree.map((rootNode) => (
                        <div key={rootNode.id} className="relative before:absolute before:top-0 before:left-4 before:w-px before:h-full before:bg-gray-200">
                           <OrgNode node={rootNode} onSelect={setSelectedEntity} selectedId={selectedEntity?.id} onEdit={handleOpenModal} onAddSub={handleAddSub} />
                        </div>
                    ))}
                    {view === 'list' && (
                        <div className="bg-white border rounded-lg">
                            <table className="min-w-full">
                                <thead className="bg-gray-50"><tr>
                                    {['Nom', 'Code', 'Type', 'Responsable', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}
                                </tr></thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredEntities.map(entity => {
                                        const responsable = mockData.personnes.find(p => p.id === entity.responsableId);
                                        return (
                                            <tr key={entity.id} onClick={() => setSelectedEntity(entity)} className={`hover:bg-gray-50 cursor-pointer ${selectedEntity?.id === entity.id ? 'bg-blue-50' : ''}`}>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{entity.nom}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{entity.code}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{entity.type}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{responsable ? `${responsable.prenom} ${responsable.nom}` : '-'}</td>
                                                <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs rounded-full capitalize ${ENTITY_STATUS_COLORS[entity.statut]}`}>{entity.statut.replace(/_/g, ' ')}</span></td>
                                                <td className="px-4 py-2"><div className="flex items-center space-x-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(entity); }} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); /* delete action */ }} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                                </div></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {selectedEntity && (
                <EntityDetailPanel
                    entity={selectedEntity}
                    onClose={() => setSelectedEntity(null)}
                    onEdit={handleOpenModal}
                    onAddSub={handleAddSub}
                    onReorder={handleReorderChild}
                    allEntities={entities}
                />
            )}
             <EntiteFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEntity}
                entite={editingEntity}
            />
        </div>
    );
};

export default EntitiesPage;