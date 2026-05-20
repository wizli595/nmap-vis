# nmap-vis — Build Phases

## Phase 1: Foundation [DONE]
Project skeleton, Docker, dev environment.

- [x] Git repo + GitHub remote
- [x] CLAUDE.md with project rules
- [x] Docker: Kali-slim + nmap image, docker-compose
- [x] Backend: FastAPI skeleton, health route, config
- [x] Frontend: Vite + React + TypeScript + Tailwind
- [x] Makefile, .gitignore, README

---

## Phase 2: Scanner Core [DONE]
Build nmap commands from UI, execute in Docker, return results.

- [x] Pydantic models: ScanRequest, ScanResult, Host, Port
- [x] flags.json: 35 nmap flags with descriptions
- [x] Fluent Builder: command_builder.py with input validation
- [x] Docker Manager: async container facade (aiodocker)
- [x] XML Parser: nmap output to structured data
- [x] Scan routes: POST /scan, GET /scan/{id}
- [x] Frontend: ScanPage, TargetInput, ScanTypeSelector, TimingSlider
- [x] Frontend: FlagPicker, FlagToggle, CommandPreview
- [x] Schema-driven flags.ts with toFlag() functions
- [x] Zustand store for scan state

---

## Phase 3: Real-Time Streaming [DONE]
Live scan output via WebSocket, snapshot + delta protocol.

- [x] event_bus.py: asyncio.Queue pub/sub with subscribe/publish/listen
- [x] scan_store.py: centralized scan state with event publishing
- [x] WebSocket endpoint: /scan/{id}/stream with snapshot + delta
- [x] useWebSocket.ts: shared WebSocket hook
- [x] useScanStream.ts: scan lifecycle hook with message handlers
- [x] TerminalView.tsx: color-coded output with auto-scroll
- [x] LiveScanView.tsx: status badges, command bar, host counter
- [x] ScanPage switches between builder and live view
- [x] 19 new tests (event bus + scan store), 70 total passing

---

## Phase 4: Radar Visualization [DONE]
Animated radar sweep during scan, transforms to network map when done.

- [x] RadarSweep.tsx: canvas radar with sweep beam, trail, grid, range rings, HUD
- [x] Host blips appear on radar as discovered, pulse animation, size by port count
- [x] NetworkMap.tsx: D3 force-directed graph with zoom/pan
- [x] HostNode.tsx: SVG node (size=open ports, color=status)
- [x] PortBadge.tsx: color-coded port state badges
- [x] HostDetail.tsx: click host to see ports, OS, hostname
- [x] RadarPage.tsx: toggle between radar and map, auto-switches on completion
- [x] LiveScanView: tabbed layout with Radar and Terminal tabs
- [x] D3 zoom, pan interactions on network map

---

## Phase 5: History, Scripts & Presets
Scan persistence, NSE scripts, quick-start presets.

- [ ] history_store.py: SQLite for completed scans
- [ ] History routes: GET /history, GET /history/{id}
- [ ] HistoryPage, ScanCard, useHistory
- [ ] Scan presets: Quick, Intense, Full Port, Vuln
- [ ] scripts.json: common NSE scripts with descriptions
- [ ] Scripts route: GET /scripts
- [ ] ScriptSelector.tsx: pick/search NSE scripts
- [ ] Custom script editor

---

## Phase 6: Open Source Polish
Tests, CI, docs, contributing guide.

- [ ] Backend tests: command_builder, parser, routes
- [ ] Frontend tests: scanner, radar components
- [ ] GitHub Actions CI: lint + test + docker build
- [ ] CONTRIBUTING.md: how to add flags, features, structure
- [ ] README.md: screenshots, setup, architecture diagram
- [ ] MIT License
