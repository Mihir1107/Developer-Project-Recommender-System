#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [[ ! -d "$BACKEND_DIR" || ! -d "$FRONTEND_DIR" ]]; then
  echo "Run this script from the project root."
  exit 1
fi

if [[ ! -d "$BACKEND_DIR/venv" ]]; then
  echo "Backend virtual environment not found at backend/venv."
  echo "Create it with:"
  echo "  cd backend"
  echo "  python3 -m venv venv"
  echo "  source venv/bin/activate"
  echo "  pip install -r requirements.txt"
  exit 1
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "Frontend dependencies not found at frontend/node_modules."
  echo "Install them with:"
  echo "  cd frontend"
  echo "  npm install"
  exit 1
fi

cleanup() {
  echo
  echo "Stopping backend and frontend..."

  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  wait "${BACKEND_PID:-}" "${FRONTEND_PID:-}" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

echo "Starting backend at http://localhost:8000"
(
  cd "$BACKEND_DIR" || exit 1
  source venv/bin/activate
  uvicorn main:app --reload
) &
BACKEND_PID=$!

echo "Starting frontend at http://localhost:3000"
(
  cd "$FRONTEND_DIR" || exit 1
  npm start
) &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both services."

wait "$BACKEND_PID" "$FRONTEND_PID"