# Demo Java Project

This is a sample Java 8 + Spring Boot 2.7 project for testing the MCP Java Modernization Server.

## Project Details

- **Java Version:** 8
- **Spring Boot:** 2.7.18
- **Build Tool:** Maven
- **Purpose:** Testing MCP server analysis capabilities

## What This Project Contains

1. **Old Java Version (8)** - To test upgrade path suggestions
2. **Old Spring Boot (2.7.18)** - To test Spring Boot migration
3. **Deprecated APIs** - `Date`, `SimpleDateFormat` for testing deprecation detection
4. **Older Dependencies** - To test dependency update suggestions

## How to Test the MCP Server

### Test 1: Analyze the Project
In GitHub Copilot Chat:
```
Analyze the Java project at E:\finscore-analyser\mcp-java-modernization\demo-java-project
```

**Expected Output:**
- Detects Java 8
- Detects Spring Boot 2.7.18
- Lists dependencies

### Test 2: Get Upgrade Suggestions
```
Suggest upgrade path for the demo project from Java 8 to Java 21
```

**Expected Output:**
- Java 8 → 11 → 17 → 21
- Spring Boot compatibility recommendations

### Test 3: Generate Migration Checklist
```
Create a migration checklist for upgrading this demo project from Java 8 to Java 17
```

**Expected Output:**
- Breaking changes list
- Spring Boot migration tasks
- Testing checklist

### Test 4: Detect Deprecated APIs
```
Detect deprecated APIs in E:\finscore-analyser\mcp-java-modernization\demo-java-project for Java 21
```

**Expected Output:**
- Finds `new Date()` usage
- Finds `SimpleDateFormat` usage
- Suggests modern alternatives

### Test 5: Check Dependencies
```
Check for outdated dependencies in the demo project
```

**Expected Output:**
- Lists dependencies that can be updated
- Maven command to check updates

## Recommended Upgrade Path

Based on MCP server analysis:

1. **Java 8 → Java 11**
   - Update `pom.xml` properties
   - Add JAXB dependencies
   - Test thoroughly

2. **Java 11 → Java 17**
   - Review encapsulation changes
   - Update reflection usage
   - Spring Boot 2.7 is compatible

3. **Spring Boot 2.7 → 3.2**
   - Requires Java 17 minimum
   - Change `javax.*` to `jakarta.*`
   - Update configuration

4. **Java 17 → Java 21** (optional)
   - Evaluate virtual threads
   - Consider pattern matching
   - Spring Boot 3.2+ compatible

## Files Structure

```
demo-java-project/
├── pom.xml                           # Maven configuration
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── example/
│                   └── demo/
│                       └── DemoApplication.java  # Main class with deprecated APIs
└── README.md                         # This file
```

## Note

This is a minimal project for testing purposes. It won't actually build or run without additional configuration, but it has enough structure for the MCP server to analyze.
