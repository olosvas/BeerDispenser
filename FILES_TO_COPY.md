# Súbory potrebné na kopírovanie na Raspberry Pi

## Postup kopírovania
1. Stiahnite si všetky súbory z tohto Replit projektu
2. Skopírujte ich na Raspberry Pi do adresára `/home/pi/beer_dispenser/`
3. Spustite deployment script

## Zoznam súborov a adresárov

### Hlavné súbory
- `main.py` - Hlavný súbor aplikácie
- `config.py` - Konfiguračné nastavenia
- `version.py` - Informácie o verzii
- `requirements.txt` - Python závislosti (vytvorte podľa potreby)

### Adresáre a ich obsah

#### `/age_verification/`
- `__init__.py`
- `age_detector.py`
- `webcam_capture.py`

#### `/controllers/`
- `__init__.py`
- `dispense_sequence.py`
- `error_handler.py`
- `main_controller.py`

#### `/hardware/`
- `__init__.py`
- `beer_dispenser.py`
- `cup_delivery.py`
- `cup_dispenser.py`
- `mock_hardware.py`
- `system_monitor.py`
- `weight_sensor.py`

#### `/web_interface/`
- `__init__.py`
- `app.py`
- `routes.py`

#### `/web_interface/templates/`
- `admin.html`
- `control.html`
- `customer.html`
- `layout.html`
- `status.html`

#### `/web_interface/static/`
- `customer.js`
- `custom.css`
- `generated-icon.png`

### Dokumentácia
- `RASPBERRY_PI_SETUP.md` - Detailný návod na inštaláciu
- `RELEASE.md` - Poznámky k vydaniu
- `HARDWARE_SETUP_GUIDE.md` - Návod na pripojenie hardvéru
- `WIRING_DIAGRAM.md` - Schéma zapojenia
- `COMPONENTS_SHOPPING_LIST.md` - Zoznam komponentov na kúpu
- `CALIBRATION_GUIDE.md` - Kalibrácia systému

### Deployment súbory
- `deploy_to_pi.sh` - Automatický deployment script
- `FILES_TO_COPY.md` - Tento súbor

## Príkazy na kopírovanie

### Použitie SCP (z vášho počítača)
```bash
# Skopírovanie celého projektu
scp -r . pi@<IP_ADRESA>:/home/pi/beer_dispenser/

# Alebo po súboroch
scp main.py config.py version.py pi@<IP_ADRESA>:/home/pi/beer_dispenser/
scp -r age_verification/ pi@<IP_ADRESA>:/home/pi/beer_dispenser/
scp -r controllers/ pi@<IP_ADRESA>:/home/pi/beer_dispenser/
scp -r hardware/ pi@<IP_ADRESA>:/home/pi/beer_dispenser/
scp -r web_interface/ pi@<IP_ADRESA>:/home/pi/beer_dispenser/
scp *.md pi@<IP_ADRESA>:/home/pi/beer_dispenser/
scp deploy_to_pi.sh pi@<IP_ADRESA>:/home/pi/beer_dispenser/
```

### Použitie rsync (odporúčané)
```bash
# Synchronizácia celého projektu
rsync -avz --exclude='__pycache__' --exclude='*.pyc' --exclude='temp_*' . pi@<IP_ADRESA>:/home/pi/beer_dispenser/
```

### Použitie Git (ak máte repository)
```bash
# Na Raspberry Pi
cd /home/pi/beer_dispenser
git clone <YOUR_REPOSITORY_URL> .
```

## Po kopírovaní súborov

1. Prihláste sa na Raspberry Pi:
   ```bash
   ssh pi@<IP_ADRESA>
   ```

2. Prejdite do adresára s projektom:
   ```bash
   cd ~/beer_dispenser
   ```

3. Spustite deployment script:
   ```bash
   chmod +x deploy_to_pi.sh
   ./deploy_to_pi.sh
   ```

4. Následne editujte konfiguráciu:
   ```bash
   nano .env
   ```
   
   Nastavte váš OpenAI API kľúč:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

5. Reštartujte službu:
   ```bash
   sudo systemctl restart beer-dispenser
   ```

## Kontrola po inštalácii

```bash
# Stav služby
sudo systemctl status beer-dispenser

# Logy
sudo journalctl -u beer-dispenser -f

# Test webového rozhrania
curl http://localhost:5000

# Monitoring
./status.sh
```

## Poznámky
- Dbajte na to, aby ste skopírovali všetky súbory zachovávajúc štruktúru adresárov
- Súbory s prefixom `temp_` nie sú potrebné na produkčné nasadenie
- Ak používate Git, pridajte `.gitignore` súbor pre vyfilterovanie nepotrebných súborov