import React, { createContext, useContext, useState, useReducer, useMemo, useCallback } from 'react';
import { mockData, modules as appModules } from '../constants';
import type { Personne, Risque, Role, Document, Actualite, NormeLoiCadre, NormeLoiExigence, Competence, CampagneEvaluation, EvaluationCompetence, PlanFormation, Mission, Processus, Notification, ISettings, Procedure, Poste, Entite, Controle, Indicateur, Tache, Incident, Amelioration, Actif, FluxDefinition, ValidationInstance, SyncConnector } from '../types';

// --- LOCAL STORAGE PERSISTENCE ---

const LOCAL_STORAGE_KEY = 'optimisoSuiteData';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
const reviveDates = (key: string, value: any) => {
    if (typeof value === 'string' && isoDateRegex.test(value)) {
        try {
            return new Date(value);
        } catch (e) {
            // ignore if not a valid date
        }
    }
    return value;
};

const loadDataFromLocalStorage = (): IDataState => {
    try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            return mockData;
        }
        const storedData = JSON.parse(serializedState, reviveDates);
        const initialState = { ...mockData };
        for (const key in storedData) {
            if (Object.prototype.hasOwnProperty.call(initialState, key)) {
                initialState[key] = storedData[key];
            }
        }
        return initialState;
    } catch (err) {
        console.error("Could not load state from localStorage", err);
        return mockData;
    }
};

const saveDataToLocalStorage = async (state: IDataState): Promise<void> => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
    } catch (err) {
        console.error("Could not save state to localStorage", err);
    }
};


