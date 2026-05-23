/**
 * scripts/seed-flutter-components.ts
 *
 * Iterates BUILT_IN_COMPONENTS from componentRegistry and upserts every entry
 * into the platform_components table.  Safe to re-run: existing rows are
 * updated, missing rows are created.
 *
 * Run with:  pnpm seed:components
 */

import { PrismaClient } from '@prisma/client';
import { BUILT_IN_COMPONENTS } from '@/lib/componentRegistry';
import type { ComponentDefinition } from '@/types';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps a ComponentDefinition's children spec to the DB childMode string.
 * Defaults to 'multi' when children is undefined (permissive container).
 */
function arityToChildMode(
  spec: ComponentDefinition['children'],
): 'none' | 'single' | 'multi' | 'slots' {
  if (!spec) return 'multi';
  const mode = spec.mode;
  if (mode === 'none') return 'none';
  if (mode === 'single') return 'single';
  if (mode === 'multi') return 'multi';
  if (mode === 'slots') return 'slots';
  return 'multi';
}

/**
 * Maps a registry category string to the ComponentCategory Prisma enum value.
 * The enum values ARE lowercase (layout, display, input, navigation, media, form).
 * Unknown categories fall back to 'display'.
 */
function toCategory(
  cat: string,
): 'layout' | 'input' | 'display' | 'navigation' | 'form' | 'media' {
  const valid = new Set(['layout', 'input', 'display', 'navigation', 'form', 'media']);
  if (valid.has(cat)) return cat as ReturnType<typeof toCategory>;
  console.warn(`  ⚠  Unknown category "${cat}" — falling back to "display"`);
  return 'display';
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seedFlutterComponents() {
  console.log('Seeding Flutter UI components from componentRegistry...\n');

  const defs = Object.values(BUILT_IN_COMPONENTS);
  console.log(`Registry contains ${defs.length} component(s).\n`);

  let created = 0;
  let updated = 0;

  for (const def of defs) {
    const category = toCategory(def.category);
    const childMode = arityToChildMode(def.children);
    const propsSchema = (def.properties ?? []) as unknown as object;
    const defaultProps = (def.defaultProps ?? {}) as unknown as object;

    // PlatformComponent.name has no @unique constraint, so we use findFirst + branch.
    const existing = await prisma.platformComponent.findFirst({
      where: { name: def.id },
      select: { id: true },
    });

    if (existing) {
      await prisma.platformComponent.update({
        where: { id: existing.id },
        data: {
          category,
          propsSchema,
          defaultProps,
          childMode,
          // bump patch version so dashboards can detect the refresh
          version: '1.1.0',
        },
      });
      console.log(`  updated  ${def.id}`);
      updated++;
    } else {
      await prisma.platformComponent.create({
        data: {
          name: def.id,
          category,
          propsSchema,
          defaultProps,
          childMode,
          version: '1.0.0',
          visibility: 'PUBLIC',
        },
      });
      console.log(`  created  ${def.id}`);
      created++;
    }
  }

  console.log(
    `\nDone. ${created} created, ${updated} updated (${created + updated} total).`,
  );
}

// ─── Entrypoint ───────────────────────────────────────────────────────────────

seedFlutterComponents()
  .then(() => {
    console.log('Seed completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
