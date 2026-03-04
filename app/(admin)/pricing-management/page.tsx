'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAdminStore } from '@/store/adminStore';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { PricingPlan } from '@/types';

export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const pricingPlans = useAdminStore((state) => state.pricingPlans);
  const setPricingPlans = useAdminStore((state) => state.setPricingPlans);
  const setPricingLoading = useAdminStore((state) => state.setPricingLoading);
  const updatePricingPlan = useAdminStore((state) => state.updatePricingPlan);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPricingPlans();
  }, []);

  async function loadPricingPlans() {
    setPricingLoading(true);
    setLoading(true);
    try {
      const response = await apiRequest<{ plans: PricingPlan[] }>('/admin/pricing');

      if (!response.success) {
        if (response.error === 'UNAUTHORIZED') {
          router.push('/login');
          return;
        }
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
        return;
      }

      setPricingPlans(response.data.plans);
    } catch (error) {
      console.error('Failed to load pricing plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pricing plans',
        variant: 'destructive',
      });
    } finally {
      setPricingLoading(false);
      setLoading(false);
    }
  }

  const handleEdit = (plan: PricingPlan) => {
    setEditingId(plan.id);
    setEditValues({
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      apiLimit: plan.apiLimit,
      layoutLimit: plan.layoutLimit,
      teamLimit: plan.teamLimit,
    });
  };

  async function handleSave(planId: string) {
    setSaving(true);
    try {
      const response = await apiRequest(`/admin/pricing/${planId}`, {
        method: 'PATCH',
        body: JSON.stringify(editValues),
      });

      if (!response.success) {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Pricing plan updated successfully',
      });

      updatePricingPlan(planId, editValues as Partial<PricingPlan>);
      setEditingId(null);
      await loadPricingPlans();
    } catch (error) {
      console.error('Failed to update pricing plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to update pricing plan',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">Pricing Plans</h1>
        <p className="text-muted-foreground mt-2">Manage subscription plans and features</p>
      </motion.div>

      {/* Plans Grid */}
      {pricingPlans.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">No pricing plans found</p>
          <p className="text-sm text-muted-foreground">
            Create pricing plans to get started with subscriptions
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              className={`border rounded-lg p-6 ${
                editingId === plan.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card/50 backdrop-blur-sm hover:border-primary/50'
              } transition-all`}
            >
              {editingId === plan.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Monthly Price ($)</label>
                      <Input
                        type="number"
                        value={editValues.monthlyPrice || ''}
                        onChange={(e) =>
                          setEditValues({ ...editValues, monthlyPrice: parseFloat(e.target.value) })
                        }
                        className="mt-1"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">API Limit</label>
                      <Input
                        type="number"
                        value={editValues.apiLimit || ''}
                        onChange={(e) =>
                          setEditValues({ ...editValues, apiLimit: parseInt(e.target.value) })
                        }
                        className="mt-1"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Layout Limit</label>
                      <Input
                        type="number"
                        value={editValues.layoutLimit || ''}
                        onChange={(e) =>
                          setEditValues({ ...editValues, layoutLimit: parseInt(e.target.value) })
                        }
                        className="mt-1"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Team Limit</label>
                      <Input
                        type="number"
                        value={editValues.teamLimit || ''}
                        onChange={(e) =>
                          setEditValues({ ...editValues, teamLimit: parseInt(e.target.value) })
                        }
                        className="mt-1"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      onClick={() => handleSave(plan.id)}
                      className="flex-1"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>

                  <div className="mb-4">
                    <span className="text-2xl font-bold">${plan.monthlyPrice}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Calls:</span>
                      <span className="font-medium">{plan.apiLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Layouts:</span>
                      <span className="font-medium">{plan.layoutLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Members:</span>
                      <span className="font-medium">{plan.teamLimit}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(plan)}
                    className="w-full"
                  >
                    Edit Plan
                  </Button>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
