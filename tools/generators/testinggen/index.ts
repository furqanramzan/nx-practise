import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  addDependenciesToPackageJson,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import * as path from 'path';
import { NodeGeneratorSchema } from './schema';

interface NormalizedSchema extends NodeGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  host: Tree,
  options: NodeGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : `${getWorkspaceLayout(host).appsDir}/${name}`;
  const projectName = name.replace(/\//g, '-');
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot: projectDirectory,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(host: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    host,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

export default async function (host: Tree, options: NodeGeneratorSchema) {
  const normalizedOptions = normalizeOptions(host, options);
  addProjectConfiguration(host, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@wanews/nx-vite:build',
        options: {},
      },
      serve: {
        executor: '@wanews/nx-vite:serve',
        options: {},
      },
      lint: {
        executor: '@nrwl/linter:eslint',
        options: {
          lintFilePatterns: [`${normalizedOptions.projectRoot}/**/*.ts`],
        },
      },
      test: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: 'npx vitest --run',
          cwd: normalizedOptions.projectRoot,
        },
      },
    },
    tags: normalizedOptions.parsedTags,
  });

  addFiles(host, normalizedOptions);

  const installTask = addDependenciesToPackageJson(
    host,
    {
      vue: '^3.2.25',
    },
    {
      '@vitejs/plugin-vue': '^2.3.3',
      typescript: '^4.5.4',
      vite: '^2.9.9',
      'vue-tsc': '^0.34.7',
    }
  );

  await formatFiles(host);

  return runTasksInSerial(installTask);
}
