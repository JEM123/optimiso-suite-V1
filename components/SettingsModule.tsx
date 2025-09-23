import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { ISettings, CustomFieldDef, CustomFieldType, ReferenceFormat } from '../types';
import { modules } from '../constants';
import { Save, Package, FileText, FolderOpen, AlertTriangle, X, Plus, Trash2 } from 'lucide-react';
import PageHeader from './PageHeader';
import Button from './ui/Button';

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";
const modulesWithCustomFields = ['personnes', 'postes', 'processus', 'competences', 'risques', 'entites'];

const SettingsModule: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const [localSettings, setLocalSettings] = useState<ISettings>(JSON.parse(JSON.stringify(settings))); // Deep copy
    const [activeTab, setActiveTab] = useState('modules');
    const [selectedModule, setSelectedModule] = useState(modulesWithCustomFields[0]);
    
    const handleSave = () => {
        setSettings(localSettings);
        alert('Paramètres sauvegardés !');
    };

    // --- Tab Render Functions ---

    const renderModulesTab = () => {
        const handleToggle = (moduleId: string) => {
            setLocalSettings(prev => ({
                ...prev,
                modules: { ...prev.modules, [moduleId]: { visible: !prev.modules[moduleId]?.visible } }
            }));
        };
        return (
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    Cochez les modules que vous souhaitez rendre visibles dans la barre de navigation latérale.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.filter(m => m.id !== 'settings').map(mod => (
                        <label key={mod.id} className="flex items-center p-4 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                                checked={localSettings.modules[mod.id]?.visible ?? true}
                                onChange={() => handleToggle(mod.id)}
                            />
                            <span className="ml-3 font-medium text-gray-700">{mod.nom}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    const renderReferencesTab = () => {
        const handleRefChange = (module: string, field: keyof ReferenceFormat, value: string | number) => {
            setLocalSettings(prev => ({
                ...prev,
                references: { ...prev.references, [module]: { ...prev.references[module], [field]: value } }
            }));
        };
        return (
             <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    Configurez le formatage des références pour les nouveaux éléments.
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(localSettings.references).map(([module, format]) => {
                        const refFormat = format as ReferenceFormat;
                        return (
                        <div key={module} className="p-4 bg-white border rounded-lg">
                            <h4 className="font-semibold text-gray-800 capitalize mb-3">{module}</h4>
                            <div className="space-y-3">
                                <div><label className="block text-sm mb-1">Préfixe</label><input type="text" value={refFormat.prefix} onChange={e => handleRefChange(module, 'prefix', e.target.value)} className={formInputClasses}/></div>
                                <div><label className="block text-sm mb-1">Nombre de chiffres</label><input type="number" min="2" max="8" value={refFormat.digits} onChange={e => handleRefChange(module, 'digits', parseInt(e.target.value))} className={formInputClasses}/></div>
                                <div className="bg-gray-100 p-2 rounded text-sm">Exemple: <span className="font-mono">{`${refFormat.prefix}${String(1).padStart(refFormat.digits, '0')}`}</span></div>
                            </div>
                        </div>
                    )})}
                 </div>
            </div>
        )
    };
    
    const renderCustomFieldsTab = () => {
        const handleFieldChange = (index: number, field: keyof CustomFieldDef, value: any) => {
            const newFields = [...(localSettings.customFields[selectedModule] || [])];
            if (field === 'options' && typeof value === 'string') {
                newFields[index] = { ...newFields[index], [field]: value.split(',').map(s => s.trim()).filter(Boolean) };
            } else {
                newFields[index] = { ...newFields[index], [field]: value };
            }
            setLocalSettings(prev => ({ ...prev, customFields: { ...prev.customFields, [selectedModule]: newFields }}));
        };

        const addField = () => {
             const newField: CustomFieldDef = { id: `cf-${Date.now()}`, name: '', type: 'text', required: false };
             const currentFields = localSettings.customFields[selectedModule] || [];
             setLocalSettings(prev => ({ ...prev, customFields: { ...prev.customFields, [selectedModule]: [...currentFields, newField] }}));
        };

        const removeField = (index: number) => {
             const currentFields = localSettings.customFields[selectedModule] || [];
             setLocalSettings(prev => ({ ...prev, customFields: { ...prev.customFields, [selectedModule]: currentFields.filter((_, i) => i !== index) }}));
        };

        return (
             <div className="space-y-4">
                 <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    Ajoutez des champs de données supplémentaires aux modules de votre choix pour correspondre à vos processus.
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Sélectionner un module à configurer:</label>
                    <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)} className={formInputClasses + " max-w-xs"}>
                        {modulesWithCustomFields.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
                    </select>
                </div>
                <div className="p-4 bg-white border rounded-lg space-y-3">
                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-2">
                        <div className="col-span-4">Nom du champ</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-4">Options (si type select)</div>
                        <div className="col-span-1 text-center">Requis</div>
                    </div>
                    {(localSettings.customFields[selectedModule] || []).map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-gray-50/50">
                            <div className="col-span-4">
                                <input type="text" placeholder="Nom du champ" value={field.name} onChange={e => handleFieldChange(index, 'name', e.target.value)} className={formInputClasses} />
                            </div>
                            <div className="col-span-2">
                                <select value={field.type} onChange={e => handleFieldChange(index, 'type', e.target.value as CustomFieldType)} className={formInputClasses}>
                                    {['text', 'number', 'date', 'textarea', 'select'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="col-span-4">
                                {field.type === 'select' && (
                                    <input type="text" placeholder="Options, séparées par virgule" value={(field.options || []).join(', ')} onChange={e => handleFieldChange(index, 'options', e.target.value)} className={formInputClasses}/>
                                )}
                            </div>
                            <div className="col-span-1 flex items-center justify-center">
                                <input type="checkbox" checked={field.required} onChange={e => handleFieldChange(index, 'required', e.target.checked)} className="rounded" id={`req-${field.id}`}/>
                                <label htmlFor={`req-${field.id}`} className="sr-only">Requis</label>
                            </div>
                            <div className="col-span-1">
                                <button type="button" onClick={() => removeField(index)} className="p-1 hover:bg-gray-100 rounded">
                                    <Trash2 className="h-4 w-4 text-red-500"/>
                                </button>
                            </div>
                        </div>
                    ))}
                    <Button type="button" onClick={addField} variant="secondary" size="sm" icon={Plus}>Ajouter un champ</Button>
                </div>
            </div>
        )
    };


    const tabs = [
        { id: 'modules', name: 'Modules', icon: Package, content: renderModulesTab() },
        { id: 'references', name: 'Références', icon: FileText, content: renderReferencesTab() },
        { id: 'customfields', name: 'Champs Libres', icon: FolderOpen, content: renderCustomFieldsTab() },
    ];
    
    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="Paramètres"
                icon={AlertTriangle}
                description="Personnalisez le comportement et l'apparence de l'application."
                actions={[{ label: 'Sauvegarder', icon: Save, onClick: handleSave, variant: 'primary' }]}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <div className="border-b bg-white">
                    <nav className="flex space-x-4 px-4">
                        {tabs.map(tab => (
                             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-3 px-1 text-sm font-medium flex items-center gap-2 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                <tab.icon className="h-5 w-5" /> {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    {tabs.find(t => t.id === activeTab)?.content}
                </div>
            </div>
        </div>
    );
};

export default SettingsModule;