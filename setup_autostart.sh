#!/bin/bash

# Setup automatic startup of kiosk mode on Raspberry Pi boot

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTOSTART_DIR="$HOME/.config/autostart"

# Create autostart directory if it doesn't exist
mkdir -p "$AUTOSTART_DIR"

# Create desktop file for autostart
cat > "$AUTOSTART_DIR/beer-dispenser-kiosk.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Beer Dispenser Kiosk
Exec=$SCRIPT_DIR/start_kiosk.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF

# Create systemd service file (alternative method)
sudo tee /etc/systemd/system/beer-dispenser-kiosk.service > /dev/null << EOF
[Unit]
Description=Beer Dispenser Kiosk Mode
After=graphical-session.target

[Service]
Type=simple
User=$USER
Environment=DISPLAY=:0
Environment=HOME=$HOME
ExecStart=$SCRIPT_DIR/start_kiosk.sh
Restart=always
RestartSec=5

[Install]
WantedBy=graphical-session.target
EOF

# Create script to hide cursor
cat > "$SCRIPT_DIR/hide_cursor.sh" << 'EOF'
#!/bin/bash
# Hide mouse cursor after 1 second of inactivity
unclutter -idle 1 -root &
EOF

chmod +x "$SCRIPT_DIR/hide_cursor.sh"

# Create desktop file for cursor hiding
cat > "$AUTOSTART_DIR/hide-cursor.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Hide Cursor
Exec=$SCRIPT_DIR/hide_cursor.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF

# Enable the systemd service
sudo systemctl daemon-reload
sudo systemctl enable beer-dispenser-kiosk.service

echo "Autostart setup complete!"
echo ""
echo "The beer dispenser will now start automatically in kiosk mode when the system boots."
echo ""
echo "To disable autostart:"
echo "  sudo systemctl disable beer-dispenser-kiosk.service"
echo "  rm ~/.config/autostart/beer-dispenser-kiosk.desktop"
echo ""
echo "To manually start the service:"
echo "  sudo systemctl start beer-dispenser-kiosk.service"
echo ""
echo "To check service status:"
echo "  sudo systemctl status beer-dispenser-kiosk.service"