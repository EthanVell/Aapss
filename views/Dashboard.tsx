import React from 'react';
import { ShieldCheck, Zap, AlertTriangle, Clock } from 'lucide-react';
import { MOCK_ORDERS, MOCK_EQUIPMENT } from '../constants';

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className={`text-xs mt-2 ${subtext.includes('+') ? 'text-green-600' : 'text-slate-400'}`}>
        {subtext}
      </p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const pendingOrders = MOCK_ORDERS.filter(o => o.status === '待处理').length;
  const activeEquip = MOCK_EQUIPMENT.filter(e => e.status !== '空闲').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">生产概览</h2>
          <p className="text-slate-500 mt-1">GMP 车间实时监控与状态看板</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">当前班次: A班</p>
          <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="GMP 合规率" 
          value="99.8%" 
          subtext="环比上月 +0.2%"
          icon={ShieldCheck}
          color="bg-emerald-500"
        />
        <StatCard 
          title="设备利用率" 
          value="78%" 
          subtext={`${activeEquip} / ${MOCK_EQUIPMENT.length} 运行中`}
          icon={Zap}
          color="bg-blue-500"
        />
        <StatCard 
          title="安全预警" 
          value="0" 
          subtext="无活跃警报"
          icon={AlertTriangle}
          color="bg-amber-500"
        />
        <StatCard 
          title="待处理订单" 
          value={pendingOrders} 
          subtext="2 个紧急截止"
          icon={Clock}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-lg text-slate-900 mb-4">生产任务队列</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">订单编号</th>
                  <th className="px-4 py-3">物料名称</th>
                  <th className="px-4 py-3">数量</th>
                  <th className="px-4 py-3">优先级</th>
                  <th className="px-4 py-3 rounded-r-lg">截止日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_ORDERS.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${order.material.toxicity === '无毒' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        {order.material.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{order.quantityKg} kg</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.priority === '紧急' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{order.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Equipment Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-lg text-slate-900 mb-4">设备状态</h3>
          <div className="space-y-4">
            {MOCK_EQUIPMENT.map(eq => (
              <div key={eq.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${eq.status === '运行中' ? 'bg-green-500 animate-pulse' : eq.status === '空闲' ? 'bg-slate-300' : 'bg-amber-400'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{eq.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{eq.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">{eq.capacity}kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;