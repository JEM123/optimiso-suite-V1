import React, { createContext, useContext, useState, useReducer, useMemo, useCallback } from 'react';
import { mockData, modules as appModules } from '../constants';
import type { Personne, Risque, Role, Document, Actualite, NormeLoiCadre, NormeLoiExigence, Competence, CampagneEvaluation, EvaluationCompetence, PlanFormation, Mission, Processus, Notification, ISettings } from '../types';

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
    // FIX: Allow IDataState to hold objects as well as arrays to accommodate dashboardStats.
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
  | { type: 'SET_DATA', payload: IDataState }
  | { type: 'SAVE_RISK', payload: Risque }
  | { type: 'DELETE_RISK', payload: string }
  | { type: 'SAVE_PERSON', payload: Personne }
  | { type: 'DELETE_PERSON', payload: string }
  | { type: 'SAVE_ROLE', payload: Role }
  | { type: 'DELETE_ROLE', payload: string }
  | { type: 'SAVE_DOCUMENT', payload: Document }
  | { type: 'DELETE_DOCUMENT', payload: string }
  | { type: 'SAVE_ACTUALITE', payload: Actualite }
  | { type: 'DELETE_ACTUALITE', payload: string }
  | { type: 'SAVE_NORME_LOI_CADRE', payload: NormeLoiCadre }
  | { type: 'DELETE_NORME_LOI_CADRE', payload: string }
  | { type: 'SAVE_NORME_LOI_EXIGENCE', payload: NormeLoiExigence }
  | { type: 'DELETE_NORME_LOI_EXIGENCE', payload: string }
  | { type: 'SAVE_COMPETENCE', payload: Competence }
  | { type: 'DELETE_COMPETENCE', payload: string }
  | { type: 'SAVE_CAMPAGNE_EVALUATION', payload: CampagneEvaluation }
  | { type: 'DELETE_CAMPAGNE_EVALUATION', payload: string }
  | { type: 'SAVE_EVALUATION_COMPETENCE', payload: EvaluationCompetence }
  | { type: 'SAVE_PLAN_FORMATION', payload: PlanFormation }
  | { type: 'DELETE_PLAN_FORMATION', payload: string }
  | { type: 'SAVE_MISSION', payload: Mission }
  | { type: 'DELETE_MISSION', payload: string }
  | { type: 'SAVE_PROCESSUS', payload: Processus }
  | { type: 'DELETE_PROCESSUS', payload: string };

// --- CONTEXT CREATION ---

const AppContext = createContext<IAppContext | undefined>(undefined);
const DataContext = createContext<IDataContext | undefined>(undefined);

// --- DATA REDUCER ---

