import { create } from 'zustand';
import type {
  AdminUser,
  AdminProject,
  DashboardStats,
  ActivityLog,
  PlatformComponent,
  Template,
  PricingPlan,
  Subscription,
  ChartDataPoint,
} from '@/types';

interface AdminState {
  // Auth & User
  currentAdmin: AdminUser | null;
  isAuthenticated: boolean;
  setCurrentAdmin: (admin: AdminUser | null) => void;

  // Dashboard Stats
  stats: DashboardStats | null;
  setStats: (stats: DashboardStats) => void;

  // Users Management
  users: AdminUser[];
  usersLoading: boolean;
  usersPagination: { page: number; limit: number; total: number };
  usersFilter: { status?: string; plan?: string; search?: string };
  setUsers: (users: AdminUser[]) => void;
  setUsersLoading: (loading: boolean) => void;
  setUsersPagination: (pagination: { page: number; limit: number; total: number }) => void;
  setUsersFilter: (filter: { status?: string; plan?: string; search?: string }) => void;
  updateUser: (userId: string, updates: Partial<AdminUser>) => void;
  deleteUser: (userId: string) => void;

  // Projects Management
  projects: AdminProject[];
  projectsLoading: boolean;
  projectsPagination: { page: number; limit: number; total: number };
  projectsFilter: { status?: string; owner?: string; search?: string };
  setProjects: (projects: AdminProject[]) => void;
  setProjectsLoading: (loading: boolean) => void;
  setProjectsPagination: (pagination: { page: number; limit: number; total: number }) => void;
  setProjectsFilter: (filter: { status?: string; owner?: string; search?: string }) => void;
  suspendProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;

  // Components Management
  components: PlatformComponent[];
  componentsLoading: boolean;
  setComponents: (components: PlatformComponent[]) => void;
  setComponentsLoading: (loading: boolean) => void;
  addComponent: (component: PlatformComponent) => void;
  updateComponent: (componentId: string, updates: Partial<PlatformComponent>) => void;
  deleteComponent: (componentId: string) => void;

  // Templates Management
  templates: Template[];
  templatesLoading: boolean;
  setTemplates: (templates: Template[]) => void;
  setTemplatesLoading: (loading: boolean) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (templateId: string, updates: Partial<Template>) => void;
  deleteTemplate: (templateId: string) => void;

  // Pricing Plans
  pricingPlans: PricingPlan[];
  pricingLoading: boolean;
  setPricingPlans: (plans: PricingPlan[]) => void;
  setPricingLoading: (loading: boolean) => void;
  updatePricingPlan: (planId: string, updates: Partial<PricingPlan>) => void;

  // Subscriptions
  subscriptions: Subscription[];
  setSubscriptions: (subscriptions: Subscription[]) => void;

  // Activity Log
  activityLog: ActivityLog[];
  setActivityLog: (log: ActivityLog[]) => void;
  addActivityLog: (entry: ActivityLog) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // Auth & User
  currentAdmin: null,
  isAuthenticated: false,
  setCurrentAdmin: (admin) => set({ currentAdmin: admin, isAuthenticated: !!admin }),

  // Dashboard Stats
  stats: null,
  setStats: (stats) => set({ stats }),

  // Users Management
  users: [],
  usersLoading: false,
  usersPagination: { page: 1, limit: 20, total: 0 },
  usersFilter: {},
  setUsers: (users) => set({ users }),
  setUsersLoading: (loading) => set({ usersLoading: loading }),
  setUsersPagination: (pagination) => set({ usersPagination: pagination }),
  setUsersFilter: (filter) => set({ usersFilter: filter }),
  updateUser: (userId, updates) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
    })),
  deleteUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),

  // Projects Management
  projects: [],
  projectsLoading: false,
  projectsPagination: { page: 1, limit: 20, total: 0 },
  projectsFilter: {},
  setProjects: (projects) => set({ projects }),
  setProjectsLoading: (loading) => set({ projectsLoading: loading }),
  setProjectsPagination: (pagination) => set({ projectsPagination: pagination }),
  setProjectsFilter: (filter) => set({ projectsFilter: filter }),
  suspendProject: (projectId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, status: 'SUSPENDED' as const } : p
      ),
    })),
  deleteProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
    })),

  // Components Management
  components: [],
  componentsLoading: false,
  setComponents: (components) => set({ components }),
  setComponentsLoading: (loading) => set({ componentsLoading: loading }),
  addComponent: (component) =>
    set((state) => ({
      components: [component, ...state.components],
    })),
  updateComponent: (componentId, updates) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === componentId ? { ...c, ...updates } : c
      ),
    })),
  deleteComponent: (componentId) =>
    set((state) => ({
      components: state.components.filter((c) => c.id !== componentId),
    })),

  // Templates Management
  templates: [],
  templatesLoading: false,
  setTemplates: (templates) => set({ templates }),
  setTemplatesLoading: (loading) => set({ templatesLoading: loading }),
  addTemplate: (template) =>
    set((state) => ({
      templates: [template, ...state.templates],
    })),
  updateTemplate: (templateId, updates) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId ? { ...t, ...updates } : t
      ),
    })),
  deleteTemplate: (templateId) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== templateId),
    })),

  // Pricing Plans
  pricingPlans: [],
  pricingLoading: false,
  setPricingPlans: (plans) => set({ pricingPlans: plans }),
  setPricingLoading: (loading) => set({ pricingLoading: loading }),
  updatePricingPlan: (planId, updates) =>
    set((state) => ({
      pricingPlans: state.pricingPlans.map((p) =>
        p.id === planId ? { ...p, ...updates } : p
      ),
    })),

  // Subscriptions
  subscriptions: [],
  setSubscriptions: (subscriptions) => set({ subscriptions }),

  // Activity Log
  activityLog: [],
  setActivityLog: (log) => set({ activityLog: log }),
  addActivityLog: (entry) =>
    set((state) => ({
      activityLog: [entry, ...state.activityLog].slice(0, 100), // Keep last 100
    })),

  // UI State
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
