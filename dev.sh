#!/bin/bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
DESKTOP_DIR="$ROOT_DIR/desktop"

# ── Colors ───────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

log()  { echo -e "${GREEN}[✔]${RESET} $1"; }
warn() { echo -e "${YELLOW}[!]${RESET} $1"; }
info() { echo -e "${CYAN}[→]${RESET} $1"; }
err()  { echo -e "${RED}[✘]${RESET} $1"; }

# ══════════════════════════════════════════════════════════════
#  COMBINED
# ══════════════════════════════════════════════════════════════

# DB (Docker) + Backend Express (local) + Frontend (local)
run_web() {
  trap "echo -e '\n${YELLOW}Stopping servers...${RESET}'; docker compose -f \"$BACKEND_DIR/docker-compose.yml\" down; kill 0" SIGINT
  info "Starting DB (Docker)...";    docker compose -f "$BACKEND_DIR/docker-compose.yml" up -d
  log  "DB running."
  log  "Starting Backend (Express)..."; (cd "$BACKEND_DIR" && npm run dev) &
  log  "Starting Frontend...";          (cd "$FRONTEND_DIR" && npm run dev) &
  wait
}

# Everything via root docker-compose + Desktop (local Electron)
run_all() {
  trap "echo -e '\n${YELLOW}Stopping all...${RESET}'; docker compose -f \"$ROOT_DIR/docker-compose.yml\" down; kill 0" SIGINT
  info "Starting all services (Docker)..."; docker compose -f "$ROOT_DIR/docker-compose.yml" up -d
  log  "Docker containers running."
  log  "Starting Desktop (Electron)..."; (cd "$DESKTOP_DIR" && npm run dev) &
  wait
}

run_test() {
  info "Running Backend tests...";  (cd "$BACKEND_DIR" && npm test)
  echo ""
  info "Running Frontend tests..."; (cd "$FRONTEND_DIR" && npm test)
  echo ""
  warn "Desktop has no tests — it shares the Frontend build."
  echo ""; log "All tests done."
}

install_all() {
  info "Installing Backend dependencies...";  (cd "$BACKEND_DIR" && npm install)
  echo ""
  info "Installing Frontend dependencies..."; (cd "$FRONTEND_DIR" && npm install)
  echo ""
  info "Installing Desktop dependencies...";  (cd "$DESKTOP_DIR" && npm install)
  echo ""; log "All dependencies installed."
}

# ══════════════════════════════════════════════════════════════
#  BACKEND  (Express — runs locally)
# ══════════════════════════════════════════════════════════════
b_run()     { info "Backend: npm run dev";  (cd "$BACKEND_DIR" && npm run dev); }
b_install() { info "Backend: npm install";  (cd "$BACKEND_DIR" && npm install); }
b_test()    { info "Backend: npm test";     (cd "$BACKEND_DIR" && npm test); }
b_build()   { info "Backend: npm build";    (cd "$BACKEND_DIR" && npm run build); }
b_lint()    { info "Backend: npm lint";     (cd "$BACKEND_DIR" && npm run lint); }

# ══════════════════════════════════════════════════════════════
#  DATABASE  (Postgres via backend/docker-compose.yml)
# ══════════════════════════════════════════════════════════════
db_up()     { info "DB: starting...";           docker compose -f "$BACKEND_DIR/docker-compose.yml" up -d && log "DB running."; }
db_down()   { info "DB: stopping...";           docker compose -f "$BACKEND_DIR/docker-compose.yml" down; }
db_logs()   { info "DB: logs (Ctrl+C to exit)"; docker compose -f "$BACKEND_DIR/docker-compose.yml" logs -f; }
db_ps()     { info "DB: status";                docker compose -f "$BACKEND_DIR/docker-compose.yml" ps; }
db_shell()  {
  info "Opening psql shell..."
  docker compose -f "$BACKEND_DIR/docker-compose.yml" exec db \
    psql -U ihsan -d ihsan_db
}

# ══════════════════════════════════════════════════════════════
#  ROOT DOCKER-COMPOSE  (Backend + Frontend + DB together)
# ══════════════════════════════════════════════════════════════
root_up()      { info "Root: docker compose up";        docker compose -f "$ROOT_DIR/docker-compose.yml" up; }
root_upd()     { info "Root: docker compose up -d";     docker compose -f "$ROOT_DIR/docker-compose.yml" up -d && log "All containers running."; }
root_down()    { info "Root: docker compose down";      docker compose -f "$ROOT_DIR/docker-compose.yml" down; }
root_logs()    { info "Root: logs (Ctrl+C to exit)";    docker compose -f "$ROOT_DIR/docker-compose.yml" logs -f; }
root_build()   { info "Root: docker compose build";     docker compose -f "$ROOT_DIR/docker-compose.yml" build; }
root_restart() { info "Root: restarting...";            docker compose -f "$ROOT_DIR/docker-compose.yml" restart && log "Restarted."; }
root_ps()      { info "Root: container status";         docker compose -f "$ROOT_DIR/docker-compose.yml" ps; }

