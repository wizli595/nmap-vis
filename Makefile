.PHONY: dev dev-backend dev-frontend build docker-build docker-up docker-down test lint

dev:
	$(MAKE) dev-backend & $(MAKE) dev-frontend

dev-backend:
	cd backend && uvicorn main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

docker-build:
	docker build -t nmap-vis-nmap -f docker/Dockerfile.nmap docker/

docker-up:
	docker compose -f docker/docker-compose.yml up --build

docker-down:
	docker compose -f docker/docker-compose.yml down

test:
	cd backend && python -m pytest tests/ -v

lint:
	cd backend && python -m ruff check .
	cd frontend && npm run lint
