export interface BaseEntity {
  id: string;
  reference: string;
  nom: string;
  description?: string;
  statut: 'brouillon' | 'en_cours' | 'valide' | 'archive' | 'à_créer' | 'en_recrutement' | 'gelé' | 'figé' | 'planifié' | 'terminé' | 'non-conforme' | 'clôturé' | 'a_faire' | 'en_retard' | 'en_validation' | 'publie' | 'rejete';
  dateCreation: Date;
  dateModification: Date;
  auteurId: string;
}

export interface Entite extends BaseEntity {
  code: string;
  type: 'Direction' | 'Division' | 'Service' | 'Équipe' | 'Autre';
  parentId?: string;
  ordre: number;
  responsableId?: string; // Link to Personne
  emailContact?: string;
  telephoneContact?: string;
  siteAdresse?: string;
  champsLibres?: Record<string, any>;
  confidentialite: 'publique' | 'restreinte';
  actif: boolean; // Maintained for simpler filtering, but 'statut' is the source of truth for lifecycle.
}

export interface Poste extends Omit<BaseEntity, 'nom'> {
    intitule: string;
    mission?: string;
    responsabilites?: string;
    activitesCles?: string;
    entiteId: string;
    posteParentId?: string;
    relationsFonctionnellesIds?: string[];
    competencesRequisesIds?: string[];
    habilitationsRoleIds?: string[];
    occupantsIds: string[];
    effectifCible: number;
    confidentialite: 'publique' | 'restreinte';
    champsLibres?: Record<string, any>;
}

export interface EchelleNiveau {
  niveau: number;
  libelle: string;
  criteres: string;
}

export interface PosteRequis {
  posteId: string;
  niveauAttendu: number;
}

export interface Competence extends BaseEntity {
  domaine: 'Technique' | 'Comportementale' | 'Réglementaire' | 'Métier';
  sousDomaine?: string;
  echelleNiveaux: EchelleNiveau[];
  certificationsLiees?: string[];
  dateValidite?: Date;
  postesRequis: PosteRequis[];
  liensProcessusIds?: string[];
  liensControlesIds?: string[];
  liensNormesIds?: string[];
  entitesConcerneesIds?: string[];
  champsLibres?: Record<string, any>;
  actif: boolean;
}

export interface EvaluationCompetence {
    id: string;
    competenceId: string;
    personneId: string;
    campagneId: string;
    niveauEvalue?: number;
    methode: 'Manager' | 'Auto-évaluation' | '360';
    evaluateurId: string; // Personne ID
    dateEvaluation?: Date;
    commentaire?: string;
    evidence?: string; // Link to document or text
    statut: 'a_faire' | 'completee';
}

export interface CampagneEvaluation extends BaseEntity {
    periodeDebut: Date;
    periodeFin: Date;
    personnesCiblesIds: string[];
    postesCiblesIds: string[];
    entitesCiblesIds?: string[];
    competencesCiblesIds: string[];
    methodes: ('Manager' | 'Auto-évaluation' | '360')[];
}


export interface PlanFormation {
    id: string;
    competenceId: string;
    personneId: string;
    action: string;
    type: 'Interne' | 'Externe' | 'E-learning';
    echeance: Date;
    statut: 'Planifié' | 'En cours' | 'Réalisé' | 'Annulé';
}

export interface RACI {
    id: string;
    posteId: string;
    objetId: string; // ID of Processus, Procedure, or Controle
    objetType: 'processus' | 'procedure' | 'controle';
    role: 'R' | 'A' | 'C' | 'I';
}

export interface OccupationHistory {
    id: string;
    posteId: string;
    personneId: string;
    dateDebut: Date;
    dateFin?: Date;
}


export interface Role extends BaseEntity {
    permissions: Record<string, { C: boolean; R: boolean; U: boolean; D: boolean; }>;
    personneIds: string[];
}

export interface Personne extends BaseEntity {
  prenom: string;
  email: string;
  profil: 'administrateur' | 'editeur' | 'acteur' | 'lecteur';
  posteIds: string[];
  entiteIds: string[]; // Direct entity attachments
  roleIds: string[];
  synchroniseAzureAD: boolean;
  champsLibres?: Record<string, any>;
}

export interface CategorieDocument extends BaseEntity {
    //
}

