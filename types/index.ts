// Type definitions for SDUI Platform

// Component property type definitions
export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'array'
  | 'object'
  | 'textarea'   // multi-line text
  | 'image'      // URL + preview
  | 'icon'       // searchable icon name picker
  | 'slider'     // range slider (uses min/max/step)
  | 'spacing';   // 4-value padding/margin box model

export interface PropertySchema {
  name: string;
  type: PropertyType;
  label: string;
  default?: unknown;
  required?: boolean;
  options?: Array<{ label: string; value: unknown }>;
  description?: string;
  category?: string;
  // For number / slider
  min?: number;
  max?: number;
  step?: number;
}

// Component definition in the registry
export interface ComponentDefinition {
  id: string;
  name: string;
  category: 'layout' | 'input' | 'display' | 'navigation' | 'form' | 'media';
  icon: string;
  description: string;
  properties: PropertySchema[];
  defaultProps?: Record<string, unknown>;
  supportedChildren?: string[]; // Component types that can be children
  allowChildren?: boolean;
}

// Layout node represents a component instance in the layout tree
export interface LayoutNode {
  id: string;
  componentType: string; // Reference to ComponentDefinition.id
  props: Record<string, unknown>;
  children: LayoutNode[];
  dataBindings?: Record<string, DataBinding>;
}

// Data binding configuration
export interface DataBinding {
  source: 'api' | 'variable' | 'static';
  path?: string; // JSON path or variable name
  apiEndpointId?: string;
  defaultValue?: unknown;
  transform?: string; // Expression for data transformation
}

// Project structure
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  layoutId: string;
  settings?: ProjectSettings;
}

export interface ProjectSettings {
  primaryColor?: string;
  secondaryColor?: string;
  devicePresets?: DevicePreset[];
  exportFormat?: 'json' | 'flutter' | 'react';
}

export interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: string;
}

// Layout represents the complete UI design
export interface Layout {
  id: string;
  projectId: string;
  name: string;
  rootNode: LayoutNode;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// API Endpoint configuration
export interface ApiEndpoint {
  id: string;
  projectId: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  responseSchema?: unknown;
  description?: string;
}

// Component library entry
export interface LibraryComponent {
  id: string;
  name: string;
  category: string;
  layoutNode: LayoutNode;
  thumbnail?: string;
  tags?: string[];
}

// Selection state
export interface SelectionState {
  selectedNodeId: string | null;
  selectedNodes: string[];
  hoveredNodeId: string | null;
}

// History entry for undo/redo
export interface HistoryEntry {
  layout: Layout;
  timestamp: Date;
  action: string;
}

// Export/Publish configuration
export interface ExportConfig {
  format: 'json' | 'flutter' | 'react';
  includeAssets?: boolean;
  minify?: boolean;
  prettify?: boolean;
}

// User-related types (for authentication)
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  plan: 'free' | 'pro' | 'enterprise';
}

// Component instance in builder (extends LayoutNode with metadata)
export interface ComponentInstance extends LayoutNode {
  metadata?: {
    locked?: boolean;
    hidden?: boolean;
    notes?: string;
  };
}

// ==================== ADMIN TYPES ====================

export type AdminRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type ProjectStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAUSED';
export type ComponentVisibility = 'PUBLIC' | 'PRIVATE' | 'BETA';

// Extended User interface for admin
export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: AdminRole;
  plan: UserPlan;
  status: UserStatus;
  apiKey?: string;
  projectCount: number;
  apiUsageCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// Subscription details
export interface Subscription {
  id: string;
  userId: string;
  plan: UserPlan;
  monthlyPrice: number;
  apiLimit: number;
  layoutLimit: number;
  teamLimit: number;
  startDate: Date;
  renewalDate: Date;
  status: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Extended Project for admin
export interface AdminProject {
  id: string;
  userId: string;
  userName?: string;
  name: string;
  apiKey: string;
  layoutCount: number;
  apiCallsCount: number;
  lastApiCall?: Date;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Platform Component
export interface PlatformComponent {
  id: string;
  name: string;
  category: 'layout' | 'input' | 'display' | 'navigation' | 'form' | 'media';
  propsSchema: PropertySchema[];
  defaultProps: Record<string, unknown>;
  version: string;
  visibility: ComponentVisibility;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// Template for quick layouts
export interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  layoutJson: LayoutNode;
  previewUrl?: string;
  published: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// Pricing Plan
export interface PricingPlan {
  id: string;
  name: string;
  slug: UserPlan;
  monthlyPrice: number;
  yearlyPrice?: number;
  apiLimit: number;
  layoutLimit: number;
  teamLimit: number;
  features: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  activeApps: number;
  totalApiRequests: number;
  monthlyRevenue: number;
  userGrowth: ChartDataPoint[];
  projectGrowth: ChartDataPoint[];
  apiUsageTrend: ChartDataPoint[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

// Activity Log
export interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  entityType: 'user' | 'project' | 'component' | 'template' | 'pricing';
  entityId: string;
  changes?: Record<string, unknown>;
  createdAt: Date;
}

// API Request Log
export interface ApiRequestLog {
  id: string;
  projectId: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  createdAt: Date;
}
