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