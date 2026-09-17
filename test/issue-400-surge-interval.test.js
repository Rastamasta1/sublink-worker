import { describe, it, expect } from 'vitest';
import { SurgeConfigBuilder } from '../src/builders/SurgeConfigBuilder.js';

// Issue #400: SurgeConfigBuilder's managed-config update interval should
// default to 43200, accept a valid custom value, and fall back to the
// default when given an invalid value (non-numeric or negative).
describe('Issue #400 - Surge managed-config update interval', () => {
    const makeBuilder = () => new SurgeConfigBuilder(
        'not-a-valid-subscription',
        [],
        [],
        null,
        'zh-CN'
    );

    it('defaults to interval=43200 when setUpdateInterval is never called', async () => {
        const builder = makeBuilder();
        builder.setSubscriptionUrl('https://example.com/surge?config=x');

        await builder.build();
        const result = builder.formatConfig();

        expect(result).toContain('interval=43200 strict=false');
    });

    it('uses the custom interval after setUpdateInterval(\'1800\')', async () => {
        const builder = makeBuilder();
        builder.setSubscriptionUrl('https://example.com/surge?config=x');
        builder.setUpdateInterval('1800');

        await builder.build();
        const result = builder.formatConfig();

        expect(result).toContain('interval=1800');
        expect(result).toContain('interval=1800 strict=false');
        expect(result).not.toContain('interval=43200 strict=false');
    });

    it('falls back to interval=43200 when setUpdateInterval(\'abc\') is invalid', async () => {
        const builder = makeBuilder();
        builder.setSubscriptionUrl('https://example.com/surge?config=x');
        builder.setUpdateInterval('abc');

        await builder.build();
        const result = builder.formatConfig();

        expect(result).toContain('interval=43200 strict=false');
    });

    it('falls back to interval=43200 when setUpdateInterval(\'-5\') is invalid', async () => {
        const builder = makeBuilder();
        builder.setSubscriptionUrl('https://example.com/surge?config=x');
        builder.setUpdateInterval('-5');

        await builder.build();
        const result = builder.formatConfig();

        expect(result).toContain('interval=43200 strict=false');
    });
});
