import { BuildExecutorOptions } from './schema';
import { join } from 'path';
import { ExecutorContext } from '@nrwl/devkit';
import { default as runCommands } from '@nrwl/workspace/src/executors/run-commands/run-commands.impl';

export async function buildExecutor(
  options: BuildExecutorOptions,
  context: ExecutorContext
) {
  const projectName = context.projectName || '';
  const projectDir = context.workspace.projects[projectName].root;
  const projectRoot = join(context.root, projectDir);
  const tsupConfig = options.tsupConfig
    ? join(context.root, options.tsupConfig)
    : join(projectRoot, 'tsup.config.ts');
  const outDir = join(context.root, options.outputPath);

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
  return {
    success: result,
  };
}

export default buildExecutor;
