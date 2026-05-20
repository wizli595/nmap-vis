# nmap-vis

A web-based visual interface for Nmap. Build scan commands visually, watch results appear on a radar, explore network maps.

## Stack

- **Backend:** FastAPI (Python) — command builder, Docker orchestration, XML parser
- **Frontend:** React + TypeScript + Tailwind — radar visualization, flag picker, network map
- **Scanner:** Nmap in a Docker container (Kali-slim)

## Quick Start

```bash
# Build the nmap Docker image
make docker-build

# Run in dev mode (backend + frontend)
make dev

# Or run everything in Docker
make docker-up
```

## Development

```bash
# Backend only
make dev-backend    # http://localhost:8000

# Frontend only
make dev-frontend   # http://localhost:5173

# Tests
make test

# Lint
make lint
```

## Architecture

```
routes → services → store/docker
```

Three layers. Routes are thin. Services do the work. Store holds state.

See [CLAUDE.md](CLAUDE.md) for full conventions and patterns.

## License

MIT
