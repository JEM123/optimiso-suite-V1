import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ValidationError } from '../types';

export const downloadCsv = (filename: string, csvContent: string) => {
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

export const generateCsv = (headers: string[], dataRows: any[][]): string => {
    const rows = [headers, ...dataRows];
    return Papa.unparse(rows, { delimiter: ';' });
};

export const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                // Convert all header keys to lowercase to make the import case-insensitive
                const lowercasedJson = json.map(row =>
                    Object.keys(row as object).reduce((acc, key) => {
                        (acc as any)[key.toLowerCase()] = (row as any)[key];
                        return acc;
                    }, {} as Record<string, any>)
                );
                
                resolve(lowercasedJson);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
};

export const generateExcelTemplate = (filename: string, headers: string[], dataRows: any[][]) => {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modèle');
    XLSX.writeFile(wb, filename);
};


export const generateErrorCsv = (originalData: any[], errors: ValidationError[]): string => {
    const errorMap = new Map<number, string[]>();
    errors.forEach(err => {
        if (!errorMap.has(err.row)) {
            errorMap.set(err.row, []);
        }
        errorMap.get(err.row)!.push(err.message);
    });

    const dataWithErrors = originalData.map((row, index) => ({
        ...row,
        _error: errorMap.get(index + 2)?.join(' | ') || ''
    }));
    
    // We still use PapaParse for this as it's simple and effective for error reporting
    return Papa.unparse(dataWithErrors, { delimiter: ';' });
};