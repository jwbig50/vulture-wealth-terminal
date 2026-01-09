# Vulture Wealth Terminal - Local Setup

**No authentication needed. Just run and go to dashboard.**

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/jwbig50/vulture-wealth-terminal.git
cd vulture-wealth-terminal
```

### 2. Run
```bash
./run-local.sh
```

Select option **1** (Build and start)

### 3. Open browser
```
http://localhost:3000
```

**That's it!** You're in the dashboard. No login needed.

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

## What's Included

✅ Real-time portfolio tracking
✅ Add/edit positions with DCA
✅ Watchlist management
✅ DCF valuation engine
✅ Margin of Safety calculations
✅ Portfolio analytics
✅ Benchmark comparison (S&P 500, Gold, Bitcoin)
✅ AI insights
✅ Data backup/restore

---

## Access from Other Devices

```bash
# Find your IP
hostname -I

# Access from another device
http://YOUR_IP:3000
```

---

## Stop Everything

```bash
./run-local.sh
# Select 3
```

---

## Troubleshooting

### Port 3000 in use?
```bash
./run-local.sh
# Select 3 to stop
```

### Can't connect?
Wait 30 seconds and refresh the page.

### View errors?
```bash
./run-local.sh
# Select 4 to view logs
```

---

Enjoy! 🚀
