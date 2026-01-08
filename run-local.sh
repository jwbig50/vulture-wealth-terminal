#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Vulture Wealth Terminal - Local Docker${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose found${NC}"
echo ""

# Menu
echo "What do you want to do?"
echo "1) Build and start (first time)"
echo "2) Start (already built)"
echo "3) Stop"
echo "4) View logs"
echo "5) Restart"
echo ""
read -p "Enter option (1-5): " option

case $option in
    1)
        echo -e "${BLUE}Building Docker image...${NC}"
        docker-compose -f docker-compose.local.yml build
        echo ""
        echo -e "${BLUE}Starting services...${NC}"
        docker-compose -f docker-compose.local.yml up -d
        sleep 10
        echo ""
        docker-compose -f docker-compose.local.yml ps
        echo ""
        echo -e "${GREEN}✓ Application started!${NC}"
        echo -e "${BLUE}Access at: http://localhost:3000${NC}"
        ;;
    2)
        echo -e "${BLUE}Starting services...${NC}"
        docker-compose -f docker-compose.local.yml up -d
        sleep 5
        echo ""
        docker-compose -f docker-compose.local.yml ps
        echo ""
        echo -e "${GREEN}✓ Application started!${NC}"
        echo -e "${BLUE}Access at: http://localhost:3000${NC}"
        ;;
    3)
        echo -e "${BLUE}Stopping services...${NC}"
        docker-compose -f docker-compose.local.yml down
        echo -e "${GREEN}✓ Services stopped${NC}"
        ;;
    4)
        echo -e "${BLUE}Showing logs (Ctrl+C to exit)...${NC}"
        docker-compose -f docker-compose.local.yml logs -f app
        ;;
    5)
        echo -e "${BLUE}Restarting services...${NC}"
        docker-compose -f docker-compose.local.yml restart
        sleep 5
        echo ""
        docker-compose -f docker-compose.local.yml ps
        echo -e "${GREEN}✓ Services restarted${NC}"
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
