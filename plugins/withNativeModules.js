const { withProjectBuildGradle, withAppBuildGradle, withGradleProperties, withAndroidManifest, withAndroidColors } = require('@expo/config-plugins');

/**
 * Config plugin to add native module dependencies
 */
function withNativeModules(config) {
  // Step 1: Add repositories to project-level build.gradle
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addRepositories(config.modResults.contents);
    }
    return config;
  });

  // Step 2: Add dependencies to app-level build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addDependencies(config.modResults.contents);
    }
    return config;
  });

  return config;
}

function addRepositories(contents) {
  // Check if already added
  if (contents.includes('wira_flutter_module')) {
    return contents;
  }

  const storageUrlDef = `def storageUrl = System.env.FLUTTER_STORAGE_BASE_URL ?: "https://storage.googleapis.com"`;

  // Replace the entire repositories block with the new content
  const newRepositories = `
    // Native module repositories
    maven {url file('/home/john/Workspace/electoral/wira-sdk-flutter-component/build/host/outputs/repo') }
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
    maven { url "$storageUrl/download.flutter.io" }`;

  // Add storageUrl definition before allprojects block if not present
  if (!contents.includes('FLUTTER_STORAGE_BASE_URL')) {
    contents = contents.replace(
      /allprojects\s*\{/,
      `${storageUrlDef}\n\nallprojects {`
    );
  }

  // Replace the repositories block
  const repositoriesPattern = /allprojects\s*\{\s*repositories\s*\{[\s\S]*?\}/;
  contents = contents.replace(
    repositoriesPattern,
    `allprojects {\n  repositories {${newRepositories}`
  );

  // Dependency resolution strategy to map legacy package_info_plus coordinates
  const resolutionStrategy = `
// Map the legacy package_info_plus coordinates to the actual published group in the local Flutter repo.
// This is needed because polygonid_flutter_sdk transitively depends on package_info_plus with old coordinates.
subprojects {
  configurations.all { config ->
    config.resolutionStrategy.eachDependency { details ->
      if (details.requested.group == 'io.flutter.plugins.packageinfo' &&
          details.requested.name == 'package_info_plus_release') {
        details.useTarget('dev.fluttercommunity.plus.packageinfo:package_info_plus_release:1.0')
      }
    }
  }
}`;

  // Add resolution strategy after the apply plugin lines at the end
  if (!contents.includes('resolutionStrategy.eachDependency')) {
    const applyPluginPattern = /(apply plugin: "com\.facebook\.react\.rootproject")/;
    if (applyPluginPattern.test(contents)) {
      contents = contents.replace(
        applyPluginPattern,
        `$1\n${resolutionStrategy}`
      );
    }
  }

  return contents;
}

function addDependencies(contents) {
  // Check if already added
  if (contents.includes('wira_flutter_module')) {
    return contents;
  }

  const flutterDeps = `
    // Flutter module dependencies for wira-sdk
    releaseImplementation 'com.wira.wira_flutter_module:flutter_release:1.0'
`;

  // Find the dependencies block and add the Flutter dependencies
  const dependenciesPattern = /(dependencies\s*\{)/;

  if (dependenciesPattern.test(contents)) {
    contents = contents.replace(
      dependenciesPattern,
      `$1${flutterDeps}`
    );
  }

  // Add pickFirst rules to handle duplicate native libraries from Flutter module
  if (!contents.includes('librapidsnark.so')) {
    const packagingPattern = /(packagingOptions\s*\{\s*\n\s*jniLibs\s*\{[^}]*useLegacyPackaging[^}]*\})/;

    if (packagingPattern.test(contents)) {
      contents = contents.replace(
        packagingPattern,
        `packagingOptions {
        jniLibs {
            def enableLegacyPackaging = findProperty('expo.useLegacyPackaging') ?: 'false'
            useLegacyPackaging enableLegacyPackaging.toBoolean()
            // Handle duplicate native libraries from Flutter module dependencies
            pickFirsts += ['**/librapidsnark.so', '**/libgmp.so', '**/libcircom_witnesscalc.so']
        }`
      );
    }
  }

  return contents;
}

module.exports = withNativeModules;
