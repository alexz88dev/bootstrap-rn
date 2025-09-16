export default {
  scanText(): Promise<{ text: string; pageCount: number }> {
    throw new Error('VisionKitScanner.scanText not implemented');
  },
  isSupported(): boolean {
    return false;
  }
};
