
# Stage 1: Build React
FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot with React files
FROM eclipse-temurin:17-jdk-alpine AS backend-build
WORKDIR /app
COPY portal/ ./
COPY --from=frontend-build /frontend/dist/ ./src/main/resources/static/
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Stage 3: Run application
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
