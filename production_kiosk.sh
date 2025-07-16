#!/bin/bash

# Production Kiosk Mode - pripravené pre nasadenú verziu na Raspberry Pi
# Verzia: 1.0.0 (April 9, 2025)

# Nastavenie pre produkčnú verziu
# Automatická detekcia Replit deployment URL
if [ -n "$REPLIT_DEPLOYMENT" ] && [ -n "$REPLIT_DOMAINS" ]; then
    # Použitie prvej domény z REPLIT_DOMAINS
    PRODUCTION_URL="https://$(echo $REPLIT_DOMAINS | cut -d',' -f1)"
    echo "Spúšťam kiosk mód pre produkčnú verziu na: $PRODUCTION_URL"
    APP_URL="$PRODUCTION_URL"
elif [ -n "$REPLIT_DEV_DOMAIN" ]; then
    # Použitie dev domény
    PRODUCTION_URL="https://$REPLIT_DEV_DOMAIN"
    echo "Spúšťam kiosk mód pre dev verziu na: $PRODUCTION_URL"
    APP_URL="$PRODUCTION_URL"
else
    # Lokálna verzia
    LOCAL_URL="http://localhost:5000"
    echo "Spúšťam kiosk mód pre lokálnu verziu..."
    APP_URL="$LOCAL_URL"
fi

# Kontrola Raspberry Pi
if [ ! -f /proc/device-tree/model ] || ! grep -q "Raspberry Pi" /proc/device-tree/model; then
    echo "Upozornenie: Tento skript je navrhnutý pre Raspberry Pi"
fi

# Nastavenie display
export DISPLAY=:0

# Zastavenie existujúcich chromium procesov
pkill -f chromium-browser

# Pre produkčnú verziu nepotrebujeme spúšťať Flask lokálne
if [ "$APP_URL" = "$LOCAL_URL" ]; then
    # Kontrola či Flask beží lokálne
    if curl -s $LOCAL_URL > /dev/null; then
        echo "Lokálna Flask aplikácia už beží"
    else
        echo "Spúšťam lokálnu Flask aplikáciu..."
        python3 main.py &
        FLASK_PID=$!
        sleep 5
        
        if ! curl -s $LOCAL_URL > /dev/null; then
            echo "Chyba: Flask aplikácia sa nepodarila spustiť"
            exit 1
        fi
        echo "Flask aplikácia úspešne spustená"
    fi
else
    echo "Používam produkčnú verziu na: $APP_URL"
    # Kontrola dostupnosti produkčnej verzie
    if ! curl -s "$APP_URL/customer" > /dev/null; then
        echo "Chyba: Produkčná verzia nie je dostupná na $APP_URL"
        exit 1
    fi
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
    --disable-prompt-on-repost \
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
    --user-data-dir=/tmp/chrome-kiosk-prod \
    "$APP_URL/customer" &

CHROMIUM_PID=$!

# Funkcia na cleanup
cleanup() {
    echo "Upratávam..."
    kill $CHROMIUM_PID 2>/dev/null
    if [ -n "$FLASK_PID" ]; then
        kill $FLASK_PID 2>/dev/null
    fi
    exit 0
}

# Nastavenie signal handlers
trap cleanup SIGINT SIGTERM

# Čakanie na ukončenie Chromium
wait $CHROMIUM_PID

# Cleanup
if [ -n "$FLASK_PID" ]; then
    kill $FLASK_PID 2>/dev/null
fi

echo "Kiosk mód ukončený"