// --- INITIAL SETTINGS STATE ---
const initialSettings: ISettings = {
    modules: appModules.reduce((acc, mod) => {
        acc[mod.id] = { visible: true };
        return acc;
    }, {} as Record<string, { visible: boolean }>),
    references: {
        personnes: { prefix: 'PER-', digits: 4 },
        documents: { prefix: 'DOC-', digits: 5 },
        risques: { prefix: 'RSK-', digits: 3 },
    },
    customFields: {
        personnes: [
            { id: 'cf-pers-1', name: 'Date d\'entrée', type: 'date', required: false },
            { id: 'cf-pers-2', name: 'Numéro de matricule', type: 'text', required: false },
        ],
        risques: [],
        postes: [],
        processus: [],
        competences: [],
        entites: [],
    },
    ficheLayouts: {
        documents: {
            tabs: [
                { id: 'tab1', label: 'Métadonnées' },
                { id: 'tab2', label: 'Contenu' },
                { id: 'tab3', label: 'Relations' },
                { id: 'tab4', label: 'Historique' },
            ],
            sections: {
                tab1: ['validationSection', 'metadataSection'],
                tab2: ['contentSection'],
                tab3: ['relationsSection'],
                tab4: ['historySection'],
            },
        },
        personnes: {
            tabs: [
                { id: 'tab1', label: 'Informations' },
                { id: 'tab2', label: 'Affectations' },
                { id: 'tab3', label: 'Compétences' },
                { id: 'tab4', label: 'Accès' },
                { id: 'tab5', label: 'Historique' },
            ],
            sections: {
                tab1: ['personne-generalInfoSection'],
                tab2: ['affectationsSection'],
                tab3: ['competencesSection'],
                tab4: ['accessSection'],
                tab5: ['personne-historySection'],
            },
        },
        postes: {
            tabs: [
                { id: 'tab1', label: 'Détails' },
                { id: 'tab2', label: 'Mission' },
                { id: 'tab3', label: 'Compétences' },
                { id: 'tab4', label: 'Occupants' },
                { id: 'tab5', label: 'RACI' },
            ],
            sections: {
                tab1: ['poste-detailsSection'],
                tab2: ['poste-missionSection'],
                tab3: ['poste-skillsSection'],
                tab4: ['poste-occupantsSection'],
                tab5: ['poste-raciSection'],
            },
        },
        risques: {
            tabs: [
                { id: 'tab1', label: 'Identification' },
                { id: 'tab2', label: 'Évaluation' },
                { id: 'tab3', label: 'Maîtrise' },
                { id: 'tab4', label: 'Actions' },
                { id: 'tab5', label: 'Historique' },
            ],
            sections: {
                tab1: ['identificationSection'],
                tab2: ['evaluationSection'],
                tab3: ['masterySection'],
                tab4: ['actionsSection'],
                tab5: ['risque-historySection'],
            },
        },
        controles: {
            tabs: [
                { id: 'tab1', label: 'Détails' },
                { id: 'tab2', label: 'Planification' },
                { id: 'tab3', label: 'Maîtrise' },
                { id: 'tab4', label: 'Exécutions' },
            ],
            sections: {
                tab1: ['controle-detailsSection'],
                tab2: ['planningSection'],
                tab3: ['controle-masterySection'],
                tab4: ['executionsSection'],
            },
        },
        entites: {
            tabs: [
                { id: 'tab1', label: 'Organisation' },
                { id: 'tab2', label: 'Informations' },
            ],
            sections: {
                tab1: ['hierarchySection', 'entite-relationsSection'],
                tab2: ['entite-generalInfoSection'],
            }
        },
        roles: {
            tabs: [
                { id: 'tab1', label: 'Détails' },
                { id: 'tab2', label: 'Permissions' },
                { id: 'tab3', label: 'Assignations' },
            ],
            sections: {
                tab1: ['role-detailsSection'],
                tab2: ['permissionsSection'],
                tab3: ['assignmentsSection'],
            },
        },
        missions: {
            tabs: [
                { id: 'tab1', label: 'Détails' },
                { id: 'tab2', label: 'KPI' },
                { id: 'tab3', label: 'Liens & Interfaces' },
            ],
            sections: {
                tab1: ['mission-detailsSection'],
                tab2: ['kpiSection'],
                tab3: ['mission-linksSection'],
            },
        },
        actifs: {
            tabs: [
                { id: 'tab1', label: 'Détails' },
                { id: 'tab2', label: 'Arborescence' },
                { id: 'tab3', label: 'Maintenance' },
                { id: 'tab4', label: 'Liens' },
            ],
            sections: {
                tab1: ['actif-detailsSection'],
                tab2: ['treeSection'],
                tab3: ['maintenanceSection'],
                tab4: ['actif-linksSection'],
            },
        },
        incidents: {
            tabs: [
                { id: 'tab1', label: 'Détails' },
                { id: 'tab2', label: 'Tâches' },
                { id: 'tab3', label: 'Liens' },
            ],
            sections: {
                tab1: ['incident-detailsSection'],
                tab2: ['tasksSection'],
                tab3: ['incident-linksSection'],
            },
        },
        ameliorations: {
            tabs: [
                { id: 'tab1', label: 'Détails' },
                { id: 'tab2', label: 'Plan d\'actions' },
                { id: 'tab3', label: 'Liens' },
            ],
            sections: {
                tab1: ['amelioration-detailsSection'],
                tab2: ['amelioration-actionsSection'],
                tab3: ['amelioration-linksSection'],
            },
        },
        processus: {
            tabs: [
                { id: 'tab1', label: 'Détails' },
                { id: 'tab2', label: 'SIPOC' },
                { id: 'tab3', label: 'Liens' },
            ],
            sections: {
                tab1: ['processus-detailsSection'],
                tab2: ['sipocSection'],
                tab3: ['processus-linksSection'],
            },
        },
         competences: {
            tabs: [
                { id: 'tab1', label: 'Détails' },
            ],
            sections: {
                tab1: [],
            },
        },
         indicateurs: {
            tabs: [
                { id: 'tab1', label: 'Graphique' },
            ],
            sections: {
                tab1: [],
            },
        },
        'normes-lois': {
            tabs: [
                { id: 'tab1', label: 'Exigences' },
            ],
            sections: {
                tab1: [],
            },
        },
        actualites: {
            tabs: [
                { id: 'tab1', label: 'Contenu' },
            ],
            sections: {
                tab1: [],
            },
        },
        todo: {
             tabs: [
                { id: 'tab1', label: 'Détails' },
            ],
            sections: {
                tab1: [],
            },
        }
    }
};

// --- STATE & CONTEXT TYPES ---

