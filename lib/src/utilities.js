"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectName = void 0;
function getProjectName(projectPath) {
    const lastSlashPosition = projectPath.lastIndexOf('/');
    if (lastSlashPosition >= 0) {
        return projectPath.substring(lastSlashPosition + 1);
    }
    return projectPath.substring(0, projectPath.length - 1);
}
exports.getProjectName = getProjectName;
//# sourceMappingURL=utilities.js.map