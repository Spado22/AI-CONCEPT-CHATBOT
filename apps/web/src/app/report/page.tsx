"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { reportsAPI } from "@/lib/api";
import { 
  FileText, 
  MapPin, 
  Building, 
  AlertCircle, 
  Download, 
  Plus,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ReportPage() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setLoading(true);
    try {
      const res = await reportsAPI.generate({
        description,
        location,
        municipality
      });
      setGeneratedReport(res.data);
      toast.success("Document generated successfully!");
    } catch (err) {
      toast.error("Failed to generate document");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedReport(null);
    setDescription("");
    setLocation("");
    setMunicipality("");
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black px-4 py-2 rounded-full mb-6 uppercase tracking-[0.2em]"
          >
            <Sparkles className="w-3 h-3" /> Document Concierge AI
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Generate <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Official Documents.</span></h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Create professional, legally-sound reports and applications that demand results from government and municipal bodies.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {!generatedReport ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] shadow-2xl space-y-8 backdrop-blur-sm">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                      Describe your situation or complaint
                    </label>
                    <textarea
                      required
                      rows={6}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-700 focus:border-indigo-500 transition-all outline-none"
                      placeholder="e.g. My water bill has been incorrect for 3 months despite several visits..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                        Incident Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-white/10 rounded-2xl px-12 py-4 text-sm text-white placeholder-slate-700 focus:border-indigo-500 outline-none transition-all"
                          placeholder="Street address / suburb"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                        Municipality / Department
                      </label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-white/10 rounded-2xl px-12 py-4 text-sm text-white placeholder-slate-700 focus:border-indigo-500 outline-none transition-all"
                          placeholder="e.g. City of Tshwane / Ekurhuleni"
                          value={municipality}
                          onChange={(e) => setMunicipality(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        Draft Official Document <Send className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="bg-slate-900 border border-white/5 p-1 rounded-[2rem] overflow-hidden shadow-3xl">
                <div className="bg-indigo-600/5 p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight">QueueLess AI Concierge Report</h2>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest">ID: QL-{generatedReport.report_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-indigo-500/20">
                      LEGAL FORMAT VERIFIED
                    </span>
                  </div>
                </div>
                
                <div className="p-10 bg-white text-zinc-900 font-serif text-base whitespace-pre-wrap leading-relaxed min-h-[500px] shadow-inner">
                  {generatedReport.generated_report}
                </div>

                <div className="p-8 bg-slate-900/80 border-t border-white/5 flex flex-wrap gap-4">
                  <button 
                    onClick={() => window.print()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-3 shadow-lg transition-all"
                  >
                    <Download className="w-5 h-5" /> Export as PDF
                  </button>
                  <button 
                    onClick={handleReset}
                    className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-3 transition-all"
                  >
                    <Plus className="w-5 h-5" /> New Document
                  </button>
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2rem] flex gap-6">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Verified Professional Document.</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    This document has been saved to your QueueLess vault. You can now use this for formal escalations to the Public Protector, Ward Councillor, or as evidence in municipal disputes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
