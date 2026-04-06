# ---- Build Stage ----
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# Install parent pom to local repo (non-recursive, skips modules)
COPY pom.xml .
RUN mvn -N install -q

# Copy service pom and source
COPY config-server/pom.xml config-server/pom.xml
COPY config-server/src config-server/src

# Build the service JAR (with repackage goal)
RUN mvn -f config-server/pom.xml package -DskipTests -q

# ---- Runtime Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/config-server/target/config-server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9999
ENTRYPOINT ["java", "-jar", "app.jar"]
