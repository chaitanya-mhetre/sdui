'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Trash2, Save } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [featureFlags, setFeatureFlags] = useState({
    enableBeta: true,
    enableAnalytics: true,
    enableCustomComponents: false,
    enableWebhooks: true,
    enableExport: true,
  });

  const [config, setConfig] = useState({
    maxProjects: 100,
    maxUsers: 1000,
    apiRateLimit: 10000,
  });

  const handleFlagToggle = (flag: keyof typeof featureFlags) => {
    setFeatureFlags((prev) => ({
      ...prev,
      [flag]: !prev[flag],
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure platform settings and features</p>
      </motion.div>

      {/* Settings Grid */}
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Feature Flags */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6">Feature Flags</h2>

            <div className="space-y-4">
              {Object.entries(featureFlags).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div>
                    <p className="font-medium capitalize">
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {key === 'enableBeta'
                        ? 'Allow beta features for users'
                        : key === 'enableAnalytics'
                          ? 'Enable platform analytics'
                          : key === 'enableCustomComponents'
                            ? 'Allow custom component uploads'
                            : key === 'enableWebhooks'
                              ? 'Enable webhook system'
                              : 'Allow layout export functionality'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={() => handleFlagToggle(key as keyof typeof featureFlags)}
                  />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Platform Configuration */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6">Platform Configuration</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Max Projects Per User</label>
                <Input
                  type="number"
                  value={config.maxProjects}
                  onChange={(e) => setConfig({ ...config, maxProjects: parseInt(e.target.value) })}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Max Users</label>
                <Input
                  type="number"
                  value={config.maxUsers}
                  onChange={(e) => setConfig({ ...config, maxUsers: parseInt(e.target.value) })}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">API Rate Limit (requests/day)</label>
                <Input
                  type="number"
                  value={config.apiRateLimit}
                  onChange={(e) => setConfig({ ...config, apiRateLimit: parseInt(e.target.value) })}
                  className="mt-2"
                />
              </div>

              <div className="pt-4">
                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* System Logs */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6">System Maintenance</h2>

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                View System Logs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Clear Cache
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
