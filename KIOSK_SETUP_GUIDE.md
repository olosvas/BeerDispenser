# Kiosk Mode Setup Guide pre Raspberry Pi

Tento návod vám pomôže nastaviť aplikáciu čapovacieho systému na Raspberry Pi 4B tak, aby bežala v celoobrazovkovom kiosk móde namiesto v bežnom prehliadači.

## Pre produkčnú verziu (odporúčané)

**Ak máte nasadenú verziu na Replit:**

1. **Nainštalujte závislosti:**
   ```bash
   ./install_kiosk_dependencies.sh
   ```

2. **Spustite produkčný kiosk mód:**
   ```bash
   ./production_kiosk.sh
   ```

3. **Nastavte automatické spustenie:**
   ```bash
   ./setup_production_kiosk.sh
   ```

## Pre lokálnu verziu

1. **Nainštalujte závislosti:**
   ```bash
   ./install_kiosk_dependencies.sh
   ```

2. **Spustite lokálny kiosk mód:**
   ```bash
   ./start_kiosk.sh
   ```

## Automatické spustenie po štarte systému

Pre automatické spustenie po štarte Raspberry Pi:

```bash
./setup_autostart.sh
```

## Čo kiosk mód robí

- **Celoobrazovkový mód**: Aplikácia sa spustí na celej obrazovke bez okrajov prehliadača
- **Skrytý kurzor**: Kurzor myši sa skryje po 1 sekunde nečinnosti
- **Automatický reštart**: Aplikácia sa automaticky reštartuje pri páde
- **Optimalizované nastavenia**: Vypnuté notifikácie, aktualizácie a iné rušivé prvky

## Ovládanie kiosk módu

### Produkčná verzia
```bash
# Manuálne spustenie
./production_kiosk.sh

# Spustenie služby
sudo systemctl start beer-dispenser-prod-kiosk.service

# Zastavenie služby
sudo systemctl stop beer-dispenser-prod-kiosk.service

# Stav služby
sudo systemctl status beer-dispenser-prod-kiosk.service

# Logy služby
sudo journalctl -u beer-dispenser-prod-kiosk.service -f

# Vypnutie automatického spustenia
sudo systemctl disable beer-dispenser-prod-kiosk.service
```

### Lokálna verzia
```bash
# Manuálne spustenie
./start_kiosk.sh

# Spustenie služby
sudo systemctl start beer-dispenser-kiosk.service

# Zastavenie služby
sudo systemctl stop beer-dispenser-kiosk.service

# Stav služby
sudo systemctl status beer-dispenser-kiosk.service
```

## Požiadavky na systém

- Raspberry Pi 4B s Raspberry Pi OS
- Chromium prehliadač
- X11 grafický server
- Python 3 s Flask aplikáciou

## Rozlíšenie obrazovky

Skript automaticky nastaví rozlíšenie 1920x1080. Pre iné rozlíšenie upravte riadok v `start_kiosk.sh`:

```bash
--window-size=1920,1080
```

## Riešenie problémov

### Aplikácia sa nespustí
```bash
# Skontrolujte Flask aplikáciu
python3 main.py

# Skontrolujte či port 5000 je voľný
netstat -tuln | grep 5000
```

### Chromium sa nespustí
```bash
# Skontrolujte DISPLAY
echo $DISPLAY

# Spustite X server ak nie je spustený
startx
```

### Služba nefunguje
```bash
# Pozrite logy
sudo journalctl -u beer-dispenser-kiosk.service -f

# Reštartujte službu
sudo systemctl restart beer-dispenser-kiosk.service
```

## Súbory

### Produkčná verzia
- `production_kiosk.sh` - Hlavný skript pre produkčný kiosk mód
- `setup_production_kiosk.sh` - Nastavenie automatického spustenia produkčnej verzie
- `install_kiosk_dependencies.sh` - Inštalácia závislostí

### Lokálna verzia
- `start_kiosk.sh` - Hlavný skript pre lokálny kiosk mód
- `setup_autostart.sh` - Nastavenie automatického spustenia lokálnej verzie
- `hide_cursor.sh` - Skrytie kurzora myši

## Bezpečnostné poznámky

Kiosk mód vypína niektoré bezpečnostné funkcie Chromium pre lepšiu funkcionalitu. Používajte len v kontrolovanom prostredí a nie na systémoch pripojených k internetu.