/**
 * Expo Config Plugin for MyCar Portrait Widget
 * Based on Evan Bacon's approach to native module configuration
 */

const { withXcodeProject, withInfoPlist, withEntitlementsPlist } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WIDGET_TARGET_NAME = 'MyCarWidget';
const WIDGET_BUNDLE_IDENTIFIER = 'com.alexzamfir.mycarportrait.widget';
const APP_GROUP_IDENTIFIER = 'group.com.alexzamfir.mycarportrait';

/**
 * Main plugin configuration
 */
function withMyCarWidget(config) {
  // Add app groups capability
  config = withAppGroups(config);
  
  // Configure Info.plist
  config = withWidgetInfoPlist(config);
  
  // Add widget extension to Xcode project
  config = withWidgetExtension(config);
  
  return config;
}

/**
 * Add App Groups capability for sharing data between app and widget
 */
function withAppGroups(config) {
  return withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.security.application-groups'] = [APP_GROUP_IDENTIFIER];
    return config;
  });
}

/**
 * Configure Info.plist for widget support
 */
function withWidgetInfoPlist(config) {
  return withInfoPlist(config, (config) => {
    // Add widget configuration
    if (!config.modResults.NSExtension) {
      config.modResults.NSExtension = {};
    }
    
    config.modResults.NSExtension.NSExtensionPointIdentifier = 'com.apple.widgetkit-extension';
    
    // Add CarPlay support
    if (!config.modResults.UIApplicationSceneManifest) {
      config.modResults.UIApplicationSceneManifest = {
        UIApplicationSupportsMultipleScenes: true,
        UISceneConfigurations: {}
      };
    }
    
    return config;
  });
}

/**
 * Add widget extension target to Xcode project
 */
function withWidgetExtension(config) {
  return withXcodeProject(config, async (config) => {
    const projectPath = config.modRequest.platformProjectRoot;
    const project = config.modResults;
    
    // Check if widget target already exists
    const existingTarget = project.pbxTargetByName(WIDGET_TARGET_NAME);
    if (existingTarget) {
      console.log('Widget target already exists, skipping creation');
      return config;
    }
    
    // Create widget extension files
    createWidgetFiles(projectPath);
    
    // Add widget target to project
    const target = project.addTarget(
      WIDGET_TARGET_NAME,
      'app_extension',
      WIDGET_TARGET_NAME
    );
    
    // Configure build settings
    const configurations = project.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      const configuration = configurations[key];
      if (configuration.buildSettings && configuration.name) {
        if (configuration.buildSettings.PRODUCT_NAME === WIDGET_TARGET_NAME) {
          configuration.buildSettings = {
            ...configuration.buildSettings,
            PRODUCT_BUNDLE_IDENTIFIER: WIDGET_BUNDLE_IDENTIFIER,
            INFOPLIST_FILE: `${WIDGET_TARGET_NAME}/Info.plist`,
            SWIFT_VERSION: '5.0',
            TARGETED_DEVICE_FAMILY: '1,2',
            IPHONEOS_DEPLOYMENT_TARGET: '17.0',
            CODE_SIGN_STYLE: 'Automatic',
            DEVELOPMENT_TEAM: '$(DEVELOPMENT_TEAM)',
            SKIP_INSTALL: 'YES',
            ENABLE_APP_SANDBOX: 'YES',
            ENABLE_HARDENED_RUNTIME: 'NO',
          };
        }
      }
    }
    
    // Add widget files to project
    const widgetGroup = project.addPbxGroup(
      [],
      WIDGET_TARGET_NAME,
      WIDGET_TARGET_NAME
    );
    
    // Add Swift files
    project.addSourceFile(
      `${WIDGET_TARGET_NAME}/MyCarWidget.swift`,
      { target: target.uuid },
      widgetGroup.uuid
    );
    
    project.addSourceFile(
      `${WIDGET_TARGET_NAME}/MyCarWidgetBundle.swift`,
      { target: target.uuid },
      widgetGroup.uuid
    );
    
    // Add Info.plist
    project.addFile(
      `${WIDGET_TARGET_NAME}/Info.plist`,
      widgetGroup.uuid
    );
    
    // Add Assets catalog
    project.addResourceFile(
      `${WIDGET_TARGET_NAME}/Assets.xcassets`,
      { target: target.uuid },
      widgetGroup.uuid
    );
    
    // Add widget extension to main app's embedded content
    const mainTarget = project.getFirstTarget();
    project.addTargetDependency(mainTarget.uuid, [target.uuid]);
    
    // Add copy files build phase for embedding
    project.addBuildPhase(
      [],
      'PBXCopyFilesBuildPhase',
      'Embed App Extensions',
      mainTarget.uuid,
      'app_extension'
    );
    
    return config;
  });
}

