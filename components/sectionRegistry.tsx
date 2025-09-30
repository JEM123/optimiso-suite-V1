import React from 'react';

// Document Sections
import DocumentContentSection from './sections/document/DocumentContentSection';
import DocumentHistorySection from './sections/document/DocumentHistorySection';
import DocumentMetadataSection from './sections/document/DocumentMetadataSection';
import DocumentRelationsSection from './sections/document/DocumentRelationsSection';

// Poste Sections
import PosteDetailsSection from './sections/poste/PosteDetailsSection';
import PosteMissionSection from './sections/poste/PosteMissionSection';
import PosteSkillsSection from './sections/poste/PosteSkillsSection';
import PosteOccupantsSection from './sections/poste/PosteOccupantsSection';
import PosteRaciSection from './sections/poste/PosteRaciSection';

// Entite Sections
import EntityHierarchySection from './sections/entite/EntityHierarchySection';
import EntityRelationsSection from './sections/entite/EntityRelationsSection';
import EntityGeneralInfoSection from './sections/entite/EntityGeneralInfoSection';

// Risque Sections
import RiskIdentificationSection from './sections/risque/RiskIdentificationSection';
import RiskEvaluationSection from './sections/risque/RiskEvaluationSection';
import RiskMasterySection from './sections/risque/RiskMasterySection';
import RiskActionsSection from './sections/risque/RiskActionsSection';
import RiskHistorySection from './sections/risque/RiskHistorySection';

// Controle Sections
import ControlDetailsSection from './sections/controle/ControlDetailsSection';
import ControlPlanningSection from './sections/controle/ControlPlanningSection';
import ControlMasterySection from './sections/controle/ControlMasterySection';
import ControlExecutionsSection from './sections/controle/ControlExecutionsSection';

// Personne Sections
import PersonGeneralInfoSection from './sections/personne/PersonGeneralInfoSection';
import PersonAffectationsSection from './sections/personne/PersonAffectationsSection';
import PersonCompetencesSection from './sections/personne/PersonCompetencesSection';
import PersonAccessSection from './sections/personne/PersonAccessSection';
import PersonHistorySection from './sections/personne/PersonHistorySection';

// Role Sections
import RoleDetailsSection from './sections/role/RoleDetailsSection';
import RolePermissionsSection from './sections/role/RolePermissionsSection';
import RoleAssignmentsSection from './sections/role/RoleAssignmentsSection';

// Mission Sections
import MissionDetailsSection from './sections/mission/MissionDetailsSection';
import MissionKpiSection from './sections/mission/MissionKpiSection';
import MissionLinksSection from './sections/mission/MissionLinksSection';

// Actif Sections
import ActifDetailsSection from './sections/actif/ActifDetailsSection';
import ActifTreeSection from './sections/actif/ActifTreeSection';
import ActifMaintenanceSection from './sections/actif/ActifMaintenanceSection';
import ActifLinksSection from './sections/actif/ActifLinksSection';

// Incident Sections
import IncidentDetailsSection from './sections/incident/IncidentDetailsSection';
import IncidentTasksSection from './sections/incident/IncidentTasksSection';
import IncidentLinksSection from './sections/incident/IncidentLinksSection';

// Amelioration Sections
import AmeliorationDetailsSection from './sections/amelioration/AmeliorationDetailsSection';
import AmeliorationActionsSection from './sections/amelioration/AmeliorationActionsSection';
import AmeliorationLinksSection from './sections/amelioration/AmeliorationLinksSection';

// Processus Sections
import ProcessusDetailsSection from './sections/processus/ProcessusDetailsSection';
import ProcessusSipocSection from './sections/processus/ProcessusSipocSection';
import ProcessusLinksSection from './sections/processus/ProcessusLinksSection';

// --- Le Registre Central ---
// Ce registre fait le lien entre un ID de section (défini dans les paramètres)
// et le composant React qui doit être affiché.

export const sectionRegistry: Record<string, React.ComponentType<any>> = {
  // Document
  validationSection: DocumentMetadataSection, // This section contains the validation part
  metadataSection: DocumentMetadataSection,
  contentSection: DocumentContentSection,
  relationsSection: DocumentRelationsSection,
  
  // Poste
  'poste-detailsSection': PosteDetailsSection,
  'poste-missionSection': PosteMissionSection,
  'poste-skillsSection': PosteSkillsSection,
  'poste-occupantsSection': PosteOccupantsSection,
  'poste-raciSection': PosteRaciSection,

  // Entite
  hierarchySection: EntityHierarchySection,
  'entite-relationsSection': EntityRelationsSection,
  'entite-generalInfoSection': EntityGeneralInfoSection,

  // Risque
  identificationSection: RiskIdentificationSection,
  evaluationSection: RiskEvaluationSection,
  masterySection: RiskMasterySection,
  actionsSection: RiskActionsSection,
  
  // Controle
  'controle-detailsSection': ControlDetailsSection,
  planningSection: ControlPlanningSection,
  'controle-masterySection': ControlMasterySection,
  executionsSection: ControlExecutionsSection,
  
  // Personne
  'personne-generalInfoSection': PersonGeneralInfoSection,
  affectationsSection: PersonAffectationsSection,
  competencesSection: PersonCompetencesSection,
  accessSection: PersonAccessSection,

  // Role
  'role-detailsSection': RoleDetailsSection,
  permissionsSection: RolePermissionsSection,
  assignmentsSection: RoleAssignmentsSection,
  
  // Mission
  'mission-detailsSection': MissionDetailsSection,
  kpiSection: MissionKpiSection,
  'mission-linksSection': MissionLinksSection,

  // Actif
  'actif-detailsSection': ActifDetailsSection,
  treeSection: ActifTreeSection,
  maintenanceSection: ActifMaintenanceSection,
  'actif-linksSection': ActifLinksSection,

  // Incident
  'incident-detailsSection': IncidentDetailsSection,
  tasksSection: IncidentTasksSection,
  'incident-linksSection': IncidentLinksSection,

  // Amelioration
  'amelioration-detailsSection': AmeliorationDetailsSection,
  'amelioration-actionsSection': AmeliorationActionsSection,
  'amelioration-linksSection': AmeliorationLinksSection,
  
  // Processus
  'processus-detailsSection': ProcessusDetailsSection,
  sipocSection: ProcessusSipocSection,
  'processus-linksSection': ProcessusLinksSection,

  // Shared
  historySection: DocumentHistorySection, // Using doc history as a generic one for now
  customFieldsSection: () => <div>Champs libres (à implémenter)</div>, // Placeholder
};