export interface VersionHistory {
    version: string;
    date: Date;
    authorId: string;
    notes?: string;
}

export interface Document extends BaseEntity {
  categorieIds: string[];
  source: 'Fichier' | 'Lien' | 'Description';
  lien?: string; 
  description?: string;
  champsLibres?: {
    dateEcheance?: string;
  };
  miseEnAvant?: boolean;
  autoValidationGED?: boolean;
  version: string;
  entiteIds: string[];
  processusIds: string[];
  validationInstanceId?: string;
  risqueIds: string[];
  controleIds: string[];
  versionHistory?: VersionHistory[];
  originalId?: string;
}

export interface EtapeProcedure {
  id: string;
  libelle: string;
  responsablePosteId?: string;
  description?: string;
  entreesIds?: string[];
  sortiesIds?: string[];
  ordre: number;
  position: { x: number; y: number; };
  type: 'start' | 'end' | 'step' | 'decision';
  risqueIds?: string[];
  controleIds?: string[];
  documentIds?: string[];
}

export interface ProcedureLien {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    label?: string;
}

export interface Procedure extends BaseEntity {
  version: string;
  acteursPosteIds: string[];
  documentIds: string[];
  risqueIds: string[];
  controleIds: string[];
  procedureLieesIds?: string[];
  champsLibres?: Record<string, any>;
  actif: boolean;
  etapes: EtapeProcedure[];
  liens: ProcedureLien[];
  validationInstanceId?: string;
  versionHistory?: VersionHistory[];
  originalId?: string;
}

// --- FLUX & SYNCHRONISATION MODULE TYPES ---

export type FluxModuleCible = 'Documents' | 'Procédures' | 'Risques' | 'Indicateurs' | 'Contrôles';
export type FluxEvenementCible = 'Création' | 'Modification' | 'Publication' | 'Retrait';
export type FluxModeAppro = 'Individu' | 'Groupe de rôles' | 'File d’attente';
export type FluxRegleDecision = 'Tous' | 'Majorité' | 'Premier répondant';

export interface FluxEtape {
    id: string;
    ordre: number;
    nom: string;
    type: 'Intermédiaire' | 'Finale';
    modeAppro: FluxModeAppro;
    approbateursIds: string[]; // Can be Personne IDs or Role IDs based on modeAppro
    regleDecision: FluxRegleDecision;
    SLA_Heures: number;
}

export interface FluxDefinition extends BaseEntity {
    modulesCibles: FluxModuleCible[];
    evenementsCouverts: FluxEvenementCible[];
    etapes: FluxEtape[];
}

export interface ValidationHistoryEntry {
    id: string;
    etapeId: string;
    decideurId: string; // Personne ID
    decision: 'Approuvé' | 'Rejeté' | 'Révision demandée';
    commentaire?: string;
    dateDecision: Date;
}

export interface ValidationInstance {
    id: string;
    fluxDefinitionId: string;
    elementId: string; // ID of the Document, Procedure, etc.
    elementModule: FluxModuleCible;
    statut: 'En cours' | 'Approuvé' | 'Rejeté';
    etapeActuelle: number; // Order of the current step
    demandeurId: string; // Personne ID who initiated the validation
    dateDemande: Date;
    historique: ValidationHistoryEntry[];
    observateursIds?: string[]; // Personne IDs
}


export interface SyncConnector {
    id: string;
    nom: string;
    type: 'CSV';
    parametres: {
        delimiter: string;
        encoding: 'UTF-8' | 'ISO-8859-1';
    };
    mappingAttributs: {
        nom: string; // CSV column name for 'nom'
        prenom: string;
        email: string;
        groupes: string; // CSV column name for groups (e.g., "group1,group2")
    };
    groupesMappingRoles: {
        csvGroup: string;
        roleId: string;
    }[];
    planification: string; // CRON-like
    modePilote: boolean;
    derniereExecution?: Date;
    dernierStatut: 'Succès' | 'Échec' | 'Jamais exécuté';
}

export interface SyncLogEntry {
    id: string;
    connectorId: string;
    dateExecution: Date;
    statut: 'Succès' | 'Échec';
    summary: {
        creations: number;
        misesAJour: number;
        desactivations: number;
        erreurs: number;
    };
    details?: string; // JSON string or detailed text log
}

// --- END FLUX & SYNCHRO TYPES ---


