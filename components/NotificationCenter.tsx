import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell, CheckSquare, AtSign, AlertTriangle, UserCheck, Calendar, Check, X } from 'lucide-react';
import type { Notification, NotificationType } from '../types';

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
    validation: CheckSquare,
    mention: AtSign,
    alerte: AlertTriangle,
    tache: Calendar,
    evaluation: UserCheck
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
    validation: 'bg-blue-500',
    mention: 'bg-purple-500',
    alerte: 'bg-red-500',
    tache: 'bg-yellow-500',
    evaluation: 'bg-indigo-500'
};

const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " ans";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mois";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " jours";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " heures";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes";
    return Math.floor(seconds) + " secondes";
};

interface NotificationCenterProps {
    onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
    const { user, notifications, readNotificationIds, handleNotificationClick, markAllNotificationsAsRead } = useAppContext();
    const [activeTab, setActiveTab] = useState<'vous' | 'toutes'>('vous');

    const allNotifications = [...notifications].sort((a, b) => b.date.getTime() - a.date.getTime());
    const userNotifications = allNotifications.filter(n => n.userId === user.id || !n.userId);

    const displayedNotifications = activeTab === 'vous' ? userNotifications : allNotifications;

    return (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border z-50 animate-fade-in-down flex flex-col max-h-[80vh]">
            <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X className="h-5 w-5"/></button>
                </div>
                 <div className="mt-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer font-medium" onClick={markAllNotificationsAsRead}>
                    Tout marquer comme lu
                </div>
            </div>

            <div className="border-b">
                 <nav className="flex space-x-2 px-2">
                    <button onClick={() => setActiveTab('vous')} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'vous' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Pour vous</button>
                    <button onClick={() => setActiveTab('toutes')} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'toutes' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Toutes</button>
                </nav>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {displayedNotifications.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Bell className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2">Aucune nouvelle notification.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {displayedNotifications.map(notification => {
                            const isRead = readNotificationIds.includes(notification.id);
                            const Icon = NOTIFICATION_ICONS[notification.type];
                            return (
                                <button 
                                    key={notification.id} 
                                    onClick={() => { handleNotificationClick(notification); onClose(); }}
                                    className="w-full text-left p-4 hover:bg-gray-50 flex items-start gap-4"
                                >
                                    {!isRead && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>}
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${NOTIFICATION_COLORS[notification.type]}`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium text-gray-800 ${isRead ? '' : 'font-bold'}`}>{notification.title}</p>
                                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                                        <p className="text-xs text-blue-500 mt-2">il y a {timeSince(notification.date)}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
