# ---- Build Stage ----
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# Install parent pom to local repo (non-recursive, skips modules)
COPY pom.xml .
RUN mvn -N install -q

# Copy service pom and source
COPY policy-service/pom.xml policy-service/pom.xml
COPY policy-service/src policy-service/src

# Build the service JAR (with repackage goal)
RUN mvn -f policy-service/pom.xml package -DskipTests -q

# ---- Runtime Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/policy-service/target/policy-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8004
ENTRYPOINT ["java", "-jar", "app.jar"]
