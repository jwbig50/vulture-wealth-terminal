#!/bin/bash

# Vulture Wealth Terminal - Docker Deployment Script
# This script automates the setup and deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed: $(docker --version)"

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        echo "Install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose is installed: $(docker-compose --version)"

    if ! command -v git &> /dev/null; then
        print_warning "Git is not installed (optional)"
    else
        print_success "Git is installed: $(git --version)"
    fi
}

# Create environment file
setup_env() {
    print_header "Setting Up Environment"

    if [ -f .env ]; then
        print_warning ".env file already exists"
        read -p "Do you want to overwrite it? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "Keeping existing .env file"
            return
        fi
    fi

    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 16)

    cat > .env << EOF
# Application Environment
NODE_ENV=production

# Database Configuration
DB_ROOT_PASSWORD=$(openssl rand -base64 16)
DB_NAME=vulture_wealth
DB_USER=vulture_user
DB_PASSWORD=$DB_PASSWORD
DB_PORT=3306

# Security
JWT_SECRET=$JWT_SECRET

# OAuth Configuration (Manus)
VITE_APP_ID=
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://app.manus.im

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_FRONTEND_FORGE_API_KEY=

# Owner Information
OWNER_NAME=Portfolio Owner
OWNER_OPEN_ID=

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# Frontend Branding
VITE_APP_TITLE=Vulture Wealth Terminal
VITE_APP_LOGO=

# Docker Ports
APP_PORT=3000
DB_PORT=3306
NGINX_PORT=80
NGINX_SSL_PORT=443
EOF

    print_success ".env file created"
    print_warning "Please edit .env and update the following:"
    echo "  - OWNER_NAME"
    echo "  - OWNER_OPEN_ID"
    echo "  - VITE_APP_ID (if using Manus OAuth)"
    echo "  - API keys (if available)"
}

# Build Docker image
build_image() {
    print_header "Building Docker Image"

    docker-compose build

    print_success "Docker image built successfully"
}

# Start services
start_services() {
    print_header "Starting Services"

    docker-compose up -d

    print_success "Services started"
    echo ""
    echo "Waiting for services to be ready..."
    sleep 10

    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "All services are running"
    else
        print_error "Some services failed to start"
        docker-compose logs
        exit 1
    fi
}

# Display status
show_status() {
    print_header "Deployment Status"

    docker-compose ps

    echo ""
    print_success "Application is ready!"
    echo ""
    echo "Access the application at:"
    echo -e "  ${BLUE}http://localhost:3000${NC}"
    echo ""
    echo "Or from another device:"
    echo -e "  ${BLUE}http://$(hostname -I | awk '{print $1}'):3000${NC}"
    echo ""
    echo "Useful commands:"
    echo "  View logs:        docker-compose logs -f app"
    echo "  Stop services:    docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Database shell:   docker-compose exec db mysql -u vulture_user -p vulture_wealth"
}

# Main deployment flow
main() {
    print_header "Vulture Wealth Terminal - Docker Deployment"

    # Get deployment options
    echo ""
    echo "Select deployment option:"
    echo "1) Quick Setup (recommended for first-time)"
    echo "2) Build Only (don't start services)"
    echo "3) Start Only (if already built)"
    echo "4) Full Setup (build + start)"
    echo ""
    read -p "Enter option (1-4): " option

    case $option in
        1)
            check_prerequisites
            setup_env
            build_image
            start_services
            show_status
            ;;
        2)
            check_prerequisites
            build_image
            ;;
        3)
            check_prerequisites
            start_services
            show_status
            ;;
        4)
            check_prerequisites
            setup_env
            build_image
            start_services
            show_status
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac

    echo ""
    print_success "Deployment complete!"
}

# Run main function
main "$@"