export interface Processus extends BaseEntity {
  type: 'Management' | 'Métier' | 'Support';
  niveau: 'L0' | 'L1' | 'L2' | 'L3';
  parentId?: string;
  proprietaireProcessusId: string; // Personne/Poste/Rôle
  entitesConcerneesIds: string[];
  // SIPOC
  fournisseurs?: string;
  entrees?: string;
  sorties?: string;
  clients?: string;
  // Liens
  procedureIds: string[];
  indicateurIds: string[];
  risqueIds: string[];
  controleIds: string[];
  documentIds: string[];
  missionId: string;
  exigenceIds?: string[];
  
  champsLibres?: Record<string, any>;
  actif: boolean;
}

export interface EvaluationRisque {
    probabilite: number; // Scale 1-5
    impact: number; // Scale 1-5
    niveau?: number; // Calculated: P x I
}

export interface Risque extends BaseEntity {
  causes?: string;
  consequences?: string;
  processusId: string;
  categorieIds: string[];
  proprietairePosteId?: string;
  analyseInherente: EvaluationRisque;
  analyseResiduelle: EvaluationRisque;
  analyseFuture?: EvaluationRisque;
  controleMaitriseIds: string[];
  documentMaitriseIds: string[];
  procedureMaitriseIds: string[];
  entiteIds: string[];
  indicateurIds: string[];
  validationInstanceId?: string;
  commentaires?: { user: string; text: string; date: Date; }[];
}

export interface CategorieRisque extends BaseEntity {
    //
}

export interface CategorieControle extends BaseEntity {
    //
}

export interface ChampResultat {
    id: string;
    libelle: string;
    type_reponse: 'texte' | 'nombre' | 'date' | 'booléen';
    obligatoire: boolean;
    aideContextuelle?: string;
}

export interface Controle extends BaseEntity {
  methodeExecution: string;
  categorieIds: string[];
  typePlanification: 'non_automatisé' | 'a_la_demande' | 'periodique';
  frequence?: 'quotidienne' | 'hebdomadaire' | 'mensuelle' | 'trimestrielle' | 'annuelle';
  dateDebut: Date;
  dateFin?: Date;
  executantsIds: string[];
  superviseurId?: string;
  champsResultatsDef: ChampResultat[];
  risqueMaitriseIds: string[];
  procedureIds: string[];
  documentIds: string[];
  indicateurIds: string[];
  actifIds: string[];
  validationInstanceId?: string;
}

export interface ExecutionControle extends BaseEntity {
    controleId: string;
    dateEcheance: Date;
    dateExecution?: Date;
    executantId: string;
    resultatsSaisis: Record<string, any>; // JSON object { champId: valeur }
}

export interface CategorieActualite extends BaseEntity {
    //
}

export interface Actualite extends BaseEntity {
  resume?: string;
  contenuRiche?: string;
  imageURL?: string;
  categorieId: string;
  datePublication: Date;
  dateExpiration?: Date;
  lienCible?: string; // internal/external link
  entitesConcerneesIds?: string[];
  champsLibres?: Record<string, any>;
}

export interface MesureIndicateur {
  id: string;
  dateMesure: Date;
  valeur: number;
  modeSaisie: 'Manuel' | 'Import' | 'API';
  justificatif?: string; // Lien
  commentaire?: string;
}

export interface CategorieIndicateur extends BaseEntity {
    //
}

export interface Indicateur extends BaseEntity {
  unite: string;
  objectif: number;
  seuilAlerte: number;
  sourceDonnee: 'formulaire' | 'table' | 'API' | 'fichier';
  frequence: 'quotidien' | 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel';
  responsableId: string; // Lien vers Personne ou Poste
  categorieIds: string[];
  champsLibres?: Record<string, any>;
  actif: boolean;
  mesures: MesureIndicateur[];
  // Relations
  processusIds: string[];
  risqueIds: string[];
  controleIds: string[];
  validationInstanceId?: string;
}


export type TacheSourceModule = 'Controle' | 'Incident' | 'Amelioration' | 'Actif' | 'FluxValidation' | 'NormesLois' | 'AdHoc';
export type TachePriorite = 'Basse' | 'Normale' | 'Haute' | 'Critique';
export type TacheStatut = 'A faire' | 'En cours' | 'En attente' | 'Bloquee' | 'Fait' | 'Annulee';

