
import type { Personne, Processus, Document, Procedure, Controle, Risque, Actualite, CategorieActualite, Indicateur, Tache, Entite, Poste, Role, Competence, OccupationHistory, RACI, CategorieRisque, CategorieControle, ExecutionControle, CategorieDocument, Incident, Amelioration, Actif, ActifCategorie, MaintenanceLog, AccueilPage, CategorieIndicateur, FluxDefinition, ValidationInstance, SyncConnector, SyncLogEntry, NormeLoiCadre, NormeLoiExigence, EvaluationCompetence, PlanFormation, CampagneEvaluation, Mission, Notification } from './types';
import { 
  Users, FileText, Settings, AlertTriangle, CheckCircle, BarChart3, 
  Building2, Briefcase, Target, Shield, TrendingUp, Calendar, 
  Bell, Home, Workflow, CheckSquare, Scale, Network
} from 'lucide-react';

export const modules = [
  { id: 'accueil', nom: 'Accueil', icon: Home },
  // FIX: Replaced non-existent Sitemap icon with Network icon.
  { id: 'organigramme', nom: 'Organigramme', icon: Network },
  { id: 'mes-validations', nom: 'Mes Validations', icon: CheckSquare },
  { id: 'personnes', nom: 'Personnes', icon: Users },
  { id: 'roles', nom: 'Rôles', icon: Users },
  { id: 'postes', nom: 'Postes', icon: Briefcase },
  { id: 'entites', nom: 'Entités', icon: Building2 },
  { id: 'documents', nom: 'Documents', icon: FileText },
  { id: 'procedures', nom: 'Procédures', icon: Workflow },
  { id: 'processus', nom: 'Processus', icon: Target },
  { id: 'missions', nom: 'Missions', icon: Briefcase },
  { id: 'risques', nom: 'Risques', icon: AlertTriangle },
  { id: 'controles', nom: 'Contrôles', icon: CheckCircle },
  { id: 'competences', nom: 'Compétences', icon: TrendingUp },
  { id: 'actifs', nom: 'Actifs', icon: Shield },
  { id: 'indicateurs', nom: 'Indicateurs', icon: BarChart3 },
  { id: 'ameliorations', nom: 'Améliorations', icon: TrendingUp },
  { id: 'incidents', nom: 'Incidents', icon: AlertTriangle },
  { id: 'normes-lois', nom: 'Normes et lois', icon: Scale },
  { id: 'todo', nom: 'ToDo Manager', icon: Calendar },
  { id: 'actualites', nom: 'Actualités', icon: Bell },
  { id: 'sync-flux', nom: 'Flux & Synchro', icon: Workflow },
  { id: 'settings', nom: 'Paramètres', icon: Settings },
];

const allPermissions = modules.reduce((acc, module) => {
    acc[module.id] = { C: true, R: true, U: true, D: true };
    return acc;
}, {} as Record<string, { C: boolean; R: boolean; U: boolean; D: boolean; }>);

const readOnlyPermissions = modules.reduce((acc, module) => {
    acc[module.id] = { C: false, R: true, U: false, D: false };
    return acc;
}, {} as Record<string, { C: boolean; R: boolean; U: boolean; D: boolean; }>);

