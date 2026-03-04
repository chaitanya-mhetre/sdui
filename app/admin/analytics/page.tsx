'use client';

import { motion } from 'framer-motion';
import { AdminChart } from '@/components/admin/AdminChart';

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

export default function AnalyticsPage() {
  const topComponentsData = [
    { date: 'Container', value: 8234 },
    { date: 'Button', value: 6123 },
    { date: 'Text', value: 5432 },
    { date: 'Image', value: 4234 },
    { date: 'HStack', value: 3123 },
  ];

  const templateUsageData = [
    { date: 'Ecommerce', value: 456 },
    { date: 'Dashboard', value: 389 },
    { date: 'Landing', value: 267 },
    { date: 'Mobile', value: 189 },
    { date: 'Admin', value: 123 },
  ];

  const apiRequestsData = [
    { date: 'Jan', value: 12000 },
    { date: 'Feb', value: 19000 },
    { date: 'Mar', value: 28000 },
    { date: 'Apr', value: 38000 },
    { date: 'May', value: 45000 },
  ];

  const activeProjectsData = [
    { date: 'Jan', value: 234 },
    { date: 'Feb', value: 567 },
    { date: 'Mar', value: 892 },
    { date: 'Apr', value: 1234 },
    { date: 'May', value: 1567 },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">Platform insights and usage statistics</p>
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div variants={itemVariants}>
          <AdminChart
            title="Top Components Used"
            data={topComponentsData}
            dataKey="value"
            height={300}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <AdminChart
            title="Template Usage"
            data={templateUsageData}
            dataKey="value"
            height={300}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <AdminChart
            title="API Requests Over Time"
            data={apiRequestsData}
            dataKey="value"
            height={300}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <AdminChart
            title="Active Projects Growth"
            data={activeProjectsData}
            dataKey="value"
            height={300}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