const dataReducer = (state: IDataState, action: DataAction): IDataState => {
    switch (action.type) {
        case 'SAVE_RISK':
            const riskExists = (state.risques as Risque[]).some(r => r.id === action.payload.id);
            return {
                ...state,
                risques: riskExists
                    ? (state.risques as Risque[]).map(r => r.id === action.payload.id ? action.payload : r)
                    : [...(state.risques as Risque[]), { ...action.payload, id: `RSK-${Date.now()}` }]
            };
        case 'DELETE_RISK':
            return { ...state, risques: (state.risques as Risque[]).filter(r => r.id !== action.payload) };

        case 'SAVE_PERSON':
            const personExists = (state.personnes as Personne[]).some(p => p.id === action.payload.id);
            return {
                ...state,
                personnes: personExists
                    ? (state.personnes as Personne[]).map(p => p.id === action.payload.id ? action.payload : p)
                    : [...(state.personnes as Personne[]), { ...action.payload, id: `pers-${Date.now()}` }]
            };
        case 'DELETE_PERSON':
             return { ...state, personnes: (state.personnes as Personne[]).filter(p => p.id !== action.payload) };

        case 'SAVE_ROLE':
            const roleExists = (state.roles as Role[]).some(r => r.id === action.payload.id);
            return {
                ...state,
                roles: roleExists
                    ? (state.roles as Role[]).map(r => r.id === action.payload.id ? action.payload : r)
                    : [...(state.roles as Role[]), { ...action.payload, id: `role-${Date.now()}` }]
            };
        case 'DELETE_ROLE':
             return { ...state, roles: (state.roles as Role[]).filter(r => r.id !== action.payload) };
             
        case 'SAVE_DOCUMENT':
            const docExists = (state.documents as Document[]).some(d => d.id === action.payload.id);
            return {
                ...state,
                documents: docExists
                    ? (state.documents as Document[]).map(d => d.id === action.payload.id ? action.payload : d)
                    : [...(state.documents as Document[]), { ...action.payload, id: `doc-${Date.now()}` }]
            };
        case 'DELETE_DOCUMENT':
             return { ...state, documents: (state.documents as Document[]).filter(d => d.id !== action.payload) };
        
        case 'SAVE_ACTUALITE':
            const actuExists = (state.actualites as Actualite[]).some(a => a.id === action.payload.id);
            return {
                ...state,
                actualites: actuExists
                    ? (state.actualites as Actualite[]).map(a => a.id === action.payload.id ? action.payload : a)
                    : [...(state.actualites as Actualite[]), { ...action.payload, id: `act-${Date.now()}` }]
            };
        case 'DELETE_ACTUALITE':
             return { ...state, actualites: (state.actualites as Actualite[]).filter(a => a.id !== action.payload) };

        case 'SAVE_NORME_LOI_CADRE':
            const cadreExists = (state.normesLoisCadres as NormeLoiCadre[]).some(c => c.id === action.payload.id);
            return {
                ...state,
                normesLoisCadres: cadreExists
                    ? (state.normesLoisCadres as NormeLoiCadre[]).map(c => c.id === action.payload.id ? action.payload : c)
                    : [...(state.normesLoisCadres as NormeLoiCadre[]), { ...action.payload, id: `nlc-${Date.now()}` }]
            };
        case 'DELETE_NORME_LOI_CADRE':
            return { 
                ...state, 
                normesLoisCadres: (state.normesLoisCadres as NormeLoiCadre[]).filter(c => c.id !== action.payload),
                normesLoisExigences: (state.normesLoisExigences as NormeLoiExigence[]).filter(e => e.cadreId !== action.payload)
            };
        case 'SAVE_NORME_LOI_EXIGENCE':
            const exigenceExists = (state.normesLoisExigences as NormeLoiExigence[]).some(e => e.id === action.payload.id);
            return {
                ...state,
                normesLoisExigences: exigenceExists
                    ? (state.normesLoisExigences as NormeLoiExigence[]).map(e => e.id === action.payload.id ? action.payload : e)
                    : [...(state.normesLoisExigences as NormeLoiExigence[]), { ...action.payload, id: `nle-${Date.now()}` }]
            };
        case 'DELETE_NORME_LOI_EXIGENCE':
            return { ...state, normesLoisExigences: (state.normesLoisExigences as NormeLoiExigence[]).filter(e => e.id !== action.payload) };
        
        case 'SAVE_COMPETENCE':
            const compExists = (state.competences as Competence[]).some(c => c.id === action.payload.id);
            return {
                ...state,
                competences: compExists
                    ? (state.competences as Competence[]).map(c => c.id === action.payload.id ? action.payload : c)
                    : [...(state.competences as Competence[]), { ...action.payload, id: `comp-${Date.now()}` }]
            };
        case 'DELETE_COMPETENCE':
             return { ...state, competences: (state.competences as Competence[]).filter(c => c.id !== action.payload) };
        
        case 'SAVE_CAMPAGNE_EVALUATION':
            const campExists = (state.campagnesEvaluation as CampagneEvaluation[]).some(c => c.id === action.payload.id);
            return {
                ...state,
                campagnesEvaluation: campExists
                    ? (state.campagnesEvaluation as CampagneEvaluation[]).map(c => c.id === action.payload.id ? action.payload : c)
                    : [...(state.campagnesEvaluation as CampagneEvaluation[]), { ...action.payload, id: `camp-${Date.now()}` }]
            };

        case 'DELETE_CAMPAGNE_EVALUATION':
            return { ...state, campagnesEvaluation: (state.campagnesEvaluation as CampagneEvaluation[]).filter(c => c.id !== action.payload) };

        case 'SAVE_EVALUATION_COMPETENCE':
             return {
                ...state,
                evaluationsCompetences: (state.evaluationsCompetences as EvaluationCompetence[]).map(e => e.id === action.payload.id ? action.payload : e)
             };

        case 'SAVE_PLAN_FORMATION':
            const planExists = (state.plansFormation as PlanFormation[]).some(p => p.id === action.payload.id);
            return {
                ...state,
                plansFormation: planExists
                    ? (state.plansFormation as PlanFormation[]).map(p => p.id === action.payload.id ? action.payload : p)
                    : [...(state.plansFormation as PlanFormation[]), { ...action.payload, id: `plan-${Date.now()}` }]
            };

        case 'DELETE_PLAN_FORMATION':
            return { ...state, plansFormation: (state.plansFormation as PlanFormation[]).filter(p => p.id !== action.payload) };
        
        case 'SAVE_MISSION':
            const missionExists = (state.missions as Mission[]).some(m => m.id === action.payload.id);
            return {
                ...state,
                missions: missionExists
                    ? (state.missions as Mission[]).map(m => m.id === action.payload.id ? action.payload : m)
                    : [...(state.missions as Mission[]), { ...action.payload, id: `miss-${Date.now()}` }]
            };
        case 'DELETE_MISSION':
            return { ...state, missions: (state.missions as Mission[]).filter(m => m.id !== action.payload) };

        case 'SAVE_PROCESSUS':
            const procExists = (state.processus as Processus[]).some(p => p.id === action.payload.id);
            return {
                ...state,
                processus: procExists
                    ? (state.processus as Processus[]).map(p => p.id === action.payload.id ? action.payload : p)
                    : [...(state.processus as Processus[]), { ...action.payload, id: `proc-${Date.now()}` }]
            };
        case 'DELETE_PROCESSUS':
            return { ...state, processus: (state.processus as Processus[]).filter(p => p.id !== action.payload) };
        
        default:
            return state;
    }
};

