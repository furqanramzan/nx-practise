import type {
  AssetGlob,
  FileInputOutput,
} from '@nrwl/workspace/src/utilities/assets';

export interface BuildExecutorOptions {
  entry: Array<string>;
  tsupConfig: string;
  outputPath: string;
  tsConfig: string;
  assets: Array<AssetGlob | string>;
  watch: boolean;
  updateBuildableProjectDepsInPackageJson: boolean;
  buildableProjectDepsInPackageJsonType?: 'dependencies' | 'peerDependencies';
}

export interface NormalizedExecutorOptions extends BuildExecutorOptions {
  root?: string;
  sourceRoot?: string;
  projectRoot?: string;
  mainOutputPath: string;
  files: Array<FileInputOutput>;
}
