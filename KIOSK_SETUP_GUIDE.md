# Kiosk Mode Setup Guide pre Raspberry Pi

Tento návod vám pomôže nastaviť aplikáciu čapovacieho systému na Raspberry Pi 4B tak, aby bežala v celoobrazovkovom kiosk móde namiesto v bežnom prehliadači.

## Rýchle spustenie

1. **Nainštalujte závislosti:**
   ```bash
   ./install_kiosk_dependencies.sh
   ```

2. **Spustite kiosk mód manuálne:**
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

### Manuálne spustenie/zastavenie
```bash
# Spustenie
./start_kiosk.sh

# Zastavenie (Ctrl+C v terminále)
```

### Systemd služba
```bash
# Spustenie služby
sudo systemctl start beer-dispenser-kiosk.service

# Zastavenie služby
sudo systemctl stop beer-dispenser-kiosk.service

# Stav služby
sudo systemctl status beer-dispenser-kiosk.service

# Vypnutie automatického spustenia
sudo systemctl disable beer-dispenser-kiosk.service
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

- `start_kiosk.sh` - Hlavný skript pre spustenie kiosk módu
- `install_kiosk_dependencies.sh` - Inštalácia závislostí
- `setup_autostart.sh` - Nastavenie automatického spustenia
- `hide_cursor.sh` - Skrytie kurzora myši

## Bezpečnostné poznámky

Kiosk mód vypína niektoré bezpečnostné funkcie Chromium pre lepšiu funkcionalitu. Používajte len v kontrolovanom prostredí a nie na systémoch pripojených k internetu.