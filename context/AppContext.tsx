import React, { createContext, useContext, useState, useReducer, useMemo, useCallback } from 'react';
import { mockData, modules as appModules } from '../constants';
import type { Personne, Risque, Role, Document, Actualite, NormeLoiCadre, NormeLoiExigence, Competence, CampagneEvaluation, EvaluationCompetence, PlanFormation, Mission, Processus, Notification, ISettings, Procedure, Poste, Entite, Controle, Indicateur, Tache, Incident, Amelioration, Actif, FluxDefinition, ValidationInstance, SyncConnector } from '../types';

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
    actions: {
        [key: string]: (...args: any[]) => Promise<void>;
    };
}

// --- ACTION TYPES FOR REDUCER ---

type DataAction =
  | { type: 'SAVE_ITEM', payload: { key: keyof IDataState, item: any } }
  | { type: 'DELETE_ITEM', payload: { key: keyof IDataState, id: string } };
  
// --- CONTEXT CREATION ---

const AppContext = createContext<IAppContext | undefined>(undefined);
const DataContext = createContext<IDataContext | undefined>(undefined);

// --- DATA REDUCER ---

const dataReducer = (state: IDataState, action: DataAction): IDataState => {
    switch (action.type) {
        case 'SAVE_ITEM': {
            const { key, item } = action.payload;
            const collection = state[key] as any[];
            const itemExists = collection.some(i => i.id === item.id);
            const newCollection = itemExists
                ? collection.map(i => i.id === item.id ? item : i)
                : [...collection, { ...item, id: `${String(key).slice(0, 4)}-${Date.now()}` }];
            return { ...state, [key]: newCollection };
        }
        case 'DELETE_ITEM': {
            const { key, id } = action.payload;
            const collection = state[key] as any[];
            return { ...state, [key]: collection.filter(i => i.id !== id) };
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
    const [data, dispatch] = useReducer(dataReducer, mockData);
    const [loading, setLoading] = useState(false);

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

    // Memoized async action creators
    const createAndDispatch = useCallback(async (action: DataAction) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        dispatch(action);
        setLoading(false);
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
        };
    }, [createAndDispatch]);


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
        data, loading, actions
    }), [data, loading, actions]);

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
