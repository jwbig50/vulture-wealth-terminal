# Docker Quick Reference Guide

## Quick Start (3 Steps)

```bash
# 1. Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# 2. Build and start
docker-compose up -d

# 3. Access application
# Open browser to: http://localhost:3000
```

## Essential Commands

### Deployment

| Command | Description |
|---------|-------------|
| `./deploy.sh` | Interactive deployment script (recommended) |
| `docker-compose build` | Build Docker image |
| `docker-compose up -d` | Start all services in background |
| `docker-compose down` | Stop all services |
| `docker-compose restart` | Restart all services |

### Monitoring

| Command | Description |
|---------|-------------|
| `docker-compose ps` | Show running containers |
| `docker-compose logs -f app` | View application logs (live) |
| `docker-compose logs -f db` | View database logs (live) |
| `docker stats` | Show resource usage |

### Database

| Command | Description |
|---------|-------------|
| `docker-compose exec db mysql -u vulture_user -p vulture_wealth` | Access MySQL shell |
| `docker-compose exec db mysqldump -u vulture_user -p vulture_wealth > backup.sql` | Backup database |
| `docker-compose exec -T db mysql -u vulture_user -p vulture_wealth < backup.sql` | Restore database |

### Maintenance

| Command | Description |
|---------|-------------|
| `docker-compose pull` | Pull latest images |
| `docker-compose build --no-cache` | Rebuild without cache |
| `docker system prune -a` | Clean up unused Docker resources |
| `docker-compose down -v` | Remove services and volumes (⚠️ deletes data) |

## Troubleshooting

### Check Service Status

```bash
# All services
docker-compose ps

# Specific service
docker-compose ps app
docker-compose ps db
```

### View Logs

```bash
# Last 50 lines
docker-compose logs --tail=50 app

# Follow logs in real-time
docker-compose logs -f app

# Search for errors
docker-compose logs app | grep -i error
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
docker-compose restart db
```

### Port Issues

```bash
# Check if port is in use
lsof -i :3000

# Change port in .env
# APP_PORT=3001
docker-compose restart
```

### Database Issues

```bash
# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Check database health
docker-compose exec db mysqladmin ping -u root -p
```

## Network Access

### Local Network

```bash
# Find server IP
hostname -I

# Access from another device
http://192.168.x.x:3000
```

### Port Forwarding (Remote Access)

1. Forward port in router (e.g., 8080 → 192.168.x.x:3000)
2. Access remotely: `http://your-public-ip:8080`

### Nginx Reverse Proxy

```bash
# Start with Nginx
docker-compose --profile nginx up -d

# Access through Nginx
http://localhost:80
```

## Backup & Recovery

### Quick Backup

```bash
# Backup database
docker-compose exec db mysqldump -u vulture_user -p vulture_wealth > backup_$(date +%Y%m%d).sql

# Backup entire project
tar -czf vulture_backup_$(date +%Y%m%d).tar.gz .
```

### Quick Restore

```bash
# Restore database
docker-compose exec -T db mysql -u vulture_user -p vulture_wealth < backup_20240101.sql
```

## Environment Variables

### Key Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `APP_PORT` | Application port | `3000` |
| `DB_PASSWORD` | Database password | Generated |
| `JWT_SECRET` | Auth secret | Generated |
| `OWNER_NAME` | Your name | `John Doe` |

### Generate Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate password
openssl rand -base64 16
```

## Performance Tips

### Increase Resources

Edit `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Enable Gzip Compression

Already enabled in nginx.conf for better performance.

### Database Optimization

```bash
# Increase max connections
docker-compose exec db mysql -u root -p -e "SET GLOBAL max_connections = 500;"
```

## Security Checklist

- [ ] Changed all default passwords in `.env`
- [ ] Generated strong `JWT_SECRET`
- [ ] Enabled SSL/HTTPS (if remote access)
- [ ] Set up firewall rules
- [ ] Regular backups scheduled
- [ ] `.env` not committed to git
- [ ] Updated Docker images regularly

## Common Issues & Solutions

### "Port already in use"
```bash
# Change port in .env
APP_PORT=3001
docker-compose restart
```

### "Database connection failed"
```bash
# Check database is running
docker-compose ps db

# Restart database
docker-compose restart db

# Check logs
docker-compose logs db
```

### "Out of disk space"
```bash
# Check usage
df -h

# Clean up Docker
docker system prune -a
```

### "Application won't start"
```bash
# Check logs
docker-compose logs app

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Auto-start on Boot (Linux)

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

Enable:
```bash
sudo systemctl enable vulture-wealth
sudo systemctl start vulture-wealth
```

## Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Need Help?

1. Check logs: `docker-compose logs -f`
2. Verify `.env` configuration
3. Ensure Docker is up to date
4. Check system resources
5. Review DOCKER_DEPLOYMENT.md for detailed guide
