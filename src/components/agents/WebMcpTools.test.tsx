import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { WebMcpTools } from './WebMcpTools';

const UNITS = [
  { id: 'U-1', title: 'شقة', type: 'apartment', city: 'الرياض', district: 'الملقا', pricePerNight: 450,
    capacity: 4, bedrooms: 2, beds: 3, bathrooms: 2, rating: 4.8, reviewCount: 10,
    amenities: [{ key: 'wifi', labelAr: 'واي فاي' }], checkInTime: '15:00', checkOutTime: '12:00',
    cancellationPolicy: 'moderate', description: 'وصف' },
];

vi.mock('@/lib/api/client', () => ({
  unitsApi: {
    list: vi.fn(async () => UNITS),
    getById: vi.fn(async () => UNITS[0]),
  },
}));

type Tool = {
  name: string;
  annotations?: { readOnlyHint?: boolean };
  inputSchema?: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
};

type RegisterToolMock = (tool: Tool, options: { signal: AbortSignal }) => Promise<void>;

function stubContext(shape: 'registerTool' | 'provideContext') {
  const registered: Tool[] = [];
  const registerTool = vi.fn<RegisterToolMock>(async (t) => void registered.push(t));
  const provideContext = vi.fn((c: { tools: Tool[] }) => void registered.push(...c.tools));
  const ctx = shape === 'registerTool' ? { registerTool } : { provideContext };

  Object.defineProperty(document, 'modelContext', { value: ctx, configurable: true, writable: true });
  return { registered, registerTool, provideContext };
}

/** Indexing the array directly trips noUncheckedIndexedAccess; fail loudly instead. */
function toolNamed(registered: Tool[], name: string): Tool {
  const tool = registered.find((t) => t.name === name);
  if (!tool) throw new Error(`tool "${name}" was never registered`);
  return tool;
}

afterEach(() => {
  cleanup();
  // @ts-expect-error — removing the stub between cases
  delete document.modelContext;
  vi.clearAllMocks();
});

describe('WebMcpTools', () => {
  it('registers nothing and does not throw when the browser has no WebMCP', async () => {
    expect(() => render(<WebMcpTools />)).not.toThrow();
  });

  it('registers the catalogue tools via the spec API', async () => {
    const { registered } = stubContext('registerTool');
    await act(async () => { render(<WebMcpTools />); });
    expect(registered.map((t) => t.name)).toEqual(['search_units', 'get_unit']);
  });

  it('falls back to the earlier provideContext shape', async () => {
    const { registered } = stubContext('provideContext');
    await act(async () => { render(<WebMcpTools />); });
    expect(registered.map((t) => t.name)).toEqual(['search_units', 'get_unit']);
  });

  // These tools run in the page with the visitor's own session, so every one of
  // them must be read-only — a mutating tool would let an agent act as the user.
  it('marks every tool read-only', async () => {
    const { registered } = stubContext('registerTool');
    await act(async () => { render(<WebMcpTools />); });
    for (const tool of registered) expect(tool.annotations?.readOnlyHint).toBe(true);
  });

  it('returns summarized listings with an absolute url from search_units', async () => {
    const { registered } = stubContext('registerTool');
    await act(async () => { render(<WebMcpTools />); });

    const result = (await toolNamed(registered, 'search_units').execute({ city: 'الرياض' })) as {
      count: number;
      units: { url: string; beds: number; amenities: string[] }[];
    };
    expect(result.count).toBe(1);
    expect(result.units).toHaveLength(1);
    expect(result.units[0]).toMatchObject({
      url: `${window.location.origin}/units/U-1`,
      beds: 3,
      amenities: ['واي فاي'],
    });
  });

  it('unregisters on unmount', async () => {
    const { registerTool } = stubContext('registerTool');
    const { unmount } = render(<WebMcpTools />);
    await act(async () => {});

    const firstCall = registerTool.mock.calls[0];
    expect(firstCall).toBeDefined();
    const signal = firstCall![1].signal;
    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });
});
