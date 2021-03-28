export interface NpmDependencies {
  [name: string]: {
    version: string;
    resolved: string;
  }
}

export interface InternalDependencyMap {
  version: string;
  name: string;
  project: string;
}

export interface UpdatableDependenciesByProject {
  high: string;
  low: string;
  name: string;
  version: string;
}