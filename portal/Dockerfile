# Stage 1: Build the application using Maven
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copy the portal directory contents
COPY portal/ .

# Give execution permission to mvnw and run build
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
