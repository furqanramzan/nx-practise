import { ExecutorContext } from '@nrwl/devkit';
import { BuildExecutorOptions } from './schema';
import executor from './executor.lib';

let options: BuildExecutorOptions;
let mockContext: ExecutorContext;

beforeEach(async () => {
  vi.mock(
    '@nrwl/workspace/src/executors/run-commands/run-commands.impl',
    () => {
      return {
        default: vi.fn(() => true),
      };
    }
  );
  vi.mock('@nrwl/devkit', () => {
    return {
      joinPathFragments: vi.fn(),
    };
  });
  options = {
    command: 'run',
    vitestConfig: './vitest.config.ts',
  };
  mockContext = {
    root: '/root',
    projectName: 'proj',
    workspace: {
      version: 2,
      projects: {
        proj: {
          root: 'proj',
          targets: {
            build: {
              executor: '@coc/my-plugin:build',
            },
          },
        },
      },
      npmScope: 'build',
    },
    target: {
      executor: '@coc/my-plugin:build',
    },
    cwd: '/root',
    isVerbose: true,
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Build Executor', () => {
  it('can run', async () => {
    const output = await executor(options, mockContext);
    expect(output.success).toBe(true);
  });
});
