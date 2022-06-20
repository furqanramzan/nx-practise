export interface VitestExecutorOptions {
  vitestConfig: string;
  command: string;
  testNamePattern?: string;
  passWithNoTests?: boolean;
}