# ══════════════════════════════════════════════════════════════
#  FRONTEND  (local npm)
# ══════════════════════════════════════════════════════════════
f_run()     { info "Frontend: dev";     (cd "$FRONTEND_DIR" && npm run dev); }
f_test()    { info "Frontend: test";    (cd "$FRONTEND_DIR" && npm test); }
f_install() { info "Frontend: install"; (cd "$FRONTEND_DIR" && npm install); }
f_build()   { info "Frontend: build";   (cd "$FRONTEND_DIR" && npm run build); }
f_lint()    { info "Frontend: lint";    (cd "$FRONTEND_DIR" && npm run lint); }

# ══════════════════════════════════════════════════════════════
#  DESKTOP  (Electron)
# ══════════════════════════════════════════════════════════════
d_run()     { info "Desktop: dev (Electron)"; (cd "$DESKTOP_DIR" && npm run dev); }
d_install() { info "Desktop: install";        (cd "$DESKTOP_DIR" && npm install); }
d_build()   { info "Desktop: build";          (cd "$DESKTOP_DIR" && npm run build); }

# ══════════════════════════════════════════════════════════════
#  MENU
# ══════════════════════════════════════════════════════════════
show_menu() {
  clear
  echo -e "${BOLD}${CYAN}"
  echo "  ╔══════════════════════════════╗"
  echo "  ║     IndieHub Dev Console     ║"
  echo "  ╚══════════════════════════════╝"
  echo -e "${RESET}"

  echo -e "  ${BOLD}Combined${RESET}"
  echo "    1)  Run     — DB (Docker) + Backend (local) + Frontend (local)"
  echo "    2)  Run     — Root Docker (all) + Desktop (Electron)"
  echo "    3)  Test    — Backend + Frontend"
  echo "    4)  Install — All npm dependencies"
  echo ""

  echo -e "  ${BOLD}Backend  ${CYAN}(Express · runs locally)${RESET}"
  echo "    b1) Run    b2) Install    b3) Test    b4) Build    b5) Lint"
  echo ""

  echo -e "  ${BOLD}Database  ${CYAN}(Postgres · backend/docker-compose.yml)${RESET}"
  echo "    db1) Up    db2) Down    db3) Logs    db4) Status    db5) psql shell"
  echo ""

  echo -e "  ${BOLD}Root Docker  ${CYAN}(docker-compose.yml — all services)${RESET}"
  echo "    r1) Up (attached)    r2) Up (detached)    r3) Down"
  echo "    r4) Logs             r5) Build            r6) Restart"
  echo "    r7) Status (ps)"
  echo ""

  echo -e "  ${BOLD}Frontend  ${CYAN}(local npm)${RESET}"
  echo "    f1) Run    f2) Test    f3) Install    f4) Build    f5) Lint"
  echo ""

  echo -e "  ${BOLD}Desktop  ${CYAN}(Electron)${RESET}"
  echo "    d1) Run    d2) Install    d3) Build"
  echo -e "    ${YELLOW}(no tests — Desktop shares Frontend build)${RESET}"
  echo ""
  echo -e "    q)  Quit"
  echo ""
  echo -ne "${CYAN}  Choose > ${RESET}"
  read -r choice

  case $choice in
    1)   run_web ;;       2)   run_all ;;      3)   run_test ;;    4)   install_all ;;
    b1)  b_run ;;         b2)  b_install ;;    b3)  b_test ;;      b4)  b_build ;;  b5) b_lint ;;
    db1) db_up ;;         db2) db_down ;;      db3) db_logs ;;     db4) db_ps ;;    db5) db_shell ;;
    r1)  root_up ;;       r2)  root_upd ;;     r3)  root_down ;;
    r4)  root_logs ;;     r5)  root_build ;;   r6)  root_restart ;; r7) root_ps ;;
    f1)  f_run ;;         f2)  f_test ;;       f3)  f_install ;;   f4)  f_build ;;  f5) f_lint ;;
    d1)  d_run ;;         d2)  d_install ;;    d3)  d_build ;;
    q|Q) echo "Bye!"; exit 0 ;;
    *)   warn "Unknown option. Try again."; sleep 1 ;;
  esac

  echo -e "\n${YELLOW}Press Enter to return to menu...${RESET}"
  read -r
  show_menu
}