export interface Tache {
  id: string;
  titre: string;
  description?: string;
  sourceModule: TacheSourceModule;
  sourceId?: string; // Link to the source object
  assigneA: string; // Personne ID
  createur: string; // Personne ID
  priorite: TachePriorite;
  statut: TacheStatut;
  dateCreation: Date;
  dateEcheance: Date;
  dateCloture?: Date;
}

// --- INCIDENTS MODULE TYPES ---

export type IncidentCategorie = 'Sécurité' | 'Qualité' | 'SI' | 'RH' | 'Environnement';
export type IncidentPriorite = 'Faible' | 'Moyenne' | 'Élevée' | 'Critique';
export type IncidentGravite = 'Mineure' | 'Majeure' | 'Critique';
export type IncidentStatut = 'Nouveau' | 'En cours' | 'Suspendu' | 'Clôturé';

export interface IncidentTask {
    id: string;
    titre: string;
    responsableId: string; // Personne ID
    statut: TacheStatut;
    dateEcheance: Date;
    dateRealisation?: Date;
    commentaire?: string;
    dateModification?: Date;
}

export interface Incident {
    id: string;
    reference: string;
    titre: string;
    description: string;
    categorie: IncidentCategorie;
    priorite: IncidentPriorite;
    gravite: IncidentGravite;
    statut: IncidentStatut;
    dateOuverture: Date;
    dateCloture?: Date;
    dateModification?: Date;
    declarantId: string; // Personne ID
    assigneAId: string; // Personne ID
    entiteId: string;
    SLA_Cible: number; // in hours
    echeanceSLA: Date;
    depassementSLA: boolean;
    causeRacine?: string;
    lienRisqueId?: string;
    lienControleId?: string;
    lienActifId?: string;
    taches: IncidentTask[];
}

// --- AMÉLIORATIONS MODULE TYPES ---

export type AmeliorationType = 'Corrective' | 'Préventive' | 'Opportunité';
export type AmeliorationPriorite = 'basse' | 'moyenne' | 'haute' | 'critique';
export type AmeliorationStatut = 'Nouveau' | 'En cours' | 'Suspendu' | 'Clôturé';
export type AmeliorationOrigine = 'Incident' | 'Audit' | 'Risque' | 'Contrôle' | 'Indicateur' | 'Suggestion';
export type AmeliorationActionStatut = 'À faire' | 'En cours' | 'En attente' | 'Fait' | 'Non conforme';
export type AmeliorationActionEfficacite = 'Non évaluée' | 'Insuffisante' | 'Acceptable' | 'Excellente';

export interface AmeliorationAction {
    id: string;
    titre: string;
    responsableId: string; // Personne/Poste ID
    statut: AmeliorationActionStatut;
    dateEcheance: Date;
    dateRealisation?: Date;
    commentaire?: string;
    efficacite: AmeliorationActionEfficacite;
}

export interface Amelioration {
    id: string;
    reference: string;
    titre: string;
    description: string;
    type: AmeliorationType;
    priorite: AmeliorationPriorite;
    statut: AmeliorationStatut;
    piloteId: string; // Personne/Poste ID
    commanditaireId?: string; // Personne/Poste ID
    entiteId?: string; // Entite ID
    origine: AmeliorationOrigine[];
    lienIncidentId?: string;
    lienRisqueId?: string;
    lienControleId?: string;
    objectifMesurable: string;
    indicateurSuiviId?: string;
    budget?: number;
    confidentialite: 'publique' | 'restreinte';
    echeanceCible: Date;
    dateCloture?: Date;
    dateCreation: Date;
    dateModification: Date;
    actions: AmeliorationAction[];
}

// --- ACTIFS MODULE TYPES ---

export type ActifType = 'Matériel' | 'Logiciel' | 'Service' | 'Donnée' | 'Autre';
export type ActifStatutCycleVie = 'En service' | 'En stock' | 'En maintenance' | 'Obsolète' | 'Retiré';
export type FrequenceEntretien = 'hebdomadaire' | 'mensuelle' | 'trimestrielle' | 'annuelle';

export interface ActifCategorie extends BaseEntity {}

export interface MaintenanceLog {
  id: string;
  date: Date;
  description: string;
  technicien: string;
}

