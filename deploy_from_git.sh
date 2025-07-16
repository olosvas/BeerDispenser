#!/bin/bash
# Git deployment script pre Beer Dispensing System na Raspberry Pi 4B
# Verzia 1.0.0

set -e  # Exit on any error

# Farby pre output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Konfigurácia
PROJECT_DIR="/home/pi/beer_dispenser"
GIT_REPO_URL=""
BRANCH="main"

# Funkcia pre získanie Git repository URL
get_git_repo() {
    echo "Zadajte URL vášho Git repository:"
    echo "Príklady:"
    echo "  https://github.com/username/beer-dispenser.git"
    echo "  git@github.com:username/beer-dispenser.git"
    echo ""
    read -p "Git repository URL: " GIT_REPO_URL
    
    if [[ -z "$GIT_REPO_URL" ]]; then
        log_error "Git repository URL je povinné!"
        exit 1
    fi
    
    # Voliteľne zadanie branch
    read -p "Branch (predvolené: main): " BRANCH
    if [[ -z "$BRANCH" ]]; then
        BRANCH="main"
    fi
    
    log_info "Použijem repository: $GIT_REPO_URL"
    log_info "Branch: $BRANCH"
}

# Kontrola, či sme na Raspberry Pi
check_raspberry_pi() {
    if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
        log_error "Tento script je určený pre Raspberry Pi!"
        exit 1
    fi
    log_info "Raspberry Pi detekované"
}

# Kontrola Git inštalácie
check_git() {
    if ! command -v git &> /dev/null; then
        log_info "Inštalujem Git..."
        sudo apt update
        sudo apt install -y git
    fi
    log_info "Git je k dispozícii"
}

# Klonovanie alebo aktualizácia repository
clone_or_update_repo() {
    log_step "Sťahujem kód z Git repository..."
    
    if [[ -d "$PROJECT_DIR" ]]; then
        log_info "Adresár $PROJECT_DIR už existuje"
        read -p "Chcete ho aktualizovať? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd "$PROJECT_DIR"
            log_info "Aktualizujem existujúci repository..."
            git fetch origin
            git reset --hard origin/$BRANCH
            git clean -fd
        else
            log_info "Používam existujúci kód"
        fi
    else
        log_info "Klonujem repository..."
        git clone -b "$BRANCH" "$GIT_REPO_URL" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi
    
    log_info "Kód úspešne stiahnutý"
}

# Aktualizácia systému
update_system() {
    log_step "Aktualizujem systém..."
    sudo apt update
    sudo apt upgrade -y
}

# Inštalácia závislostí
install_dependencies() {
    log_step "Inštalujem systémové závislosti..."
    
    # Základné balíky
    sudo apt install -y python3-pip python3-venv
    
    # Kamera a GPIO
    sudo apt install -y libcamera-dev libcamera-tools
    sudo apt install -y python3-opencv
    
    # PostgreSQL
    sudo apt install -y postgresql postgresql-contrib
    
    # Ďalšie užitočné nástroje
    sudo apt install -y htop nano curl ufw
    
    log_info "Systémové závislosti nainštalované"
}

# Konfigurácia Raspberry Pi
configure_pi() {
    log_step "Konfigurujem Raspberry Pi..."
    
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
    log_step "Nastavujem PostgreSQL databázu..."
    
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
    log_step "Vytváram Python virtuálne prostredie..."
    
    cd "$PROJECT_DIR"
    
    # Vytvoriť virtuálne prostredie
    python3 -m venv venv
    source venv/bin/activate
    
    # Inštalácia Python závislostí
    pip install --upgrade pip
    
    # Kontrola, či existuje requirements_pi.txt
    if [[ -f "requirements_pi.txt" ]]; then
        log_info "Inštalujem závislosti z requirements_pi.txt"
        pip install -r requirements_pi.txt
    else
        log_info "requirements_pi.txt neexistuje, inštalujem manuálne"
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
    fi
    
    log_info "Python prostredie nastavené"
}

# Vytvorenie konfiguračných súborov
create_config_files() {
    log_step "Vytváram konfiguračné súbory..."
    
    cd "$PROJECT_DIR"
    
    # .env súbor (ak neexistuje)
    if [[ ! -f ".env" ]]; then
        cat > .env << 'EOF'
USE_REAL_GPIO=1
DATABASE_URL=postgresql://beer_user:beer_password123@localhost/beer_dispenser
SESSION_SECRET=your_session_secret_change_this_in_production
FLASK_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
EOF
        log_info "Vytvorený .env súbor"
    else
        log_info ".env súbor už existuje"
    fi
    
    # GPIO konfigurácia (ak neexistuje)
    if [[ ! -f "gpio_config.py" ]]; then
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
        log_info "Vytvorený gpio_config.py súbor"
    else
        log_info "gpio_config.py súbor už existuje"
    fi
    
    log_info "Konfiguračné súbory pripravené"
}

