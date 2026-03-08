'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Zap, Globe, Shield, Terminal, Activity, ArrowRight, User, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { formatDistanceToNow } from 'date-fns';

interface ApiEndpoint {
  id: string;
  name: string;
  method: string;
  url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  project: {
    name: string;
  };
}

export default function ApiManagerPage() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEndpoints() {
      try {
        const response = await apiRequest<{ endpoints: ApiEndpoint[] }>('/api-endpoints');
        if (response.success) {
          setEndpoints(response.data.endpoints);
        }
      } catch (error) {
        console.error('Failed to fetch endpoints:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEndpoints();
  }, []);

  return (
    <div className="space-y-12 pb-20">
      {/* Header Cluster */}
      <motion.div
        {...({
          className: "flex flex-col md:flex-row items-start md:items-end justify-between gap-6 px-1",
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 }
        } as any)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">API Services</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            API <span className="text-primary">Management</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Manage your API endpoints and integrations across projects</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-all gap-2 border-none">
          <Plus className="w-4 h-4" />
          Add Endpoint
        </Button>
      </motion.div>

      {/* Gateway Table */}
      <motion.div
        {...({
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.2 },
          className: "rounded-2xl border border-border bg-card overflow-hidden backdrop-blur-3xl shadow-xl relative"
        } as any)}
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-8 py-5 text-sm font-bold text-foreground">Endpoint Name</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground text-center">Method</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground">Target URL</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground">Last Updated</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground text-right px-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Syncing Endpoints...</p>
                    </div>
                  </td>
                </tr>
              ) : endpoints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Terminal className="w-10 h-10 text-muted-foreground/20" />
                      <p className="text-sm font-bold text-muted-foreground/40">No API endpoints registered yet.</p>
                      <Button variant="outline" className="h-9 px-6 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        Create Your First Endpoint
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                endpoints.map((api) => (
                  <tr key={api.id} className="group hover:bg-muted/10 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{api.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest ml-4.5">{api.project.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <span className="px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10 text-primary text-[9px] font-black tracking-wider">
                          {api.method}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5 max-w-[300px]">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground/40" />
                        <span className="text-xs font-semibold text-muted-foreground/70 truncate">{api.url}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-muted-foreground/40">
                        {formatDistanceToNow(new Date(api.updatedAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-8 py-5 px-10">
                      <div className="flex justify-end gap-2">
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/5 hover:text-primary text-muted-foreground/40 transition-all border border-transparent hover:border-primary/10">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-destructive/5 hover:text-destructive text-muted-foreground/40 transition-all border border-transparent hover:border-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
