# Community Hero — Hyperlocal Problem Solver
A full-stack civic grievance platform built during my internship at 1M1B (One Million for One Billion) with IBM SkillsBuild (AICTE-supported), addressing SDG 6 and SDG 11.
Citizens report local infrastructure issues (potholes, water leaks, waste, broken infrastructure) with a photo and location. A multimodal AI pipeline categorises each report and scores its severity; geospatial deduplication clusters duplicate reports of the same issue into master tickets; and an SLA state machine (Reported → Triaged → Dispatched → Resolved) tracks resolution transparently.
Stack: NestJS backend, FastAPI spatial service with PostGIS, Celery async workers (image privacy blurring and categorisation models), Vite + React + TypeScript dashboard, React Native/Expo mobile app, PostgreSQL/PostGIS, Redis, RabbitMQ, MinIO, Docker Compose.
Built by Vishal Sogarwal.
