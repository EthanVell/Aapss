import React, { useState, useEffect } from 'react';
import { Play, Calendar, AlertTriangle, Layers, Clock, Check, ScanEye, ShieldCheck, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { MOCK_ORDERS, MOCK_EQUIPMENT } from '../constants';
import { generateProductionSchedules } from '../services/geminiService';
import { ProductionPlan, Order } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SchedulingProps {
  onPlanConfirmed: (plan: ProductionPlan) => void;
}

const Scheduling: React.FC<SchedulingProps> = ({ onPlanConfirmed }) => {
  // Workflow Steps: 0: Analysis, 1: Constraints, 2: Generation, 3: Decision
  const [currentStep, setCurrentStep] = useState(0);
  
  // Data State
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  // Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Constraint Check Results
  const [checkResults, setCheckResults] = useState<{valid: boolean, messages: string[]}>({ valid: true, messages: [] });

  // ----------------------------------------------------
  // Step 1: AI Perception / Analysis Logic
  // ----------------------------------------------------
  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate AI Visual Analysis for each order
    setTimeout(() => {
      const updatedOrders = orders.map(order => {
        // Randomly simulate higher moisture for demo purposes
        const isMoist = Math.random() > 0.5;
        const detected = isMoist ? order.material.standardMoisture + 3 : order.material.standardMoisture;
        return {
          ...order,
          detectedMoisture: detected,
          visualCheckStatus: '合格' as const
        };
      });
      setOrders(updatedOrders);
      setIsAnalyzing(false);
      setCurrentStep(1);
    }, 1500);
  };

  // ----------------------------------------------------
  // Step 2: Constraint Validation Logic
  // ----------------------------------------------------
  const runConstraintCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      // Mock validation logic
      const messages = [];
      let valid = true;

      // Check 1: Equipment
      const brokenEq = MOCK_EQUIPMENT.find(e => e.status === '维护中');
      if (brokenEq) {
        messages.push(`警告：设备 ${brokenEq.name} 处于维护状态，可用性降低。`);
      } else {
        messages.push("设备状态检查：全部可用 ✅");
      }

      // Check 2: Toxicity
      const toxicOrders = orders.filter(o => o.material.toxicity !== '无毒');
      if (toxicOrders.length > 0) {
        messages.push(`注意：检测到 ${toxicOrders.length} 个毒性物料订单，已激活 GMP 隔离规则 ✅`);
      }

      messages.push("物料齐套性检查：100% ✅");
      
      setCheckResults({ valid, messages });
      setIsChecking(false);
    }, 1200);
  };

  // ----------------------------------------------------
  // Step 3: AI Generation Logic
  // ----------------------------------------------------
  const handleGenerate = async () => {
    setIsGenerating(true);
    // Pass the analyzed orders (with moisture data) to the service
    const generatedPlans = await generateProductionSchedules(orders, MOCK_EQUIPMENT);
    setPlans(generatedPlans);
    if (generatedPlans.length > 0) {
      setSelectedPlanId(generatedPlans[0].id);
    }
    setIsGenerating(false);
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  // Chart Data Preparation
  const timelineData = selectedPlan?.items.map(item => {
    const start = new Date(item.startTime).getTime();
    const end = new Date(item.endTime).getTime();
    const duration = (end - start) / (1000 * 60 * 60); 
    const eq = MOCK_EQUIPMENT.find(e => e.id === item.equipmentId);
    
    return {
      name: eq ? eq.name : item.equipmentId,
      duration: duration,
      order: item.orderId,
      process: item.processType,
      startHour: new Date(item.startTime).getHours(),
    };
  });

  // ----------------------------------------------------
  // Render Helpers
  // ----------------------------------------------------
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-4">
      {['物料感知', '约束校验', 'AI 模型运算', '决策与执行'].map((label, idx) => (
        <div key={idx} className="flex flex-col items-center relative z-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
            currentStep >= idx ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-200 text-slate-500'
          }`}>
            {currentStep > idx ? <Check size={16} /> : idx + 1}
          </div>
          <span className={`text-xs mt-2 font-medium ${currentStep >= idx ? 'text-indigo-900' : 'text-slate-400'}`}>
            {label}
          </span>
        </div>
      ))}
      {/* Progress Bar Background */}
      <div className="absolute left-0 w-full top-4 h-0.5 bg-slate-200 -z-0 px-12">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500" 
          style={{ width: `${(currentStep / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">AI 智能排产引擎</h2>
        <StepIndicator />
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        
        {/* STEP 0: Order Analysis */}
        {currentStep === 0 && (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <ScanEye size={40} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">步骤 1: 订单读取与物料感知</h3>
            <p className="text-slate-500 max-w-md mb-8">
              系统将读取 ERP 待排订单，并调用视觉模型分析原料图片，以识别形态并预估含水量，为排产模型提供精准输入。
            </p>
            
            <div className="w-full max-w-2xl bg-slate-50 rounded-lg p-4 mb-8 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">待处理队列 ({orders.length})</p>
              <div className="space-y-2">
                {orders.map(o => (
                  <div key={o.id} className="flex justify-between text-sm p-2 bg-white border border-slate-100 rounded shadow-sm">
                    <span>{o.id} - {o.material.name}</span>
                    <span className="text-slate-400">等待检测...</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={runAIAnalysis}
              disabled={isAnalyzing}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              {isAnalyzing ? <Loader2 className="animate-spin"/> : <Play size={20} />}
              {isAnalyzing ? "正在进行 AI 视觉分析..." : "启动物料感知"}
            </button>
          </div>
        )}

        {/* STEP 1: Constraints Check */}
        {currentStep === 1 && (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={40} className="text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">步骤 2: 规则与约束校验</h3>
            <p className="text-slate-500 max-w-md mb-8 text-center">
              AI 视觉分析已完成。正在构建多场景约束模型：检查 GMP 毒性隔离规则、设备可用性及物料齐套性。
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-3xl mb-8">
               {/* Analysis Result Summary */}
               <div className="col-span-2 bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-3">
                 <ScanEye className="text-blue-600" size={20}/>
                 <div className="text-sm">
                   <span className="font-bold text-blue-800">感知结果更新：</span>
                   {orders.filter(o => (o.detectedMoisture || 0) > o.material.standardMoisture).length} 个批次含水量偏高，已自动建议延长干燥工艺时长。
                 </div>
               </div>

               {/* Constraint Console */}
               <div className="col-span-2 bg-slate-900 text-green-400 font-mono text-sm p-6 rounded-lg min-h-[150px]">
                 {isChecking ? (
                   <div className="flex items-center gap-2">
                     <span className="animate-pulse">_ 正在扫描设备状态...</span>
                   </div>
                 ) : (
                   <div className="space-y-2">
                     {checkResults.messages.map((msg, i) => (
                       <div key={i} className="flex items-center gap-2">
                         <span>{">"}</span>
                         {msg}
                       </div>
                     ))}
                     <div className="text-white mt-4 border-t border-slate-700 pt-2">
                       系统就绪。约束模型构建完毕。
                     </div>
                   </div>
                 )}
               </div>
            </div>

            {!isChecking && checkResults.messages.length === 0 ? (
               <button 
                 onClick={runConstraintCheck}
                 className="px-8 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all"
               >
                 运行约束检查
               </button>
            ) : (
               <button 
                 onClick={() => setCurrentStep(2)}
                 disabled={isChecking}
                 className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center gap-2"
               >
                 下一步：AI 模型运算 <ArrowRight size={18} />
               </button>
            )}
          </div>
        )}

        {/* STEP 2: Generate */}
        {currentStep === 2 && (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-8 duration-300">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Zap size={40} className="text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">步骤 3: 智能排产计算</h3>
            <p className="text-slate-500 max-w-md mb-8 text-center">
              Gemini 引擎正在基于遗传算法与强化学习策略，生成多种最优排产方案供您决策。
            </p>

            {plans.length === 0 ? (
               <div className="text-center">
                 <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-12 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center gap-3 mx-auto"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <Layers />}
                  {isGenerating ? "AI 正在计算最优解..." : "生成多场景方案"}
                </button>
                {isGenerating && (
                  <p className="text-xs text-slate-400 mt-4 animate-pulse">正在平衡 GMP 合规性与设备利用率...</p>
                )}
               </div>
            ) : (
              <div className="w-full max-w-4xl">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {plans.map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`cursor-pointer border-2 rounded-xl p-6 transition-all hover:scale-[1.02] ${
                          selectedPlanId === plan.id 
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                          : 'border-slate-200 hover:border-indigo-200 bg-white'
                        }`}
                      >
                         <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-lg text-slate-800">{plan.name}</h4>
                            <div className="flex flex-col items-end">
                              <span className="text-2xl font-bold text-indigo-600">{plan.score}</span>
                              <span className="text-xs text-slate-400">综合得分</span>
                            </div>
                         </div>
                         <p className="text-sm text-slate-600 mb-4 h-10">{plan.description}</p>
                         <div className="space-y-2 text-sm text-slate-500 bg-white/50 p-3 rounded-lg">
                            <div className="flex justify-between">
                              <span>总时长</span>
                              <span className="font-medium text-slate-900">{plan.kpis.totalDurationHours} 小时</span>
                            </div>
                            <div className="flex justify-between">
                              <span>清洁次数</span>
                              <span className="font-medium text-slate-900">{plan.kpis.cleaningCycles} 次</span>
                            </div>
                            <div className="flex justify-between">
                              <span>设备利用率</span>
                              <span className="font-medium text-slate-900">{plan.kpis.equipmentUtilization}%</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-center">
                    <button 
                      onClick={() => setCurrentStep(3)}
                      disabled={!selectedPlanId}
                      className="px-8 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      查看详情并决策 <ArrowRight size={18} />
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Decision & Execution (View Details) */}
        {currentStep === 3 && selectedPlan && (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-0 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded uppercase">已选方案</span>
                  {selectedPlan.name}
                </h3>
                <p className="text-slate-500 text-xs mt-1">请确认排产甘特图细节，确认后将生成生产指令卡。</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setCurrentStep(2)} className="text-slate-500 text-sm hover:text-slate-800">返回重选</button>
                 <button 
                   onClick={() => onPlanConfirmed(selectedPlan)}
                   className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2 font-medium"
                 >
                   <Check size={18} />
                   确认并生成排卡
                 </button>
              </div>
            </div>

            {/* Gantt Chart Area */}
            <div className="flex-1 min-h-[250px] relative">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timelineData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis type="number" unit="h" />
                  <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px', fontWeight: 500 }} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs">
                            <p className="font-bold text-slate-900 mb-1">{data.name}</p>
                            <p className="text-slate-600">工序: {data.process}</p>
                            <p className="text-slate-600">时长: {data.duration.toFixed(1)}h</p>
                            <p className="text-slate-400 mt-1">订单: {data.order}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="duration" name="时长 (小时)" radius={[0, 4, 4, 0]} barSize={24}>
                    {timelineData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.process === '清洗' ? '#cbd5e1' : 
                          entry.process === '干燥' ? '#f59e0b' : 
                          entry.process === '切制' ? '#ef4444' : 
                          '#3b82f6' 
                        } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div className="absolute top-0 right-0 bg-white/90 p-2 rounded-lg border border-slate-100 text-[10px] space-y-1 shadow-sm">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded"></div>标准工艺</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded"></div>干燥 (AI调优)</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-300 rounded"></div>GMP清洗</div>
              </div>
            </div>

            {/* AI Optimization Insight */}
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-3">
               <Zap size={16} className="text-indigo-600 mt-0.5 shrink-0" />
               <div className="text-xs text-indigo-800">
                  <span className="font-bold">MES 反馈闭环优化：</span>
                  此方案已包含自适应调整。由于部分物料感知含水量较高，干燥工序时间已自动延长 20%，预计可避免 2 次潜在的返工，整体效率提升 5%。
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Scheduling;
