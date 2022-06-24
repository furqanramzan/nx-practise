import { match } from 'minimatch';
import { join } from 'path';
import {
  readJsonFile,
  ExecutorContext,
  ProjectGraphProjectNode,
  readCachedProjectGraph,
} from '@nrwl/devkit';
import {
  calculateProjectDependencies,
  checkDependentProjectsHaveBeenBuilt,
  createTmpTsConfig,
  DependentBuildableProjectNode,
} from '@nrwl/workspace/src/utilities/buildable-libs-utils';
import { fileExists } from 'nx/src/utils/fileutils';

export function checkDependencies(
  context: ExecutorContext,
  tsConfigPath: string
): {
  tmpTsConfig: string | null;
  projectRoot: string;
  target: ProjectGraphProjectNode<any>;
  dependencies: DependentBuildableProjectNode[];
} {
  const projectName = context.projectName || '';
  const targetName = context.targetName || '';
  const configurationName = context.configurationName || '';
  const projectGraph = readCachedProjectGraph();

  // const tsConfigJson = fileExists(tsConfigPath)
  //   ? readJsonFile(tsConfigPath)
  //   : { name: context.projectName };
  // const include: string[] = tsConfigJson.include || [];
  // const exclude: string[] = tsConfigJson.exclude || [];
  // let files: string[] = projectGraph.nodes[projectName].data.files.map(
  //   (x: { file: string }) => x.file
  // );
  // include.forEach((x) => (files = match(files, `${x}`)));
  // exclude.forEach((x) => (files = match(files, `!${x}`)));
  // exclude.forEach((x) => (files = files.filter((file) => !file.endsWith(x))));
  // const filteredFiles: Array<{ deps: string[] }> = projectGraph.nodes[
  //   projectName
  // ].data.files.filter((file: { file: string }) => files.includes(file.file));
  // projectGraph.nodes[projectName].data.files = filteredFiles;
  // projectGraph.dependencies[projectName] = projectGraph.dependencies[
  //   projectName
  // ].filter((dependency) => {
  //   return filteredFiles.some((y) => y.deps?.includes(dependency.target));
  // });

  const { target, dependencies, nonBuildableDependencies } =
    calculateProjectDependencies(
      projectGraph,
      context.root,
      projectName,
      targetName,
      configurationName
    );
  const projectRoot = target.data.root;

  if (nonBuildableDependencies.length > 0) {
    throw new Error(
      `Buildable libraries can only depend on other buildable libraries. You must define the ${targetName} target for the following libraries: ${nonBuildableDependencies
        .map((t) => `"${t}"`)
        .join(', ')}`
    );
  }

  if (dependencies.length > 0) {
    const areDependentProjectsBuilt = checkDependentProjectsHaveBeenBuilt(
      context.root,
      projectName,
      targetName,
      dependencies
    );
    if (!areDependentProjectsBuilt) {
      throw new Error(
        `Some dependencies of '${projectName}' have not been built. This probably due to the ${targetName} target being misconfigured.`
      );
    }
    return {
      tmpTsConfig: createTmpTsConfig(
        tsConfigPath,
        context.root,
        projectRoot,
        dependencies
      ),
      projectRoot,
      target,
      dependencies,
    };
  }

  return {
    tmpTsConfig: null,
    projectRoot,
    target,
    dependencies,
  };
}
