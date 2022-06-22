import { BuildExecutorOptions, NormalizedBuildExecutorOptions } from './schema';
import { join, resolve } from 'path';
import { ExecutorContext, ProjectGraphProjectNode } from '@nrwl/devkit';
import { CopyAssetsHandler } from '@nrwl/js/src/utils/copy-assets-handler';
import { checkDependencies } from '@nrwl/js/src/utils/check-dependencies';
import { updatePackageJson } from './update-package-json';
// import { DependentBuildableProjectNode } from '@nrwl/workspace/src/utilities/buildable-libs-utils';
import { default as runCommands } from '@nrwl/workspace/src/executors/run-commands/run-commands.impl';

export function normalizeOptions(
  options: BuildExecutorOptions,
  context: ExecutorContext
): NormalizedBuildExecutorOptions {
  const root = context.root;
  const projectName = context.projectName || '';
  const projectDir = context.workspace.projects[projectName].root;
  const projectRoot = join(context.root, projectDir);
  const outDir = join(
    context.root,
    options.outputPath,
    options.outputBasePath || ''
  );
  const mainOutputPath = resolve(
    outDir,
    options.main.replace(`${projectRoot}/`, '').replace('.ts', '.js')
  );
  options.tsupConfig = options.tsupConfig
    ? join(root, options.tsupConfig)
    : join(projectRoot, 'tsup.config.ts');

  return {
    ...options,
    root,
    outDir,
    projectName,
    projectDir,
    projectRoot,
    mainOutputPath,
  };
}

export async function buildExecutor(
  _options: BuildExecutorOptions,
  context: ExecutorContext
) {
  const options = normalizeOptions(_options, context);
  const {
    projectRoot,
    tsConfig,
    tsupConfig,
    outDir,
    outputPath,
    assets,
    root,
  } = options;

  const result = await runCommands(
    {
      command: `tsup --config ${tsupConfig} --outDir ${outDir}`,
      cwd: projectRoot,
      parallel: false,
      color: true,
      __unparsed__: [],
    },
    context
  );
  if (result.success) {
    const assetHandler = new CopyAssetsHandler({
      projectDir: projectRoot,
      rootDir: root,
      outputDir: outputPath,
      assets,
    });
    await assetHandler.processAllAssetsOnce();
    const { dependencies, target } = checkDependencies(context, tsConfig);
    updatePackageJson(options, context, target, dependencies, false);
  }
  return result;
}

export default buildExecutor;
