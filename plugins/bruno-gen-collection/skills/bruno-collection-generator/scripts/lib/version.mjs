// The runtime version is kept separate from command orchestration so the manifest validator can
// compare it with plugin.json. A marketplace update and the generatorVersion recorded in lockfiles
// must never describe different builds.

export const PLUGIN_VERSION = '2.0.0-alpha.10';
