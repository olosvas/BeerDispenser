# 📁 Kompletné súbory pre kiosk mód

Toto sú všetky súbory ktoré potrebujete vytvoriť na Raspberry Pi.

## 🚀 Postup
1. Vytvorte priečinok: `mkdir ~/beer-dispenser-kiosk && cd ~/beer-dispenser-kiosk`
2. Vytvorte každý súbor pomocou `nano názov_súboru.sh`
3. Skopírujte obsah z tohto dokumentu
4. Uložte súbor: `Ctrl+X`, `Y`, `Enter`
5. Nastavte práva: `chmod +x *.sh`

---

## 📝 1. install_kiosk_dependencies.sh

```bash
#!/bin/bash

# Install dependencies for kiosk mode on Raspberry Pi
# Run this script once to set up the system

echo "Updating system packages..."
sudo apt update

echo "Installing Chromium browser..."
sudo apt install -y chromium-browser

echo "Installing X11 utilities..."
sudo apt install -y xorg xserver-xorg-video-fbdev

echo "Installing unclutter to hide mouse cursor..."
sudo apt install -y unclutter

echo "Installing screen management utilities..."
sudo apt install -y screen

echo "Creating kiosk autostart directory..."
mkdir -p ~/.config/autostart

echo "Dependencies installed successfully!"
echo ""
echo "To start kiosk mode manually, run:"
echo "  ./specific_version_kiosk.sh"
echo ""
echo "To set up automatic startup on boot, run:"
echo "  ./setup_specific_version_kiosk.sh"
```

---

## 📝 2. specific_version_kiosk.sh

```bash
#!/bin/bash

# Kiosk mód pre špecifickú verziu deployment
# Verzia: 1.0.0 (April 9, 2025)
# Deployment ID: 5dcf7b66-5269-4c09-8918-de0a505d8e4c

# Špecifická produkčná verzia
DEPLOYMENT_ID="5dcf7b66-5269-4c09-8918-de0a505d8e4c"
SPECIFIC_URL="https://${DEPLOYMENT_ID}.replit.app"

echo "=== Kiosk mód pre špecifickú verziu ==="
echo "Deployment ID: $DEPLOYMENT_ID"
echo "URL: $SPECIFIC_URL"
echo "======================================"

# Kontrola Raspberry Pi
if [ ! -f /proc/device-tree/model ] || ! grep -q "Raspberry Pi" /proc/device-tree/model; then
    echo "Upozornenie: Tento skript je navrhnutý pre Raspberry Pi"
fi

# Nastavenie display
export DISPLAY=:0

# Zastavenie existujúcich chromium procesov
echo "Zastavujem existujúce Chromium procesy..."
pkill -f chromium-browser

# Overenie dostupnosti špecifickej verzie
echo "Overujem dostupnosť špecifickej verzie..."
if curl -s --connect-timeout 15 "$SPECIFIC_URL/customer" > /dev/null 2>&1; then
    echo "✓ Špecifická verzia je dostupná"
    APP_URL="$SPECIFIC_URL"
else
    echo "✗ Špecifická verzia nie je dostupná"
    echo "Skúšam detailnejšiu diagnostiku..."
    
    # Diagnostika pripojenia
    echo "Testujem základné pripojenie..."
    if curl -s --connect-timeout 10 "$SPECIFIC_URL" > /dev/null 2>&1; then
        echo "✓ Základná URL je dostupná"
        echo "✗ Endpoint /customer nie je dostupný"
    else
        echo "✗ Základná URL nie je dostupná"
        echo "Možné príčiny:"
        echo "- Deployment nie je aktívny"
        echo "- Sieťové problémy"
        echo "- Nesprávne Deployment ID"
    fi
    
    echo "Ukončujem..."
    exit 1
fi

# Spustenie Chromium v kiosk móde
echo "Spúšťam Chromium v kiosk móde..."
chromium-browser \
    --kiosk \
    --no-sandbox \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --disable-translate \
    --disable-features=TranslateUI \
    --disable-ipc-flooding-protection \
    --disable-background-timer-throttling \
    --disable-backgrounding-occluded-windows \
    --disable-renderer-backgrounding \
    --disable-field-trial-config \
    --disable-back-forward-cache \
    --disable-hang-monitor \
    --disable-prompt-on-repost \
    --disable-sync \
    --disable-web-security \
    --disable-features=VizDisplayCompositor \
    --start-fullscreen \
    --window-position=0,0 \
    --window-size=1920,1080 \
    --autoplay-policy=no-user-gesture-required \
    --no-first-run \
    --fast \
    --fast-start \
    --disable-default-apps \
    --disable-popup-blocking \
    --disable-background-networking \
    --disable-background-sync \
    --disable-client-side-phishing-detection \
    --disable-component-update \
    --disable-device-discovery-notifications \
    --disable-domain-reliability \
    --disable-features=AudioServiceOutOfProcess \
    --disable-features=MediaRouter \
    --disable-gpu-sandbox \
    --disable-logging \
    --disable-notifications \
    --disable-password-generation \
    --disable-permissions-api \
    --disable-plugins \
    --disable-print-preview \
    --disable-setuid-sandbox \
    --disable-speech-api \
    --disable-webgl \
    --hide-scrollbars \
    --mute-audio \
    --no-zygote \
    --user-data-dir=/tmp/chrome-kiosk-specific \
    "$APP_URL/customer" &

CHROMIUM_PID=$!

# Funkcia na cleanup
cleanup() {
    echo ""
    echo "Ukončujem kiosk mód..."
    kill $CHROMIUM_PID 2>/dev/null
    exit 0
}

# Nastavenie signal handlers
trap cleanup SIGINT SIGTERM

echo "Kiosk mód je spustený. Pre ukončenie stlačte Ctrl+C"
echo "Pripojené na: $APP_URL/customer"

# Čakanie na ukončenie Chromium
wait $CHROMIUM_PID

echo "Kiosk mód ukončený"
```

