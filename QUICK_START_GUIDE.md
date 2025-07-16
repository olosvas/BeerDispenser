# Quick Start Guide - Beer Dispensing System na Raspberry Pi 4B

## Rýchly postup (5 minút)

### 1. Príprava
```bash
# Pripojte sa na Raspberry Pi
ssh pi@<IP_ADRESA>

# Vytvorte adresár
mkdir ~/beer_dispenser
cd ~/beer_dispenser
```

### 2. Kopírovanie súborov
```bash
# Skopírujte všetky súbory z Replit projektu do tohto adresára
# Použite SCP, rsync alebo Git clone
```

### 3. Automatická inštalácia
```bash
# Spustite deployment script
chmod +x deploy_to_pi.sh
./deploy_to_pi.sh
```

### 4. Konfigurácia API kľúča
```bash
# Editujte .env súbor
nano .env

# Nastavte váš OpenAI API kľúč
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 5. Spustenie
```bash
# Reštartujte službu
sudo systemctl restart beer-dispenser

# Skontrolujte stav
sudo systemctl status beer-dispenser
```

### 6. Testovanie
```bash
# Otvorte webové rozhranie v prehliadači
# http://IP_ADRESA_PI:5000
```

## Užitočné príkazy

```bash
# Sledovanie logov
sudo journalctl -u beer-dispenser -f

# Reštart služby
sudo systemctl restart beer-dispenser

# Stav systému
./status.sh

# Aktualizácia systému
./update.sh

# Záloha databázy
./backup.sh
```

## Riešenie problémov

### Aplikácia sa nespustí
```bash
# Skontrolujte logy
sudo journalctl -u beer-dispenser --no-pager

# Skontrolujte konfiguráciu
cat .env

# Manuálne spustenie na test
source venv/bin/activate
python3 main.py
```

### Kamera nefunguje
```bash
# Test kamery
libcamera-still -o test.jpg

# Aktivácia kamery
sudo raspi-config
# Vyberte "Interface Options" -> "Camera" -> "Enable"
```

### GPIO problémy
```bash
# Pridanie do GPIO skupiny
sudo usermod -a -G gpio pi

# Reštart
sudo reboot
```

## Prístup k rozhraniam

- **Zákaznícke rozhranie**: http://IP_ADRESA:5000/customer
- **Admin rozhranie**: http://IP_ADRESA:5000/admin
- **Monitoring**: http://IP_ADRESA:5000/status

## Podpora

Pre viac informácií pozrite:
- `RASPBERRY_PI_SETUP.md` - Detailný návod
- `HARDWARE_SETUP_GUIDE.md` - Pripojenie hardvéru
- `WIRING_DIAGRAM.md` - Schéma zapojenia