# Vulture Wealth Terminal - Docker Deployment Guide

This guide will help you containerize and run the Vulture Wealth Terminal on your home server using Docker and Docker Compose.

## Prerequisites

Before you begin, ensure you have the following installed on your home server:

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Git**: For cloning the repository
- **At least 4GB RAM** and **10GB disk space** available

### Quick Install (Ubuntu/Debian)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group (optional, allows running docker without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## Setup Steps

### 1. Clone or Download the Project

```bash
# Clone from repository (if available)
git clone <repository-url> vulture-wealth-terminal
cd vulture-wealth-terminal

# Or download the project files to your home server
```

### 2. Configure Environment Variables

Create a `.env` file in the project root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```bash
nano .env
```

**Key variables to update:**

```env
# Database Configuration
DB_ROOT_PASSWORD=choose-a-strong-password
DB_PASSWORD=choose-a-strong-password
DB_USER=vulture_user
DB_NAME=vulture_wealth

# Security - Generate with: openssl rand -base64 32
JWT_SECRET=your-generated-secret-key

# Owner Information
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-id

# Application Ports
APP_PORT=3000
DB_PORT=3306
NGINX_PORT=80
NGINX_SSL_PORT=443

# Optional: Manus OAuth (if using Manus authentication)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://app.manus.im
```

### 3. Build and Start the Application

**Option A: Without Nginx (Direct Access)**

```bash
# Build the Docker image
docker-compose build

# Start the services
docker-compose up -d

# View logs
docker-compose logs -f app

# Check status
docker-compose ps
```

The application will be available at: `http://your-server-ip:3000`

**Option B: With Nginx Reverse Proxy**

```bash
# Start with nginx profile
docker-compose --profile nginx up -d

# View logs
docker-compose logs -f nginx

# Check status
docker-compose ps
```

The application will be available at: `http://your-server-ip:80`

### 4. Initialize the Database

The database will automatically initialize on first run. To verify:

```bash
# Check database logs
docker-compose logs db

# Access the database shell (optional)
docker-compose exec db mysql -u vulture_user -p vulture_wealth
```

### 5. Verify the Setup

```bash
# Check all services are running
docker-compose ps

# Test the application
curl http://localhost:3000

# View application logs
docker-compose logs app

# View database logs
docker-compose logs db
```

## Common Operations

### Stop the Application

```bash
docker-compose down
```

### Stop and Remove All Data

```bash
# WARNING: This will delete all data!
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100 app
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app
docker-compose restart db
```

### Update the Application

```bash
# Pull latest code
git pull

# Rebuild the image
docker-compose build --no-cache

# Restart with new image
docker-compose up -d
```

### Access the Database

```bash
# MySQL shell
docker-compose exec db mysql -u vulture_user -p vulture_wealth

# Backup database
docker-compose exec db mysqldump -u vulture_user -p vulture_wealth > backup.sql

# Restore database
docker-compose exec -T db mysql -u vulture_user -p vulture_wealth < backup.sql
```

## Network Configuration

### Local Network Access

If you want to access the application from other devices on your home network:

1. Find your server's local IP:
   ```bash
   hostname -I
   ```

2. Access from another device:
   ```
   http://192.168.x.x:3000
   ```

### Port Forwarding (Remote Access)

To access from outside your home network:

1. **Port Forward in Router:**
   - Log into your router settings
   - Forward external port (e.g., 8080) to your server's port 3000
   - Example: `8080 → 192.168.x.x:3000`

2. **Access Remotely:**
   ```
   http://your-public-ip:8080
   ```

3. **Security Recommendations:**
   - Use a strong password for the application
   - Consider using a VPN for remote access
   - Set up HTTPS/SSL (see SSL Setup below)
   - Use a reverse proxy with authentication

### SSL/HTTPS Setup

For secure remote access:

1. **Generate Self-Signed Certificate:**
   ```bash
   mkdir -p ssl
   openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes
   ```

2. **Enable SSL in nginx.conf:**
   - Uncomment the HTTPS sections in `nginx.conf`
   - Update certificate paths if needed

3. **Restart Nginx:**
   ```bash
   docker-compose restart nginx
   ```

## Performance Tuning

### Increase Memory Allocation

Edit `docker-compose.yml` and add resource limits:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Database Performance

For better database performance:

```bash
# Increase MySQL max connections
docker-compose exec db mysql -u root -p -e "SET GLOBAL max_connections = 500;"
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Verify database connection
docker-compose logs db

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Error

```bash
# Check if database is healthy
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Change port in .env file
APP_PORT=3001
docker-compose restart
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Remove old images
docker image prune -a
```

## Backup and Recovery

### Backup Database

```bash
# Backup to file
docker-compose exec db mysqldump -u vulture_user -p vulture_wealth > vulture_backup_$(date +%Y%m%d).sql

# Backup with compression
docker-compose exec db mysqldump -u vulture_user -p vulture_wealth | gzip > vulture_backup_$(date +%Y%m%d).sql.gz
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T db mysql -u vulture_user -p vulture_wealth < vulture_backup_20240101.sql

# Restore from compressed backup
gunzip < vulture_backup_20240101.sql.gz | docker-compose exec -T db mysql -u vulture_user -p vulture_wealth
```

### Backup Application Data

```bash
# Backup entire project
tar -czf vulture_backup_$(date +%Y%m%d).tar.gz .

# Backup only database volume
docker run --rm -v vulture-wealth-terminal_db_data:/data -v $(pwd):/backup alpine tar czf /backup/db_backup_$(date +%Y%m%d).tar.gz -C /data .
```

## Monitoring

### System Resources

```bash
# Monitor container stats
docker stats

# Specific container
docker stats vulture-app
```

### Application Health

```bash
# Check health status
docker-compose exec app wget -q -O- http://localhost:3000/health || echo "Unhealthy"

# View application metrics
docker-compose logs --tail=50 app | grep -i error
```

## Security Best Practices

1. **Change Default Passwords:**
   - Update `DB_ROOT_PASSWORD` and `DB_PASSWORD` in `.env`
   - Generate a strong `JWT_SECRET`

2. **Use Environment Variables:**
   - Never commit `.env` to version control
   - Use `.gitignore` to exclude `.env`

3. **Firewall Configuration:**
   ```bash
   # Allow only specific ports
   sudo ufw allow 3000/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

4. **Regular Updates:**
   ```bash
   # Update Docker images
   docker-compose pull
   docker-compose up -d
   ```

5. **Enable SSL/HTTPS:**
   - Use certificates from Let's Encrypt for production
   - Enable in nginx.conf

## Systemd Service (Auto-start on Boot)

Create `/etc/systemd/system/vulture-wealth.service`:

```ini
[Unit]
Description=Vulture Wealth Terminal
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/vulture-wealth-terminal
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
User=your-username

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable vulture-wealth
sudo systemctl start vulture-wealth

# Check status
sudo systemctl status vulture-wealth
```

## Support and Issues

For issues or questions:

1. Check the logs: `docker-compose logs -f`
2. Verify `.env` configuration
3. Ensure Docker and Docker Compose are up to date
4. Check system resources (disk space, RAM, CPU)

## Next Steps

1. Access the application at `http://your-server-ip:3000`
2. Log in with your credentials
3. Add your portfolio holdings
4. Configure watchlist and valuation settings
5. Set up regular backups

Enjoy your self-hosted Vulture Wealth Terminal!