interface IAppState {
    activeModule: string;
    sidebarOpen: boolean;
    user: { id: string, nom: string; profil: string; avatar: string; };
    notifications: Notification[];
    readNotificationIds: string[];
    notifiedTarget: { moduleId: string, itemId: string } | null;
    settings: ISettings;
}

interface IAppContext extends IAppState {
    setActiveModule: (id: string) => void;
    setSidebarOpen: (open: boolean) => void;
    handleNotificationClick: (notification: Notification) => void;
    markAllNotificationsAsRead: () => void;
    clearNotifiedTarget: () => void;
    setSettings: (settings: ISettings) => void;
}

interface IDataState {
    [key: string]: any[] | Record<string, any>;
}

interface IDataContext {
    data: IDataState;
    loading: boolean;
    error: string | null;
    actions: {
        [key: string]: (...args: any[]) => Promise<void>;
    };
}

// --- ACTION TYPES FOR REDUCER ---

type DataAction =
  | { type: 'SAVE_ITEM', payload: { key: keyof IDataState, item: any } }
  | { type: 'DELETE_ITEM', payload: { key: keyof IDataState, id: string } }
  | { type: 'APPROVE_VALIDATION', payload: { validationId: string, userId: string } }
  | { type: 'REJECT_VALIDATION', payload: { validationId: string, userId: string, comment: string } };
  
// --- CONTEXT CREATION ---

const AppContext = createContext<IAppContext | undefined>(undefined);
const DataContext = createContext<IDataContext | undefined>(undefined);

// --- DATA REDUCER ---

const dataReducer = (state: IDataState, action: DataAction): IDataState => {
    switch (action.type) {
        case 'SAVE_ITEM': {
            const { key, item } = action.payload;
            let newState = { ...state };
            const collection = state[key] as any[];
            
            const itemToSave = { ...item };
            let isNew = !itemToSave.id;
            
            if (isNew) {
                const prefix = String(key).slice(0, 4);
                itemToSave.id = `${prefix}-${Date.now()}`;
            } else {
                isNew = !collection.some(i => i.id === itemToSave.id);
            }

            const newCollection = isNew
                ? [...collection, itemToSave]
                : collection.map(i => i.id === itemToSave.id ? itemToSave : i);
            
            newState = { ...newState, [key]: newCollection };

            // Specific logic for Processus to maintain Mission relationship consistency
            if (key === 'processus') {
                const proc = itemToSave as Processus;
                const oldProc = isNew ? null : collection.find(p => p.id === proc.id);
                const oldMissionId = oldProc?.missionId;
                const newMissionId = proc.missionId;

                if (oldMissionId !== newMissionId) {
                    const missions = newState.missions as Mission[];
                    const newMissions = missions.map(m => {
                        let newProcessusIds = m.processusIds ? [...m.processusIds] : [];
                        let changed = false;

                        // Remove from old mission
                        if (oldMissionId && m.id === oldMissionId) {
                            const index = newProcessusIds.indexOf(proc.id);
                            if (index > -1) {
                                newProcessusIds.splice(index, 1);
                                changed = true;
                            }
                        }
                        // Add to new mission
                        if (newMissionId && m.id === newMissionId) {
                            if (!newProcessusIds.includes(proc.id)) {
                                newProcessusIds.push(proc.id);
                                changed = true;
                            }
                        }
                        return changed ? { ...m, processusIds: newProcessusIds } : m;
                    });
                    newState = { ...newState, missions: newMissions };
                }
            }
            
            saveDataToLocalStorage(newState);
            return newState;
        }
        case 'DELETE_ITEM': {
            const { key, id } = action.payload;
            const collection = state[key] as any[];
            let newState = { ...state, [key]: collection.filter(i => i.id !== id) };

            // Specific logic for Processus delete
            if (key === 'processus') {
                const procToDelete = collection.find(p => p.id === id) as Processus | undefined;
                if (procToDelete && procToDelete.missionId) {
                    const missions = newState.missions as Mission[];
                    const newMissions = missions.map(m => {
                        if (m.id === procToDelete.missionId) {
                            const newProcessusIds = m.processusIds.filter(pid => pid !== id);
                            return { ...m, processusIds: newProcessusIds };
                        }
                        return m;
                    });
                    newState = { ...newState, missions: newMissions };
                }
            }
            
            saveDataToLocalStorage(newState);
            return newState;
        }
        case 'APPROVE_VALIDATION':
        case 'REJECT_VALIDATION': {
            const { validationId, userId } = action.payload;
            const isApproval = action.type === 'APPROVE_VALIDATION';
            const comment = (action.type === 'REJECT_VALIDATION') ? action.payload.comment : 'Approuvé';

            const validation = (state.validationInstances as ValidationInstance[]).find(v => v.id === validationId);
            if (!validation) return state;

            // Update validation instance
            const updatedValidation = {
                ...validation,
                statut: isApproval ? 'Approuvé' : 'Rejeté',
                historique: [
                    ...validation.historique,
                    {
                        id: `hist-${Date.now()}`,
                        etapeId: 'etape-flux-1', // Mock: assume first step
                        decideurId: userId,
                        decision: isApproval ? 'Approuvé' : 'Rejeté',
                        commentaire: comment,
                        dateDecision: new Date(),
                    },
                ],
            };

            // Update the element (document, procedure...)
            const elementModuleKey = (validation.elementModule.toLowerCase()) as keyof IDataState;
            const collection = state[elementModuleKey] as any[];
            const updatedCollection = collection.map(item => {
                if (item.id === validation.elementId) {
                    return { ...item, statut: isApproval ? 'publie' : 'rejete' };
                }
                return item;
            });
            
            const newState = {
                ...state,
                validationInstances: (state.validationInstances as ValidationInstance[]).map(v => v.id === validationId ? updatedValidation : v),
                [elementModuleKey]: updatedCollection,
            };
            saveDataToLocalStorage(newState);
            return newState;
        }
        default:
            return state;
    }
};


