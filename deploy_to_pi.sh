#!/bin/bash
# Deployment script pre Beer Dispensing System na Raspberry Pi 4B
# Verzia 1.0.0

set -e  # Exit on any error

# Farby pre output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funkcie pre farebný output
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Kontrola, či sme na Raspberry Pi
check_raspberry_pi() {
    if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
        log_error "Tento script je určený pre Raspberry Pi!"
        exit 1
    fi
    log_info "Raspberry Pi detekované"
}

# Aktualizácia systému
update_system() {
    log_info "Aktualizujem systém..."
    sudo apt update
    sudo apt upgrade -y
}

# Inštalácia závislostí
install_dependencies() {
    log_info "Inštalujem systémové závislosti..."
    
    # Základné balíky
    sudo apt install -y python3-pip python3-venv git
    
    # Kamera a GPIO
    sudo apt install -y libcamera-dev libcamera-tools
    sudo apt install -y python3-opencv
    
    # PostgreSQL
    sudo apt install -y postgresql postgresql-contrib
    
    # Ďalšie užitočné nástroje
    sudo apt install -y htop nano curl ufw
}

# Konfigurácia Raspberry Pi
configure_pi() {
    log_info "Konfigurujem Raspberry Pi..."
    
    # Aktivácia kamery a GPIO
    sudo raspi-config nonint do_camera 0
    sudo raspi-config nonint do_spi 0
    sudo raspi-config nonint do_i2c 0
    
    # Pridanie používateľa do skupín
    sudo usermod -a -G video pi
    sudo usermod -a -G gpio pi
    
    log_info "Raspberry Pi konfigurované"
}

# Nastavenie databázy
setup_database() {
    log_info "Nastavujem PostgreSQL databázu..."
    
    # Spustenie PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Vytvorenie databázy a používateľa
    sudo -u postgres psql -c "CREATE DATABASE beer_dispenser;" 2>/dev/null || log_warn "Databáza už existuje"
    sudo -u postgres psql -c "CREATE USER beer_user WITH PASSWORD 'beer_password123';" 2>/dev/null || log_warn "Používateľ už existuje"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE beer_dispenser TO beer_user;" 2>/dev/null || true
    
    log_info "PostgreSQL databáza nastavená"
}

# Vytvorenie virtuálneho prostredia
setup_venv() {
    log_info "Vytváram Python virtuálne prostredie..."
    
    # Vytvoriť adresár ak neexistuje
    mkdir -p ~/beer_dispenser
    cd ~/beer_dispenser
    
    # Vytvoriť virtuálne prostredie
    python3 -m venv venv
    source venv/bin/activate
    
    # Inštalácia Python závislostí
    pip install --upgrade pip
    pip install flask flask-sqlalchemy gunicorn
    pip install opencv-python-headless
    pip install openai
    pip install pillow
    pip install psycopg2-binary
    pip install RPi.GPIO
    pip install anthropic
    pip install requests
    pip install flask-login
    pip install flask-wtf
    pip install email-validator
    
    log_info "Python prostredie nastavené"
}

# Vytvorenie konfiguračných súborov
create_config_files() {
    log_info "Vytváram konfiguračné súbory..."
    
    cd ~/beer_dispenser
    
    # .env súbor
    cat > .env << 'EOF'
USE_REAL_GPIO=1
DATABASE_URL=postgresql://beer_user:beer_password123@localhost/beer_dispenser
SESSION_SECRET=your_session_secret_change_this_in_production
FLASK_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
EOF
    
    # GPIO konfigurácia
    cat > gpio_config.py << 'EOF'
# GPIO Pin konfigurácia pre Beer Dispensing System
BEER_PUMP_PIN = 18
KOFOLA_PUMP_PIN = 19
BIREL_PUMP_PIN = 20
CUP_DISPENSER_PIN = 21
WEIGHT_SENSOR_PIN = 22
EMERGENCY_STOP_PIN = 23
STATUS_LED_PIN = 24
ERROR_LED_PIN = 25
EOF
    
    log_info "Konfiguračné súbory vytvorené"
}

# Vytvorenie systemd služby
create_systemd_service() {
    log_info "Vytváram systemd službu..."
    
    sudo tee /etc/systemd/system/beer-dispenser.service > /dev/null << 'EOF'
[Unit]
Description=Beer Dispensing System
After=network.target postgresql.service

[Service]
Type=exec
User=pi
Group=pi
WorkingDirectory=/home/pi/beer_dispenser
Environment=PATH=/home/pi/beer_dispenser/venv/bin
EnvironmentFile=/home/pi/beer_dispenser/.env
ExecStart=/home/pi/beer_dispenser/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 --reload main:app
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # Aktivácia služby
    sudo systemctl daemon-reload
    sudo systemctl enable beer-dispenser
    
    log_info "Systemd služba vytvorená"
}