export const mockData = {
  personnes: [
    { id: 'pers-1', reference: 'JDU', nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@entreprise.com', profil: 'administrateur', posteIds: ['pos-1'], entiteIds: ['ent-1'], roleIds: ['rol-1'], synchroniseAzureAD: true, statut: 'valide', dateCreation: new Date('2024-01-01'), dateModification: new Date('2024-01-01'), auteurId: 'system', description: 'Administrateur système' },
    { id: 'pers-2', reference: 'MMA', nom: 'Martin', prenom: 'Marie', email: 'marie.martin@entreprise.com', profil: 'editeur', posteIds: ['pos-2'], entiteIds: ['ent-2'], roleIds: ['rol-2'], synchroniseAzureAD: true, statut: 'valide', dateCreation: new Date('2024-01-15'), dateModification: new Date('2024-01-15'), auteurId: 'pers-1', description: 'Responsable qualité' },
    { id: 'pers-3', reference: 'PDU', nom: 'Durand', prenom: 'Pierre', email: 'pierre.durand@entreprise.com', profil: 'lecteur', posteIds: ['pos-3'], entiteIds: ['ent-4'], roleIds: ['rol-3'], synchroniseAzureAD: false, statut: 'valide', dateCreation: new Date('2024-02-01'), dateModification: new Date('2024-02-01'), auteurId: 'pers-1', description: 'Comptable' },
    { id: 'pers-4', reference: 'ABE', nom: 'Bernard', prenom: 'Alice', email: 'alice.bernard@entreprise.com', profil: 'lecteur', posteIds: ['pos-4'], entiteIds: ['ent-5'], roleIds: ['rol-3'], synchroniseAzureAD: true, statut: 'valide', dateCreation: new Date('2024-03-01'), dateModification: new Date(), auteurId: 'pers-1', description: 'Spécialiste RH' },
    { id: 'pers-5', reference: 'LGR', nom: 'Legrand', prenom: 'Luc', email: 'luc.legrand@entreprise.com', profil: 'editeur', posteIds: ['pos-4'], entiteIds: ['ent-5'], roleIds: ['rol-2'], synchroniseAzureAD: false, statut: 'valide', dateCreation: new Date('2024-03-10'), dateModification: new Date(), auteurId: 'pers-1', description: 'Recruteur Senior' },
  ] as Personne[],

  postes: [
    { id: 'pos-1', reference: 'CEO', intitule: 'Directeur Général', mission: 'Définir et piloter la stratégie globale de l\'entreprise.', entiteId: 'ent-1', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system', occupantsIds: ['pers-1'], effectifCible: 1, confidentialite: 'restreinte', habilitationsRoleIds: ['rol-1'], competencesRequisesIds: ['comp-1', 'comp-5'] },
    { id: 'pos-2', reference: 'CFO', intitule: 'Directeur Financier', mission: 'Superviser la gestion financière et comptable.', entiteId: 'ent-2', posteParentId: 'pos-1', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system', occupantsIds: ['pers-2'], effectifCible: 1, confidentialite: 'restreinte', habilitationsRoleIds: ['rol-2'], competencesRequisesIds: ['comp-2', 'comp-5'] },
    { id: 'pos-3', reference: 'COMPTA-1', intitule: 'Comptable Senior', mission: 'Gérer la comptabilité générale et analytique.', entiteId: 'ent-4', posteParentId: 'pos-2', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system', occupantsIds: ['pers-3'], effectifCible: 1, confidentialite: 'publique', habilitationsRoleIds: ['rol-3'], competencesRequisesIds: ['comp-2'] },
    { id: 'pos-4', reference: 'RH-SPEC', intitule: 'Spécialiste RH', mission: 'Gérer le cycle de vie des collaborateurs.', entiteId: 'ent-5', posteParentId: 'pos-1', statut: 'en_recrutement', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system', occupantsIds: ['pers-4', 'pers-5'], effectifCible: 3, confidentialite: 'publique', habilitationsRoleIds: ['rol-3'], competencesRequisesIds: ['comp-3', 'comp-4'] },
    { id: 'pos-5', reference: 'IT-DEV', intitule: 'Développeur Full-Stack', mission: 'Concevoir et développer les applications internes.', entiteId: 'ent-7', posteParentId: 'pos-1', statut: 'à_créer', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system', occupantsIds: [], effectifCible: 2, confidentialite: 'publique', competencesRequisesIds: ['comp-1'] },
    { id: 'pos-6', reference: 'SUPPORT-1', intitule: 'Technicien Support', mission: 'Assister les utilisateurs et maintenir le parc informatique.', entiteId: 'ent-8', posteParentId: 'pos-5', statut: 'gelé', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system', occupantsIds: [], effectifCible: 1, confidentialite: 'publique' },
  ] as Poste[],

  missions: [
      {
          id: 'miss-1', reference: 'MISS-RH-01', nom: 'Assurer le cycle de vie du collaborateur', statut: 'publie',
          objectifs: "Garantir un processus de recrutement, d'intégration, de développement et de départ efficace et bienveillant pour tous les employés.",
          kpiIds: ['ind-2'],
          rattachementType: 'Entite', rattachementId: 'ent-5',
          portee: 'Tous les collaborateurs de l\'entreprise',
          entrees: 'Demande de recrutement validée', sorties: 'Collaborateur intégré et opérationnel',
          responsablePosteId: 'pos-4',
          processusIds: ['p-l1-rh', 'p-l2-rh-01'],
          procedureIds: ['proced-1'], documentIds: ['doc-form-recrut', 'doc-1'],
          risqueIds: ['RSK-001'], controleIds: ['ctrl-2'], exigenceIds: [],
          actif: true, confidentialite: 'publique',
          dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1',
      },
      {
          id: 'miss-2', reference: 'MISS-FIN-01', nom: 'Garantir la fiabilité des comptes', statut: 'brouillon',
          objectifs: "Produire des états financiers justes et sincères dans le respect des délais légaux et des normes comptables.",
          kpiIds: ['ind-1'],
          rattachementType: 'Poste', rattachementId: 'pos-2',
          portee: 'Direction, actionnaires, auditeurs',
          entrees: 'Pièces comptables, factures', sorties: 'Bilan, Compte de résultat, Annexes',
          responsablePosteId: 'pos-2',
          processusIds: ['p-l1-fin', 'p-l2-fin-01'],
          procedureIds: ['proced-2'], documentIds: ['doc-2'],
          risqueIds: ['RSK-002'], controleIds: ['ctrl-1'], exigenceIds: [],
          actif: true, confidentialite: 'restreinte',
          dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-2',
      }
  ] as Mission[],

  competences: [
    {
      id: 'comp-1', reference: 'COMP-TS', nom: 'Développement TypeScript', domaine: 'Technique', sousDomaine: 'Développement Web', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system', actif: true,
      description: 'Maîtrise du langage TypeScript pour le développement d\'applications robustes et maintenables.',
      echelleNiveaux: [
        { niveau: 1, libelle: 'Débutant', criteres: 'Connaissances de base de la syntaxe et des types primitifs.' },
        { niveau: 2, libelle: 'Intermédiaire', criteres: 'Peut développer des composants simples et utiliser les interfaces.' },
        { niveau: 3, libelle: 'Avancé', criteres: 'Maîtrise des types complexes, des génériques et des concepts avancés.' },
        { niveau: 4, libelle: 'Expert', criteres: 'Capable de définir l\'architecture type-safe d\'un projet et de coacher les autres.' },
      ],
      postesRequis: [ { posteId: 'pos-5', niveauAttendu: 3 }, { posteId: 'pos-1', niveauAttendu: 1 } ],
      certificationsLiees: ['Official TypeScript Certification'],
      entitesConcerneesIds: ['ent-7'],
    },
    {
      id: 'comp-2', reference: 'COMP-FIN', nom: 'Analyse Financière', domaine: 'Métier', sousDomaine: 'Finance', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system', actif: true,
      description: 'Capacité à analyser les états financiers, à évaluer la santé financière et à élaborer des prévisions.',
      echelleNiveaux: [
        { niveau: 1, libelle: 'Notions', criteres: 'Comprend les principaux états financiers (bilan, P&L).' },
        { niveau: 2, libelle: 'Appliqué', criteres: 'Sait calculer et interpréter les ratios financiers clés.' },
        { niveau: 3, libelle: 'Maîtrise', criteres: 'Peut construire des modèles financiers complexes et évaluer des investissements.' },
      ],
      postesRequis: [ { posteId: 'pos-2', niveauAttendu: 3 }, { posteId: 'pos-3', niveauAttendu: 2 } ],
      certificationsLiees: [],
      entitesConcerneesIds: ['ent-2', 'ent-3', 'ent-4'],
    },
    {
      id: 'comp-3', reference: 'COMP-COMM', nom: 'Communication Interpersonnelle', domaine: 'Comportementale', sousDomaine: 'Soft Skills', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system', actif: true,
      description: 'Aptitude à communiquer clairement, à pratiquer l\'écoute active et à adapter son discours à son interlocuteur.',
      echelleNiveaux: [
        { niveau: 1, libelle: 'Basique', criteres: 'S\'exprime de manière compréhensible.' },
        { niveau: 2, libelle: 'Efficace', criteres: 'Pratique l\'écoute active et sait reformuler.' },
        { niveau: 3, libelle: 'Influent', criteres: 'Sait convaincre, négocier et gérer des situations de communication difficiles.' },
      ],
      postesRequis: [ { posteId: 'pos-4', niveauAttendu: 3 }, { posteId: 'pos-1', niveauAttendu: 3 } ],
      certificationsLiees: [],
      entitesConcerneesIds: [],
    },
     {
      id: 'comp-5', reference: 'COMP-LEAD', nom: 'Leadership', domaine: 'Comportementale', sousDomaine: 'Management', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system', actif: true,
      description: 'Capacité à inspirer, motiver et guider une équipe vers l\'atteinte d\'objectifs communs.',
      echelleNiveaux: [
        { niveau: 1, libelle: 'Manager', criteres: 'Sait organiser le travail de l\'équipe et fixer des objectifs.' },
        { niveau: 2, libelle: 'Leader', criteres: 'Sait déléguer, donner du feedback et développer les compétences de ses collaborateurs.' },
        { niveau: 3, libelle: 'Visionnaire', criteres: 'Inspire une vision, porte le changement et développe une culture d\'entreprise forte.' },
      ],
      postesRequis: [ { posteId: 'pos-1', niveauAttendu: 3 }, { posteId: 'pos-2', niveauAttendu: 2 } ],
      certificationsLiees: [],
      entitesConcerneesIds: [],
    },
  ] as Competence[],
  
  campagnesEvaluation: [
    {
      id: 'camp-1', reference: 'CAMP-2024-Q2', nom: 'Campagne Évaluation Q2 2024',
      statut: 'clôturé', dateCreation: new Date('2024-04-01'), dateModification: new Date('2024-07-01'), auteurId: 'pers-1',
      periodeDebut: new Date('2024-04-15'), periodeFin: new Date('2024-06-30'),
      description: 'Évaluation trimestrielle des compétences métiers pour les équipes Finance.',
      personnesCiblesIds: [], postesCiblesIds: ['pos-3'], entitesCiblesIds: ['ent-4'],
      competencesCiblesIds: ['comp-2'],
      methodes: ['Manager']
    },
    {
      id: 'camp-2', reference: 'CAMP-2024-ANN', nom: 'Revue Annuelle des Compétences Managériales',
      statut: 'en_cours', dateCreation: new Date('2024-08-01'), dateModification: new Date('2024-08-01'), auteurId: 'pers-1',
      periodeDebut: new Date('2024-09-01'), periodeFin: new Date('2024-10-31'),
      description: 'Campagne annuelle pour évaluer les compétences de leadership et de communication au sein du comité de direction.',
      personnesCiblesIds: [], postesCiblesIds: [], entitesCiblesIds: ['ent-1', 'ent-2', 'ent-5'],
      competencesCiblesIds: ['comp-5', 'comp-3'],
      methodes: ['Manager', 'Auto-évaluation']
    },
  ] as CampagneEvaluation[],

  evaluationsCompetences: [
    { 
      id: 'eval-1', competenceId: 'comp-2', personneId: 'pers-3', campagneId: 'camp-1', niveauEvalue: 3, 
      methode: 'Manager', evaluateurId: 'pers-2', dateEvaluation: new Date('2024-06-15'), 
      commentaire: 'Excellente maîtrise des ratios et de la modélisation.', statut: 'completee'
    },
    { 
      id: 'eval-2', competenceId: 'comp-3', personneId: 'pers-5', campagneId: 'camp-1', niveauEvalue: 2, 
      methode: 'Manager', evaluateurId: 'pers-4', dateEvaluation: new Date('2024-07-01'), 
      commentaire: 'Bonnes bases, mais doit développer son assertivité en situation difficile.', statut: 'completee'
    },
    { 
      id: 'eval-3', competenceId: 'comp-1', personneId: 'pers-1', campagneId: 'camp-1', niveauEvalue: 1, 
      methode: 'Auto-évaluation', evaluateurId: 'pers-1', dateEvaluation: new Date('2024-05-20'), statut: 'completee'
    },
    { 
      id: 'eval-4', competenceId: 'comp-5', personneId: 'pers-1', campagneId: 'camp-2', niveauEvalue: 3, 
      methode: '360', evaluateurId: 'pers-2', dateEvaluation: new Date('2024-05-20'), statut: 'completee'
    },
    { 
      id: 'eval-5', competenceId: 'comp-5', personneId: 'pers-2', campagneId: 'camp-2', niveauEvalue: 3, 
      methode: 'Manager', evaluateurId: 'pers-1', dateEvaluation: new Date('2024-06-01'), 
      commentaire: 'Fait preuve d\'un leadership naturel et inspirant pour son équipe.', statut: 'completee'
    },
    // New evaluations for Marie Martin (pers-2) to do
    {
      id: 'eval-6', competenceId: 'comp-2', personneId: 'pers-3', campagneId: 'camp-2',
      methode: 'Manager', evaluateurId: 'pers-2', statut: 'a_faire'
    },
     {
      id: 'eval-7', competenceId: 'comp-5', personneId: 'pers-2', campagneId: 'camp-2',
      methode: 'Auto-évaluation', evaluateurId: 'pers-2', statut: 'a_faire'
    }
  ] as EvaluationCompetence[],
  plansFormation: [
      { id: 'plan-1', competenceId: 'comp-2', personneId: 'pers-3', action: 'Formation avancée Excel modélisation', type: 'Externe', echeance: new Date('2024-11-30'), statut: 'Planifié' },
      { id: 'plan-2', competenceId: 'comp-3', personneId: 'pers-5', action: 'Coaching en communication assertive', type: 'Interne', echeance: new Date('2024-10-15'), statut: 'En cours' },
      { id: 'plan-3', competenceId: 'comp-2', personneId: 'pers-3', action: 'E-learning Analyse de Bilan', type: 'E-learning', echeance: new Date('2024-08-31'), statut: 'Réalisé' },
      { id: 'plan-4', competenceId: 'comp-5', personneId: 'pers-2', action: 'Séminaire Leadership Visionnaire', type: 'Externe', echeance: new Date('2025-02-28'), statut: 'Planifié' }
  ] as PlanFormation[],

  occupationHistory: [
      { id: 'occ-1', posteId: 'pos-1', personneId: 'pers-1', dateDebut: new Date('2022-01-01') },
      { id: 'occ-2', posteId: 'pos-3', personneId: 'pers-3', dateDebut: new Date('2023-06-01') },
      { id: 'occ-4', posteId: 'pos-4', personneId: 'pers-4', dateDebut: new Date('2024-03-01') },
      { id: 'occ-4', posteId: 'pos-4', personneId: 'pers-5', dateDebut: new Date('2024-03-15') },
  ] as OccupationHistory[],

  raci: [
      { id: 'raci-1', posteId: 'pos-2', objetId: 'p-l2-fin-01', objetType: 'processus', role: 'A' },
      { id: 'raci-2', posteId: 'pos-3', objetId: 'p-l2-fin-01', objetType: 'processus', role: 'R' },
      { id: 'raci-4', posteId: 'pos-1', objetId: 'ctrl-1', objetType: 'controle', role: 'C' },
      { id: 'raci-5', posteId: 'pos-2', objetId: 'ctrl-1', objetType: 'controle', role: 'A' },
  ] as RACI[],

  roles: [
    { id: 'rol-1', reference: 'ADMIN', nom: 'Administrateur Global', description: 'Accès total à tous les modules et toutes les fonctionnalités.', personneIds: ['pers-1'], permissions: allPermissions, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system' },
    { id: 'rol-2', reference: 'GEST-FIN', nom: 'Gestionnaire Finance', description: 'Peut lire toutes les données mais ne peut modifier que les modules financiers.', personneIds: ['pers-2', 'pers-5'], permissions: { ...readOnlyPermissions, 'risques': { C: true, R: true, U: true, D: false }, 'controles': { C: true, R: true, U: true, D: false }, 'indicateurs': { C: true, R: true, U: true, D: true } }, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system' },
    { id: 'rol-3', reference: 'LECTEUR', nom: 'Lecteur', description: 'Peut uniquement consulter les informations dans tous les modules.', personneIds: ['pers-3', 'pers-4'], permissions: readOnlyPermissions, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system' },
  ] as Role[],

  entites: [
    { id: 'ent-1', reference: 'DG', code: 'DG', nom: 'Direction Générale', type: 'Direction', parentId: undefined, ordre: 1, responsableId: 'pers-1', actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', confidentialite: 'restreinte' },
    { id: 'ent-2', reference: 'FIN', code: 'FIN', nom: 'Direction Financière', type: 'Direction', parentId: 'ent-1', ordre: 1, responsableId: 'pers-2', actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', confidentialite: 'restreinte' },
    { id: 'ent-3', reference: 'CTRL', code: 'CTRL', nom: 'Contrôle de Gestion', type: 'Service', parentId: 'ent-2', ordre: 1, responsableId: 'pers-2', actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', confidentialite: 'restreinte' },
    { id: 'ent-4', reference: 'COMPTA', code: 'COMPTA', nom: 'Comptabilité', type: 'Service', parentId: 'ent-2', ordre: 2, responsableId: 'pers-3', actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', confidentialite: 'publique' },
    { id: 'ent-5', reference: 'RH', code: 'RH', nom: 'Ressources Humaines', type: 'Direction', parentId: 'ent-1', ordre: 2, responsableId: 'pers-4', actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', confidentialite: 'publique' },
    { id: 'ent-6', reference: 'DSI', code: 'DSI', nom: 'Direction des Systèmes d\'Information', type: 'Direction', parentId: 'ent-1', ordre: 3, actif: true, statut: 'en_cours', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', confidentialite: 'restreinte' },
    { id: 'ent-7', reference: 'DEV', code: 'DEV', nom: 'Équipe Développement', type: 'Équipe', parentId: 'ent-6', ordre: 1, actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', confidentialite: 'publique' },
    { id: 'ent-8', reference: 'SUP', code: 'SUP', nom: 'Équipe Support', type: 'Équipe', parentId: 'ent-6', ordre: 2, actif: true, statut: 'brouillon', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', confidentialite: 'publique' },
  ] as Entite[],

  documents: [
    { id: 'doc-1', reference: 'DOC-RH-001', nom: 'Politique de recrutement', categorieIds: ['cat-doc-rh'], version: 'v1.2', source: 'Fichier', statut: 'publie', entiteIds: ['ent-5'], processusIds: ['p-l2-rh-01'], dateCreation: new Date('2023-01-10'), dateModification: new Date('2024-05-20'), auteurId: 'pers-4', miseEnAvant: true, validationInstanceId: 'val-1', risqueIds: ['RSK-001'], controleIds: ['ctrl-2'] },
    { id: 'doc-form-recrut', reference: 'FORM-RH-002', nom: 'Formulaire de demande de recrutement', categorieIds: ['cat-doc-rh'], version: 'v2.0', source: 'Lien', lien: 'https://forms.office.com/r/xyz', statut: 'valide', entiteIds: ['ent-5'], processusIds: ['p-l2-rh-01'], dateCreation: new Date('2023-02-15'), dateModification: new Date(), auteurId: 'pers-4', miseEnAvant: true, autoValidationGED: true, risqueIds: ['RSK-001'], controleIds: [] },
    { id: 'doc-2', reference: 'DOC-FIN-001', nom: 'Procédure de clôture comptable', categorieIds: ['cat-doc-fin'], version: 'v3.0', source: 'Fichier', statut: 'en_validation', entiteIds: ['ent-2', 'ent-4'], processusIds: ['p-l2-fin-01'], dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-2', validationInstanceId: 'val-2', risqueIds: ['RSK-002'], controleIds: ['ctrl-1'] },
    { id: 'doc-3', reference: 'DOC-FIN-002', nom: 'Rapport Annuel 2023', categorieIds: ['cat-doc-fin'], version: 'v1.0', source: 'Fichier', statut: 'archive', entiteIds: ['ent-2'], processusIds: [], dateCreation: new Date('2024-03-01'), dateModification: new Date('2024-04-01'), auteurId: 'pers-2', risqueIds: [], controleIds: [] },
  ] as Document[],
  
  procedures: [
    { 
      id: 'proced-1', 
      reference: 'PROC-RH-01', 
      nom: 'Processus de Recrutement', 
      version: '2.1', 
      statut: 'valide', 
      actif: true, 
      dateCreation: new Date(), 
      dateModification: new Date(), 
      auteurId: 'pers-4', 
      acteursPosteIds: ['pos-4'], 
      documentIds: ['doc-form-recrut'], 
      risqueIds: ['RSK-001'], 
      controleIds: ['ctrl-2'], 
      etapes: [ 
        { id: 'etape-1-1', type: 'start', ordre: 1, libelle: 'Expression du besoin', responsablePosteId: 'pos-4', entreesIds: [], sortiesIds: ['doc-form-recrut'], position: { x: 250, y: 50 } }, 
        { id: 'etape-1-2', type: 'step', ordre: 2, libelle: 'Validation Managériale', responsablePosteId: 'pos-1', entreesIds: ['doc-form-recrut'], sortiesIds: [], position: { x: 250, y: 200 } }, 
        { id: 'etape-1-3', type: 'end', ordre: 3, libelle: 'Besoin validé', position: { x: 250, y: 350 } }
      ],
      liens: [
        { id: 'l-1-1-2', source: 'etape-1-1', target: 'etape-1-2' },
        { id: 'l-1-2-3', source: 'etape-1-2', target: 'etape-1-3' }
      ]
    },
    { 
      id: 'proced-2', 
      reference: 'PROC-FIN-01', 
      nom: 'Clôture Mensuelle', 
      version: '1.5', 
      statut: 'publie', 
      actif: true, 
      dateCreation: new Date(), 
      dateModification: new Date(), 
      auteurId: 'pers-2', 
      acteursPosteIds: ['pos-2', 'pos-3'], 
      documentIds: ['doc-2'], 
      risqueIds: ['RSK-002'], 
      controleIds: ['ctrl-1'], 
      etapes: [ 
        { id: 'p2-start', type: 'start', ordre: 1, libelle: 'Rapprochement bancaire', responsablePosteId: 'pos-3', position: { x: 350, y: 25 } },
        { id: 'p2-step1', type: 'step', ordre: 2, libelle: 'Vérification des factures', responsablePosteId: 'pos-3', position: { x: 350, y: 150 } },
        { id: 'p2-decision', type: 'decision', ordre: 3, libelle: 'Écarts détectés ?', position: { x: 350, y: 275 } },
        { id: 'p2-step-yes', type: 'step', ordre: 4, libelle: 'Analyser et corriger', responsablePosteId: 'pos-3', position: { x: 150, y: 400 } },
        { id: 'p2-step-no', type: 'step', ordre: 5, libelle: 'Validation par le CFO', responsablePosteId: 'pos-2', position: { x: 550, y: 400 }, risqueIds: ['RSK-002'], controleIds: ['ctrl-1'] },
        { id: 'p2-end', ordre: 6, libelle: 'Clôture mensuelle OK', position: { x: 350, y: 525 } }
      ],
      liens: [
        { id: 'l-p2-start-s1', source: 'p2-start', target: 'p2-step1' },
        { id: 'l-p2-s1-d1', source: 'p2-step1', target: 'p2-decision' },
        { id: 'l-p2-d1-yes', source: 'p2-decision', sourceHandle: 'yes', target: 'p2-step-yes', label: 'Oui' },
        { id: 'l-p2-d1-no', source: 'p2-decision', sourceHandle: 'no', target: 'p2-step-no', label: 'Non' },
        { id: 'l-p2-yes-end', source: 'p2-step-yes', target: 'p2-end' },
        { id: 'l-p2-no-end', source: 'p2-step-no', target: 'p2-end' }
      ]
    },
  ] as Procedure[],

  processus: [
    { id: 'p-l1-rh', reference: 'P-RH', nom: 'Gérer les Ressources Humaines', type: 'Support', niveau: 'L1', actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', proprietaireProcessusId: 'pos-4', entitesConcerneesIds: ['ent-5'], procedureIds: [], indicateurIds: [], risqueIds: [], controleIds: [], documentIds: [], missionId: 'miss-1' },
    { id: 'p-l2-rh-01', reference: 'P-RH-01', nom: 'Recrutement et Intégration', type: 'Support', niveau: 'L2', parentId: 'p-l1-rh', actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', proprietaireProcessusId: 'pos-4', entitesConcerneesIds: ['ent-5'], procedureIds: ['proced-1'], indicateurIds: ['ind-2'], risqueIds: ['RSK-001'], controleIds: ['ctrl-2'], documentIds: ['doc-form-recrut', 'doc-1'], missionId: 'miss-1' },
    { id: 'p-l1-fin', reference: 'P-FIN', nom: 'Gérer la Finance', type: 'Support', niveau: 'L1', actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', proprietaireProcessusId: 'pos-2', entitesConcerneesIds: ['ent-2'], procedureIds: [], indicateurIds: [], risqueIds: [], controleIds: [], documentIds: [], missionId: 'miss-2' },
    { id: 'p-l2-fin-01', reference: 'P-FIN-01', nom: 'Produire les comptes', type: 'Support', niveau: 'L2', parentId: 'p-l1-fin', actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', proprietaireProcessusId: 'pos-2', entitesConcerneesIds: ['ent-2', 'ent-4'], procedureIds: ['proced-2'], indicateurIds: ['ind-1'], risqueIds: ['RSK-002'], controleIds: ['ctrl-1'], documentIds: ['doc-2'], missionId: 'miss-2' },
  ] as Processus[],

  risques: [
    { id: 'RSK-001', reference: 'RSK-001', nom: 'Erreur de recrutement', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', processusId: 'p-l2-rh-01', categorieIds: ['cat-rsk-op'], analyseInherente: { probabilite: 3, impact: 4 }, analyseResiduelle: { probabilite: 2, impact: 2 }, controleMaitriseIds: ['ctrl-2'], documentMaitriseIds: ['doc-1', 'doc-form-recrut'], procedureMaitriseIds: ['proced-1'], entiteIds: ['ent-5'], indicateurIds: ['ind-2'] },
    { id: 'RSK-002', reference: 'RSK-002', nom: 'Fraude comptable', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', processusId: 'p-l2-fin-01', categorieIds: ['cat-rsk-fin'], analyseInherente: { probabilite: 2, impact: 5 }, analyseResiduelle: { probabilite: 1, impact: 3 }, controleMaitriseIds: ['ctrl-1'], documentMaitriseIds: ['doc-2'], procedureMaitriseIds: ['proced-2'], entiteIds: ['ent-2', 'ent-4'], indicateurIds: ['ind-1'], commentaires: [{ user: 'pers-1', text: 'Bonjour @Marie Martin, pourriez-vous vérifier les derniers chiffres ?', date: new Date() }] },
    { id: 'RSK-003', reference: 'RSK-003', nom: 'Perte de données critiques', statut: 'figé', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', processusId: 'p-l1-fin', categorieIds: ['cat-rsk-si'], analyseInherente: { probabilite: 2, impact: 5 }, analyseResiduelle: { probabilite: 1, impact: 4 }, controleMaitriseIds: [], documentMaitriseIds: [], procedureMaitriseIds: [], entiteIds: ['ent-6'], indicateurIds: [] },
  ] as Risque[],

  controles: [
    { id: 'ctrl-1', reference: 'CTRL-FIN-01', nom: 'Revue mensuelle des comptes par le CFO', statut: 'planifié', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', methodeExecution: 'Validation manuelle des rapports', categorieIds: ['cat-ctrl-det'], typePlanification: 'periodique', frequence: 'mensuelle', dateDebut: new Date('2024-01-01'), executantsIds: ['pers-2'], superviseurId: 'pers-1', champsResultatsDef: [{id: 'res-1', libelle: 'Rapport validé ?', type_reponse: 'booléen', obligatoire: true}], risqueMaitriseIds: ['RSK-002'], procedureIds: ['proced-2'], documentIds: ['doc-2'], indicateurIds: ['ind-1'], actifIds: [] },
    { id: 'ctrl-2', reference: 'CTRL-RH-01', nom: 'Double validation des offres d\'emploi', statut: 'planifié', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', methodeExecution: 'Signature électronique par N+1 et RH', categorieIds: ['cat-ctrl-prev'], typePlanification: 'a_la_demande', dateDebut: new Date('2024-01-01'), executantsIds: ['pers-4'], champsResultatsDef: [], risqueMaitriseIds: ['RSK-001'], procedureIds: ['proced-1'], documentIds: ['doc-1'], indicateurIds: [], actifIds: [] },
  ] as Controle[],

  indicateurs: [
    { id: 'ind-1', reference: 'IND-FIN-01', nom: 'Délai de clôture comptable', unite: 'jours', objectif: 5, seuilAlerte: 7, sourceDonnee: 'formulaire', frequence: 'mensuel', responsableId: 'pers-2', categorieIds: ['cat-ind-perf'], actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', mesures: [ {id: 'mes-1', dateMesure: new Date('2024-05-31'), valeur: 6, modeSaisie: 'Manuel'}, {id: 'mes-2', dateMesure: new Date('2024-06-30'), valeur: 5, modeSaisie: 'Manuel'}, {id: 'mes-3', dateMesure: new Date('2024-07-31'), valeur: 5.5, modeSaisie: 'Manuel'} ], processusIds: ['p-l2-fin-01'], risqueIds: ['RSK-002'], controleIds: ['ctrl-1'] },
    { id: 'ind-2', reference: 'IND-RH-01', nom: 'Turnover des nouveaux employés (<1 an)', unite: '%', objectif: 10, seuilAlerte: 15, sourceDonnee: 'API', frequence: 'trimestriel', responsableId: 'pers-4', categorieIds: ['cat-ind-qual'], actif: true, statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', mesures: [ {id: 'mes-4', dateMesure: new Date('2024-03-31'), valeur: 12, modeSaisie: 'API'}, {id: 'mes-5', dateMesure: new Date('2024-06-30'), valeur: 11, modeSaisie: 'API'} ], processusIds: ['p-l2-rh-01'], risqueIds: ['RSK-001'], controleIds: [] },
  ] as Indicateur[],

  actualites: [
    {
      id: 'act-1', reference: 'NEWS-01', nom: 'Nouvelle politique de télétravail',
      resume: 'Une nouvelle politique de télétravail entrera en vigueur le 1er septembre, offrant plus de flexibilité à nos collaborateurs.',
      contenuRiche: '<h2>Une nouvelle ère de travail flexible</h2><p>La direction a le plaisir d\'annoncer la mise en place d\'une nouvelle politique de télétravail. Celle-ci permettra à chaque collaborateur de bénéficier de <strong>jusqu\'à 3 jours</strong> de travail à distance par semaine, sous réserve de validation managériale.</p><p>Plus de détails sont disponibles dans le document lié.</p>',
      imageURL: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070',
      categorieId: 'cat-actu-2',
      datePublication: new Date('2024-07-15'),
      dateExpiration: new Date('2024-09-30'),
      lienCible: '/documents/doc-1',
      entitesConcerneesIds: ['ent-5'],
      statut: 'publie',
      dateCreation: new Date('2024-07-10'),
      dateModification: new Date('2024-07-12'),
      auteurId: 'pers-4'
    },
    {
      id: 'act-2', reference: 'NEWS-02', nom: 'Bienvenue aux nouveaux arrivants',
      resume: 'Nous souhaitons la bienvenue à nos 3 nouveaux collaborateurs qui ont rejoint l\'équipe de développement ce mois-ci.',
      contenuRiche: '<p>L\'équipe s\'agrandit ! Nous sommes ravis d\'accueillir <strong>Marc, Sophie et David</strong> au sein de l\'équipe de développement. Ils nous aideront à accélérer nos projets internes.</p>',
      imageURL: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?q=80&w=2070',
      categorieId: 'cat-actu-3',
      datePublication: new Date('2024-07-20'),
      dateExpiration: new Date('2024-08-20'),
      statut: 'publie',
      dateCreation: new Date('2024-07-18'),
      dateModification: new Date('2024-07-19'),
      auteurId: 'pers-5'
    },
    {
      id: 'act-3', reference: 'NEWS-03', nom: 'Mise à jour de la sécurité des mots de passe',
      resume: 'Une mise à jour importante de notre politique de sécurité sera déployée la semaine prochaine. Tous les mots de passe devront être réinitialisés.',
      contenuRiche: '<p>Pour renforcer la sécurité de nos systèmes, une nouvelle politique de mots de passe sera effective dès lundi prochain. Il vous sera demandé de changer votre mot de passe à votre prochaine connexion.</p>',
      imageURL: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1935',
      categorieId: 'cat-actu-3',
      datePublication: new Date('2024-08-01'),
      statut: 'brouillon',
      dateCreation: new Date('2024-07-25'),
      dateModification: new Date('2024-07-25'),
      auteurId: 'pers-1'
    },
    {
      id: 'act-4', reference: 'NEWS-04', nom: 'Ancienne procédure de congés (Archivée)',
      resume: 'Cette actualité concerne l\'ancienne procédure de demande de congés qui n\'est plus en vigueur depuis le 1er Janvier 2024.',
      contenuRiche: '<p>Cette procédure a été remplacée par le nouveau système intégré. Veuillez vous référer à la documentation RH pour plus d\'informations. Cette actualité est conservée à titre d\'archive.</p>',
      imageURL: 'https://images.unsplash.com/photo-1563291074-2bf8677ac0e5?q=80&w=1932',
      categorieId: 'cat-actu-2',
      datePublication: new Date('2023-12-01'),
      dateExpiration: new Date('2023-12-31'),
      statut: 'archive',
      dateCreation: new Date('2023-11-20'),
      dateModification: new Date('2023-11-20'),
      auteurId: 'pers-4'
    },
    {
      id: 'act-5', reference: 'NEWS-05', nom: 'Rappel : Inscriptions Tournoi de Foot (Expiré)',
      resume: 'Les inscriptions pour le tournoi de football inter-services sont maintenant closes. Merci à tous les participants !',
      contenuRiche: '<p>Les inscriptions sont closes. Le tirage au sort des poules aura lieu demain. Bonne chance à toutes les équipes !</p>',
      imageURL: 'https://images.unsplash.com/photo-1551958214-2d5b24472fe9?q=80&w=2070',
      categorieId: 'cat-actu-1',
      datePublication: new Date('2024-06-01'),
      dateExpiration: new Date('2024-06-15'),
      statut: 'publie',
      dateCreation: new Date('2024-05-30'),
      dateModification: new Date('2024-05-30'),
      auteurId: 'pers-5'
    }
  ] as Actualite[],
  
  taches: [
    { id: 'task-1', titre: 'Valider le rapport de clôture Q2', sourceModule: 'FluxValidation', sourceId: 'doc-2', assigneA: 'pers-1', createur: 'pers-2', priorite: 'Haute', statut: 'A faire', dateCreation: new Date(), dateEcheance: new Date(new Date().setDate(new Date().getDate() + 2)) },
    { id: 'task-2', titre: 'Exécuter le contrôle mensuel des comptes', sourceModule: 'Controle', sourceId: 'exec-ctrl-1', assigneA: 'pers-2', createur: 'system', priorite: 'Normale', statut: 'A faire', dateCreation: new Date(), dateEcheance: new Date(new Date().setDate(new Date().getDate() + 5)) },
    { id: 'task-3', titre: 'Mettre à jour la fiche de poste IT-DEV', sourceModule: 'AdHoc', assigneA: 'pers-4', createur: 'pers-1', priorite: 'Basse', statut: 'En cours', dateCreation: new Date(), dateEcheance: new Date(new Date().setDate(new Date().getDate() + 10)) },
  ] as Tache[],
  
  incidents: [
    { id: 'inc-1', reference: 'INC-2024-001', titre: 'Accès impossible au serveur de fichiers', description: 'Depuis 9h ce matin, personne ne peut accéder au lecteur partagé.', categorie: 'SI', priorite: 'Critique', gravite: 'Majeure', statut: 'En cours', dateOuverture: new Date(), declarantId: 'pers-3', assigneAId: 'pers-1', entiteId: 'ent-6', SLA_Cible: 4, echeanceSLA: new Date(new Date().getTime() + 4 * 3600 * 1000), depassementSLA: false, taches: [{id: 'inc-task-1', titre: 'Redémarrer le serveur', responsableId: 'pers-1', statut: 'En cours', dateEcheance: new Date()}], lienRisqueId: 'RSK-003', lienActifId: 'actif-1' },
  ] as Incident[],
  
  ameliorations: [
    { id: 'amel-1', reference: 'AMEL-2024-001', titre: 'Automatiser le rapport de turnover', description: 'Le rapport de turnover est actuellement manuel et prend 2 jours. Il faut l\'automatiser via une connexion à l\'API RH.', type: 'Opportunité', priorite: 'haute', statut: 'En cours', piloteId: 'pers-5', origine: ['Suggestion', 'Indicateur'], objectifMesurable: 'Générer le rapport en moins de 10 minutes', echeanceCible: new Date('2024-12-31'), dateCreation: new Date(), dateModification: new Date(), confidentialite: 'publique', actions: [{id: 'act-1', titre: 'Spécifier les besoins avec l\'IT', responsableId: 'pers-5', statut: 'Fait', dateEcheance: new Date('2024-08-15'), efficacite: 'Non évaluée'}], indicateurSuiviId: 'ind-2' },
  ] as Amelioration[],

  actifs: [
    { id: 'actif-1', reference: 'SRV-001', nom: 'Serveur de fichiers principal', type: 'Matériel', categorieId: 'cat-actif-info', proprietaireId: 'pos-1', gestionnaireId: 'pos-5', statutCycleVie: 'En service', confidentialite: 'restreinte', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1', maintenanceLogs: [], lienRisqueIds: ['RSK-003'] },
  ] as Actif[],
  
  // -- CATEGORIES --
  categoriesRisques: [ {id: 'cat-rsk-op', reference: 'OP', nom: 'Opérationnel', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, {id: 'cat-rsk-fin', reference: 'FIN', nom: 'Financier', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, {id: 'cat-rsk-si', reference: 'SI', nom: 'Système d\'Information', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, ] as CategorieRisque[],
  categoriesControles: [ {id: 'cat-ctrl-det', reference: 'DET', nom: 'Détectif', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, {id: 'cat-ctrl-prev', reference: 'PREV', nom: 'Préventif', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, ] as CategorieControle[],
  categoriesDocuments: [ {id: 'cat-doc-rh', reference: 'RH', nom: 'RH', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, {id: 'cat-doc-fin', reference: 'FIN', nom: 'Finance', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, ] as CategorieDocument[],
  actifCategories: [ {id: 'cat-actif-info', reference: 'INFO', nom: 'Informatique', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'} ] as ActifCategorie[],
  categoriesIndicateurs: [ {id: 'cat-ind-perf', reference: 'PERF', nom: 'Performance', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, {id: 'cat-ind-qual', reference: 'QUAL', nom: 'Qualité', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, ] as CategorieIndicateur[],
  categoriesActualites: [ {id: 'cat-actu-1', reference: 'GEN', nom: 'Général', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, {id: 'cat-actu-2', reference: 'RH', nom: 'RH', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, {id: 'cat-actu-3', reference: 'IT', nom: 'IT', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'}, ] as CategorieActualite[],

  executionsControles: [
      { id: 'exec-ctrl-1', controleId: 'ctrl-1', nom: 'Exécution Contrôle Mensuel', reference: 'EXEC-CTRL-FIN-01', statut: 'a_faire', dateEcheance: new Date(new Date().setDate(new Date().getDate() + 5)), executantId: 'pers-2', resultatsSaisis: {}, dateCreation: new Date(), dateModification: new Date(), auteurId: 'system' }
  ] as ExecutionControle[],
  
  // -- FLUX & SYNCHRO --
  fluxDefinitions: [ { id: 'flux-doc-simple', nom: 'Validation Document Simple (1 étape)', statut: 'valide', dateCreation: new Date(), dateModification: new Date(), auteurId: 'system', reference: 'FLUX-01', modulesCibles: ['Documents'], evenementsCouverts: ['Publication'], etapes: [{id: 'etape-flux-1', ordre: 1, nom: 'Validation N+1', type: 'Finale', modeAppro: 'Individu', approbateursIds: ['pers-2'], regleDecision: 'Tous', SLA_Heures: 48}] } ] as FluxDefinition[],
  validationInstances: [
    { id: 'val-1', fluxDefinitionId: 'flux-doc-simple', elementId: 'doc-1', elementModule: 'Documents', statut: 'Approuvé', etapeActuelle: 1, demandeurId: 'pers-4', dateDemande: new Date('2024-05-18'), historique: [{id: 'hist-1', etapeId: 'etape-flux-1', decideurId: 'pers-1', decision: 'Approuvé', dateDecision: new Date('2024-05-20'), commentaire: 'OK pour moi.'}] },
    { id: 'val-2', fluxDefinitionId: 'flux-doc-simple', elementId: 'doc-2', elementModule: 'Documents', statut: 'En cours', etapeActuelle: 1, demandeurId: 'pers-2', dateDemande: new Date(), historique: [] },
  ] as ValidationInstance[],
  syncConnectors: [ { id: 'sync-1', nom: 'Import CSV des employés', type: 'CSV', parametres: {delimiter: ';', encoding: 'UTF-8'}, mappingAttributs: {nom: 'NOM', prenom: 'PRENOM', email: 'EMAIL', groupes: 'GROUPES'}, groupesMappingRoles: [{csvGroup: 'Finance', roleId: 'rol-2'}], planification: '0 2 * * *', modePilote: true, dernierStatut: 'Jamais exécuté' } ] as SyncConnector[],
  syncLogs: [] as SyncLogEntry[],
  
  // -- NORMES & LOIS --
  normesLoisCadres: [ { id: 'nlc-1', reference: 'ISO 9001:2015', nom: 'Systèmes de management de la qualité — Exigences', statut: 'publie', typeCadre: 'Norme', responsableConformiteId: 'pers-2', entitesConcerneesIds: [], documentsReferenceIds: [], actif: true, dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'} ] as NormeLoiCadre[],
  normesLoisExigences: [ { id: 'nle-1', cadreId: 'nlc-1', reference: '4.1', intitule: 'Compréhension de l\'organisme et de son contexte', description: 'L\'organisme doit déterminer les enjeux externes et internes pertinents par rapport à sa finalité...', obligation: 'Obligatoire', criticite: 'Élevée', periodiciteEval: 'Annuelle', responsableId: 'pos-1', processusLiesIds: ['p-l1-rh'], controlesLiesIds: [], documentsPreuvesIds: [], indicateursSuiviIds: [], statutConformite: 'Conforme' } ] as NormeLoiExigence[],

  // -- ACCUEIL --
  mockAccueilPages: [
    {
      id: 'page-1',
      title: 'Accueil Principal',
      layout: {
        type: '3-col',
        columns: [
          ['kpi-group-1'],
          ['tasks-1', 'docs-1'],
          ['news-1', 'risks-1']
        ],
      },
      components: {
        'kpi-group-1': { id: 'kpi-group-1', type: 'kpi-card-group', config: { title: "Aperçu général" } },
        'tasks-1': { id: 'tasks-1', type: 'my-tasks', config: { title: 'Mes Tâches Prioritaires' } },
        'docs-1': { id: 'docs-1', type: 'useful-docs', config: { title: 'Documents Utiles' } },
        'news-1': { id: 'news-1', type: 'news', config: { title: 'Actualités Récentes' } },
        'risks-1': { id: 'risks-1', type: 'risk-list', config: { title: 'Top 3 Risques' } }
      }
    }
  ] as AccueilPage[],
  
  notifications: [
    { id: 'notif-1', type: 'mention', title: 'Nouvelle mention dans un risque', description: 'Jean Dupont vous a mentionné dans le risque RSK-002: "Fraude comptable".', date: new Date(new Date().getTime() - 3600000), userId: 'pers-2', targetModule: 'risques', targetId: 'RSK-002' },
    { id: 'notif-2', type: 'tache', title: 'Nouvelle tâche assignée', description: 'La tâche "Exécuter le contrôle mensuel des comptes" vous a été assignée.', date: new Date(new Date().getTime() - 2 * 3600000), userId: 'pers-2', targetModule: 'todo', targetId: 'task-2' },
    { id: 'notif-3', type: 'alerte', title: 'Incident critique déclaré', description: 'Un incident critique "Accès impossible au serveur de fichiers" a été déclaré.', date: new Date(new Date().getTime() - 5 * 3600000), targetModule: 'incidents', targetId: 'inc-1' },
    { id: 'notif-4', type: 'evaluation', title: 'Évaluation de compétence requise', description: 'Vous devez évaluer Pierre Durand sur la compétence "Analyse Financière".', date: new Date(new Date().getTime() - 24 * 3600000), userId: 'pers-2', targetModule: 'competences', targetId: 'eval-6' },
    { id: 'notif-5', type: 'validation', title: 'Demande de validation', description: 'Une nouvelle version du document "Procédure de clôture comptable" attend votre approbation.', date: new Date(new Date().getTime() - 2 * 24 * 3600000), userId: 'pers-2', targetModule: 'documents', targetId: 'doc-2' },
  ] as Notification[],
};