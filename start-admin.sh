#!/bin/bash

# Admin Portal Startup Script
# Starts only the Admin Portal (Backend + Frontend)

echo "=========================================="
echo "🏥 Healthcare Admin Portal"
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

if port_in_use 4000; then
  echo -e "${YELLOW}⚠️  Port 4000 is already in use (Admin Portal Backend)${NC}"
  echo -e "${YELLOW}   Attempting to kill existing process...${NC}"
  kill -9 $(lsof -ti:4000) 2>/dev/null
  sleep 2
  if port_in_use 4000; then
    echo -e "${RED}❌ Failed to free port 4000. Please kill the process manually.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Port 4000 freed${NC}"
else
  echo -e "${GREEN}✅ Port 4000 available (Admin Portal Backend)${NC}"
fi

if port_in_use 5174; then
  echo -e "${YELLOW}⚠️  Port 5174 is already in use (Admin Portal Frontend)${NC}"
  echo -e "${YELLOW}   Attempting to kill existing process...${NC}"
  kill -9 $(lsof -ti:5174) 2>/dev/null
  sleep 2
  if port_in_use 5174; then
    echo -e "${RED}❌ Failed to free port 5174. Please kill the process manually.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Port 5174 freed${NC}"
else
  echo -e "${GREEN}✅ Port 5174 available (Admin Portal Frontend)${NC}"
fi

echo ""

# Check .env file
if [ ! -f "backend/.env" ]; then
  echo -e "${YELLOW}⚠️  .env file not found in backend/. Copying from .env.example${NC}"
  cp backend/.env.example backend/.env
  echo -e "${RED}⚠️  Please update backend/.env with your configuration before starting!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"
echo ""

# Start Backend
echo -e "${BLUE}📦 Starting Admin Portal Backend (Port 4000)...${NC}"
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}   Installing backend dependencies...${NC}"
  npm install
fi

# Check if Prisma is setup
if [ ! -d "node_modules/@prisma/client" ]; then
  echo -e "${YELLOW}   Generating Prisma client...${NC}"
  PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate 2>/dev/null || {
    echo -e "${YELLOW}   ⚠️  Prisma generation may have failed due to network restrictions${NC}"
    echo -e "${YELLOW}   The app may still work if Prisma engines are pre-installed${NC}"
  }
fi

# Start backend server
npm run dev > ../admin-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}   ✅ Started with PID $BACKEND_PID${NC}"
echo -e "${GREEN}   📝 Logs: admin-backend.log${NC}"
cd ..

sleep 3

# Check if backend started successfully
if ! port_in_use 4000; then
  echo -e "${RED}❌ Backend failed to start. Check admin-backend.log for errors.${NC}"
  tail -20 admin-backend.log
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

# Start Frontend
echo -e "${BLUE}🎨 Starting Admin Portal Frontend (Port 5174)...${NC}"
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}   Installing frontend dependencies...${NC}"
  npm install
fi

# Start frontend server
npm run dev > ../admin-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}   ✅ Started with PID $FRONTEND_PID${NC}"
echo -e "${GREEN}   📝 Logs: admin-frontend.log${NC}"
cd ..

sleep 2

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Admin Portal started successfully!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}📱 Access the application:${NC}"
echo ""
echo -e "   🌐 Admin Portal: ${GREEN}http://localhost:5174${NC}"
echo -e "   🔧 Backend API:  ${GREEN}http://localhost:4000${NC}"
echo -e "   ❤️  Health Check: ${GREEN}http://localhost:4000/health${NC}"
echo ""
echo -e "${BLUE}👤 Default login credentials:${NC}"
echo "   Email:    admin@healthcare.com"
echo "   Password: Admin@123"
echo "   ⚠️  Change password after first login!"
echo ""
echo -e "${BLUE}📝 Log files:${NC}"
echo "   admin-backend.log"
echo "   admin-frontend.log"
echo ""
echo -e "${BLUE}🛑 To stop the application:${NC}"
echo "   ./stop-admin.sh"
echo -e "   or press ${YELLOW}Ctrl+C${NC} and run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "=========================================="

# Save PIDs to file for stop script
echo "BACKEND_PID=$BACKEND_PID" > .admin-pids
echo "FRONTEND_PID=$FRONTEND_PID" >> .admin-pids

# Function to cleanup on exit
cleanup() {
  echo ""
  echo -e "${YELLOW}Stopping Admin Portal...${NC}"
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  rm -f .admin-pids
  echo -e "${GREEN}Admin Portal stopped.${NC}"
  exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Keep script running
echo -e "${YELLOW}Press Ctrl+C to stop the Admin Portal${NC}"
echo ""
wait
