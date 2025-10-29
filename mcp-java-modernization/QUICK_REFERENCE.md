# Java 21 Quick Reference Card

## ✅ Current Status
- **Java Version:** 21.0.9 LTS
- **Spring Boot:** 3.4.0
- **Status:** ✅ Ready to use

---

## 🚀 Quick Commands

### Verify Installation
```powershell
# Check Java runtime
java -version

# Check compiler
javac -version

# Check environment
echo $env:JAVA_HOME
```

### Setup Java 21 (New Terminal Sessions)
```powershell
cd e:\finscore-analyser\mcp-java-modernization
.\setup-java21.ps1
```

### Build & Run (Requires Maven)
```powershell
cd demo-java-project

# Clean and build
mvn clean install

# Run the application
mvn spring-boot:run

# Run in debug mode
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
```

---

## 🎯 Java 21 Features to Try

### 1. Pattern Matching for Switch
```java
Object obj = "Hello";
String result = switch (obj) {
    case String s -> "String: " + s;
    case Integer i -> "Integer: " + i;
    case null -> "null";
    default -> "Unknown";
};
```

### 2. Record Patterns
```java
record Point(int x, int y) {}

Point p = new Point(1, 2);
if (p instanceof Point(int x, int y)) {
    System.out.println("x=" + x + ", y=" + y);
}
```

### 3. Virtual Threads
```java
Thread.startVirtualThread(() -> {
    System.out.println("Running in virtual thread");
});

// Or with executor
ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
executor.submit(() -> System.out.println("Task"));
```

### 4. Sequenced Collections
```java
List<String> list = new ArrayList<>();
list.addFirst("first");
list.addLast("last");
String first = list.getFirst();
String last = list.getLast();
List<String> reversed = list.reversed();
```

### 5. Modern Date/Time
```java
// Already in the demo app
LocalDateTime now = LocalDateTime.now();
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
String formatted = now.format(formatter);
```

---

## 📁 Project Structure

```
demo-java-project/
├── pom.xml                    # Maven configuration
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/demo/
│       │       └── DemoApplication.java
│       └── resources/
│           └── application.properties
└── target/                    # Build output (after mvn install)
```

---

## 🔧 Environment Variables

### Current Session (Temporary)
Set by running `setup-java21.ps1`:
```
JAVA_HOME = C:\Program Files\Java\jdk-21
PATH includes C:\Program Files\Java\jdk-21\bin
```

### Permanent Setup
Follow instructions in `JAVA_UPGRADE_COMPLETE.md` section "To Make Java 21 Permanent"

---

## 🐛 Troubleshooting

### "java is not recognized"
**Solution:** Run `.\setup-java21.ps1` in the current terminal

### "JAVA_HOME is not set"
**Solution:** Run `.\setup-java21.ps1` or set permanently via System Environment Variables

### Maven not found
**Solution:** Download from https://maven.apache.org/download.cgi
- Extract to `C:\Program Files\Maven`
- Add `C:\Program Files\Maven\bin` to PATH

### Build errors
**Solution:** Ensure Java 21 is active:
```powershell
java -version  # Should show 21.0.9
.\setup-java21.ps1  # If not showing correct version
```

---

## 📊 Migration Checklist (For Your Own Projects)

When upgrading other projects to Java 21:

- [ ] Update `pom.xml` or `build.gradle` to Java 21
- [ ] Update Spring Boot to 3.x (if applicable)
- [ ] Migrate `javax.*` imports to `jakarta.*`
- [ ] Update deprecated APIs:
  - `Date` → `LocalDate/LocalDateTime`
  - `SimpleDateFormat` → `DateTimeFormatter`
  - Legacy collections → Modern collections
- [ ] Update dependencies to Java 21 compatible versions
- [ ] Test thoroughly
- [ ] Update CI/CD pipelines to use Java 21

---

## 🎓 Learning Resources

### Official Documentation
- Java 21 Docs: https://docs.oracle.com/en/java/javase/21/
- What's New: https://www.oracle.com/java/technologies/javase/21-relnotes.html

### Spring Boot 3.4
- Spring Boot 3.4 Docs: https://docs.spring.io/spring-boot/docs/3.4.0/reference/html/
- Migration Guide: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.4-Migration-Guide

### Tutorials
- Java 21 Virtual Threads: https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html
- Pattern Matching: https://openjdk.org/jeps/441

---

## 💡 Pro Tips

1. **Use Virtual Threads** for I/O-heavy operations (network, database)
2. **Pattern Matching** reduces boilerplate in switch statements
3. **Records** are perfect for DTOs and value objects
4. **Sequenced Collections** simplify working with ordered data
5. **Enable preview features** with `--enable-preview` for cutting-edge features

---

## ⚡ Next Actions

1. ✅ Verify Java 21 is working: `java -version`
2. 🔨 Install Maven (optional): https://maven.apache.org/download.cgi
3. 🏃 Run the demo: `mvn spring-boot:run`
4. 🎯 Make environment permanent: See `JAVA_UPGRADE_COMPLETE.md`
5. 🚀 Start using Java 21 features in your code!

---

*For detailed upgrade information, see `JAVA_UPGRADE_COMPLETE.md`*
