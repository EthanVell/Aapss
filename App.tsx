import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import AIAnalysis from './views/AIAnalysis';
import Scheduling from './views/Scheduling';
import ProductionCard from './views/ProductionCard';
import { ProductionPlan } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPlan, setCurrentPlan] = useState<ProductionPlan | null>(null);

  const handlePlanConfirmed = (plan: ProductionPlan) => {
    setCurrentPlan(plan);
    setActiveTab('production');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'analysis':
        return <AIAnalysis />;
      case 'scheduling':
        return <Scheduling onPlanConfirmed={handlePlanConfirmed} />;
      case 'production':
        return <ProductionCard plan={currentPlan} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-64 flex-1 p-8">
        {/* Top bar */}
        <div className="flex justify-end mb-6">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                 ADM
              </div>
              <span className="text-sm font-medium text-slate-700">生产经理</span>
           </div>
        </div>

        {/* Dynamic Content */}
        <div className="fade-in">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
