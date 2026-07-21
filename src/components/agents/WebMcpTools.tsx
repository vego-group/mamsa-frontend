'use client';

import { useEffect } from 'react';
import { unitsApi } from '@/lib/api/client';
import type { Unit } from '@/types';

/**
 * WebMCP — exposes read-only catalogue tools to an AI agent running inside the
 * user's browser (https://webmachinelearning.github.io/webmcp/).
 *
 * Deliberately read-only, matching the posture of the server-side MCP server at
 * /mcp: these tools run in the page with the visitor's own session, so a tool
 * that booked or paid would let an agent spend a logged-in user's money without
 * them acting. Searching and reading listings exposes nothing the visitor isn't
 * already looking at.
 *
 * Entirely feature-detected and inert: no current stable browser ships WebMCP,
 * so for real visitors today this registers nothing and costs one property
 * lookup. The spec uses `document.modelContext.registerTool`; Chrome's earlier
 * preview shape was `navigator.modelContext.provideContext`, so we support both
 * rather than guess which a given agent runtime implements.
 */

interface ToolDescriptor {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean };
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

interface ModelContextLike {
  registerTool?: (tool: ToolDescriptor, options?: { signal?: AbortSignal }) => Promise<unknown>;
  provideContext?: (context: { tools: ToolDescriptor[] }) => unknown;
}

/** Trim a listing to what an agent needs to compare options and link out. */
const summarize = (u: Unit) => ({
  id: u.id,
  title: u.title,
  type: u.type,
  city: u.city,
  district: u.district || undefined,
  pricePerNight: u.pricePerNight,
  currency: 'SAR',
  capacity: u.capacity,
  bedrooms: u.bedrooms,
  beds: u.beds,
  bathrooms: u.bathrooms,
  rating: u.rating,
  reviewCount: u.reviewCount,
  amenities: u.amenities.map((a) => a.labelAr),
  url: `${window.location.origin}/units/${u.id}`,
});

const asNumber = (v: unknown): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

const TOOLS: ToolDescriptor[] = [
  {
    name: 'search_units',
    title: 'Search Mamsa listings',
    description:
      'Search Mamsa short-term rental listings in Saudi Arabia by city, unit type, guest capacity and nightly price. Returns matching listings with pricing and a link to each one.',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name in Arabic, e.g. "الرياض" or "جدة".' },
        type: { type: 'string', enum: ['apartment', 'studio', 'villa'], description: 'Unit type.' },
        capacity: { type: 'integer', description: 'Minimum number of guests the unit must sleep.' },
        maxPrice: { type: 'number', description: 'Maximum nightly price in SAR.' },
      },
    },
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      const units = await unitsApi.list({
        city: typeof input.city === 'string' ? input.city : undefined,
        type: input.type as 'apartment' | 'studio' | 'villa' | undefined,
        capacity: asNumber(input.capacity),
        maxPrice: asNumber(input.maxPrice),
      });
      return { count: units.length, units: units.map(summarize) };
    },
  },
  {
    name: 'get_unit',
    title: 'Get a Mamsa listing',
    description:
      'Fetch one Mamsa listing by id: description, amenities, check-in/out times, cancellation policy and rating.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Listing id, as returned by search_units.' } },
      required: ['id'],
    },
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      const unit = await unitsApi.getById(String(input.id));
      return {
        ...summarize(unit),
        description: unit.description,
        checkInTime: unit.checkInTime,
        checkOutTime: unit.checkOutTime,
        cancellationPolicy: unit.cancellationPolicy,
      };
    },
  },
];

export function WebMcpTools() {
  useEffect(() => {
    const ctx: ModelContextLike | undefined =
      (document as unknown as { modelContext?: ModelContextLike }).modelContext ??
      (navigator as unknown as { modelContext?: ModelContextLike }).modelContext;

    if (!ctx) return;

    // Current spec: register each tool, aborting on unmount.
    if (typeof ctx.registerTool === 'function') {
      const controller = new AbortController();
      for (const tool of TOOLS) {
        // Rejects on a duplicate name (e.g. React 18 strict-mode double effect) —
        // harmless, and never worth surfacing to a visitor.
        void ctx.registerTool(tool, { signal: controller.signal })?.catch(() => {});
      }
      return () => controller.abort();
    }

    // Earlier preview shape: hand over the whole set at once.
    if (typeof ctx.provideContext === 'function') {
      try {
        ctx.provideContext({ tools: TOOLS });
      } catch {
        /* agent runtime rejected the set — nothing a visitor can act on */
      }
    }
  }, []);

  return null;
}