# Konfigurácia firewall
setup_firewall() {
    log_info "Konfigurujem firewall..."
    
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 5000/tcp
    sudo ufw allow from 192.168.0.0/16 to any port 5000
    
    log_info "Firewall nakonfigurovaný"
}

# Vytvorenie užitočných scriptov
create_utility_scripts() {
    log_info "Vytváram užitočné scripty..."
    
    cd ~/beer_dispenser
    
    # Script pre aktualizácie
    cat > update.sh << 'EOF'
#!/bin/bash
echo "Aktualizujem systém..."
sudo apt update && sudo apt upgrade -y
echo "Reštartujem Beer Dispenser službu..."
sudo systemctl restart beer-dispenser
echo "Hotovo!"
EOF
    
    # Script pre zálohovanie
    cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
echo "Vytváram zálohu databázy..."
pg_dump -h localhost -U beer_user beer_dispenser > backup_$DATE.sql
echo "Záloha vytvorená: backup_$DATE.sql"
EOF
    
    # Script pre monitoring
    cat > status.sh << 'EOF'
#!/bin/bash
echo "=== BEER DISPENSER STATUS ==="
echo "Služba:"
sudo systemctl status beer-dispenser --no-pager -l
echo ""
echo "Posledné logy:"
sudo journalctl -u beer-dispenser -n 20 --no-pager
echo ""
echo "Systémové prostriedky:"
free -h
df -h /
EOF
    
    # Nastavenie práv
    chmod +x update.sh backup.sh status.sh
    
    log_info "Utility scripty vytvorené"
}

# Test aplikácie
test_installation() {
    log_info "Testujem inštaláciu..."
    
    # Test databázy
    if ! pg_isready -h localhost -U beer_user -d beer_dispenser; then
        log_error "Databáza nie je dostupná!"
        return 1
    fi
    
    # Test kamery
    if ! libcamera-still -t 1 -o /tmp/test.jpg 2>/dev/null; then
        log_warn "Kamera nie je dostupná alebo nie je správne nakonfigurovaná"
    else
        rm -f /tmp/test.jpg
        log_info "Kamera funguje"
    fi
    
    # Test GPIO
    if [ -e /dev/gpiomem ]; then
        log_info "GPIO je dostupné"
    else
        log_warn "GPIO nie je dostupné"
    fi
    
    log_info "Základné testy dokončené"
}

# Spustenie aplikácie
start_application() {
    log_info "Spúšťam Beer Dispenser službu..."
    
    sudo systemctl start beer-dispenser
    
    # Počkaj chvíľu a skontroluj stav
    sleep 3
    
    if sudo systemctl is-active --quiet beer-dispenser; then
        log_info "Služba úspešne spustená!"
        log_info "Webové rozhranie je dostupné na:"
        echo "  - http://localhost:5000"
        echo "  - http://$(hostname -I | awk '{print $1}'):5000"
        echo "  - Admin rozhranie: http://$(hostname -I | awk '{print $1}'):5000/admin"
    else
        log_error "Služba sa nepodarilo spustiť!"
        log_error "Skontrolujte logy: sudo journalctl -u beer-dispenser -f"
        return 1
    fi
}

# Hlavná funkcia
main() {
    log_info "Beer Dispensing System - Raspberry Pi 4B Deployment"
    log_info "Verzia: 1.0.0"
    log_info "================================================"
    
    # Kontrola práv
    if [[ $EUID -eq 0 ]]; then
        log_error "Nespúšťajte tento script ako root!"
        exit 1
    fi
    
    # Postupnosť inštalácie
    check_raspberry_pi
    update_system
    install_dependencies
    configure_pi
    setup_database
    setup_venv
    create_config_files
    create_systemd_service
    setup_firewall
    create_utility_scripts
    test_installation
    
    log_info "Inštalácia dokončená!"
    log_warn "POZOR: Nezabudnite nastaviť váš OpenAI API kľúč v súbore .env"
    log_warn "Editujte súbor: nano ~/beer_dispenser/.env"
    
    read -p "Chcete spustiť aplikáciu teraz? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_application
    else
        log_info "Aplikáciu môžete spustiť neskôr príkazom:"
        log_info "sudo systemctl start beer-dispenser"
    fi
    
    log_info "Deployment dokončený!"
}

# Spustenie main funkcie
main "$@"