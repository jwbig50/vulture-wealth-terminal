# Vulture Wealth Terminal - Local Docker Setup

## Quick Start

### Step 1: Clone the repository
```bash
git clone https://github.com/jwbig50/vulture-wealth-terminal.git
cd vulture-wealth-terminal
```

### Step 2: Make script executable
```bash
chmod +x run-local.sh
```

### Step 3: Run
```bash
./run-local.sh
```

Select option **1** (Build and start)

### Step 4: Wait for build (2-3 minutes)

### Step 5: Open browser
```
http://localhost:3000
```

---

## Commands

```bash
./run-local.sh
# 1 = Build and start (first time)
# 2 = Start (already built)
# 3 = Stop
# 4 = View logs
# 5 = Restart
```

---

## Access from Other Devices

Find your IP:
```bash
hostname -I
```

Then access:
```
http://YOUR_IP:3000
```

---

## Troubleshooting

### Port 3000 in use
```bash
./run-local.sh
# Select 3 to stop
```

### Docker not found
Install Docker: https://www.docker.com/products/docker-desktop

### Can't connect
Wait 30 seconds and refresh the page.

### View errors
```bash
./run-local.sh
# Select 4 to view logs
```

---

## Stop Everything
```bash
./run-local.sh
# Select 3
```

That's it! Enjoy! 🚀
