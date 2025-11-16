#!/bin/bash

# Admin Portal Stop Script
# Stops all Admin Portal processes

echo "=========================================="
echo "🛑 Stopping Admin Portal"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Read PIDs from file
if [ -f ".admin-pids" ]; then
  source .admin-pids

  # Stop Backend
  if [ -n "$BACKEND_PID" ]; then
    if kill -0 $BACKEND_PID 2>/dev/null; then
      echo -e "${YELLOW}Stopping Admin Portal Backend (PID: $BACKEND_PID)...${NC}"
      kill $BACKEND_PID 2>/dev/null
      sleep 1
      # Force kill if still running
      if kill -0 $BACKEND_PID 2>/dev/null; then
        kill -9 $BACKEND_PID 2>/dev/null
      fi
      echo -e "${GREEN}✅ Stopped${NC}"
    else
      echo -e "${YELLOW}Backend (PID: $BACKEND_PID) is not running${NC}"
    fi
  fi

  # Stop Frontend
  if [ -n "$FRONTEND_PID" ]; then
    if kill -0 $FRONTEND_PID 2>/dev/null; then
      echo -e "${YELLOW}Stopping Admin Portal Frontend (PID: $FRONTEND_PID)...${NC}"
      kill $FRONTEND_PID 2>/dev/null
      sleep 1
      # Force kill if still running
      if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill -9 $FRONTEND_PID 2>/dev/null
      fi
      echo -e "${GREEN}✅ Stopped${NC}"
    else
      echo -e "${YELLOW}Frontend (PID: $FRONTEND_PID) is not running${NC}"
    fi
  fi

  # Remove PID file
  rm .admin-pids

else
  echo -e "${YELLOW}No PID file found. Attempting to kill processes by port...${NC}"

  # Kill by port as fallback
  # Port 4000 (Backend)
  BACKEND_PID=$(lsof -ti:4000 2>/dev/null)
  if [ -n "$BACKEND_PID" ]; then
    echo -e "${YELLOW}Stopping Admin Portal Backend on port 4000...${NC}"
    kill $BACKEND_PID 2>/dev/null
    sleep 1
    # Force kill if still running
    if lsof -ti:4000 >/dev/null 2>&1; then
      kill -9 $(lsof -ti:4000) 2>/dev/null
    fi
    echo -e "${GREEN}✅ Stopped${NC}"
  else
    echo -e "${YELLOW}No process found on port 4000${NC}"
  fi

  # Port 5174 (Frontend)
  FRONTEND_PID=$(lsof -ti:5174 2>/dev/null)
  if [ -n "$FRONTEND_PID" ]; then
    echo -e "${YELLOW}Stopping Admin Portal Frontend on port 5174...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    sleep 1
    # Force kill if still running
    if lsof -ti:5174 >/dev/null 2>&1; then
      kill -9 $(lsof -ti:5174) 2>/dev/null
    fi
    echo -e "${GREEN}✅ Stopped${NC}"
  else
    echo -e "${YELLOW}No process found on port 5174${NC}"
  fi
fi

echo ""
echo -e "${GREEN}Admin Portal stopped successfully!${NC}"
echo "=========================================="
