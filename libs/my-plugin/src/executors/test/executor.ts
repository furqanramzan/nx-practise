import { VitestExecutorOptions } from './schema';
import { ExecutorContext, joinPathFragments } from '@nrwl/devkit';
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

export default async function (
  options: VitestExecutorOptions,
  context: ExecutorContext
) {
  const projectName = context.projectName || '';
  const projectDir = context.workspace.projects[projectName].root;
  const projectRoot = joinPathFragments(`${context.root}/${projectDir}`);

  const cliOptions = collectOptions(options);

  const result = await runCommands(
    {
      command: `vitest ${options.command} ${cliOptions} -c ${options.vitestConfig} --dir ${projectRoot}`,
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
