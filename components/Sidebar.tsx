import React from 'react';
import { LayoutDashboard, Eye, CalendarClock, FileText, Settings, Activity } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: '生产概览', icon: LayoutDashboard },
    { id: 'analysis', label: 'AI 感知分析', icon: Eye },
    { id: 'scheduling', label: '智能排产引擎', icon: CalendarClock },
    { id: 'production', label: '电子生产卡', icon: FileText },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800 shadow-xl z-10">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
          <Activity size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">中药智造.AI</h1>
          <p className="text-xs text-slate-400">智能制造管理系统</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
          <Settings size={20} />
          <span className="font-medium text-sm">系统设置</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;