"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, 
  ShieldAlert, 
  Activity, 
  Map as MapIcon, 
  BarChart3, 
  Zap, 
  Droplets, 
  Truck, 
  ChevronRight,
  ArrowUpRight,
  Search,
  LayoutDashboard,
  Bell,
  Settings,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { nationalAPI } from "@/lib/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function NationalControlTowerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNationalData();
    const interval = setInterval(fetchNationalData, 60000); // 1 minute refresh
    return () => clearInterval(interval);
  }, []);

  const fetchNationalData = async () => {
    try {
      const res = await nationalAPI.status();
      setData(res.data);
    } catch (error) {
      console.error("National data load failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Globe className="text-indigo-500 animate-spin mx-auto" size={48} />
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">Initializing National Control Tower System...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050810] text-white overflow-hidden flex flex-col">
      {/* National Status Bar */}
      <div className="h-12 bg-indigo-500 flex items-center px-6 justify-between overflow-hidden">
        <div className="flex gap-8 whitespace-nowrap animate-marquee">
          <span className="text-xs font-black tracking-widest flex items-center gap-2">
            <Activity size={14} /> NATIONAL INFRASTRUCTURE HEALTH: {data?.national_health_index || 72}%
          </span>
          <span className="text-xs font-black tracking-widest flex items-center gap-2 opacity-80">
            <Zap size={14} /> GRID STABILITY: 84%
          </span>
          <span className="text-xs font-black tracking-widest flex items-center gap-2 opacity-80">
            <Droplets size={14} /> WATER RESERVE STATUS: STABLE
          </span>
          <span className="text-xs font-black tracking-widest flex items-center gap-2 opacity-80">
             ACTIVE CRISIS ALERTS: {data?.active_alerts?.length || 0}
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-20 border-r border-white/5 bg-black/40 flex flex-col items-center py-8 gap-10">
          <Globe className="text-indigo-500" size={32} />
          <nav className="flex flex-col gap-6">
             <button className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20"><LayoutDashboard size={20} /></button>
             <button className="p-3 text-slate-500 hover:text-white transition-colors"><MapIcon size={20} /></button>
             <button className="p-3 text-slate-500 hover:text-white transition-colors"><BarChart3 size={20} /></button>
             <button className="p-3 text-slate-500 hover:text-white transition-colors"><Bell size={20} /></button>
          </nav>
          <div className="mt-auto">
            <button className="p-3 text-slate-600 hover:text-white"><Settings size={20} /></button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black tracking-tight uppercase">National Control Tower</h1>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                SECURE AGGREGATION ACTIVE
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-[#050810] bg-slate-800" />)}
               </div>
               <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">3 Controllers Online</div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* National Grid Overview */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Map/Geospatial Centerpiece */}
              <div className="xl:col-span-2 bg-gradient-to-b from-slate-900 to-black rounded-[2rem] border border-white/5 relative h-[600px] overflow-hidden group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                    {/* Simulated National Map */}
                    <svg viewBox="0 0 800 600" className="w-[80%] h-[80%] opacity-40">
                       <path d="M200 100 L600 100 L700 300 L600 500 L200 500 L100 300 Z" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="10 5" />
                       <circle cx="400" cy="300" r="4" fill="red" className="animate-ping" />
                       <circle cx="550" cy="200" r="4" fill="orange" className="animate-pulse" />
                       {data?.cities?.map((city: any, idx: number) => (
                         <circle key={city.id} cx={250 + (idx * 100)} cy={200 + (idx * 50)} r={city.risk_score / 15} fill={city.status === "CRITICAL" ? "#ef4444" : "#2dd4bf"} fillOpacity="0.4" />
                       ))}
                    </svg>
                 </div>

                 <div className="absolute top-8 left-8">
                    <div className="bg-black/60 shadow-2xl backdrop-blur-xl border border-white/10 p-6 rounded-3xl w-72">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">City Health Ranking</h3>
                       <div className="space-y-4">
                          {data?.cities?.sort((a: any, b: any) => b.risk_score - a.risk_score).slice(0, 5).map((city: any) => (
                             <div key={city.id} className="flex items-center justify-between">
                                <span className="text-sm font-bold">{city.name}</span>
                                <div className="flex items-center gap-3">
                                   <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                      <div className={`h-full ${city.risk_score > 70 ? "bg-red-500" : "bg-emerald-500"}`} style={{width: `${city.risk_score}%`}} />
                                   </div>
                                   <span className={`text-[10px] font-bold ${city.status === "CRITICAL" ? "text-red-400" : "text-emerald-400"}`}>
                                      {city.risk_score}%
                                   </span>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="absolute bottom-8 right-8">
                    <div className="bg-indigo-600 px-6 py-4 rounded-2xl shadow-2xl shadow-indigo-600/40 border border-white/10 flex items-center gap-4">
                        <ShieldAlert size={28} />
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 leading-none">Resource Reallocation AI</p>
                           <p className="text-sm font-bold mt-1">Deploying Maintenance Fleet to Tshwane/Ekurhuleni Sector</p>
                        </div>
                    </div>
                 </div>
              </div>

              {/* National Alert Stream */}
              <div className="bg-white/5 rounded-[2rem] border border-white/5 flex flex-col">
                 <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
                       <Activity size={16} /> Crisis Action Stream
                    </h3>
                    <div className="text-[10px] font-black uppercase px-2 py-0.5 bg-red-500/20 text-red-500 rounded">LIVE</div>
                 </div>
                 
                 <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[500px]">
                    {data?.active_alerts?.map((alert: any, i: number) => (
                      <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-red-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-3 text-[10px] font-black tracking-widest">
                           <span className="text-red-500 uppercase">{alert.severity} CRISIS</span>
                           <span className="text-slate-500">{alert.city} sector</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1 leading-tight">{alert.type} Report</h4>
                        <p className="text-sm text-slate-500 font-medium">Automatic escalation to provincial admin initiated.</p>
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                           <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Intercept Response</button>
                           <ChevronRight size={14} className="text-slate-600" />
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center gap-4">
                       <BarChart3 className="text-indigo-400" size={24} />
                       <div>
                          <p className="text-xs font-bold text-indigo-400">System Pattern Detection</p>
                          <p className="text-sm font-medium text-slate-400">67% correlation between City Power failures and Ward 12 outages.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </section>

            {/* National Metrics Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { label: "Total National Cases", val: data?.total_active_cases || "1,240", icon: Activity, color: "text-indigo-400" },
                 { label: "Infrastructure Load", val: "72%", icon: Zap, color: "text-emerald-400" },
                 { label: "Avg National TAT", val: "2.4h", icon: Clock, color: "text-yellow-400" },
                 { label: "Resource Efficiency", val: "94%", icon: Truck, color: "text-blue-400" }
               ].map((stat, i) => (
                 <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] group hover:bg-white/[0.08] transition-all">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                    <div className="mt-3 flex items-center justify-between">
                       <h3 className="text-3xl font-black">{stat.val}</h3>
                       <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                          <stat.icon size={20} />
                       </div>
                    </div>
                 </div>
               ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
