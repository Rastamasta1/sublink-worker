import { describe, it, expect } from 'vitest';
import { SurgeConfigBuilder } from '../src/builders/SurgeConfigBuilder.js';

// Covers the templated managed-config update interval: setUpdateInterval() validates
// and assigns, formatConfig() interpolates this.updateInterval into the
// #!MANAGED-CONFIG line instead of a hardcoded 43200.
describe('SurgeConfigBuilder update interval', () => {
    const input = 'ss://YWVzLTI1Ni1nY206dGVzdA==@us1.example.com:8388#US-Node-1';

    it('defaults to interval=43200 when setUpdateInterval is never called', async () => {
        const builder = new SurgeConfigBuilder(input, 'minimal', [], null, 'zh-CN', null, false);
        builder.setSubscriptionUrl('https://example.com/surge?config=abc');

        const result = await builder.build();

        expect(result).toContain('#!MANAGED-CONFIG https://example.com/surge?config=abc interval=43200 strict=false');
    });

    it('reflects a valid custom interval in the MANAGED-CONFIG line', async () => {
        const builder = new SurgeConfigBuilder(input, 'minimal', [], null, 'zh-CN', null, false);
        builder.setSubscriptionUrl('https://example.com/surge?config=abc');
        builder.setUpdateInterval(3600);

        const result = await builder.build();

        expect(result).toContain('interval=3600 strict=false');
        expect(result).not.toContain('interval=43200 strict=false');
    });

    it('accepts a numeric string and coerces it', async () => {
        const builder = new SurgeConfigBuilder(input, 'minimal', [], null, 'zh-CN', null, false);
        builder.setSubscriptionUrl('https://example.com/surge?config=abc');
        builder.setUpdateInterval('7200');

        const result = await builder.build();

        expect(result).toContain('interval=7200 strict=false');
    });

    it('ignores invalid values and keeps the default of 43200', async () => {
        const builder = new SurgeConfigBuilder(input, 'minimal', [], null, 'zh-CN', null, false);
        builder.setSubscriptionUrl('https://example.com/surge?config=abc');

        builder.setUpdateInterval('not-a-number');
        builder.setUpdateInterval(0);
        builder.setUpdateInterval(-5);
        builder.setUpdateInterval(1.5);
        builder.setUpdateInterval(undefined);
        builder.setUpdateInterval('');

        const result = await builder.build();

        expect(result).toContain('interval=43200 strict=false');
    });

    it('does not emit a MANAGED-CONFIG line at all when no subscription URL is set', async () => {
        const builder = new SurgeConfigBuilder(input, 'minimal', [], null, 'zh-CN', null, false);
        builder.setUpdateInterval(1800);

        const result = await builder.build();

        expect(result).not.toContain('MANAGED-CONFIG');
    });

    it('setUpdateInterval returns the builder instance for chaining', () => {
        const builder = new SurgeConfigBuilder(input, 'minimal', [], null, 'zh-CN', null, false);

        const returned = builder.setUpdateInterval(600);

        expect(returned).toBe(builder);
    });
});
