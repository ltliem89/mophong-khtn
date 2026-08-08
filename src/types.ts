export type SimulationTab = 'collinear' | 'concurrent' | 'decomposition';

export type AppMode = 'student' | 'teacher';

export type DecimalPrecision = 0 | 1 | 2 | 3;

export interface Vector2D {
  x: number;
  y: number;
}

export interface ForceVector {
  id: string;
  name: string;
  magnitude: number; // in Newtons
  angleDeg: number;  // 0 to 360 degrees (0 = +x axis, 90 = +y axis)
  color: string;
  isRemovable?: boolean;
  isLocked?: boolean;
}

export interface DataRecord {
  id: string;
  round: number;
  tabName: string;
  f1: number;
  f2: number;
  angle: number;
  fResult: number;
  fResultAngle: number;
  notes: string;
  timestamp: string;
}

export interface ExplorationTask {
  id: string;
  title: string;
  objective: string;
  f1Default: number;
  f2Default: number;
  angleDefault: number;
  guideSteps: string[];
  questionPrompt: string;
}

export interface Challenge {
  id: string;
  title: string;
  level: 'CƠ BẢN' | 'TRUNG BÌNH' | 'NÂNG CAO';
  description: string;
  tab: SimulationTab;
  targetType: 'Fhl_magnitude' | 'equilibrium' | 'decomposition_fx';
  targetValue?: number;
  targetAngle?: number;
  tolerance: number;
  initialConfig: {
    f1: number;
    f2: number;
    angle?: number;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export interface TeacherConfig {
  lockedParameters: {
    f1?: boolean;
    f2?: boolean;
    angle?: boolean;
  };
  difficulty: 'CƠ BẢN' | 'TRUNG BÌNH' | 'NÂNG CAO';
  presetScenarioName: string;
  showDirectAnswer: boolean;
}
