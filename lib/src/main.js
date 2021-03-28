#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = require("commander");
const shelljs_1 = require("shelljs");
const fs = require("fs");
const chalk = require("chalk");
const utilities_1 = require("./utilities");
commander_1.program.version("1.0.0");
commander_1.program.requiredOption("-p, --projects <project...>", "Projects to parse");
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const dependencies = [];
const getDependency = (projectPath) => {
    const path = `${process.cwd()}/${projectPath}`;
    const project = utilities_1.getProjectName(projectPath);
    if (!fs.existsSync(path)) {
        console.log(chalk.bold(chalk.red(`${project} do not exists => Dropped`)));
        return;
    }
    shelljs_1.cd(`${process.cwd()}/${projectPath}`);
    const { dependencies: projectDependencies } = JSON.parse(shelljs_1.exec("npm list --json", { silent: true }));
    for (const [name, { version }] of Object.entries(projectDependencies)) {
        dependencies.push({
            version,
            name,
            project,
        });
    }
};
const sortDependencies = (acc, dependency) => {
    if (acc[dependency.name]) {
        acc[dependency.name].push(dependency);
    }
    else {
        acc[dependency.name] = [dependency];
    }
    acc[dependency.name].sort((a, b) => a.version > b.version ? 1 : -1);
    return acc;
};
const getUpdatableDependenciesByProject = (acc, [name, values]) => {
    var _a;
    const high = values[values.length - 1];
    const low = values[0];
    const shouldBeUpdated = values.filter(dependency => dependency.version !== high.version);
    if (shouldBeUpdated.length) {
        for (const dependency of shouldBeUpdated) {
            return Object.assign(Object.assign({}, acc), { [dependency.project]: [
                    ...((_a = acc[dependency.project]) !== null && _a !== void 0 ? _a : []),
                    {
                        high: high.version,
                        low: low.version,
                        name,
                        version: dependency.version,
                    },
                ] });
        }
    }
    return acc;
};
const generateReport = ([project, dependencies]) => {
    console.log(chalk.green(`
  ${chalk.bold(chalk.underline(project))}`));
    for (const dependency of dependencies) {
        console.log(chalk.blue(`- ${dependency.name}: from ${chalk.red(dependency.version)} to ${chalk.green(dependency.high)}`));
    }
};
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            yield Promise.all(options.projects.map(getDependency));
            const sortedDependenciesByName = dependencies.reduce(sortDependencies, {});
            const parsedDependencies = Object.entries(sortedDependenciesByName).reduce(getUpdatableDependenciesByProject, {});
            if (Object.values(parsedDependencies).length) {
                console.log(chalk.blue(`-------------------------\n------ [TO UPDATE] ------\n-------------------------`));
            }
            Object.entries(parsedDependencies).forEach((item) => {
                generateReport(item);
            });
            process.exit(0);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    });
}
main();
//# sourceMappingURL=main.js.map