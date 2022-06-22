import type { AssetGlob } from '@nrwl/workspace/src/utilities/assets';

export interface BuildExecutorOptions {
  tsupConfig: string;
  outputPath: string;
  outputBasePath?: string;
  main: string;
  tsConfig: string;
  assets: Array<AssetGlob | string>;
  watch: boolean;
  updateBuildableProjectDepsInPackageJson: boolean;
  buildableProjectDepsInPackageJsonType?: 'dependencies' | 'peerDependencies';
}

export interface NormalizedBuildExecutorOptions extends BuildExecutorOptions {
  root: string;
  outDir: string;
  projectName: string;
  projectDir: string;
  projectRoot: string;
  mainOutputPath: string;
}