// --- MAIN PROVIDER COMPONENT ---

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // UI State Management
    const [activeModule, setActiveModule] = useState('accueil');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user] = useState({ id: 'pers-2', nom: 'Marie Martin', profil: 'Manager', avatar: 'MM' });
    const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
    const [notifiedTarget, setNotifiedTarget] = useState<{ moduleId: string, itemId: string } | null>(null);
    const [settings, setSettings] = useState<ISettings>(initialSettings);

    // Data State Management
    const [data, dispatch] = useReducer(dataReducer, loadDataFromLocalStorage());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Notification Actions
    const handleNotificationClick = useCallback((notification: Notification) => {
        setReadNotificationIds(prev => [...new Set([...prev, notification.id])]);
        setActiveModule(notification.targetModule);
        setNotifiedTarget({ moduleId: notification.targetModule, itemId: notification.targetId });
    }, []);

    const markAllNotificationsAsRead = useCallback(() => {
        setReadNotificationIds((data.notifications as Notification[]).map((n: Notification) => n.id));
    }, [data.notifications]);
    
    const clearNotifiedTarget = useCallback(() => {
        setNotifiedTarget(null);
    }, []);

    // Memoized async action creator wrapper
    const createAndDispatch = useCallback(async (action: DataAction) => {
        setLoading(true);
        setError(null);
        try {
            // Simulate network delay. Replace with Supabase call.
            await new Promise(resolve => setTimeout(resolve, 300));
            dispatch(action);
        } catch (e: any) {
            setError(e.message || "Une erreur est survenue.");
            console.error("Data action failed:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    const actions = useMemo(() => {
        const createActions = <T extends { id: string }>(key: keyof IDataState) => {
            const keyStr = String(key);
            const capitalizedKey = keyStr.charAt(0).toUpperCase() + keyStr.slice(1, -1);
            return {
                [`save${capitalizedKey}`]: (item: T) => createAndDispatch({ type: 'SAVE_ITEM', payload: { key, item } }),
                [`delete${capitalizedKey}`]: (id: string) => createAndDispatch({ type: 'DELETE_ITEM', payload: { key, id } }),
            };
        };
        return {
            ...createActions<Risque>('risques'),
            ...createActions<Personne>('personnes'),
            ...createActions<Role>('roles'),
            ...createActions<Document>('documents'),
            ...createActions<Actualite>('actualites'),
            ...createActions<NormeLoiCadre>('normesLoisCadres'),
            ...createActions<NormeLoiExigence>('normesLoisExigences'),
            ...createActions<Competence>('competences'),
            ...createActions<CampagneEvaluation>('campagnesEvaluation'),
            ...createActions<PlanFormation>('plansFormation'),
            ...createActions<Mission>('missions'),
            ...createActions<Processus>('processus'),
            ...createActions<Procedure>('procedures'),
            ...createActions<Poste>('postes'),
            ...createActions<Entite>('entites'),
            ...createActions<Controle>('controles'),
            ...createActions<Indicateur>('indicateurs'),
            ...createActions<Tache>('taches'),
            ...createActions<Incident>('incidents'),
            ...createActions<Amelioration>('ameliorations'),
            ...createActions<Actif>('actifs'),
            ...createActions<FluxDefinition>('fluxDefinitions'),
            ...createActions<ValidationInstance>('validationInstances'),
            ...createActions<SyncConnector>('syncConnectors'),
            // Actions that don't fit the simple pattern
            saveEvaluationCompetence: (item: EvaluationCompetence) => createAndDispatch({ type: 'SAVE_ITEM', payload: { key: 'evaluationsCompetences', item } }),
            approveValidation: (validationId: string) => createAndDispatch({ type: 'APPROVE_VALIDATION', payload: { validationId, userId: user.id } }),
            rejectValidation: (validationId: string, comment: string) => createAndDispatch({ type: 'REJECT_VALIDATION', payload: { validationId, userId: user.id, comment } }),
        };
    }, [createAndDispatch, user.id]);


    const appContextValue = useMemo(() => ({
        activeModule, setActiveModule, sidebarOpen, setSidebarOpen, user,
        notifications: data.notifications as Notification[],
        readNotificationIds,
        handleNotificationClick,
        markAllNotificationsAsRead,
        notifiedTarget,
        clearNotifiedTarget,
        settings,
        setSettings
    }), [activeModule, sidebarOpen, user, data.notifications, readNotificationIds, handleNotificationClick, markAllNotificationsAsRead, notifiedTarget, clearNotifiedTarget, settings]);
    
    const dataContextValue = useMemo(() => ({
        data, loading, error, actions
    }), [data, loading, error, actions]);

    return (
        <AppContext.Provider value={appContextValue}>
            <DataContext.Provider value={dataContextValue}>
                {children}
            </DataContext.Provider>
        </AppContext.Provider>
    );
};

// --- CUSTOM HOOKS ---

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useDataContext must be used within an AppProvider');
    }
    return context;
};

