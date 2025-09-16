import VisionKitScannerModule from './VisionKitScannerModule';

export interface ScanResult {
  text: string;
  pageCount: number;
}

/**
 * Launches the native iOS document scanner with OCR
 * @returns Promise with scanned text and page count
 */
export async function scanText(): Promise<ScanResult> {
  return VisionKitScannerModule.scanText();
}

/**
 * Check if document scanning is supported on this device
 */
export function isSupported(): boolean {
  // Only supported on iOS 13+
  return VisionKitScannerModule.isSupported?.() ?? false;
}
