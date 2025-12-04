import React from 'react';
import { MOCK_ORDERS, MOCK_EQUIPMENT } from '../constants';
import { Printer, AlertOctagon, FileCheck, Thermometer, Droplets, ArrowLeft, BrainCircuit } from 'lucide-react';
import { ProductionPlan } from '../types';

interface ProductionCardProps {
  plan: ProductionPlan | null;
}

const ProductionCard: React.FC<ProductionCardProps> = ({ plan }) => {
  // If no plan comes from scheduling, we show a placeholder or mock default for demo
  const displayOrder = MOCK_ORDERS[0];
  const items = plan ? plan.items.filter(i => i.orderId === displayOrder.id) : [];

  if (!plan) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center text-slate-400">
        <FileCheck size={64} className="mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">暂无生成的生产卡</h2>
        <p>请先在“智能排产引擎”中生成并确认方案。</p>
      </div>
    );
  }

  // Group items by order to simulate distinct batch cards. For demo, we just show the first order found in the plan.
  const firstOrderId = plan.items[0]?.orderId;
  const orderData = MOCK_ORDERS.find(o => o.id === firstOrderId) || displayOrder;
  const orderScheduleItems = plan.items.filter(i => i.orderId === orderData.id).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-start py-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-none md:rounded-lg overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        {/* Card Header */}
        <div className="bg-slate-900 text-white p-8 border-b-4 border-teal-500 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">智能生产指令卡</h1>
            <p className="opacity-80 mt-1 font-mono">方案 ID: {plan.id.substring(0,8)} • 订单: {orderData.id}</p>
          </div>
          <div className="text-right">
             <div className="inline-block bg-teal-600 px-3 py-1 rounded text-sm font-bold shadow-sm">
                AI 已校验: {plan.name}
             </div>
             <p className="mt-2 text-sm opacity-70">生成日期: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          {/* Section 1: Material Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">物料规格</h3>
               <div className="text-xl font-bold text-slate-900">{orderData.material.name}</div>
               <div className="mt-1 text-slate-600">类型: {orderData.material.type}</div>
               <div className="mt-1 text-slate-600">投料量: {orderData.quantityKg} kg</div>
            </div>
            <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">安全与合规档案</h3>
               <div className="flex items-center gap-2">
                 <span className="font-bold text-slate-900">毒性等级:</span>
                 <span className={`px-2 py-0.5 rounded text-sm font-bold ${orderData.material.toxicity !== '无毒' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {orderData.material.toxicity}
                 </span>
               </div>
               {orderData.material.toxicity !== '无毒' && (
                 <div className="mt-2 flex items-start gap-2 text-red-600 text-xs bg-red-50 p-2 rounded border border-red-100">
                    <AlertOctagon size={16} className="shrink-0 mt-0.5" />
                    <p>强制规则：该批次生产结束后，设备将自动锁定，直至 QA 确认清场。</p>
                 </div>
               )}
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* Section 2: Process Steps (Dynamic from Plan) */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">AI 优化工艺流程</h3>
            
            <div className="space-y-4">
               {orderScheduleItems.map((item, index) => {
                 const eqName = MOCK_EQUIPMENT.find(e => e.id === item.equipmentId)?.name || item.equipmentId;
                 const duration = (new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / (1000 * 60);

                 return (
                   <div key={index} className="flex gap-4 group">
                      <div className="w-8 flex flex-col items-center">
                         <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center font-bold text-slate-500">
                           {index + 1}
                         </div>
                         {index < orderScheduleItems.length - 1 && <div className="w-0.5 h-full bg-slate-100 mt-2"></div>}
                      </div>
                      <div className="flex-1 pb-6">
                         <div className="flex justify-between">
                            <h4 className="font-bold text-slate-900">{item.processType}</h4>
                            <span className="text-xs font-mono text-slate-400">
                              {new Date(item.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </span>
                         </div>
                         <p className="text-sm text-slate-500 mt-1">设备: {eqName} • 时长: {duration} 分钟</p>
                         
                         {/* Intelligent Tags based on process */}
                         <div className="flex gap-2 mt-2">
                            {item.processType === '清洗' && (
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                                 <Droplets size={12}/> 水温: 60°C (GMP标准)
                              </span>
                            )}
                            {item.processType === '干燥' && (
                              <>
                                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded flex items-center gap-1">
                                  <Thermometer size={12}/> 动态温控: 65°C
                                </span>
                                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded flex items-center gap-1 border border-indigo-100">
                                  <BrainCircuit size={12}/> AI 时长优化
                                </span>
                              </>
                            )}
                            {item.notes && (
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded italic">
                                备注: {item.notes}
                              </span>
                            )}
                         </div>
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
          
           <div className="border-t border-slate-100"></div>

          {/* Section 3: Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-4">
             <div className="border-t-2 border-slate-300 pt-2">
                <p className="text-xs text-slate-400">操作员签名</p>
             </div>
             <div className="border-t-2 border-slate-300 pt-2">
                <p className="text-xs text-slate-400">QA 复核</p>
             </div>
             <div className="border-t-2 border-slate-300 pt-2">
                <p className="text-xs text-slate-400">MES 时间戳</p>
             </div>
          </div>

        </div>
      </div>

      <div className="mt-6 flex gap-4">
         <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg">
            <Printer size={18} />
            下发至车间平板
         </button>
      </div>
    </div>
  );
};

export default ProductionCard;