type Action = 'C' | 'R' | 'U' | 'D';
type ModuleId = string;

export const usePermissions = () => {
    const { user } = useAppContext();
    const { data } = useDataContext();

    const permissions = useMemo(() => {
        const currentUser = (data.personnes as Personne[]).find(p => p.id === user.id);
        if (!currentUser) {
            return {};
        }

        const userRoles = (data.roles as Role[]).filter(r => currentUser.roleIds.includes(r.id));
        
        const aggregatedPermissions: Record<ModuleId, { [key in Action]: boolean }> = {};

        userRoles.forEach(role => {
            for (const moduleId in role.permissions) {
                if (!aggregatedPermissions[moduleId]) {
                    aggregatedPermissions[moduleId] = { C: false, R: false, U: false, D: false };
                }
                aggregatedPermissions[moduleId].C = aggregatedPermissions[moduleId].C || role.permissions[moduleId].C;
                aggregatedPermissions[moduleId].R = aggregatedPermissions[moduleId].R || role.permissions[moduleId].R;
                aggregatedPermissions[moduleId].U = aggregatedPermissions[moduleId].U || role.permissions[moduleId].U;
                aggregatedPermissions[moduleId].D = aggregatedPermissions[moduleId].D || role.permissions[moduleId].D;
            }
        });

        return aggregatedPermissions;
    }, [user.id, data.personnes, data.roles]);

    const can = useCallback((action: Action, moduleId: ModuleId): boolean => {
        return permissions[moduleId]?.[action] ?? false;
    }, [permissions]);

    return { can, permissions };
};
