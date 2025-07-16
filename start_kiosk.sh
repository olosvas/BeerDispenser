#!/bin/bash

# Kiosk mode startup script for Raspberry Pi
# This script starts the beer dispensing system in full screen kiosk mode

# Check if we're running on Raspberry Pi
if [ ! -f /proc/device-tree/model ] || ! grep -q "Raspberry Pi" /proc/device-tree/model; then
    echo "Warning: This script is designed for Raspberry Pi"
fi

# Set display environment
export DISPLAY=:0

# Kill any existing chromium processes
pkill -f chromium-browser

# Start the Flask application in background
echo "Starting Flask application..."
python3 main.py &
FLASK_PID=$!

# Wait for Flask to start
sleep 5

# Check if Flask is running
if ! curl -s http://localhost:5000 > /dev/null; then
    echo "Flask application failed to start"
    exit 1
fi

echo "Flask application started successfully"

# Start Chromium in kiosk mode
echo "Starting Chromium in kiosk mode..."
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
    --disable-default-apps \
    --disable-device-discovery-notifications \
    --disable-domain-reliability \
    --disable-features=AudioServiceOutOfProcess \
    --disable-features=MediaRouter \
    --disable-features=VizDisplayCompositor \
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
    --repl-it \
    --user-data-dir=/tmp/chrome-kiosk \
    http://localhost:5000/customer &

CHROMIUM_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Cleaning up..."
    kill $CHROMIUM_PID 2>/dev/null
    kill $FLASK_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for Chromium to exit
wait $CHROMIUM_PID

# Clean up Flask process
kill $FLASK_PID 2>/dev/null

echo "Kiosk mode ended"