import { VitestExecutorOptions } from './schema';
import { join } from 'path';
import { ExecutorContext } from '@nrwl/devkit';
import { default as runCommands } from '@nrwl/workspace/src/executors/run-commands/run-commands.impl';

function collectOptions(options: VitestExecutorOptions) {
  let cliOptions = '';
  if (options.passWithNoTests) {
    cliOptions += ' --passWithNoTests';
  }
  if (options.testNamePattern && options.testNamePattern != '') {
    cliOptions += ` --testNamePattern ${options.testNamePattern}`;
  }

  return cliOptions;
}

export async function testExecutor(
  options: VitestExecutorOptions,
  context: ExecutorContext
) {
  const projectName = context.projectName || '';
  const projectDir = context.workspace.projects[projectName].root;
  const projectRoot = join(context.root, projectDir);
  const vitestConfig = options.vitestConfig
    ? join(context.root, options.vitestConfig)
    : join(projectRoot, 'vitest.config.ts');

  const cliOptions = collectOptions(options);

  const result = await runCommands(
    {
      command: `vitest ${options.command} --config ${vitestConfig} --dir ${projectRoot} ${cliOptions}`,
      cwd: context.root,
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

export default testExecutor;
