import React from 'react';
import { modules } from '../constants';
import { Menu } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface User {
  nom: string;
  profil: string;
  avatar: string;
}

interface SidebarProps {
  activeModule: string;
  setActiveModule: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, sidebarOpen, setSidebarOpen, user }) => {
  const { settings } = useAppContext();

  const visibleModules = modules.filter(m => settings.modules[m.id]?.visible !== false);

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OS</span>
              </div>
              <span className="font-semibold">Optimiso Suite</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-gray-800"
            aria-label={sidebarOpen ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {visibleModules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeModule === module.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              title={module.nom}
              aria-label={`Accéder au module ${module.nom}`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm truncate">{module.nom}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium text-sm">{user.avatar}</span>
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.nom}</div>
              <div className="text-xs text-gray-400 truncate">{user.profil}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;