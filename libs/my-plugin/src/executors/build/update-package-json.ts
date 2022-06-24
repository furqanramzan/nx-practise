import {
  ExecutorContext,
  normalizePath,
  ProjectGraphProjectNode,
  readJsonFile,
  writeJsonFile,
} from '@nrwl/devkit';
import {
  DependentBuildableProjectNode,
  updateBuildableProjectPackageJsonDependencies,
} from '@nrwl/workspace/src/utilities/buildable-libs-utils';
import { basename, dirname, join, relative } from 'path';
import { NormalizedBuildExecutorOptions } from './schema';
import { fileExists } from 'nx/src/utils/fileutils';

type PackageExports = { require: string; import: string } | string;

function getMainFileDirRelativeToProjectRoot(
  main: string,
  projectRoot: string
): string {
  const mainFileDir = dirname(main);
  const relativeDir = normalizePath(relative(projectRoot, mainFileDir));
  return relativeDir === '' ? `./` : `./${relativeDir}/`;
}

function addFilesInPackageJson(
  options: NormalizedBuildExecutorOptions,
  context: ExecutorContext,
  packageJson: any
): void {
  const mainFile = basename(options.main).replace(/\.[tj]s$/, '');
  const relativeMainFileDir = getMainFileDirRelativeToProjectRoot(
    options.main,
    options.projectRoot
  );
  const relativeMainFilePath = relativeMainFileDir + mainFile;
  const jsFile = `${relativeMainFilePath}.js`;
  const mjsFile = `${relativeMainFilePath}.mjs`;
  const tsFile = `${relativeMainFilePath}.d.ts`;
  let packageMain = '';
  let packageExports: PackageExports = '';
  const outputPath = join(context.root, options.outputPath);
  const jsExist = fileExists(join(outputPath, jsFile));
  const mjsExist = fileExists(join(outputPath, mjsFile));
  if (fileExists(join(outputPath, tsFile))) {
    packageJson.typings = packageJson.typings ?? tsFile;
  }
  if (jsExist && mjsExist) {
    packageMain = jsFile;
    packageExports = {
      import: mjsFile,
      require: jsFile,
    };
  } else if (jsExist) {
    packageMain = jsFile;
    packageExports = jsFile;
  } else if (mjsExist) {
    packageMain = mjsFile;
    packageExports = mjsFile;
  }
  if (packageMain && !packageJson.main) {
    packageJson.main = packageMain;
  }
  if (packageExports && !packageJson.exports) {
    packageJson.exports = packageExports;
  }
}

export function updatePackageJson(
  options: NormalizedBuildExecutorOptions,
  context: ExecutorContext,
  target: ProjectGraphProjectNode<any>,
  dependencies: DependentBuildableProjectNode[]
): void {
  const pathToPackageJson = join(options.projectDir, 'package.json');

  const packageJson = fileExists(pathToPackageJson)
    ? readJsonFile(pathToPackageJson)
    : { name: context.projectName };
  addFilesInPackageJson(options, context, packageJson);
  writeJsonFile(`${options.outputPath}/package.json`, packageJson);
  const projectName = context.projectName || '';
  const targetName = context.targetName || '';
  const configurationName = context.configurationName || '';

  if (
    dependencies.length > 0 &&
    options.updateBuildableProjectDepsInPackageJson
  ) {
    updateBuildableProjectPackageJsonDependencies(
      context.root,
      projectName,
      targetName,
      configurationName,
      target,
      dependencies,
      options.buildableProjectDepsInPackageJsonType
    );
  }
}
