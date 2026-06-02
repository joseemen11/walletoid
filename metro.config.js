const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const wiraSdkRoot = path.resolve(projectRoot, "../..", "electoral", "wira-sdk");

const config = getDefaultConfig(projectRoot);

// Allow Metro to follow the local file: dependency that points outside projectRoot.
config.watchFolders = [...(config.watchFolders || []), wiraSdkRoot];
config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: true,
  nodeModulesPaths: [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(wiraSdkRoot, "node_modules"),
  ],
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    buffer: require.resolve('buffer'),
  }
};

module.exports = config;