# Vytvorenie systemd služby
create_systemd_service() {
    log_step "Vytváram systemd službu..."
    
    sudo tee /etc/systemd/system/beer-dispenser.service > /dev/null << EOF
[Unit]
Description=Beer Dispensing System
After=network.target postgresql.service

[Service]
Type=exec
User=pi
Group=pi
WorkingDirectory=$PROJECT_DIR
Environment=PATH=$PROJECT_DIR/venv/bin
EnvironmentFile=$PROJECT_DIR/.env
ExecStart=$PROJECT_DIR/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 --reload main:app
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
    log_step "Konfigurujem firewall..."
    
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 5000/tcp
    sudo ufw allow from 192.168.0.0/16 to any port 5000
    
    log_info "Firewall nakonfigurovaný"
}

# Vytvorenie užitočných scriptov
create_utility_scripts() {
    log_step "Vytváram užitočné scripty..."
    
    cd "$PROJECT_DIR"
    
    # Script pre Git aktualizácie
    cat > git_update.sh << 'EOF'
#!/bin/bash
echo "Aktualizujem kód z Git repository..."
cd /home/pi/beer_dispenser
git fetch origin
git reset --hard origin/main
git clean -fd
echo "Reštartujem službu..."
sudo systemctl restart beer-dispenser
echo "Aktualizácia dokončená!"
EOF
    
    # Script pre systémové aktualizácie
    cat > system_update.sh << 'EOF'
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
echo "Git status:"
git status --porcelain
echo "Aktuálny commit:"
git log --oneline -1
echo ""
echo "Posledné logy:"
sudo journalctl -u beer-dispenser -n 20 --no-pager
echo ""
echo "Systémové prostriedky:"
free -h
df -h /
EOF
    
    # Nastavenie práv
    chmod +x git_update.sh system_update.sh backup.sh status.sh
    
    log_info "Utility scripty vytvorené"
}

# Test aplikácie
test_installation() {
    log_step "Testujem inštaláciu..."
    
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
    
    # Test Git repository
    cd "$PROJECT_DIR"
    if git status &> /dev/null; then
        log_info "Git repository je správne nastavené"
        log_info "Aktuálny commit: $(git log --oneline -1)"
    else
        log_warn "Git repository nie je správne nastavené"
    fi
    
    log_info "Základné testy dokončené"
}

# Spustenie aplikácie
start_application() {
    log_step "Spúšťam Beer Dispenser službu..."
    
    sudo systemctl start beer-dispenser
    
    # Počkaj chvíľu a skontroluj stav
    sleep 5
    
    if sudo systemctl is-active --quiet beer-dispenser; then
        log_info "Služba úspešne spustená!"
        IP_ADDRESS=$(hostname -I | awk '{print $1}')
        log_info "Webové rozhranie je dostupné na:"
        echo "  - http://localhost:5000"
        echo "  - http://$IP_ADDRESS:5000"
        echo "  - Admin rozhranie: http://$IP_ADDRESS:5000/admin"
        echo ""
        log_info "Pre aktualizáciu kódu z Git použite: ./git_update.sh"
        log_info "Pre monitoring systému použite: ./status.sh"
    else
        log_error "Služba sa nepodarilo spustiť!"
        log_error "Skontrolujte logy: sudo journalctl -u beer-dispenser -f"
        return 1
    fi
}

# Hlavná funkcia
main() {
    log_info "Beer Dispensing System - Git Deployment na Raspberry Pi 4B"
    log_info "Verzia: 1.0.0"
    log_info "================================================================"
    
    # Kontrola práv
    if [[ $EUID -eq 0 ]]; then
        log_error "Nespúšťajte tento script ako root!"
        exit 1
    fi
    
    # Postupnosť inštalácie
    check_raspberry_pi
    check_git
    get_git_repo
    clone_or_update_repo
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
    log_warn "Editujte súbor: nano $PROJECT_DIR/.env"
    
    read -p "Chcete spustiť aplikáciu teraz? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_application
    else
        log_info "Aplikáciu môžete spustiť neskôr príkazom:"
        log_info "sudo systemctl start beer-dispenser"
    fi
    
    log_info "Git deployment dokončený!"
}

# Spustenie main funkcie
main "$@"