#!/bin/bash

# Healthcare Portal - Unified Startup Script
# Starts both Admin Portal and Doctor/Patient Portal

echo "=========================================="
echo "🏥 Healthcare Portal System"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
  lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command_exists node; then
  echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18 or higher.${NC}"
  exit 1
fi

if ! command_exists npm; then
  echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
echo -e "${GREEN}✅ npm $(npm --version)${NC}"
echo ""

# Check if ports are available
echo -e "${BLUE}Checking port availability...${NC}"

if port_in_use 3000; then
  echo -e "${YELLOW}⚠️  Port 3000 is already in use (Doctor/Patient Portal)${NC}"
  echo -e "${YELLOW}   The Doctor/Patient Portal may already be running.${NC}"
else
  echo -e "${GREEN}✅ Port 3000 available (Doctor/Patient Portal)${NC}"
fi

if port_in_use 4000; then
  echo -e "${YELLOW}⚠️  Port 4000 is already in use (Admin Portal Backend)${NC}"
  echo -e "${YELLOW}   The Admin Portal backend may already be running.${NC}"
else
  echo -e "${GREEN}✅ Port 4000 available (Admin Portal Backend)${NC}"
fi

if port_in_use 5174; then
  echo -e "${YELLOW}⚠️  Port 5174 is already in use (Admin Portal Frontend)${NC}"
  echo -e "${YELLOW}   The Admin Portal frontend may already be running.${NC}"
else
  echo -e "${GREEN}✅ Port 5174 available (Admin Portal Frontend)${NC}"
fi

echo ""

# Check for Doctor/Patient Portal
DOCTOR_PORTAL_PATH="../capstone-helath-care-portal-latest"
DOCTOR_PORTAL_EXISTS=false

if [ -d "$DOCTOR_PORTAL_PATH" ]; then
  echo -e "${GREEN}✅ Doctor/Patient Portal found at ${DOCTOR_PORTAL_PATH}${NC}"
  DOCTOR_PORTAL_EXISTS=true
else
  echo -e "${YELLOW}⚠️  Doctor/Patient Portal not found at ${DOCTOR_PORTAL_PATH}${NC}"
  echo -e "${YELLOW}   Only Admin Portal will be started.${NC}"
  echo -e "${YELLOW}   To integrate with Doctor/Patient Portal, ensure it's located at:${NC}"
  echo -e "${YELLOW}   ${DOCTOR_PORTAL_PATH}${NC}"
fi

echo ""
echo -e "${BLUE}Starting services...${NC}"
echo ""

# Start Doctor/Patient Portal Backend (if exists)
if [ "$DOCTOR_PORTAL_EXISTS" = true ]; then
  echo -e "${BLUE}📦 Starting Doctor/Patient Portal Backend (Port 3000)...${NC}"
  cd "$DOCTOR_PORTAL_PATH/backend" || cd "$DOCTOR_PORTAL_PATH"

  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   Installing dependencies...${NC}"
    npm install
  fi

  npm run dev > ../../doctor-patient-backend.log 2>&1 &
  DOCTOR_BACKEND_PID=$!
  echo -e "${GREEN}   ✅ Started with PID $DOCTOR_BACKEND_PID${NC}"
  echo -e "${GREEN}   📝 Logs: doctor-patient-backend.log${NC}"
  cd - > /dev/null

  sleep 2

  # Start Doctor/Patient Portal Frontend (if exists)
  if [ -d "$DOCTOR_PORTAL_PATH/frontend" ]; then
    echo -e "${BLUE}🎨 Starting Doctor/Patient Portal Frontend...${NC}"
    cd "$DOCTOR_PORTAL_PATH/frontend"

    if [ ! -d "node_modules" ]; then
      echo -e "${YELLOW}   Installing dependencies...${NC}"
      npm install
    fi

    npm run dev > ../../doctor-patient-frontend.log 2>&1 &
    DOCTOR_FRONTEND_PID=$!
    echo -e "${GREEN}   ✅ Started with PID $DOCTOR_FRONTEND_PID${NC}"
    echo -e "${GREEN}   📝 Logs: doctor-patient-frontend.log${NC}"
    cd - > /dev/null
  fi

  sleep 3
fi

# Start Admin Portal Backend
echo -e "${BLUE}📦 Starting Admin Portal Backend (Port 4000)...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}   Installing dependencies...${NC}"
  npm install
fi

if [ ! -f ".env" ]; then
  echo -e "${YELLOW}   ⚠️  .env file not found. Copying from .env.example${NC}"
  cp .env.example .env
  echo -e "${RED}   ⚠️  Please update .env with your configuration!${NC}"
fi

npm run dev > ../admin-backend.log 2>&1 &
ADMIN_BACKEND_PID=$!
echo -e "${GREEN}   ✅ Started with PID $ADMIN_BACKEND_PID${NC}"
echo -e "${GREEN}   📝 Logs: admin-backend.log${NC}"
cd ..

sleep 3

# Start Admin Portal Frontend
echo -e "${BLUE}🎨 Starting Admin Portal Frontend (Port 5174)...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}   Installing dependencies...${NC}"
  npm install
fi

npm run dev > ../admin-frontend.log 2>&1 &
ADMIN_FRONTEND_PID=$!
echo -e "${GREEN}   ✅ Started with PID $ADMIN_FRONTEND_PID${NC}"
echo -e "${GREEN}   📝 Logs: admin-frontend.log${NC}"
cd ..

sleep 2

echo ""
echo "=========================================="
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo "=========================================="
echo ""
echo "📱 Access the applications:"
echo ""
if [ "$DOCTOR_PORTAL_EXISTS" = true ]; then
  echo -e "${BLUE}Doctor/Patient Portal:${NC}"
  echo "   🌐 http://localhost:3000 (or check actual port)"
  echo ""
fi
echo -e "${BLUE}Admin Portal:${NC}"
echo "   🌐 Frontend: http://localhost:5174"
echo "   🔧 Backend:  http://localhost:4000"
echo "   ❤️  Health:   http://localhost:4000/health"
echo ""
echo "📝 Log files:"
echo "   admin-backend.log"
echo "   admin-frontend.log"
if [ "$DOCTOR_PORTAL_EXISTS" = true ]; then
  echo "   doctor-patient-backend.log"
  echo "   doctor-patient-frontend.log"
fi
echo ""
echo "🛑 To stop all services:"
echo "   ./stop-all.sh"
echo "   or press Ctrl+C and run: kill $ADMIN_BACKEND_PID $ADMIN_FRONTEND_PID"
if [ "$DOCTOR_PORTAL_EXISTS" = true ] && [ -n "$DOCTOR_BACKEND_PID" ]; then
  echo "   kill $DOCTOR_BACKEND_PID $DOCTOR_FRONTEND_PID"
fi
echo ""
echo "=========================================="

# Save PIDs to file for stop script
echo "ADMIN_BACKEND_PID=$ADMIN_BACKEND_PID" > .pids
echo "ADMIN_FRONTEND_PID=$ADMIN_FRONTEND_PID" >> .pids
if [ "$DOCTOR_PORTAL_EXISTS" = true ] && [ -n "$DOCTOR_BACKEND_PID" ]; then
  echo "DOCTOR_BACKEND_PID=$DOCTOR_BACKEND_PID" >> .pids
  echo "DOCTOR_FRONTEND_PID=$DOCTOR_FRONTEND_PID" >> .pids
fi

# Wait for user interrupt
trap "echo ''; echo 'Stopping services...'; ./stop-all.sh; exit" INT
wait
