import React, { useState } from 'react';
import { 
  DecimalPrecision, 
  DataRecord, 
  SimulationTab 
} from './types';
import { Header } from './components/Header';
import { TabNavigation, MainTabType } from './components/TabNavigation';
import { CollinearTab } from './components/tabs/CollinearTab';
import { ConcurrentTab } from './components/tabs/ConcurrentTab';
import { DecompositionTab } from './components/tabs/DecompositionTab';
import { MotionControls } from './components/MotionControls';
import { DataTable } from './components/DataTable';
import { ExplorationPanel } from './components/ExplorationPanel';
import { ChallengePanel } from './components/ChallengePanel';
import { QuizPanel } from './components/QuizPanel';
import { BookOpen } from 'lucide-react';

export default function App() {
  const [precision, setPrecision] = useState<DecimalPrecision>(1);
  const [scaleFactor, setScaleFactor] = useState<number>(14); // pixels per Newton
  const [activeTab, setActiveTab] = useState<MainTabType>('concurrent');
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [isCompact, setIsCompact] = useState<boolean>(false);

  // Motion animation state
  const [objectOffset, setObjectOffset] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  // Handle recording measurement results
  const handleRecordData = (newRecord: Omit<DataRecord, 'id' | 'timestamp'>) => {
    const record: DataRecord = {
      ...newRecord,
      id: Date.now().toString(),
      round: records.length + 1,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    };
    setRecords((prev) => [record, ...prev]);
  };

  const handleResetAll = () => {
    setRecords([]);
    setObjectOffset({ x: 0, y: 0 });
    setIsMoving(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-blue-500 selection:text-white pb-12">
      {/* Header */}
      <Header
        precision={precision}
        setPrecision={setPrecision}
        scaleFactor={scaleFactor}
        setScaleFactor={setScaleFactor}
        isCompact={isCompact}
        setIsCompact={setIsCompact}
        onResetAll={handleResetAll}
      />

      {/* Main Container */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 ${isCompact ? 'pt-3 space-y-3' : 'pt-6 space-y-6'}`}>
        {/* Navigation Tabs */}
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          recordCount={records.length}
          isCompact={isCompact}
        />

        {/* Tab Content Renderer */}
        <div className={isCompact ? "space-y-3" : "space-y-6"}>
          {activeTab === 'collinear' && (
            <CollinearTab
              precision={precision}
              scaleFactor={scaleFactor}
              onRecordData={handleRecordData}
              isCompact={isCompact}
            />
          )}

          {activeTab === 'concurrent' && (
            <ConcurrentTab
              precision={precision}
              scaleFactor={scaleFactor}
              onRecordData={handleRecordData}
              isCompact={isCompact}
            />
          )}

          {activeTab === 'decomposition' && (
            <DecompositionTab
              precision={precision}
              scaleFactor={scaleFactor}
              onRecordData={handleRecordData}
              isCompact={isCompact}
            />
          )}

          {activeTab === 'data_table' && (
            <DataTable
              records={records}
              precision={precision}
              onClearAll={() => setRecords([])}
              onDeleteRecord={(id) => setRecords(records.filter((r) => r.id !== id))}
            />
          )}

          {activeTab === 'exploration' && <ExplorationPanel />}

          {activeTab === 'challenges' && (
            <ChallengePanel
              onSelectChallengeTab={(simTab: SimulationTab) => setActiveTab(simTab)}
            />
          )}

          {activeTab === 'quiz' && <QuizPanel />}
        </div>

        {/* Bottom Real-time Motion Simulation Panel (Available for core tabs) */}
        {['collinear', 'concurrent', 'decomposition'].includes(activeTab) && (
          <MotionControls
            netMagnitude={10} // Driven by simulation state
            netAngleDeg={45}
            onOffsetChange={setObjectOffset}
            onMovingStateChange={setIsMoving}
            isCompact={isCompact}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-300">VẬT LÍ 10</span>
            <span>• Bài 13: Tổng hợp và phân tích lực. Cân bằng lực</span>
          </div>
          <p className="text-slate-500">
            Bộ sách: Kết nối tri thức với cuộc sống • Mô phỏng tương tác dành cho giảng dạy & học tập
          </p>
        </div>
      </footer>
    </div>
  );
}
