import { describe, it, expect } from 'vitest';
import { getRendererInfo } from '../utils/webgpu';

describe('webgpu utilities', () => {
  describe('getRendererInfo', () => {
    it('should return renderer info object', () => {
      const info = getRendererInfo();
      expect(info).toHaveProperty('webgpu');
      expect(info).toHaveProperty('fallback');
      expect(typeof info.webgpu).toBe('boolean');
      expect(typeof info.fallback).toBe('string');
    });

    it('should report WebGL2 fallback when WebGPU not available', () => {
      // jsdom doesn't have WebGPU
      const info = getRendererInfo();
      expect(info.webgpu).toBe(false);
      expect(info.fallback).toBe('WebGL2');
    });
  });
});