/**
 * Create widget Swift files
 */
function createWidgetFiles(projectPath) {
  const widgetDir = path.join(projectPath, WIDGET_TARGET_NAME);
  
  // Create widget directory
  if (!fs.existsSync(widgetDir)) {
    fs.mkdirSync(widgetDir, { recursive: true });
  }
  
  // Create MyCarWidget.swift
  const widgetSwiftContent = `import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), carImage: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), carImage: loadCarImage())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []
        
        let currentDate = Date()
        let entry = SimpleEntry(date: currentDate, carImage: loadCarImage())
        entries.append(entry)
        
        // Refresh every hour
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!
        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        completion(timeline)
    }
    
    func loadCarImage() -> UIImage? {
        // Load image from shared app group container
        guard let containerURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "${APP_GROUP_IDENTIFIER}"
        ) else { return nil }
        
        let imageURL = containerURL.appendingPathComponent("portrait.png")
        
        if FileManager.default.fileExists(atPath: imageURL.path) {
            return UIImage(contentsOfFile: imageURL.path)
        }
        
        return nil
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let carImage: UIImage?
}

struct MyCarWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\\.widgetFamily) var family

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [Color.blue, Color.purple]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            if let image = entry.carImage {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .padding(8)
            } else {
                // Placeholder when no image
                VStack {
                    Image(systemName: "car.fill")
                        .font(.system(size: family == .systemSmall ? 40 : 60))
                        .foregroundColor(.white.opacity(0.8))
                    
                    if family != .systemSmall {
                        Text("MyCar")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
            }
        }
        .containerBackground(for: .widget) {
            Color.clear
        }
    }
}

@main
struct MyCarWidget: Widget {
    let kind: String = "MyCarWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            MyCarWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("My Car")
        .description("Display your car portrait on your home screen and CarPlay")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}`;
  
  fs.writeFileSync(
    path.join(widgetDir, 'MyCarWidget.swift'),
    widgetSwiftContent
  );
  
  // Create MyCarWidgetBundle.swift
  const bundleSwiftContent = `import WidgetKit
import SwiftUI

@main
struct MyCarWidgetBundle: WidgetBundle {
    var body: some Widget {
        MyCarWidget()
    }
}`;
  
  fs.writeFileSync(
    path.join(widgetDir, 'MyCarWidgetBundle.swift'),
    bundleSwiftContent
  );
  
  // Create Info.plist
  const infoPlistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>MyCar Widget</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>${WIDGET_BUNDLE_IDENTIFIER}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>XPC!</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.widgetkit-extension</string>
        <key>NSExtensionPrincipalClass</key>
        <string>$(PRODUCT_MODULE_NAME).MyCarWidgetBundle</string>
    </dict>
</dict>
</plist>`;
  
  fs.writeFileSync(
    path.join(widgetDir, 'Info.plist'),
    infoPlistContent
  );
  
  // Create Assets.xcassets structure
  const assetsDir = path.join(widgetDir, 'Assets.xcassets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  const contentsJson = {
    info: {
      author: 'xcode',
      version: 1
    }
  };
  
  fs.writeFileSync(
    path.join(assetsDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  
  console.log(`✅ Created widget files in ${widgetDir}`);
}

module.exports = withMyCarWidget;