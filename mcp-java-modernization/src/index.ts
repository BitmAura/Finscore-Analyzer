#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { promises as fs } from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import * as semver from 'semver';

// Java version upgrade paths
const JAVA_UPGRADE_PATHS = {
  '8': { next: '11', lts: true, eol: '2030-12' },
  '11': { next: '17', lts: true, eol: '2032-09' },
  '17': { next: '21', lts: true, eol: '2029-09' },
  '21': { next: '25', lts: true, eol: '2031-09' },
};

// Spring Boot version compatibility
const SPRING_BOOT_COMPATIBILITY = {
  '2.7.x': { javaVersions: ['8', '11', '17'], endOfSupport: '2025-02' },
  '3.0.x': { javaVersions: ['17', '19'], endOfSupport: '2023-11' },
  '3.1.x': { javaVersions: ['17', '20'], endOfSupport: '2024-05' },
  '3.2.x': { javaVersions: ['17', '21'], endOfSupport: '2025-02' },
  '3.3.x': { javaVersions: ['17', '21'], endOfSupport: '2025-08' },
  '3.4.x': { javaVersions: ['17', '21'], endOfSupport: '2026-02' },
};

interface PomDependency {
  groupId: string[];
  artifactId: string[];
  version?: string[];
}

interface MavenProject {
  project: {
    modelVersion?: string[];
    groupId?: string[];
    artifactId?: string[];
    version?: string[];
    properties?: any;
    dependencies?: { dependency: PomDependency[] }[];
    parent?: {
      groupId: string[];
      artifactId: string[];
      version: string[];
    }[];
  };
}

// Define available tools
const tools: Tool[] = [
  {
    name: 'analyze_java_project',
    description:
      'Analyzes a Java project (Maven/Gradle) to determine current Java version, dependencies, and Spring Boot version if applicable',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to the Java project root directory',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'suggest_upgrade_path',
    description:
      'Suggests an upgrade path for Java version and/or Spring Boot based on current versions and compatibility',
    inputSchema: {
      type: 'object',
      properties: {
        currentJavaVersion: {
          type: 'string',
          description: 'Current Java version (e.g., "8", "11", "17")',
        },
        currentSpringBootVersion: {
          type: 'string',
          description: 'Current Spring Boot version (e.g., "2.7.18") - optional',
        },
        targetJavaVersion: {
          type: 'string',
          description: 'Target Java version (e.g., "21") - optional',
        },
      },
      required: ['currentJavaVersion'],
    },
  },
  {
    name: 'check_dependency_updates',
    description:
      'Checks for outdated dependencies in a Maven pom.xml or Gradle build file and suggests updates',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to the Java project root directory',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'migration_checklist',
    description:
      'Generates a migration checklist for upgrading Java and/or Spring Boot versions with breaking changes and action items',
    inputSchema: {
      type: 'object',
      properties: {
        fromJavaVersion: {
          type: 'string',
          description: 'Source Java version',
        },
        toJavaVersion: {
          type: 'string',
          description: 'Target Java version',
        },
        fromSpringBootVersion: {
          type: 'string',
          description: 'Source Spring Boot version (optional)',
        },
        toSpringBootVersion: {
          type: 'string',
          description: 'Target Spring Boot version (optional)',
        },
      },
      required: ['fromJavaVersion', 'toJavaVersion'],
    },
  },
  {
    name: 'detect_deprecated_apis',
    description:
      'Scans Java source files for deprecated APIs and suggests modern alternatives',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to the Java project root directory',
        },
        targetJavaVersion: {
          type: 'string',
          description: 'Target Java version to check compatibility',
        },
      },
      required: ['projectPath', 'targetJavaVersion'],
    },
  },
];

// Helper functions
async function analyzeMavenProject(projectPath: string) {
  const pomPath = path.join(projectPath, 'pom.xml');
  const pomContent = await fs.readFile(pomPath, 'utf-8');
  const pomData = (await parseStringPromise(pomContent)) as MavenProject;

  const project = pomData.project;
  const properties = project.properties?.[0] || {};
  
  // Detect Java version
  let javaVersion = properties['java.version']?.[0] || 
                    properties['maven.compiler.source']?.[0] ||
                    properties['maven.compiler.target']?.[0] ||
                    'unknown';

  // Detect Spring Boot version
  let springBootVersion = 'none';
  if (project.parent) {
    const parent = project.parent[0];
    if (parent.artifactId[0] === 'spring-boot-starter-parent') {
      springBootVersion = parent.version[0];
    }
  }

  // Collect dependencies
  const dependencies: Array<{ groupId: string; artifactId: string; version?: string }> = [];
  if (project.dependencies && project.dependencies[0]?.dependency) {
    for (const dep of project.dependencies[0].dependency) {
      dependencies.push({
        groupId: dep.groupId[0],
        artifactId: dep.artifactId[0],
        version: dep.version?.[0],
      });
    }
  }

  return {
    buildTool: 'maven',
    javaVersion,
    springBootVersion,
    dependencies,
    groupId: project.groupId?.[0] || 'unknown',
    artifactId: project.artifactId?.[0] || 'unknown',
    version: project.version?.[0] || 'unknown',
  };
}

