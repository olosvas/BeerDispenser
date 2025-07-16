# Inštalácia Beer Dispensing System na Raspberry Pi 4B

## Požiadavky na hardware
- Raspberry Pi 4B (4GB RAM odporúčané)
- MicroSD karta (32GB alebo viac)
- Ethernet kábel alebo WiFi pripojenie
- Napájanie pre Raspberry Pi (5V, 3A)
- Kamera modul pre Raspberry Pi (pre age verification)
- GPIO komponenty (relé, senzory, pumpy)

## Príprava systému

### 1. Inštalácia operačného systému
```bash
# Stiahnite si Raspberry Pi OS Lite z https://www.raspberrypi.org/software/
# Použite Raspberry Pi Imager na napísanie na SD kartu
# Aktivujte SSH pred prvým spustením
```

### 2. Základná konfigurácia
```bash
# Pripojte sa cez SSH
ssh pi@<IP_ADRESA>

# Aktualizujte systém
sudo apt update
sudo apt upgrade -y

# Aktivujte kameru a GPIO
sudo raspi-config
# Vyberte "Interfacing Options" -> "Camera" -> "Yes"
# Vyberte "Interfacing Options" -> "SPI" -> "Yes"
# Vyberte "Interfacing Options" -> "I2C" -> "Yes"
# Reštartujte: sudo reboot
```

### 3. Inštalácia závislostí
```bash
# Inštalujte Python a potrebné balíky
sudo apt install -y python3-pip python3-venv git

# Inštalujte systémové závislosti
sudo apt install -y libcamera-dev libcamera-tools
sudo apt install -y python3-opencv
sudo apt install -y postgresql postgresql-contrib
```

## Inštalácia aplikácie

### 1. Stiahnutie kódu
```bash
# Vytvorte adresár pre projekt
mkdir ~/beer_dispenser
cd ~/beer_dispenser

# Klonujte projekt (alebo skopírujte súbory)
# git clone <YOUR_REPOSITORY_URL> .
# ALEBO skopírujte všetky súbory z vašej Replit do tohto adresára
```

### 2. Nastavenie Python prostredia
```bash
# Vytvorte virtuálne prostredie
python3 -m venv venv
source venv/bin/activate

# Inštalujte Python závislosti
pip install flask flask-sqlalchemy gunicorn
pip install opencv-python
pip install openai
pip install pillow
pip install psycopg2-binary
pip install RPi.GPIO
```

### 3. Konfigurácia databázy
```bash
# Spustite PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Vytvorte databázu a používateľa
sudo -u postgres psql
CREATE DATABASE beer_dispenser;
CREATE USER beer_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE beer_dispenser TO beer_user;
\q
```

### 4. Nastavenie environment premenných
```bash
# Vytvorte .env súbor
cat > .env << 'EOF'
USE_REAL_GPIO=1
DATABASE_URL=postgresql://beer_user:your_password@localhost/beer_dispenser
OPENAI_API_KEY=your_openai_api_key_here
SESSION_SECRET=your_session_secret_here
FLASK_ENV=production
EOF

# Načítajte premenné
source .env
export $(cat .env | grep -v '^#' | xargs)
```

## Konfigurácia hardware

### 1. GPIO pripojenie
```bash
# Vytvorte konfiguračný súbor pre GPIO piny
cat > gpio_config.py << 'EOF'
# GPIO Pin konfigurácia
BEER_PUMP_PIN = 18
KOFOLA_PUMP_PIN = 19
BIREL_PUMP_PIN = 20
CUP_DISPENSER_PIN = 21
WEIGHT_SENSOR_PIN = 22
EMERGENCY_STOP_PIN = 23
EOF
```

### 2. Testovanie kamery
```bash
# Otestujte kameru
libcamera-still -o test.jpg
# Ak funguje, súbor test.jpg bude vytvorený
```

## Spustenie aplikácie

### 1. Testovanie v development móde
```bash
# Aktivujte virtuálne prostredie
source venv/bin/activate

# Spustite aplikáciu
python3 main.py
```

### 2. Produkčné spustenie
```bash
# Vytvorte systemd service
sudo cat > /etc/systemd/system/beer-dispenser.service << 'EOF'
[Unit]
Description=Beer Dispensing System
After=network.target

[Service]
Type=exec
User=pi
Group=pi
WorkingDirectory=/home/pi/beer_dispenser
Environment=PATH=/home/pi/beer_dispenser/venv/bin
Environment=USE_REAL_GPIO=1
EnvironmentFile=/home/pi/beer_dispenser/.env
ExecStart=/home/pi/beer_dispenser/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 main:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Aktivujte a spustite službu
sudo systemctl daemon-reload
sudo systemctl enable beer-dispenser
sudo systemctl start beer-dispenser
```

### 3. Overenie funkčnosti
```bash
# Skontrolujte stav služby
sudo systemctl status beer-dispenser

# Skontrolujte logy
sudo journalctl -u beer-dispenser -f

# Otestujte webové rozhranie
curl http://localhost:5000
```

## Automatické spustenie pri štarte

### 1. Konfigurácia autostart
```bash
# Služba sa už automaticky spustí vďaka systemd
# Overenie: sudo systemctl is-enabled beer-dispenser
```

### 2. Nastavenie statickej IP adresy (voliteľné)
```bash
# Editujte konfiguráciu
sudo nano /etc/dhcpcd.conf

# Pridajte na koniec súboru:
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

## Bezpečnosť a údržba

### 1. Firewall
```bash
# Inštalujte a nakonfigurujte UFW
sudo apt install ufw
sudo ufw allow ssh
sudo ufw allow 5000
sudo ufw enable
```

### 2. Aktualizácie
```bash
# Vytvorte script pre aktualizácie
cat > update.sh << 'EOF'
#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo systemctl restart beer-dispenser
EOF

chmod +x update.sh
```

### 3. Zálohovanie
```bash
# Vytvorte script pre zálohovanie databázy
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump beer_dispenser > backup_$DATE.sql
EOF

chmod +x backup.sh
```

## Riešenie problémov

### 1. Časté problémy
```bash
# Ak sa aplikácia nespustí:
sudo systemctl status beer-dispenser
sudo journalctl -u beer-dispenser --no-pager

# Ak kamera nefunguje:
sudo usermod -a -G video pi
sudo reboot

# Ak GPIO nefunguje:
sudo usermod -a -G gpio pi
```

### 2. Testovanie komponentov
```bash
# Test GPIO (LED na pine 18)
python3 -c "
import RPi.GPIO as GPIO
import time
GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)
GPIO.output(18, GPIO.HIGH)
time.sleep(1)
GPIO.output(18, GPIO.LOW)
GPIO.cleanup()
"
```

### 3. Monitoring
```bash
# Sledovanie výkonu
htop

# Sledovanie diskového priestoru
df -h

# Sledovanie logov
tail -f /var/log/syslog
```

## Webové rozhranie

Po úspešnom spustení bude aplikácia dostupná na:
- Lokálne: http://localhost:5000
- V sieti: http://IP_ADRESA_PI:5000

### Prístup k admin rozhraniu:
- http://IP_ADRESA_PI:5000/admin

### Monitorovanie systému:
- http://IP_ADRESA_PI:5000/status

## Poznámky
- Uistite sa, že máte všetky potrebné API kľúče (OpenAI)
- Otestujte všetky hardware komponenty pred produkčným nasadením
- Pravidelne zálohujte databázu a konfiguráciu
- Monitorujte systémové prostriedky (CPU, RAM, disk)