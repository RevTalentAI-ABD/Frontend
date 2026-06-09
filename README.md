# RevTalentAI

The **Frontend Application** is a modern, responsive single-page dashboard built with React and Vite. It serves as the primary user interface for the **RevTalent** microservices HRMS ecosystem, supporting candidates, employees, managers, and HR administrators.

---

##  Project Description & Overview

### Phase 2: Cloud-Native Microservices Architecture
Phase 2 transforms the HR platform into a cloud-native microservices architecture designed for scalability, fault isolation, and independent deployment. The system is organized around HR business domains such as employee management, leave workflows, attendance tracking, recruitment, performance reviews, payroll, and AI-powered assistance. This approach improves maintainability while supporting secure, role-based access for employees, managers, and HR administrators.

---

## Microservices Architecture

The platform is divided into domain-focused services, each handling a specific business capability:

- **API Gateway** – Central entry point for routing, authentication, and request filtering.
- **Auth Service** – JWT-based login, authorization, and hierarchical role management.
- **Employee Service** – Employee profiles, department details, designation, and reporting hierarchy.
- **Leave Service** – Leave application, approval workflow, and balance tracking.
- **Attendance Service** – Check-in/check-out logging and monthly attendance summaries.
- **Recruitment Service** – Candidate lifecycle management from application to hiring.
- **Performance Service** – Manager ratings, feedback, and flexible review templates.
- **Payroll Service** – Salary breakdowns and summary views.
- **AI HR Assistant Service** – Policy Q&A, resume screening, and review summarization.
- **Admin/Analytics Service** – HR dashboards, workforce insights, and reporting.

---

## Service Communication

- **Synchronous Communication**: REST APIs with Feign Clients for service-to-service calls.
- **Asynchronous Communication**: RabbitMQ for event-driven workflows such as leave approvals, recruitment updates, and notification triggers.

---

##  Resilience & Configuration

- **Service Discovery**: Eureka Server for dynamic service registration and lookup.
- **Centralized Configuration**: Spring Cloud Config Server for environment-based configuration management.
- **Fault Tolerance**: Resilience4j Circuit Breakers to protect services from cascading failures.

---

## Data Management

- **MySQL** stores transactional data such as employees, leave, attendance, and payroll.
- **MongoDB** stores flexible document-based data such as resumes, review forms, policies, and chat history.
- **ChromaDB** supports AI retrieval over company documents, job descriptions, and review history.

---

##  Observability & Monitoring

- **Zipkin** provides distributed tracing across all microservices.
- **Structured Logging & Metrics** support debugging, performance monitoring, and operational visibility.

---

## Containerization & Orchestration

- **Docker** packages each service consistently across environments.
- **Docker Compose** supports complete local setup with databases, messaging, and tracing services.
- **Kubernetes on Azure AKS** manages deployment, scaling, service discovery, ConfigMaps, and secrets.

---

## CI/CD & Deployment

- **GitHub Actions** automates build, test, Docker image creation, and deployment.
- **Deployment Targets** include Azure Kubernetes Service (AKS) for production-like demos and Azure App Service for lightweight hosting scenarios.

---

## Outcome

This phase delivers a scalable, resilient, and production-ready HR platform with independent service deployment, event-driven workflows, AI-assisted HR operations, and a modern DevOps pipeline for efficient delivery and maintenance.

---

## Frontend Dependencies

The following libraries are declared in the project's `package.json`:

- **React 19 & Vite** (`react`, `react-dom`, `vite`): Core rendering engine and rapid build bundler.
- **Recharts** (`recharts`): Renders visual dashboard charts (bar charts, line graphs) representing attendance statistics, salary distributions, and performance scoring.
- **Bootstrap** (`bootstrap`): Supplies UI layout elements and CSS styling frameworks.
- **Axios** (`axios`): HTTP client used to fetch from and send JSON data to the API Gateway.
- **React Router DOM** (`react-router-dom`): Coordinates client-side routing between portals.
- **Lucide React & React Icons** (`lucide-react`, `react-icons`): Supplies icons for navigation links, indicators, and buttons.
- **Testing Libraries** (`jest`, `@testing-library/react`, `babel-jest`): Quality verification suite.

---
