export enum ToxicityLevel {
  NONE = '无毒',
  LOW = '小毒',
  HIGH = '剧毒',
}

export enum ProcessType {
  WASHING = '清洗',
  STEAMING = '蒸煮',
  DRYING = '干燥',
  CUTTING = '切制',
  PACKAGING = '包装',
}

export interface Material {
  id: string;
  name: string;
  toxicity: ToxicityLevel;
  type: string; // e.g., "Root", "Leaf"
  standardMoisture: number; // Target moisture %
}

export interface Equipment {
  id: string;
  name: string;
  type: ProcessType;
  capacity: number;
  status: '空闲' | '运行中' | '清洗中' | '维护中';
}

export interface Order {
  id: string;
  material: Material;
  quantityKg: number;
  deadline: string;
  priority: '普通' | '紧急';
  status: '待处理' | '已排产' | '生产中' | '已完成';
  // Added for logic flow
  detectedMoisture?: number; 
  visualCheckStatus?: '待检测' | '合格' | '异常';
}

export interface ScheduleItem {
  orderId: string;
  equipmentId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  processType: ProcessType;
  notes?: string;
}

export interface ProductionPlan {
  id: string;
  name: string;
  score: number;
  description: string;
  items: ScheduleItem[];
  kpis: {
    totalDurationHours: number;
    cleaningCycles: number;
    equipmentUtilization: number;
  };
}

export interface AIAnalysisResult {
  materialName: string;
  detectedForm: string; // e.g., "Whole", "Slice", "Segment"
  estimatedMoisture: number;
  qualityCheck: '合格' | '不合格';
  reasoning: string;
}
