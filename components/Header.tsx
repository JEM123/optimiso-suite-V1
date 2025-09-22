import React, { useState, useMemo } from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { modules } from '../constants';
import { useAppContext } from '../context/AppContext';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
    activeModule: string;
}

const Header: React.FC<HeaderProps> = ({ activeModule }) => {
    const { notifications, readNotificationIds } = useAppContext();
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);

    const getModuleTitle = () => {
        if (activeModule === 'accueil') return 'Page d\'Accueil';
        if (activeModule === 'risques-dashboard') return 'Tableau de Bord - Risques';
        if (activeModule === 'documents-dashboard') return 'Tableau de Bord - Documents';
        return modules.find(m => m.id === activeModule)?.nom || 'Module';
    };

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !readNotificationIds.includes(n.id)).length;
    }, [notifications, readNotificationIds]);

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-md text-gray-500">
                        {getModuleTitle()}
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 sm:w-64"
                            aria-label="Recherche globale"
                        />
                    </div>
                    <div className="relative">
                        <button 
                            onClick={() => setNotificationsOpen(prev => !prev)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                                </span>
                            )}
                        </button>
                        {isNotificationsOpen && <NotificationCenter onClose={() => setNotificationsOpen(false)} />}
                    </div>
                    <button 
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        aria-label="Paramètres"
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
