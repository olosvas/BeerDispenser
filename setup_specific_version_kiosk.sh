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