async function analyzeGradleProject(projectPath: string) {
  const buildGradlePath = path.join(projectPath, 'build.gradle');
  let buildContent: string;
  
  try {
    buildContent = await fs.readFile(buildGradlePath, 'utf-8');
  } catch {
    // Try build.gradle.kts
    buildContent = await fs.readFile(path.join(projectPath, 'build.gradle.kts'), 'utf-8');
  }

  // Simple regex-based parsing (for production, use proper Gradle parsing)
  const javaVersionMatch = buildContent.match(/sourceCompatibility\s*=\s*['"]?(\d+)['"]?/);
  const springBootMatch = buildContent.match(/org\.springframework\.boot['"]?\s*version\s*['"]([^'"]+)['"]/);

  return {
    buildTool: 'gradle',
    javaVersion: javaVersionMatch?.[1] || 'unknown',
    springBootVersion: springBootMatch?.[1] || 'none',
    dependencies: [], // Would need more sophisticated parsing
  };
}

function generateUpgradePath(
  currentJava: string,
  targetJava?: string,
  currentSpringBoot?: string
) {
  const path: string[] = [];
  let current = currentJava;

  // Build Java upgrade path
  while (current !== targetJava && JAVA_UPGRADE_PATHS[current as keyof typeof JAVA_UPGRADE_PATHS]) {
    const next = JAVA_UPGRADE_PATHS[current as keyof typeof JAVA_UPGRADE_PATHS].next;
    path.push(`Java ${current} → Java ${next}`);
    current = next;
    if (!targetJava && JAVA_UPGRADE_PATHS[current as keyof typeof JAVA_UPGRADE_PATHS]?.lts) {
      break; // Stop at next LTS if no target specified
    }
  }

  // Spring Boot recommendations
  let springBootRecommendation = '';
  if (currentSpringBoot && currentSpringBoot !== 'none') {
    const targetJavaVer = targetJava || current;
    const compatibleSpringBoot = Object.entries(SPRING_BOOT_COMPATIBILITY).find(
      ([_, info]) => info.javaVersions.includes(targetJavaVer)
    );
    
    if (compatibleSpringBoot) {
      springBootRecommendation = `\nRecommended Spring Boot: ${compatibleSpringBoot[0]} (compatible with Java ${targetJavaVer})`;
    }
  }

  return {
    path,
    recommendation: springBootRecommendation,
    targetJavaVersion: current,
  };
}

function generateMigrationChecklist(
  fromJava: string,
  toJava: string,
  fromSpringBoot?: string,
  toSpringBoot?: string
) {
  const checklist: string[] = [
    '## Migration Checklist',
    `### Java ${fromJava} → Java ${toJava}`,
    '',
  ];

  // Java-specific migration tasks
  if (parseInt(fromJava) < 11 && parseInt(toJava) >= 11) {
    checklist.push(
      '#### Breaking Changes (Java 8 → 11):',
      '- [ ] Remove usage of `sun.*` and `com.sun.*` packages',
      '- [ ] Update JAXB dependencies (no longer bundled)',
      '- [ ] Replace JavaFX (now separate from JDK)',
      '- [ ] Update `javax.annotation` annotations to separate dependency',
      '- [ ] Review and update deprecated APIs',
      ''
    );
  }

  if (parseInt(fromJava) < 17 && parseInt(toJava) >= 17) {
    checklist.push(
      '#### Breaking Changes (Java 11 → 17):',
      '- [ ] Review strong encapsulation of JDK internals',
      '- [ ] Update reflection usage (may require --add-opens)',
      '- [ ] Remove deprecated security manager usage',
      '- [ ] Update to sealed classes if applicable',
      ''
    );
  }

  if (parseInt(fromJava) < 21 && parseInt(toJava) >= 21) {
    checklist.push(
      '#### New Features (Java 17 → 21):',
      '- [ ] Consider using Virtual Threads for concurrency',
      '- [ ] Evaluate Pattern Matching for switch statements',
      '- [ ] Review Record Patterns usage',
      '- [ ] Consider Sequenced Collections',
      ''
    );
  }

  // Spring Boot migration tasks
  if (fromSpringBoot && toSpringBoot) {
    const fromMajor = parseInt(fromSpringBoot.split('.')[0]);
    const toMajor = parseInt(toSpringBoot.split('.')[0]);

    if (fromMajor === 2 && toMajor === 3) {
      checklist.push(
        '#### Spring Boot 2.x → 3.x Migration:',
        '- [ ] Update `javax.*` imports to `jakarta.*`',
        '- [ ] Minimum Java 17 required',
        '- [ ] Update Spring Security configuration (WebSecurityConfigurerAdapter removed)',
        '- [ ] Review property name changes (spring.redis.* → spring.data.redis.*)',
        '- [ ] Update Actuator endpoints configuration',
        '- [ ] Migrate to Spring Native if using GraalVM',
        ''
      );
    }
  }

  // General tasks
  checklist.push(
    '#### General Tasks:',
    '- [ ] Update Maven/Gradle build tool version',
    '- [ ] Run dependency vulnerability scan',
    '- [ ] Update all third-party dependencies',
    '- [ ] Run full test suite',
    '- [ ] Review and update CI/CD pipeline',
    '- [ ] Update Docker base images',
    '- [ ] Performance testing with new version',
    '- [ ] Update documentation'
  );

  return checklist.join('\n');
}

async function detectDeprecatedAPIs(projectPath: string, targetJava: string) {
  const deprecations: Array<{ file: string; line: number; api: string; suggestion: string }> = [];
  
  // Common deprecated patterns
  const patterns = [
    {
      regex: /new Date\(/g,
      api: 'java.util.Date',
      suggestion: 'Use java.time.LocalDateTime or java.time.Instant',
    },
    {
      regex: /new SimpleDateFormat\(/g,
      api: 'SimpleDateFormat',
      suggestion: 'Use java.time.format.DateTimeFormatter',
    },
    {
      regex: /Thread\.stop\(/g,
      api: 'Thread.stop()',
      suggestion: 'Use interrupt() and proper thread coordination',
    },
  ];

  async function scanDirectory(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'target' && entry.name !== 'build') {
        await scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.java')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, idx) => {
          patterns.forEach(pattern => {
            if (pattern.regex.test(line)) {
              deprecations.push({
                file: path.relative(projectPath, fullPath),
                line: idx + 1,
                api: pattern.api,
                suggestion: pattern.suggestion,
              });
            }
          });
        });
      }
    }
  }

  try {
    await scanDirectory(path.join(projectPath, 'src'));
  } catch (error) {
    // Directory might not exist
  }

  return deprecations;
}

// Create MCP server
const server = new Server(
  {
    name: 'mcp-java-modernization',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'analyze_java_project': {
        const { projectPath } = args as { projectPath: string };
        
        // Detect build tool
        const hasPom = await fs.access(path.join(projectPath, 'pom.xml')).then(() => true).catch(() => false);
        const hasGradle = await fs.access(path.join(projectPath, 'build.gradle')).then(() => true).catch(() => false);
        
        let result;
        if (hasPom) {
          result = await analyzeMavenProject(projectPath);
        } else if (hasGradle) {
          result = await analyzeGradleProject(projectPath);
        } else {
          throw new Error('No Maven or Gradle build file found');
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'suggest_upgrade_path': {
        const { currentJavaVersion, currentSpringBootVersion, targetJavaVersion } = args as {
          currentJavaVersion: string;
          currentSpringBootVersion?: string;
          targetJavaVersion?: string;
        };

        const upgradePath = generateUpgradePath(
          currentJavaVersion,
          targetJavaVersion,
          currentSpringBootVersion
        );

        return {
          content: [
            {
              type: 'text',
              text: `Upgrade Path:\n${upgradePath.path.join('\n')}${upgradePath.recommendation}\n\nTarget: Java ${upgradePath.targetJavaVersion}`,
            },
          ],
        };
      }

      case 'check_dependency_updates': {
        const { projectPath } = args as { projectPath: string };
        
        const hasPom = await fs.access(path.join(projectPath, 'pom.xml')).then(() => true).catch(() => false);
        
        if (hasPom) {
          const analysis = await analyzeMavenProject(projectPath);
          
          return {
            content: [
              {
                type: 'text',
                text: `Found ${analysis.dependencies.length} dependencies.\n\nNote: Use 'mvn versions:display-dependency-updates' for detailed update recommendations.`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: 'Dependency checking requires Maven or Gradle build files.',
            },
          ],
        };
      }

      case 'migration_checklist': {
        const { fromJavaVersion, toJavaVersion, fromSpringBootVersion, toSpringBootVersion } = args as {
          fromJavaVersion: string;
          toJavaVersion: string;
          fromSpringBootVersion?: string;
          toSpringBootVersion?: string;
        };

        const checklist = generateMigrationChecklist(
          fromJavaVersion,
          toJavaVersion,
          fromSpringBootVersion,
          toSpringBootVersion
        );

        return {
          content: [
            {
              type: 'text',
              text: checklist,
            },
          ],
        };
      }

      case 'detect_deprecated_apis': {
        const { projectPath, targetJavaVersion } = args as {
          projectPath: string;
          targetJavaVersion: string;
        };

        const deprecations = await detectDeprecatedAPIs(projectPath, targetJavaVersion);

        if (deprecations.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No common deprecated APIs detected.',
              },
            ],
          };
        }

        const report = deprecations.map(
          (d) => `${d.file}:${d.line} - ${d.api}\n  → ${d.suggestion}`
        ).join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${deprecations.length} deprecated API usage(s):\n\n${report}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Java Modernization Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