// --- MAIN PROVIDER COMPONENT ---

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // UI State Management
    const [activeModule, setActiveModule] = useState('accueil');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    // Let's assume the user is Marie Martin for the evaluations feature
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

    const actions = useMemo(() => ({
        saveRisk: (payload: Risque) => createAndDispatch({ type: 'SAVE_RISK', payload }),
        deleteRisk: (payload: string) => createAndDispatch({ type: 'DELETE_RISK', payload }),
        savePerson: (payload: Personne) => createAndDispatch({ type: 'SAVE_PERSON', payload }),
        deletePerson: (payload: string) => createAndDispatch({ type: 'DELETE_PERSON', payload }),
        saveRole: (payload: Role) => createAndDispatch({ type: 'SAVE_ROLE', payload }),
        deleteRole: (payload: string) => createAndDispatch({ type: 'DELETE_ROLE', payload }),
        saveDocument: (payload: Document) => createAndDispatch({ type: 'SAVE_DOCUMENT', payload }),
        deleteDocument: (payload: string) => createAndDispatch({ type: 'DELETE_DOCUMENT', payload }),
        saveActualite: (payload: Actualite) => createAndDispatch({ type: 'SAVE_ACTUALITE', payload }),
        deleteActualite: (payload: string) => createAndDispatch({ type: 'DELETE_ACTUALITE', payload }),
        saveNormeLoiCadre: (payload: NormeLoiCadre) => createAndDispatch({ type: 'SAVE_NORME_LOI_CADRE', payload }),
        deleteNormeLoiCadre: (payload: string) => createAndDispatch({ type: 'DELETE_NORME_LOI_CADRE', payload }),
        saveNormeLoiExigence: (payload: NormeLoiExigence) => createAndDispatch({ type: 'SAVE_NORME_LOI_EXIGENCE', payload }),
        deleteNormeLoiExigence: (payload: string) => createAndDispatch({ type: 'DELETE_NORME_LOI_EXIGENCE', payload }),
        saveCompetence: (payload: Competence) => createAndDispatch({ type: 'SAVE_COMPETENCE', payload }),
        deleteCompetence: (payload: string) => createAndDispatch({ type: 'DELETE_COMPETENCE', payload }),
        saveCampagneEvaluation: (payload: CampagneEvaluation) => createAndDispatch({ type: 'SAVE_CAMPAGNE_EVALUATION', payload }),
        deleteCampagneEvaluation: (payload: string) => createAndDispatch({ type: 'DELETE_CAMPAGNE_EVALUATION', payload }),
        saveEvaluationCompetence: (payload: EvaluationCompetence) => createAndDispatch({ type: 'SAVE_EVALUATION_COMPETENCE', payload }),
        savePlanFormation: (payload: PlanFormation) => createAndDispatch({ type: 'SAVE_PLAN_FORMATION', payload }),
        deletePlanFormation: (payload: string) => createAndDispatch({ type: 'DELETE_PLAN_FORMATION', payload }),
        saveMission: (payload: Mission) => createAndDispatch({ type: 'SAVE_MISSION', payload }),
        deleteMission: (payload: string) => createAndDispatch({ type: 'DELETE_MISSION', payload }),
        saveProcessus: (payload: Processus) => createAndDispatch({ type: 'SAVE_PROCESSUS', payload }),
        deleteProcessus: (payload: string) => createAndDispatch({ type: 'DELETE_PROCESSUS', payload }),
    }), [createAndDispatch]);


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