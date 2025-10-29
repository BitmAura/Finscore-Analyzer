# MCP Java Modernization Server

A Model Context Protocol (MCP) server that helps modernize Java applications by analyzing codebases, suggesting upgrade paths, and providing migration guidance.

## Features

### Tools Provided

1. **analyze_java_project** - Analyzes a Java project to determine:
   - Current Java version
   - Build tool (Maven/Gradle)
   - Spring Boot version (if applicable)
   - Project dependencies

2. **suggest_upgrade_path** - Suggests upgrade paths for:
   - Java version migrations (8 → 11 → 17 → 21)
   - Spring Boot compatibility recommendations
   - LTS version targeting

3. **check_dependency_updates** - Checks for outdated dependencies and suggests updates

4. **migration_checklist** - Generates comprehensive migration checklists including:
   - Breaking changes between Java versions
   - Spring Boot migration tasks
   - Testing and deployment considerations

5. **detect_deprecated_apis** - Scans Java source code for:
   - Deprecated API usage
   - Modern alternatives and suggestions

## Installation

```bash
cd mcp-java-modernization
npm install
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

### Configuring with Claude Desktop

Add to your Claude Desktop configuration file:

**macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "java-modernization": {
      "command": "node",
      "args": ["E:\\finscore-analyser\\mcp-java-modernization\\dist\\index.js"]
    }
  }
}
```

### Configuring with VS Code Copilot

Add to VS Code settings (`.vscode/settings.json` or user settings):

```json
{
  "mcp.servers": {
    "java-modernization": {
      "command": "node",
      "args": ["E:\\finscore-analyser\\mcp-java-modernization\\dist\\index.js"]
    }
  }
}
```

## Example Usage

Once connected to an MCP client (Claude Desktop, VS Code Copilot, etc.), you can:

```
Analyze this Java project: E:\my-spring-app

Suggest an upgrade path from Java 8 to Java 21

Generate a migration checklist for upgrading from Java 11 to Java 17 
and Spring Boot 2.7 to 3.2

Detect deprecated APIs in my project for Java 21 compatibility
```

## Supported Versions

### Java Versions
- Java 8 (LTS - EOL 2030)
- Java 11 (LTS - EOL 2032)
- Java 17 (LTS - EOL 2029)
- Java 21 (LTS - EOL 2031)

### Spring Boot Versions
- 2.7.x (supports Java 8, 11, 17)
- 3.0.x - 3.4.x (requires Java 17+)

## Architecture

The server is built using:
- TypeScript for type safety
- `@modelcontextprotocol/sdk` for MCP protocol implementation
- XML parsing for Maven POM analysis
- File system traversal for code scanning

## Development

### Watch Mode
```bash
npm run watch
```

### Testing Locally
```bash
# In one terminal
npm run dev

# In another terminal, test with MCP inspector or client
```

## Roadmap

- [ ] Gradle Kotlin DSL support
- [ ] Jakarta EE migration detection
- [ ] Automated dependency version resolution via Maven Central API
- [ ] Code transformation suggestions (e.g., Date → LocalDateTime)
- [ ] Multi-module project support
- [ ] Integration with OpenRewrite for automated migrations

## Contributing

This MCP server is part of the FinScore Analyzer project. Contributions welcome!

## License

MIT
