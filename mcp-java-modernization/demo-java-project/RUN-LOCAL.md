# Run the Demo (Java 21 + Spring Boot 3.4)

This demo is configured for Java 21 and uses an embedded H2 database for quick local runs.

## Prerequisites

- Java 21 installed. To set it for this terminal session:

```powershell
..\setup-java21.ps1
```

## Build

```powershell
# From this folder
.\mvnw.cmd -DskipTests clean package
```

## Run

```powershell
.\mvnw.cmd spring-boot:run
```

Then open:
- Application: http://localhost:8081/
- H2 Console: http://localhost:8081/h2-console
  - JDBC URL: jdbc:h2:mem:demo
  - User: sa
  - Password: (empty)

## Notes

- Port is set to 8081 to avoid conflicts.
- To use a real database, remove the H2 dependency in `pom.xml` and provide `spring.datasource.*` settings in `src/main/resources/application.properties`.