---

## 📝 3. setup_specific_version_kiosk.sh

```bash
#!/bin/bash

# Setup automatického spustenia pre špecifickú verziu deployment
# Deployment ID: 5dcf7b66-5269-4c09-8918-de0a505d8e4c

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME="beer-dispenser-specific-kiosk"
DEPLOYMENT_ID="5dcf7b66-5269-4c09-8918-de0a505d8e4c"

echo "=== Nastavenie automatického spustenia ==="
echo "Deployment ID: $DEPLOYMENT_ID"
echo "Služba: $SERVICE_NAME"
echo "=========================================="

# Kontrola či sme na Raspberry Pi
if [ ! -f /proc/device-tree/model ] || ! grep -q "Raspberry Pi" /proc/device-tree/model; then
    echo "Upozornenie: Tento skript je navrhnutý pre Raspberry Pi"
fi

# Vytvorenie systemd služby
echo "Vytváram systemd službu..."
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null << EOF
[Unit]
Description=Beer Dispenser Kiosk Mode - Specific Version ($DEPLOYMENT_ID)
After=graphical-session.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
Group=$USER
Environment=DISPLAY=:0
Environment=HOME=$HOME
WorkingDirectory=$SCRIPT_DIR
ExecStart=$SCRIPT_DIR/specific_version_kiosk.sh
Restart=always
RestartSec=15
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=graphical-session.target
EOF

# Vytvorenie autostart súboru
echo "Vytváram autostart súbor..."
mkdir -p "$HOME/.config/autostart"
cat > "$HOME/.config/autostart/${SERVICE_NAME}.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Beer Dispenser Kiosk (Specific Version)
Comment=Spustí čapovací systém v kiosk móde pre špecifickú verziu $DEPLOYMENT_ID
Exec=$SCRIPT_DIR/specific_version_kiosk.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
StartupNotify=false
EOF

# Nastavenie práv
chmod +x "$SCRIPT_DIR/specific_version_kiosk.sh"

# Reload systemd a povolenie služby
echo "Aktivujem službu..."
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}.service

echo ""
echo "✓ Automatické spustenie bolo úspešne nastavené!"
echo ""
echo "Dostupné príkazy:"
echo "  Manuálne spustenie:        ./specific_version_kiosk.sh"
echo "  Spustenie služby:          sudo systemctl start ${SERVICE_NAME}"
echo "  Zastavenie služby:         sudo systemctl stop ${SERVICE_NAME}"
echo "  Stav služby:               sudo systemctl status ${SERVICE_NAME}"
echo "  Logy služby:               sudo journalctl -u ${SERVICE_NAME} -f"
echo "  Test URL:                  ./test_deployment_url.sh"
echo ""
echo "Služba sa automaticky spustí po reštarte systému."
echo "Pre vypnutie automatického spustenia:"
echo "  sudo systemctl disable ${SERVICE_NAME}"
echo ""
echo "Cieľová URL: https://${DEPLOYMENT_ID}.replit.app/customer"
```

