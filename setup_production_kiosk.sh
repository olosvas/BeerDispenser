#!/bin/bash

# Setup pre produkčný kiosk mód na Raspberry Pi
# Vytvorí systemd službu pre automatické spustenie

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME="beer-dispenser-prod-kiosk"

# Kontrola či sme na Raspberry Pi
if [ ! -f /proc/device-tree/model ] || ! grep -q "Raspberry Pi" /proc/device-tree/model; then
    echo "Upozornenie: Tento skript je navrhnutý pre Raspberry Pi"
fi

# Vytvorenie systemd služby pre produkčnú verziu
echo "Vytváram systemd službu pre produkčný kiosk mód..."
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null << EOF
[Unit]
Description=Beer Dispenser Production Kiosk Mode
After=graphical-session.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
Group=$USER
Environment=DISPLAY=:0
Environment=HOME=$HOME
WorkingDirectory=$SCRIPT_DIR
ExecStart=$SCRIPT_DIR/production_kiosk.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=graphical-session.target
EOF

# Vytvorenie autostart súboru
mkdir -p "$HOME/.config/autostart"
cat > "$HOME/.config/autostart/${SERVICE_NAME}.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Beer Dispenser Production Kiosk
Comment=Spustí čapovací systém v kiosk móde
Exec=$SCRIPT_DIR/production_kiosk.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
StartupNotify=false
EOF

# Nastavenie práv
chmod +x "$SCRIPT_DIR/production_kiosk.sh"

# Reload systemd a povolenie služby
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}.service

echo "Produkčný kiosk mód bol úspešne nastavený!"
echo ""
echo "Dostupné príkazy:"
echo "  Spustenie kiosk módu:      ./production_kiosk.sh"
echo "  Spustenie služby:          sudo systemctl start ${SERVICE_NAME}"
echo "  Zastavenie služby:         sudo systemctl stop ${SERVICE_NAME}"
echo "  Stav služby:               sudo systemctl status ${SERVICE_NAME}"
echo "  Logy služby:               sudo journalctl -u ${SERVICE_NAME} -f"
echo ""
echo "Služba sa automaticky spustí po reštarte systému."
echo "Pre vypnutie automatického spustenia:"
echo "  sudo systemctl disable ${SERVICE_NAME}"