# ══════════════════════════════════════════════════════════════
#  CLI  ./dev.sh [option]
# ══════════════════════════════════════════════════════════════
case "${1:-}" in
  # Combined
  web)       run_web ;;
  all)       run_all ;;
  test)      run_test ;;
  setup)     install_all ;;
  # Backend
  b:run)     b_run ;;
  b:install) b_install ;;
  b:test)    b_test ;;
  b:build)   b_build ;;
  b:lint)    b_lint ;;
  # DB
  db:up)     db_up ;;
  db:down)   db_down ;;
  db:logs)   db_logs ;;
  db:ps)     db_ps ;;
  db:shell)  db_shell ;;
  # Root Docker
  r:up)      root_up ;;
  r:upd)     root_upd ;;
  r:down)    root_down ;;
  r:logs)    root_logs ;;
  r:build)   root_build ;;
  r:restart) root_restart ;;
  r:ps)      root_ps ;;
  # Frontend
  f:run)     f_run ;;
  f:test)    f_test ;;
  f:install) f_install ;;
  f:build)   f_build ;;
  f:lint)    f_lint ;;
  # Desktop
  d:run)     d_run ;;
  d:install) d_install ;;
  d:build)   d_build ;;
  # Help
  help|-h|--help)
    echo -e "${BOLD}Usage:${RESET} ./dev.sh [option]   (no option → interactive menu)"
    echo ""
    echo -e "  ${CYAN}web${RESET}          DB (Docker) + Backend (local) + Frontend (local)"
    echo -e "  ${CYAN}all${RESET}          Root Docker (all) + Desktop (Electron)"
    echo -e "  ${CYAN}test${RESET}         Test Backend + Frontend"
    echo -e "  ${CYAN}setup${RESET}        npm install everywhere"
    echo ""
    echo -e "  ${CYAN}b:run${RESET}        Backend npm run dev (Express)"
    echo -e "  ${CYAN}b:install${RESET}    Backend npm install"
    echo -e "  ${CYAN}b:test${RESET}       Backend npm test"
    echo -e "  ${CYAN}b:build${RESET}      Backend npm run build"
    echo -e "  ${CYAN}b:lint${RESET}       Backend npm run lint"
    echo ""
    echo -e "  ${CYAN}db:up${RESET}        Postgres docker compose up -d"
    echo -e "  ${CYAN}db:down${RESET}      Postgres docker compose down"
    echo -e "  ${CYAN}db:logs${RESET}      Postgres logs -f"
    echo -e "  ${CYAN}db:ps${RESET}        Postgres container status"
    echo -e "  ${CYAN}db:shell${RESET}     psql shell (ihsan/ihsan_db)"
    echo ""
    echo -e "  ${CYAN}r:up${RESET}         root docker-compose up (attached)"
    echo -e "  ${CYAN}r:upd${RESET}        root docker-compose up -d"
    echo -e "  ${CYAN}r:down${RESET}       root docker-compose down"
    echo -e "  ${CYAN}r:logs${RESET}       root docker-compose logs -f"
    echo -e "  ${CYAN}r:build${RESET}      root docker-compose build"
    echo -e "  ${CYAN}r:restart${RESET}    root docker-compose restart"
    echo -e "  ${CYAN}r:ps${RESET}         root docker-compose ps"
    echo ""
    echo -e "  ${CYAN}f:run${RESET}        Frontend npm run dev"
    echo -e "  ${CYAN}f:test${RESET}       Frontend npm test"
    echo -e "  ${CYAN}f:install${RESET}    Frontend npm install"
    echo -e "  ${CYAN}f:build${RESET}      Frontend npm run build"
    echo -e "  ${CYAN}f:lint${RESET}       Frontend npm run lint"
    echo ""
    echo -e "  ${CYAN}d:run${RESET}        Desktop npm run dev (Electron)"
    echo -e "  ${CYAN}d:install${RESET}    Desktop npm install"
    echo -e "  ${CYAN}d:build${RESET}      Desktop npm run build"
    echo -e "  ${YELLOW}  (Desktop has no tests)${RESET}"
    ;;
  "") show_menu ;;
  *)  err "Unknown option: $1"; echo "Run './dev.sh help' to see all options."; exit 1 ;;
esac
