'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Zap, Globe, Shield, Terminal, Activity, ArrowRight } from 'lucide-react';

export default function ApiManagerPage() {
  const apis = [
    {
      id: '1',
      name: 'Fetch_User_Profile',
      method: 'GET',
      url: 'https://api.v4.platform/clusters/user/{id}',
      createdAt: '48H_ELAPSED',
      status: 'VERIFIED'
    },
    {
      id: '2',
      name: 'Push_Node_Update',
      method: 'PUT',
      url: 'https://api.v4.platform/clusters/user/{id}',
      createdAt: '24H_ELAPSED',
      status: 'VERIFIED'
    },
    {
      id: '3',
      name: 'Query_Registry_Inventory',
      method: 'GET',
      url: 'https://api.v4.platform/global/inventory',
      createdAt: '120H_ELAPSED',
      status: 'STANDBY'
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Header Cluster */}
      <motion.div
        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Interface Controller</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Node <span className="text-emerald-500 italic">Gateways</span>
          </h1>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">Map cluster endpoints // Encryption: Industrial-Grade</p>
        </div>
        <button className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-[0_20px_40px_rgba(16,185,129,0.2)] flex items-center gap-3">
          <Plus className="w-4 h-4" />
          Map_New_Endpoint
        </button>
      </motion.div>

      {/* Gateway Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[2.5rem] border border-white/[0.08] bg-[#0b0b0d] overflow-hidden backdrop-blur-3xl shadow-2xl"
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Resource_Handle</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Protocol</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Destination_Path</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Lifecycle</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {apis.map((api) => (
                <tr key={api.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${api.status === 'VERIFIED' ? 'bg-emerald-500' : 'bg-zinc-700'} shadow-[0_0_8px_rgba(16,185,129,0.2)]`} />
                      <span className="text-xs font-black uppercase tracking-tight text-white italic group-hover:text-emerald-400 transition-colors">{api.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className="px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                        {api.method}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-3.5 h-3.5 text-zinc-700" />
                      <span className="text-[10px] font-medium text-zinc-400 font-mono truncate max-w-xs">{api.url}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{api.createdAt}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2 opactiy-60 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 text-zinc-500 transition-all border border-white/[0.05]">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-500/10 hover:text-red-400 text-zinc-500 transition-all border border-white/[0.05]">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Network Diagnostics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { label: "Throughput", value: "84.2 GB/S", icon: Activity },
          { label: "Active Connections", value: "12,804", icon: Globe },
          { label: "Latency Spike", value: "0 ms", icon: Shield }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] group hover:border-emerald-500/20 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <item.icon className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
              <div className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-700">Live_Matrix</div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{item.label}</p>
            <p className="text-3xl font-black text-white italic truncate">{item.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
