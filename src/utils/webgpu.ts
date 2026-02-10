export async function detectWebGPU(): Promise<boolean> {
  if (!navigator.gpu) {
    return false;
  }
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

export function getRendererInfo(): { webgpu: boolean; fallback: string } {
  const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;
  return {
    webgpu: hasWebGPU,
    fallback: hasWebGPU ? 'WebGPU' : 'WebGL2',
  };
}
