import bcrypt from 'bcryptjs';
import { prisma } from './db';
import type { UserRole, UserPlan, UserStatus } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
  const prefix = 'sdui_';
  const crypto = require('crypto');
  const randomPart = crypto.randomBytes(32).toString('hex');
  return `${prefix}${randomPart}`;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      role: true,
      plan: true,
      status: true,
      apiKey: true,
      createdAt: true,
      updatedAt: true,
      lastLogin: true,
    },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      status: true,
      apiKey: true,
      createdAt: true,
      updatedAt: true,
      lastLogin: true,
    },
  });
}

/**
 * Get user by API key
 */
export async function getUserByApiKey(apiKey: string) {
  return prisma.user.findUnique({
    where: { apiKey },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      status: true,
      apiKey: true,
      createdAt: true,
      updatedAt: true,
      lastLogin: true,
    },
  });
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  name?: string;
  password: string;
  role?: UserRole;
  plan?: UserPlan;
}) {
  const passwordHash = await hashPassword(data.password);
  const apiKey = generateApiKey();

  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      role: data.role || 'USER',
      plan: data.plan || 'FREE',
      apiKey,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      status: true,
      apiKey: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Update user's last login
 */
export async function updateLastLogin(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });
}

/**
 * Check if user is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

/**
 * Verify user is active
 */
export function isUserActive(status: UserStatus): boolean {
  return status === 'ACTIVE';
}
