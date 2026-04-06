# ---- Build Stage ----
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# Install parent pom to local repo (non-recursive, skips modules)
COPY pom.xml .
RUN mvn -N install -q

# Copy service pom and source
COPY admin-service/pom.xml admin-service/pom.xml
COPY admin-service/src admin-service/src

# Build the service JAR (with repackage goal)
RUN mvn -f admin-service/pom.xml package -DskipTests -q

# ---- Runtime Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/admin-service/target/admin-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8005
ENTRYPOINT ["java", "-jar", "app.jar"]
