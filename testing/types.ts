/**
 * Testing Types for MyCar Portrait
 */

export type TestStatus = 'pending' | 'passed' | 'failed' | 'skipped';
export type TestPriority = 'P0' | 'P1' | 'P2';

export interface TestCase {
  id: string;
  name: string;
  steps: string[];
  expectedResult: string;
  actualResult: string | null;
  status: TestStatus;
  notes?: string;
  screenshots?: string[];
}

export interface TestSuite {
  name: string;
  priority: TestPriority;
  tests: TestCase[];
  environment?: TestEnvironment;
  deviceRequirements?: DeviceRequirements;
}

export interface TestResult {
  testId: string;
  status: TestStatus;
  timestamp: string;
  duration?: number;
  error?: Error;
  notes?: string;
  deviceInfo?: DeviceInfo;
}

export interface TestEnvironment {
  appVersion: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
  supabaseUrl: string;
  iapMode: 'sandbox' | 'production';
}

export interface DeviceRequirements {
  minIOSVersion: string;
  requiredFeatures?: string[];
  carPlayRequired?: boolean;
}

export interface DeviceInfo {
  model: string;
  osVersion: string;
  screenSize: string;
  hasCarPlay: boolean;
  locale: string;
}