export interface Actif {
  id: string;
  reference: string;
  nom: string;
  description?: string;
  type: ActifType;
  categorieId: string;
  proprietaireId: string; // Personne/Poste/Rôle ID
  gestionnaireId: string; // Personne/Poste/Rôle ID
  statutCycleVie: ActifStatutCycleVie;
  confidentialite: 'publique' | 'restreinte';
  dateAchat?: Date;
  valeur?: number;
  frequenceEntretien?: FrequenceEntretien;
  dateDernierEntretien?: Date;
  parentId?: string;
  lienRisqueIds?: string[];
  lienControleIds?: string[];
  maintenanceLogs?: MaintenanceLog[];
  dateCreation: Date;
  dateModification: Date;
  auteurId: string;
}


// --- ACCUEIL / BI 2.0 MODULE TYPES ---

export type ComponentType = 'welcome' | 'text' | 'news' | 'my-tasks' | 'risk-list' | 'useful-docs' | 'indicator-chart' | 'kpi-card-group';

export interface AccueilComponentConfig {
    title?: string;
    content?: string;
    indicatorId?: string;
    [key: string]: any;
}

export interface AccueilComponent {
    id: string;
    type: ComponentType;
    config: AccueilComponentConfig;
}

export interface AccueilLayout {
    type: '1-col' | '2-col' | '3-col';
    columns: string[][]; // Array of columns, each column is an array of component IDs
}

export interface AccueilPage {
    id: string;
    title: string;
    layout: AccueilLayout;
    components: Record<string, AccueilComponent>;
}

// --- NORMES & LOIS MODULE TYPES ---

export interface NormeLoiCadre extends Omit<BaseEntity, 'statut'> {
  statut: 'brouillon' | 'publie' | 'archive';
  typeCadre: 'Norme' | 'Loi' | 'Règlement' | 'Politique interne';
  editionJuridiction?: string;
  datePublication?: Date;
  dateApplication?: Date;
  perimetre?: string;
  responsableConformiteId: string; // Link to Personne or Poste
  entitesConcerneesIds: string[]; // Links to Entites
  documentsReferenceIds: string[];
  actif: boolean;
}

export interface NormeLoiExigence {
    id: string;
    cadreId: string;
    reference: string;
    intitule: string;
    description: string;
    obligation: 'Obligatoire' | 'Recommandée';
    criticite: 'Faible' | 'Moyenne' | 'Élevée';
    periodiciteEval: 'À la demande' | 'Trimestrielle' | 'Semestrielle' | 'Annuelle';
    responsableId: string; // Link to Poste
    processusLiesIds: string[];
    controlesLiesIds: string[];
    documentsPreuvesIds: string[];
    indicateursSuiviIds: string[];
    statutConformite: 'Non applicable' | 'Conforme' | 'Partiellement conforme' | 'Non conforme' | 'À évaluer';
    dateCreation?: Date;
    dateModification?: Date;
    auteurId?: string;
}

export interface Mission extends BaseEntity {
    objectifs: string;
    kpiIds: string[];
    rattachementType: 'Entite' | 'Poste';
    rattachementId: string;
    portee: string; // Describes clients/scope
    entrees: string;
    sorties: string;
    responsablePosteId: string;
    processusIds: string[];
    procedureIds: string[];
    documentIds: string[];
    risqueIds: string[];
    controleIds: string[];
    exigenceIds?: string[];
    actif: boolean;
    confidentialite: 'publique' | 'restreinte';
}

export type NotificationType = 'validation' | 'mention' | 'alerte' | 'tache' | 'evaluation';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    date: Date;
    userId?: string; // If undefined, it's for all users
    targetModule: string;
    targetId: string;
}

export type CustomFieldType = 'text' | 'number' | 'date' | 'textarea' | 'select';

export interface CustomFieldDef {
    id: string;
    name: string;
    type: CustomFieldType;
    options?: string[];
    required: boolean;
}

export interface ReferenceFormat {
    prefix: string;
    digits: number;
}

export interface FicheTab {
    id: string;
    label: string;
}

export interface FicheLayout {
    tabs: FicheTab[];
    sections: Record<string, string[]>; // { tabId: sectionId[] }
}

export interface ISettings {
    modules: Record<string, { visible: boolean }>;
    references: Record<string, ReferenceFormat>;
    customFields: Record<string, CustomFieldDef[]>;
    ficheLayouts: Record<string, FicheLayout>;
}
