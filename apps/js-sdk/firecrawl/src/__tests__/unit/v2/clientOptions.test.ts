import { Firecrawl, type FirecrawlClientOptions } from '../../../index';
import axios from 'axios';

describe('Firecrawl v2 Client Options', () => {
  it('should accept v2 options including timeoutMs, maxRetries, and backoffFactor', () => {
    const options: FirecrawlClientOptions = {
      apiKey: 'test-key',
      timeoutMs: 300,
      maxRetries: 5,
      backoffFactor: 0.5,
    };

    // Should not throw any type errors
    const client = new Firecrawl(options);
    
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(Firecrawl);
  });

  it('should work with minimal options', () => {
    const options: FirecrawlClientOptions = {
      apiKey: 'test-key',
    };

    const client = new Firecrawl(options);
    
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(Firecrawl);
  });

  it('should work with all v2 options', () => {
    const options: FirecrawlClientOptions = {
      apiKey: 'test-key',
      apiUrl: 'https://custom-api.firecrawl.dev',
      timeoutMs: 60000,
      maxRetries: 3,
      backoffFactor: 1.0,
    };

    const client = new Firecrawl(options);
    
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(Firecrawl);
  });

  it('should export FirecrawlClientOptions type', () => {
    // This test ensures the type is properly exported
    const options: FirecrawlClientOptions = {
      apiKey: 'test-key',
      timeoutMs: 300,
    };

    expect(options.timeoutMs).toBe(300);
    expect(options.apiKey).toBe('test-key');
  });

  // Regression tests for https://github.com/mendableai/firecrawl/issues/2814
  describe('customHeaders option', () => {
    it('accepts customHeaders in FirecrawlClientOptions type', () => {
      const options: FirecrawlClientOptions = {
        apiKey: 'test-key',
        customHeaders: {
          'X-Proxy-Token': 'secret',
          'X-Custom-Auth': 'value',
        },
      };

      // TypeScript type check — should compile without error
      const client = new Firecrawl(options);
      expect(client).toBeDefined();
    });

    it('merges customHeaders into axios instance default headers', () => {
      // Spy on axios.create to capture the config passed to it
      const createSpy = jest.spyOn(axios, 'create');

      new Firecrawl({
        apiKey: 'fc-test',
        customHeaders: { 'X-Proxy-Token': 'proxy-secret' },
      });

      expect(createSpy).toHaveBeenCalled();
      const config = createSpy.mock.calls[createSpy.mock.calls.length - 1][0];
      expect(config?.headers?.['X-Proxy-Token']).toBe('proxy-secret');
      // The standard Authorization header must still be present
      expect(config?.headers?.['Authorization']).toBe('Bearer fc-test');

      createSpy.mockRestore();
    });

    it('works without customHeaders (no regression)', () => {
      const createSpy = jest.spyOn(axios, 'create');

      new Firecrawl({ apiKey: 'fc-no-custom' });

      const config = createSpy.mock.calls[createSpy.mock.calls.length - 1][0];
      expect(config?.headers?.['Authorization']).toBe('Bearer fc-no-custom');
      // No extra keys beyond Authorization
      const extraKeys = Object.keys(config?.headers ?? {}).filter(k => k !== 'Authorization');
      expect(extraKeys).toHaveLength(0);

      createSpy.mockRestore();
    });
  });
});

describe('Firecrawl v2 Client Options', () => {
  it('should accept v2 options including timeoutMs, maxRetries, and backoffFactor', () => {
    const options: FirecrawlClientOptions = {
      apiKey: 'test-key',
      timeoutMs: 300,
      maxRetries: 5,
      backoffFactor: 0.5,
    };

    // Should not throw any type errors
    const client = new Firecrawl(options);
    
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(Firecrawl);
  });

  it('should work with minimal options', () => {
    const options: FirecrawlClientOptions = {
      apiKey: 'test-key',
    };

    const client = new Firecrawl(options);
    
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(Firecrawl);
  });

  it('should work with all v2 options', () => {
    const options: FirecrawlClientOptions = {
      apiKey: 'test-key',
      apiUrl: 'https://custom-api.firecrawl.dev',
      timeoutMs: 60000,
      maxRetries: 3,
      backoffFactor: 1.0,
    };

    const client = new Firecrawl(options);
    
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(Firecrawl);
  });

  it('should export FirecrawlClientOptions type', () => {
    // This test ensures the type is properly exported
    const options: FirecrawlClientOptions = {
      apiKey: 'test-key',
      timeoutMs: 300,
    };

    expect(options.timeoutMs).toBe(300);
    expect(options.apiKey).toBe('test-key');
  });
});
