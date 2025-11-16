#!/bin/bash

# Healthcare Portal - Unified Stop Script
# Stops all running services

echo "=========================================="
echo "🛑 Stopping Healthcare Portal Services"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Read PIDs from file
if [ -f ".pids" ]; then
  source .pids

  # Stop Admin Backend
  if [ -n "$ADMIN_BACKEND_PID" ]; then
    if kill -0 $ADMIN_BACKEND_PID 2>/dev/null; then
      echo -e "${YELLOW}Stopping Admin Portal Backend (PID: $ADMIN_BACKEND_PID)...${NC}"
      kill $ADMIN_BACKEND_PID 2>/dev/null
      echo -e "${GREEN}✅ Stopped${NC}"
    else
      echo -e "${YELLOW}Admin Portal Backend (PID: $ADMIN_BACKEND_PID) is not running${NC}"
    fi
  fi

  # Stop Admin Frontend
  if [ -n "$ADMIN_FRONTEND_PID" ]; then
    if kill -0 $ADMIN_FRONTEND_PID 2>/dev/null; then
      echo -e "${YELLOW}Stopping Admin Portal Frontend (PID: $ADMIN_FRONTEND_PID)...${NC}"
      kill $ADMIN_FRONTEND_PID 2>/dev/null
      echo -e "${GREEN}✅ Stopped${NC}"
    else
      echo -e "${YELLOW}Admin Portal Frontend (PID: $ADMIN_FRONTEND_PID) is not running${NC}"
    fi
  fi

  # Stop Doctor/Patient Backend
  if [ -n "$DOCTOR_BACKEND_PID" ]; then
    if kill -0 $DOCTOR_BACKEND_PID 2>/dev/null; then
      echo -e "${YELLOW}Stopping Doctor/Patient Portal Backend (PID: $DOCTOR_BACKEND_PID)...${NC}"
      kill $DOCTOR_BACKEND_PID 2>/dev/null
      echo -e "${GREEN}✅ Stopped${NC}"
    else
      echo -e "${YELLOW}Doctor/Patient Portal Backend (PID: $DOCTOR_BACKEND_PID) is not running${NC}"
    fi
  fi

  # Stop Doctor/Patient Frontend
  if [ -n "$DOCTOR_FRONTEND_PID" ]; then
    if kill -0 $DOCTOR_FRONTEND_PID 2>/dev/null; then
      echo -e "${YELLOW}Stopping Doctor/Patient Portal Frontend (PID: $DOCTOR_FRONTEND_PID)...${NC}"
      kill $DOCTOR_FRONTEND_PID 2>/dev/null
      echo -e "${GREEN}✅ Stopped${NC}"
    else
      echo -e "${YELLOW}Doctor/Patient Portal Frontend (PID: $DOCTOR_FRONTEND_PID) is not running${NC}"
    fi
  fi

  # Remove PID file
  rm .pids

else
  echo -e "${YELLOW}No PID file found. Attempting to kill processes by port...${NC}"

  # Kill by port as fallback
  # Port 4000 (Admin Backend)
  ADMIN_BACKEND_PID=$(lsof -ti:4000)
  if [ -n "$ADMIN_BACKEND_PID" ]; then
    echo -e "${YELLOW}Stopping Admin Portal Backend on port 4000...${NC}"
    kill $ADMIN_BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Stopped${NC}"
  fi

  # Port 5174 (Admin Frontend)
  ADMIN_FRONTEND_PID=$(lsof -ti:5174)
  if [ -n "$ADMIN_FRONTEND_PID" ]; then
    echo -e "${YELLOW}Stopping Admin Portal Frontend on port 5174...${NC}"
    kill $ADMIN_FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Stopped${NC}"
  fi

  # Port 3000 (Doctor/Patient Backend)
  DOCTOR_BACKEND_PID=$(lsof -ti:3000)
  if [ -n "$DOCTOR_BACKEND_PID" ]; then
    echo -e "${YELLOW}Stopping Doctor/Patient Portal Backend on port 3000...${NC}"
    kill $DOCTOR_BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Stopped${NC}"
  fi
fi

echo ""
echo -e "${GREEN}All services stopped successfully!${NC}"
echo "=========================================="
