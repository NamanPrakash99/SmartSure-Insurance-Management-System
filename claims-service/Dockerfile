# ---- Build Stage ----
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# Install parent pom to local repo (non-recursive, skips modules)
COPY pom.xml .
RUN mvn -N install -q

# Copy service pom and source
COPY claims-service/pom.xml claims-service/pom.xml
COPY claims-service/src claims-service/src

# Build the service JAR (with repackage goal)
RUN mvn -f claims-service/pom.xml package -DskipTests -q

# ---- Runtime Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/claims-service/target/claims-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8003
ENTRYPOINT ["java", "-jar", "app.jar"]