---

## 📝 4. test_deployment_url.sh

```bash
#!/bin/bash

# Test script pre overenie dostupnosti špecifickej verzie
DEPLOYMENT_ID="5dcf7b66-5269-4c09-8918-de0a505d8e4c"
SPECIFIC_URL="https://${DEPLOYMENT_ID}.replit.app"

echo "=== Test dostupnosti deployment verzie ==="
echo "Deployment ID: $DEPLOYMENT_ID"
echo "URL: $SPECIFIC_URL"
echo "=========================================="

# Test základnej URL
echo "1. Testovanie základnej URL..."
if curl -s --connect-timeout 15 "$SPECIFIC_URL" > /dev/null 2>&1; then
    echo "✓ Základná URL je dostupná"
    
    # Test customer endpoint
    echo "2. Testovanie /customer endpoint..."
    if curl -s --connect-timeout 15 "$SPECIFIC_URL/customer" > /dev/null 2>&1; then
        echo "✓ Customer endpoint je dostupný"
        echo "✓ Deployment je plne funkčný pre kiosk mód"
    else
        echo "✗ Customer endpoint nie je dostupný"
        echo "Skúšam získať HTTP kód..."
        HTTP_CODE=$(curl -s --connect-timeout 15 -o /dev/null -w "%{http_code}" "$SPECIFIC_URL/customer")
        echo "HTTP kód: $HTTP_CODE"
    fi
else
    echo "✗ Základná URL nie je dostupná"
    echo "Možné príčiny:"
    echo "- Deployment nie je aktívny"
    echo "- Nesprávne Deployment ID"
    echo "- Sieťové problémy"
fi

echo ""
echo "=== Detailné testovanie ==="
echo "Pokus o načítanie hlavičiek..."
curl -I --connect-timeout 15 "$SPECIFIC_URL/customer" 2>&1 | head -10

echo ""
echo "Test dokončený."
```

---

## 🎯 Postup inštalácie

1. **Vytvorte priečinok:**
```bash
mkdir ~/beer-dispenser-kiosk
cd ~/beer-dispenser-kiosk
```

2. **Vytvorte súbory:**
```bash
nano install_kiosk_dependencies.sh
# Skopírujte obsah súboru 1

nano specific_version_kiosk.sh
# Skopírujte obsah súboru 2

nano setup_specific_version_kiosk.sh
# Skopírujte obsah súboru 3

nano test_deployment_url.sh
# Skopírujte obsah súboru 4
```

3. **Nastavte práva:**
```bash
chmod +x *.sh
```

4. **Spustite inštaláciu:**
```bash
./install_kiosk_dependencies.sh
```

5. **Otestujte pripojenie:**
```bash
./test_deployment_url.sh
```

6. **Spustite kiosk mód:**
```bash
./specific_version_kiosk.sh
```

7. **Nastavte automatické spustenie:**
```bash
./setup_specific_version_kiosk.sh
```

**Hotovo!** Vaša aplikácia sa teraz spustí v kiosk móde na celej obrazovke.