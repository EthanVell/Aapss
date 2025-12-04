import { Equipment, Material, Order, ProcessType, ToxicityLevel } from "./types";

export const MOCK_MATERIALS: Material[] = [
  { id: 'm1', name: '人参', toxicity: ToxicityLevel.NONE, type: '根茎类', standardMoisture: 12 },
  { id: 'm2', name: '附子', toxicity: ToxicityLevel.HIGH, type: '根茎类', standardMoisture: 10 },
  { id: 'm3', name: '甘草', toxicity: ToxicityLevel.NONE, type: '根茎类', standardMoisture: 11 },
  { id: 'm4', name: '枸杞', toxicity: ToxicityLevel.NONE, type: '果实类', standardMoisture: 13 },
  { id: 'm5', name: '半夏', toxicity: ToxicityLevel.LOW, type: '块茎类', standardMoisture: 14 },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq1', name: '清洗机 A1', type: ProcessType.WASHING, capacity: 500, status: '空闲' },
  { id: 'eq2', name: '蒸煮罐 B1', type: ProcessType.STEAMING, capacity: 300, status: '空闲' },
  { id: 'eq3', name: '干燥箱 C1', type: ProcessType.DRYING, capacity: 1000, status: '运行中' },
  { id: 'eq4', name: '切药机 D1', type: ProcessType.CUTTING, capacity: 200, status: '空闲' },
  { id: 'eq5', name: '包装机 E1', type: ProcessType.PACKAGING, capacity: 1000, status: '空闲' },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ord-101', material: MOCK_MATERIALS[0], quantityKg: 200, deadline: '2023-11-01', priority: '紧急', status: '待处理' },
  { id: 'ord-102', material: MOCK_MATERIALS[1], quantityKg: 100, deadline: '2023-11-02', priority: '普通', status: '待处理' },
  { id: 'ord-103', material: MOCK_MATERIALS[2], quantityKg: 500, deadline: '2023-11-03', priority: '普通', status: '待处理' },
  { id: 'ord-104', material: MOCK_MATERIALS[3], quantityKg: 150, deadline: '2023-11-01', priority: '紧急', status: '待处理' },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: '生产概览', icon: 'LayoutDashboard' },
  { id: 'analysis', label: 'AI 感知分析', icon: 'Eye' },
  { id: 'scheduling', label: '智能排产引擎', icon: 'CalendarClock' },
  { id: 'production', label: '电子生产卡', icon: 'FileText' },
];