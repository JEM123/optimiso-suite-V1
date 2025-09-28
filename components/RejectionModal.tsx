
import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (comment: string) => void;
}

const RejectionModal: React.FC<RejectionModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [comment, setComment] = useState('');
    const modalRef = useRef<HTMLFormElement>(null);
    const commentRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        if (isOpen) {
            // Focus the first focusable element when the modal opens
            setTimeout(() => commentRef.current?.focus(), 100);

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(comment);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="rejection-title">
            <form ref={modalRef} onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 id="rejection-title" className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500"/>
                        Confirmer le Rejet
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div>
                    <label htmlFor="rejection-comment" className="block text-sm font-medium text-gray-700 mb-1">
                        Motif du rejet (obligatoire)
                    </label>
                    <textarea
                        id="rejection-comment"
                        ref={commentRef}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors"
                        required
                    />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit"
                        disabled={!comment.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:bg-red-300 disabled:cursor-not-allowed"
                    >
                        Confirmer le Rejet
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RejectionModal;