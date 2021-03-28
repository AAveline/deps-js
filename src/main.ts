#!/usr/bin/env node
import { program } from "commander";
import { cd, exec } from "shelljs";
import * as fs from "fs";
const chalk = require("chalk");

import { getProjectName } from "./utilities";
import { NpmDependencies, InternalDependencyMap, UpdatableDependenciesByProject } from "./types";

program.version("1.0.0");
program.requiredOption("-p, --projects <project...>", "Projects to parse");
program.parse(process.argv);

const options = program.opts() as { projects: string[] };
const dependencies: InternalDependencyMap[] = [];

const getDependency = (projectPath: string) => {
  const path = `${process.cwd()}/${projectPath}`;
  const project = getProjectName(projectPath);

  if (!fs.existsSync(path)) {
    console.log(chalk.bold(chalk.red(`${project} do not exists => Dropped`)));
    return;
  }

  cd(`${process.cwd()}/${projectPath}`);

  const { dependencies: projectDependencies } = JSON.parse(
    exec("npm list --json", { silent: true })
  ) as { [k: string]: NpmDependencies };

  for (const [name, { version }] of Object.entries(projectDependencies)) {
    dependencies.push({
      version,
      name,
      project,
    });
  }
}

const sortDependencies = (acc: { [name: string]: InternalDependencyMap[] }, dependency: InternalDependencyMap) => {
  if (acc[dependency.name]) {
    acc[dependency.name].push(dependency);
  } else {
    acc[dependency.name] = [dependency];
  }

  acc[dependency.name].sort((a, b) => a.version > b.version ? 1 : -1)

  return acc;
}

const getUpdatableDependenciesByProject =
  (acc: { [project: string]: UpdatableDependenciesByProject[] }, [name, values]: [name: string, values: InternalDependencyMap[]]) => {
    const high = values[values.length - 1];
    const low = values[0];

    const shouldBeUpdated = values.filter(dependency => dependency.version !== high.version);

    if (shouldBeUpdated.length) {

      for (const dependency of shouldBeUpdated) {
        return {
          ...acc,
          [dependency.project]: [
            ...(acc[dependency.project] ?? []),
            {
              high: high.version,
              low: low.version,
              name,
              version: dependency.version,
            },
          ]
        }
      }
    }

    return acc;
  }

const generateReport = ([project, dependencies]: [project: string, dependencies: UpdatableDependenciesByProject[]]) => {
  console.log(chalk.green(`
  ${chalk.bold(chalk.underline(project))}`));

  for (const dependency of dependencies) {
    console.log(chalk.blue(`- ${dependency.name}: from ${chalk.red(dependency.version)} to ${chalk.green(dependency.high)}`));
  }
}

async function main() {
  try {
    await Promise.all(options.projects.map(getDependency));

    const sortedDependenciesByName = dependencies.reduce(sortDependencies, {});
    const parsedDependencies = Object.entries(sortedDependenciesByName).reduce(getUpdatableDependenciesByProject, {}) as {
      [project: string]: UpdatableDependenciesByProject[]
    };

    if (Object.values(parsedDependencies).length) {
      console.log(chalk.blue(`-------------------------\n------ [TO UPDATE] ------\n-------------------------`));
    }

    Object.entries(parsedDependencies).forEach((item) => {
      generateReport(item);
    });

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();