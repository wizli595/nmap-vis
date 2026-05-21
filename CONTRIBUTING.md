# Contributing to nmap-vis

Thanks for your interest in contributing! This project is designed to be contributor-friendly — most changes are config-driven, not code-driven.

## Getting Started

### Prerequisites

- Docker Desktop
- Python 3.12+
- Node.js 20+

### Setup

```bash
git clone https://github.com/wizli595/nmap-vis.git
cd nmap-vis

# Build nmap Docker image
make docker-build

# Backend
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows
# source .venv/bin/activate     # Mac/Linux
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### Running

```bash
# Terminal 1 — backend
cd backend && source .venv/Scripts/activate
uvicorn main:app --reload --port 8001

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open http://localhost:5173

### Testing

```bash
cd backend && python -m pytest tests/ -v
cd frontend && npx tsc --noEmit
```

## How to Contribute

### Adding an Nmap Flag

This is the most common contribution. No React knowledge needed.

**1. Add to `backend/data/flags.json`:**

```json
{
  "flag": "--new-flag",
  "name": "New Flag",
  "description": "What this flag does in plain English",
  "category": "detection",
  "has_value": false
}
```

Categories: `scan_type`, `detection`, `port`, `timing`, `host_discovery`, `output`, `evasion`, `script`

**2. Add to `frontend/src/data/flags.ts`:**

Add to the appropriate group array:

```typescript
{
  id: 'newFlag',
  flag: '--new-flag',
  name: 'New Flag',
  description: 'What this flag does',
  category: 'detection',
  type: 'toggle',  // or 'text' for flags with values
  toFlag: (on) => (on ? '--new-flag' : ''),
}
```

**3. Whitelist in `backend/services/command_builder.py`:**

Add the flag to `ALLOWED_FLAGS` (for boolean flags) or `VALUE_FLAGS` (for flags with values).

Done. The UI renders it automatically.

### Adding an NSE Script

Even simpler — one file only.

**Add to `backend/data/scripts.json`:**

```json
{
  "name": "script-name",
  "description": "What this script does",
  "category": "vulnerability"
}
```

Categories: `vulnerability`, `discovery`, `enumeration`, `security`, `general`

The API serves it, the UI renders it. No other changes needed.

### Adding a Scan Preset

**Add to `frontend/src/data/presets.ts`:**

```typescript
{
  id: 'my-preset',
  name: 'My Preset',
  description: 'What this preset does',
  scanType: '-sS',
  timing: 4,
  flags: { versionDetection: true, osDetection: true },
  scripts: ['vuln'],
}
```

## Project Structure

```
backend/
  routes/          Thin HTTP handlers — validate, call service, respond
  services/        Business logic — command builder, docker, parser
  models/          Pydantic schemas
  store/           State — active scans (memory), history (SQLite)
  data/            Static config — flags.json, scripts.json
  tests/           pytest tests

frontend/
  src/
    features/      Feature folders — scanner, radar, history, terminal
    api/           API client functions
    stores/        Zustand state
    data/          Schema-driven configs (flags, presets)
    types/         TypeScript interfaces
```

## Code Style

We follow Clean Code (Robert C. Martin):

- Small functions that do one thing
- Meaningful names — no abbreviations
- Early returns over nested ifs
- No comments where code speaks for itself
- DRY — but don't abstract prematurely

## Submitting a PR

1. Fork and create a branch from `master`
2. Make your changes
3. Run tests: `pytest tests/ -v` and `npx tsc --noEmit`
4. Write a clear commit message (imperative mood, focus on why)
5. Open a PR with a short description

## Questions?

Open an issue on GitHub. We're happy to help.
