import React, { useState } from 'react';
import FluxWorkflowPanel from './FluxWorkflowPanel';
import SyncConnectorPanel from './SyncConnectorPanel';
import { Workflow, UploadCloud } from 'lucide-react';

const SyncAndFlowPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'flux' | 'sync'>('flux');

    return (
        <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold text-gray-900">Flux & Synchronisation</h1>
                <p className="text-sm text-gray-600 mt-1">Gérez les circuits de validation et la synchronisation des utilisateurs.</p>
            </div>
            <div className="border-b">
                <nav className="flex space-x-4 px-4">
                    <button 
                        onClick={() => setActiveTab('flux')} 
                        className={`py-3 px-1 text-sm font-medium flex items-center gap-2 ${activeTab === 'flux' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Workflow className="h-5 w-5" />
                        Flux de validation
                    </button>
                    <button 
                        onClick={() => setActiveTab('sync')} 
                        className={`py-3 px-1 text-sm font-medium flex items-center gap-2 ${activeTab === 'sync' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <UploadCloud className="h-5 w-5" />
                        Synchronisation CSV
                    </button>
                </nav>
            </div>
            <div className="flex-1 p-6 bg-gray-50/50 overflow-y-auto">
                {activeTab === 'flux' && <FluxWorkflowPanel />}
                {activeTab === 'sync' && <SyncConnectorPanel />}
            </div>
        </div>
    );
};

export default SyncAndFlowPage;
