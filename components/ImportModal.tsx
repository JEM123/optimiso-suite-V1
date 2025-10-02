import React, { useState, useCallback } from 'react';
import { X, Download, UploadCloud, ShieldCheck, PartyPopper, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { parseExcelFile, generateErrorCsv, downloadCsv } from '../utils/importUtils';
import type { ValidationError } from '../types';

type ImportStep = 1 | 2 | 3 | 4;

interface ImportModalProps {
    moduleName: string;
    isOpen: boolean;
    onClose: () => void;
    onGenerateTemplate: () => void;
    onValidate: (data: any[]) => ValidationError[];
    onImport: (data: any[]) => Promise<{ created: number, updated: number, errors: number }>;
}

const StepIndicator: React.FC<{ currentStep: ImportStep, step: ImportStep, title: string, icon: React.ElementType }> = ({ currentStep, step, title, icon: Icon }) => {
    const isActive = currentStep === step;
    const isDone = currentStep > step;
    return (
        <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div className={`ml-3 ${isActive || isDone ? 'text-gray-800' : 'text-gray-500'}`}>
                <div className="text-sm font-medium">{title}</div>
            </div>
        </div>
    );
};

const ImportModal: React.FC<ImportModalProps> = ({ moduleName, isOpen, onClose, onGenerateTemplate, onValidate, onImport }) => {
    const [step, setStep] = useState<ImportStep>(1);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importResult, setImportResult] = useState<{ created: number, updated: number, errors: number } | null>(null);

    const resetState = useCallback(() => {
        setStep(1);
        setFile(null);
        setParsedData([]);
        setValidationErrors([]);
        setIsProcessing(false);
        setImportResult(null);
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileSelected = async (selectedFile: File) => {
        if (selectedFile && (selectedFile.type.includes('spreadsheetml') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
            setFile(selectedFile);
            setIsProcessing(true);
            try {
                const data = await parseExcelFile(selectedFile);
                setParsedData(data);
                setStep(2);
            } catch (error) {
                console.error("Error parsing Excel file:", error);
                alert("Erreur lors de la lecture du fichier Excel.");
                setFile(null);
            } finally {
                setIsProcessing(false);
            }
        } else {
            alert("Veuillez sélectionner un fichier Excel (.xlsx ou .xls).");
        }
    }

    const handleFileDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        await handleFileSelected(droppedFile);
    }, []);
    
    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            await handleFileSelected(selectedFile);
        }
    };


    const handleValidate = () => {
        setIsProcessing(true);
        const errors = onValidate(parsedData);
        setValidationErrors(errors);
        setStep(3);
        setIsProcessing(false);
    };
    
    const handleImport = async () => {
        setIsProcessing(true);
        try {
            const result = await onImport(parsedData);
            setImportResult(result);
            setStep(4);
        } catch (error) {
            alert("Une erreur est survenue lors de l'importation.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownloadErrors = () => {
        const errorCsv = generateErrorCsv(parsedData, validationErrors);
        downloadCsv(`erreurs_import_${moduleName.toLowerCase()}.csv`, errorCsv);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Importer des {moduleName}</h2>
                    <button type="button" onClick={handleClose}><X className="h-5 w-5"/></button>
                </div>
                
                <div className="p-4 border-b">
                    <div className="grid grid-cols-4 gap-4">
                        <StepIndicator currentStep={step} step={1} title="Modèle" icon={Download}/>
                        <StepIndicator currentStep={step} step={2} title="Prévisualisation" icon={UploadCloud}/>
                        <StepIndicator currentStep={step} step={3} title="Validation" icon={ShieldCheck}/>
                        <StepIndicator currentStep={step} step={4} title="Terminé" icon={PartyPopper}/>
                    </div>
                </div>

                <div className="flex-grow p-6 overflow-y-auto">
                    {step === 1 && (
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">1. Télécharger et remplir le modèle</h3>
                            <p className="text-gray-600 mb-4">Pour garantir une importation réussie, veuillez utiliser notre modèle Excel pré-formaté.</p>
                            <button onClick={onGenerateTemplate} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                <Download className="h-4 w-4"/> Télécharger le modèle Excel
                            </button>
                             <div 
                                onDrop={handleFileDrop} 
                                onDragOver={e => e.preventDefault()} 
                                className="mt-6 p-10 border-2 border-dashed rounded-lg text-center relative hover:border-blue-500 bg-gray-50"
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileInputChange}
                                    accept=".xlsx, .xls"
                                />
                                <UploadCloud className="h-10 w-10 mx-auto text-gray-400 mb-2"/>
                                <p className="font-semibold">Glissez-déposez votre fichier Excel ici</p>
                                <p className="text-sm text-gray-500">ou cliquez pour sélectionner un fichier</p>
                            </div>
                        </div>
                    )}
                     {step === 2 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">2. Prévisualisation des données</h3>
                            <p className="text-gray-600 mb-4">Vérifiez que les premières lignes de votre fichier sont correctement interprétées. Si tout semble correct, continuez vers la validation.</p>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50"><tr className="text-left">{Object.keys(parsedData[0] || {}).map(key => <th key={key} className="p-2 font-medium">{key}</th>)}</tr></thead>
                                    <tbody className="bg-white divide-y">{parsedData.slice(0, 5).map((row, i) => <tr key={i}>{Object.values(row).map((val, j) => <td key={j} className="p-2 truncate max-w-xs">{String(val)}</td>)}</tr>)}</tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">3. Validation des données</h3>
                            {validationErrors.length === 0 ? (
                                <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-r-lg">
                                    <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/><h4 className="font-bold">Validation réussie !</h4></div>
                                    <p>{parsedData.length} lignes sont prêtes à être importées.</p>
                                </div>
                            ) : (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-lg">
                                    <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/><h4 className="font-bold">{validationErrors.length} erreur(s) trouvée(s).</h4></div>
                                    <p>Veuillez corriger votre fichier. Vous pouvez télécharger un rapport détaillé des erreurs.</p>
                                     <div className="max-h-40 overflow-y-auto mt-2 bg-white p-2 rounded border border-red-200 text-sm space-y-1">
                                        {validationErrors.map((err, i) => <p key={i}>Ligne {err.row}, Colonne "{err.column}": {err.message}</p>)}
                                    </div>
                                    <button onClick={handleDownloadErrors} className="mt-3 inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700">
                                        <FileSpreadsheet className="h-4 w-4"/>Télécharger le rapport d'erreurs (CSV)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {step === 4 && (
                        <div className="text-center">
                             <PartyPopper className="h-12 w-12 mx-auto text-green-500 mb-3"/>
                             <h3 className="text-lg font-semibold mb-2">Importation terminée !</h3>
                             <div className="text-gray-600">
                                 <p><strong className="text-green-600">{importResult?.created || 0}</strong> {moduleName} ont été créées.</p>
                                 <p><strong className="text-yellow-600">{importResult?.updated || 0}</strong> {moduleName} ont été mises à jour.</p>
                                 <p><strong className="text-red-600">{importResult?.errors || 0}</strong> erreurs.</p>
                             </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                    <button onClick={handleClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Fermer</button>
                    <div className="flex gap-2">
                        {step > 1 && step < 4 && <button onClick={() => setStep(step - 1 as ImportStep)} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Précédent</button>}
                        {step === 2 && <button onClick={handleValidate} disabled={isProcessing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">{isProcessing ? "Validation..." : "Valider les données"}</button>}
                        {step === 3 && validationErrors.length === 0 && <button onClick={handleImport} disabled={isProcessing} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300">{isProcessing ? "Importation..." : `Importer ${parsedData.length} éléments`}</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;