import { BuildExecutorOptions, NormalizedBuildExecutorOptions } from './schema';
import { join, resolve } from 'path';
import { ExecutorContext } from '@nrwl/devkit';
import { CopyAssetsHandler } from '@nrwl/js/src/utils/copy-assets-handler';
import { checkDependencies } from '@nrwl/js/src/utils/check-dependencies';
import { updatePackageJson } from './update-package-json';
import { default as runCommands } from '@nrwl/workspace/src/executors/run-commands/run-commands.impl';

export function normalizeOptions(
  options: BuildExecutorOptions,
  context: ExecutorContext
): NormalizedBuildExecutorOptions {
  const root = context.root;
  const projectName = context.projectName || '';
  const projectRoot = context.workspace.projects[projectName].root;
  const projectDir = join(context.root, projectRoot);
  const outDir = join(
    context.root,
    options.outputPath,
    options.outputBasePath || ''
  );
  const mainOutputPath = resolve(
    outDir,
    options.main.replace(`${projectDir}/`, '').replace('.ts', '.js')
  );
  options.tsupConfig = options.tsupConfig
    ? join(root, options.tsupConfig)
    : join(projectDir, 'tsup.config.ts');

  return {
    ...options,
    root,
    outDir,
    projectName,
    projectRoot,
    projectDir,
    mainOutputPath,
  };
}

export async function buildExecutor(
  _options: BuildExecutorOptions,
  context: ExecutorContext
) {
  const options = normalizeOptions(_options, context);
  const { projectDir, tsConfig, tsupConfig, outDir, outputPath, assets, root } =
    options;

  const result = await runCommands(
    {
      command: `tsup --config ${tsupConfig} --outDir ${outDir}`,
      cwd: projectDir,
      parallel: false,
      color: true,
      __unparsed__: [],
    },
    context
  );
  if (result.success) {
    const assetHandler = new CopyAssetsHandler({
      projectDir,
      rootDir: root,
      outputDir: outputPath,
      assets,
    });
    await assetHandler.processAllAssetsOnce();
    const { dependencies, target } = checkDependencies(context, tsConfig);
    updatePackageJson(options, context, target, dependencies);
  }
  return result;
}

export default buildExecutor;
