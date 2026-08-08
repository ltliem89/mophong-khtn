import React from 'react';
import { SimulationTab } from '../types';
import { 
  ArrowRight, 
  Compass, 
  Scale, 
  Split, 
  FileText, 
  Trophy, 
  HelpCircle 
} from 'lucide-react';

export type MainTabType = SimulationTab | 'data_table' | 'exploration' | 'challenges' | 'quiz';

interface TabNavigationProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  recordCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  recordCount,
}) => {
  const simulationTabs = [
    { id: 'collinear', name: 'Hai Lực Cùng Phương', icon: ArrowRight, activeColor: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' },
    { id: 'concurrent', name: 'Quy Tắc Hình Bình Hành', icon: Compass, activeColor: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' },
    { id: 'decomposition', name: 'Phân Tích Lực', icon: Split, activeColor: 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' },
  ] as const;

  const extraTabs: { id: MainTabType; name: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'data_table', name: 'Bảng Số Liệu', icon: FileText, badge: recordCount },
    { id: 'exploration', name: 'Thí Nghiệm Khám Phá', icon: Compass },
    { id: 'challenges', name: 'Thử Thách', icon: Trophy },
    { id: 'quiz', name: 'Câu Hỏi Củng Cố', icon: HelpCircle },
  ];

  return (
    <div className="space-y-3">
      {/* Primary 3 Simulation Tabs */}
      <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-1.5 shadow-md">
        {simulationTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MainTabType)}
              className={`p-3 rounded-xl transition font-bold text-xs flex items-center justify-center gap-2 ${
                isActive
                  ? tab.activeColor
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Supplementary Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2 text-xs">
        {extraTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MainTabType)}
              className={`px-3.5 py-2 rounded-xl border transition font-bold flex items-center gap-2 ${
                isActive
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.name}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-emerald-500 text-slate-950 font-extrabold rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
