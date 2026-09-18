## Community Hero — AI-Powered Civic Infrastructure & Grievance Platform

> Built for the **1M1B AI for Sustainability Virtual Internship** (in collaboration with IBM SkillsBuild & AICTE).  
> **Primary SDG:** UN Sustainable Development Goal 11 (Sustainable Cities and Communities)  
> **Secondary SDG:** SDG 6 (Clean Water and Sanitation)

## Overview
Community Hero is an intelligent civic reporting platform combining interactive geospatial mapping (Mapbox GL) with multimodal AI triage to detect, prioritize, and route municipal infrastructure issues (water pipe bursts, road hazards, sanitation breakdowns).

## AI Workflow
1. **Multimodal Issue Classification:** Automated analysis of citizen-submitted descriptions and photos to categorize issue urgency and domain.
2. **Automated Severity Scoring:** Priority indexing ensuring critical resource hazards (e.g., major water leaks) are escalated first.
3. **Smart Radius De-duplication:** Clusters nearby duplicate reports into a single actionable dispatch ticket.

## Responsible AI & Ethics
- **Privacy First:** Automatic anonymization and redaction of personal identifiable imagery (faces, vehicle plates).
- **Equitable Prioritization:** Severity-based issue scoring independent of neighborhood demographics.

## Architecture Blueprint

```
                 +---------------------------------------+
                 |            Mobile App / Web           |
                 +-------------------+-------------------+
                                     | (REST / WebSockets)
                                     v
                 +-------------------+-------------------+
                 |           NestJS Core                 |
                 +----+--------------+---------------+---+
                      | (Pub/Sub)    |               |
                      v              |               v
                 +----+----+    +----+----+    +-----+----+
                 | RabbitMQ|    | PostgreSQL|   |  Redis   |
                 +----+----+    +----+----+    +-----+----+
                      |              |               ^
                      | (Trigger AI) |               | (Leaderboard)
                      v              v               |
                 +----+--------------+---------------+---+
                 |            Celery Workers             |
                 |    (YOLOv8 + MobileNetV3 + MinIO)     |
                 +---------------------------------------+
```

---

## Getting Started (Local Launch Guide)

### Prerequisites
- Docker & Docker Compose
- Node.js (v24+)
- Python (3.12+)

---

### Step 1 — Spin up Infrastructure
Run the following command at the project root directory to launch PostgreSQL (with PostGIS), Redis, RabbitMQ, and MinIO storage:

```bash
docker-compose up -d
```

---

### Step 2 — Run Core NestJS Backend
Navigate to `/backend-core` to install and start the NestJS web service:

```bash
cd backend-core
npm install
npm run start:dev
```
- Rest API URL: `http://localhost:3000`
- WebSockets Namespace: `http://localhost:3000`

---

### Step 3 — Start Spatial Microservice
FastAPI handles spatial indexing, report duplication checks (`ST_DWithin` inside 50m radius), and media uploads:

```bash
cd spatial-service
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload
```
- Spatial API Swagger Documentation: `http://localhost:8001/docs`

---

### Step 4 — Run Async AI Workers
Celery processes incoming images asynchronously:
1. Runs **YOLOv8** to blur faces and license plates.
2. Runs **MobileNetV3** small model to auto-categorize and determine severity.
3. Post-processes to write results to PostGIS and notify WebSockets.

```bash
cd async-workers
pip install -r requirements.txt
celery -A worker worker --loglevel=info -Q ai_pipeline --concurrency=1
```

---

### Step 5 — Run Web Dashboard & Admin Portal
Vite + React + TS administration dashboard containing map views, live WebSocket mirrors, upvote verifications, and monthly leaderboard analytics:

```bash
cd web-dashboard
npm install
npm run dev
```

---

### Step 6 — Run Mobile App
Scaffolded React Native / Expo application for geotagged submissions and gamified points:

```bash
cd mobile-app
npm install
npx expo start
```
