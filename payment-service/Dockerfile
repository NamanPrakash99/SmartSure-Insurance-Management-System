# ---- Build Stage ----
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# Install parent pom to local repo (non-recursive, skips modules)
COPY pom.xml .
RUN mvn -N install -q

# Copy service pom and source
COPY payment-service/pom.xml payment-service/pom.xml
COPY payment-service/src payment-service/src

# Build the service JAR (with repackage goal)
RUN mvn -f payment-service/pom.xml package -DskipTests -q

# ---- Runtime Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/payment-service/target/payment-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
