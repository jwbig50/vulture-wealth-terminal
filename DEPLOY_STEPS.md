# Ubuntu Docker Deployment - Step by Step

## Step 1: Install Docker

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Verify Docker works
docker --version
```

## Step 2: Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

## Step 3: Clone or Download the Project

```bash
# Option A: Clone from git (if you have a repository)
git clone <your-repository-url> vulture-wealth-terminal
cd vulture-wealth-terminal

# Option B: If you have the files locally, copy them
# cd /path/to/vulture-wealth-terminal
```

## Step 4: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file
nano .env
```

**In the editor, change these values:**
- `DB_ROOT_PASSWORD=` → Change to something like `MySecurePassword123!`
- `DB_PASSWORD=` → Change to something like `AppPassword456!`
- `OWNER_NAME=` → Your name (e.g., `John Doe`)
- `JWT_SECRET=` → Keep as is (already generated)

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

## Step 5: Build the Docker Image

```bash
# Build the image (this takes 5-10 minutes)
docker-compose build

# Wait for it to complete - you'll see "Successfully tagged..."
```

## Step 6: Start the Application

```bash
# Start all services in background
docker-compose up -d

# Wait 30 seconds for services to start
sleep 30

# Check if everything is running
docker-compose ps
```

**You should see:**
```
NAME          STATUS
vulture-db    Up (healthy)
vulture-app   Up (healthy)
```

## Step 7: Verify Everything Works

```bash
# Check application logs
docker-compose logs app

# You should see "Server running on http://localhost:3000"
```

## Step 8: Access the Application

**On the same computer:**
```
http://localhost:3000
```

**From another computer on your network:**
```
http://192.168.x.x:3000
```

(Replace `192.168.x.x` with your Ubuntu machine's IP - find it with `hostname -I`)

---

## Common Commands You'll Need

### View Logs
```bash
# See what's happening
docker-compose logs -f app

# Press Ctrl+C to stop viewing logs
```

### Stop Everything
```bash
docker-compose down
```

### Start Again
```bash
docker-compose up -d
```

### Restart Services
```bash
docker-compose restart
```

### Check Status
```bash
docker-compose ps
```

### Access Database
```bash
docker-compose exec db mysql -u vulture_user -p vulture_wealth

# Enter password when prompted (the one you set in .env)
```

---

## Troubleshooting

### "Port 3000 already in use"
```bash
# Change port in .env
nano .env
# Change APP_PORT=3000 to APP_PORT=3001

# Restart
docker-compose restart
```

### "Services won't start"
```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### "Can't connect to database"
```bash
# Restart database
docker-compose restart db

# Wait 10 seconds
sleep 10

# Check logs
docker-compose logs db
```

### "Out of disk space"
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a
```

---

## Backup Your Data

### Backup Database
```bash
# Create backup file
docker-compose exec db mysqldump -u vulture_user -p vulture_wealth > backup_$(date +%Y%m%d).sql

# Enter password when prompted
```

### Restore from Backup
```bash
# Restore database
docker-compose exec -T db mysql -u vulture_user -p vulture_wealth < backup_20240101.sql

# Enter password when prompted
```

---

## Update the Application

```bash
# Pull latest code
git pull

# Rebuild
docker-compose build --no-cache

# Restart
docker-compose up -d
```

---

## Auto-start on Boot (Optional)

Create a file called `vulture-wealth.service`:

```bash
sudo nano /etc/systemd/system/vulture-wealth.service
```

Paste this content:

```ini
[Unit]
Description=Vulture Wealth Terminal
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/YOUR_USERNAME/vulture-wealth-terminal
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
User=YOUR_USERNAME

[Install]
WantedBy=multi-user.target
```

Replace `YOUR_USERNAME` with your actual username.

Then enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable vulture-wealth
sudo systemctl start vulture-wealth

# Check status
sudo systemctl status vulture-wealth
```

---

## That's It!

Your Vulture Wealth Terminal is now running locally on your Ubuntu machine!

**Quick Summary:**
1. ✅ Installed Docker
2. ✅ Installed Docker Compose
3. ✅ Downloaded project
4. ✅ Created .env file
5. ✅ Built Docker image
6. ✅ Started services
7. ✅ Accessed application
8. ✅ Ready to use!

**Access:** http://localhost:3000
