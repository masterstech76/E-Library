# ReVena E-Library Backend (Java / Spring Boot)

A Java backend that serves **all** E-Library pages and provides a **live-internet AI agent**
for students.

## Features

- 🖥️ **Serves all E-Library pages** — home, feature pages, CSS, JS, and assets.
- 🤖 **Live-internet AI agent** — fetches real, current information directly from the open web
  (Wikipedia REST API + DuckDuckGo Instant Answer API) and presents it directly to students.
  It does NOT just link out to Google/Gemini/other agents.
- 🛡️ **Refuses live exam answers** — the agent will not answer live exam questions or provide
  answers to exam papers.
- 🌐 **CORS enabled** for all `/api/**` endpoints.

## Tech Stack

- Java 17
- Spring Boot 3.2.5
- Maven
- `org.json` (JSON parsing)
- `HttpURLConnection` (live web fetch)

## Project Structure

```
backend/
├── pom.xml
├── README.md
└── src/main/
    ├── java/com/revena/
    │   ├── RevenaBackendApplication.java   (main app + CORS)
    │   ├── controller/
    │   │   ├── AgentController.java        (REST: /api/health, /api/agent/chat)
    │   │   └── PageController.java         (serves all static pages)
    │   ├── dto/
    │   │   ├── ChatRequest.java
    │   │   └── ChatResponse.java
    │   └── service/
    │       └── AgentService.java           (live internet fetch + exam refusal)
    └── resources/
        └── application.properties
```

## Running the Backend

> Requires Java 17+ and Maven 3.6+.

From the repository root:

```bash
cd backend
mvn spring-boot:run
```

The server starts on http://localhost:8080

## Endpoints

| Method | URL                | Description                                        |
|--------|--------------------|----------------------------------------------------|
| GET    | `/`                | Serves the home page (`html/index.html`)           |
| GET    | `/api/health`      | Health check for the frontend                      |
| POST   | `/api/agent/chat`  | AI agent chat (live internet info)                 |
| GET    | `/pages/features/{name}.html` | Serves a feature page (e.g. `jee-exam.html`) |
| GET    | `/css/{name}.css`  | Serves a stylesheet                                |
| GET    | `/js/{name}.js`    | Serves a script                                    |

### Chat request example

```json
POST /api/agent/chat
{
  "message": "What is Newton's second law?",
  "subject": "physics"
}
```

### Chat response example

```json
{
  "reply": "Newton's second law states that the acceleration...",
  "source": "Wikipedia — Newton's laws of motion",
  "live": true,
  "refused": false
}
```

## AI Agent Behavior

1. **Greetings / identity / thanks** → answered locally by the agent.
2. **Live web fetch** → the agent queries DuckDuckGo and Wikipedia and returns real content.
3. **Exam questions** → the agent politely refuses and instead offers to explain the concept.
4. **Fallback** → helpful study guidance pointing the student to ask a concrete topic.
