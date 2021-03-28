export function getProjectName(projectPath: string): string {
  const lastSlashPosition = projectPath.lastIndexOf('/');
  
  if (lastSlashPosition >= 0) {
    return projectPath.substring(lastSlashPosition + 1);
  }

  return projectPath.substring(0, projectPath.length -1);
}