# Presný návod: Kiosk mód na Raspberry Pi

## Krok za krokom inštalácia a spustenie

### Predpoklady
- Raspberry Pi 4B s Raspberry Pi OS
- Internetové pripojenie
- SSH alebo priamy prístup k terminalu
- Vaša aplikácia je nasadená na verzii: `5dcf7b66-5269-4c09-8918-de0a505d8e4c`

---

## KROK 1: Príprava súborov

### 1.1 Vytvorte pracovný priečinok
```bash
mkdir ~/beer-dispenser-kiosk
cd ~/beer-dispenser-kiosk
```

### 1.2 Stiahnite súbory z tohto projektu
Všetky potrebné súbory si musíte prekopírovať na Raspberry Pi:
- `install_kiosk_dependencies.sh`
- `specific_version_kiosk.sh`
- `setup_specific_version_kiosk.sh`
- `test_deployment_url.sh`

**Možnosť A: SSH/SCP**
```bash
# Z vášho počítača (nahraďte IP adresu)
scp install_kiosk_dependencies.sh pi@192.168.1.100:~/beer-dispenser-kiosk/
scp specific_version_kiosk.sh pi@192.168.1.100:~/beer-dispenser-kiosk/
scp setup_specific_version_kiosk.sh pi@192.168.1.100:~/beer-dispenser-kiosk/
scp test_deployment_url.sh pi@192.168.1.100:~/beer-dispenser-kiosk/
```

**Možnosť B: Manuálne vytvorenie súborov**
Vytvorte súbory pomocou `nano` editora (postupne pre každý súbor).

---

## KROK 2: Inštalácia závislostí

### 2.1 Nastavte práva súborov
```bash
cd ~/beer-dispenser-kiosk
chmod +x *.sh
```

### 2.2 Spustite inštaláciu závislostí
```bash
./install_kiosk_dependencies.sh
```

**Čo sa stane:**
- Aktualizuje systém
- Nainštaluje Chromium prehliadač
- Nainštaluje X11 utilities
- Nainštaluje unclutter (skrytie kurzora)

**Očakávaný čas:** 5-10 minút

---

## KROK 3: Test pripojenia

### 3.1 Otestujte dostupnosť vašej aplikácie
```bash
./test_deployment_url.sh
```

**Očakávaný výstup:**
```
=== Test dostupnosti deployment verzie ===
Deployment ID: 5dcf7b66-5269-4c09-8918-de0a505d8e4c
URL: https://5dcf7b66-5269-4c09-8918-de0a505d8e4c.replit.app
==========================================
1. Testovanie základnej URL...
✓ Základná URL je dostupná
2. Testovanie /customer endpoint...
✓ Customer endpoint je dostupný
✓ Deployment je plne funkčný pre kiosk mód
```

**Ak test zlyhá:**
- Skontrolujte internetové pripojenie
- Overte, že deployment ID je správne
- Skúste otvoriť URL v prehliadači na inom zariadení

---

## KROK 4: Spustenie kiosk módu

### 4.1 Prvý test - manuálne spustenie
```bash
./specific_version_kiosk.sh
```

**Čo sa stane:**
- Otvorí sa Chromium v celoobrazovkovom móde
- Zobrazí sa vaša aplikácia bez okrajov prehliadača
- Kurzor sa automaticky skryje

**Pre ukončenie:** Stlačte `Ctrl+C` v terminále

### 4.2 Ak kiosk mód nefunguje
```bash
# Skontrolujte DISPLAY variable
echo $DISPLAY

# Ak je prázdne, nastavte
export DISPLAY=:0

# Spustite X server ak nie je spustený
startx
```

---

## KROK 5: Automatické spustenie

### 5.1 Nastavte automatické spustenie po štarte
```bash
./setup_specific_version_kiosk.sh
```

**Čo sa vytvorí:**
- Systemd služba `beer-dispenser-specific-kiosk`
- Autostart súbor pre grafické prostredie
- Automatický reštart pri páde

### 5.2 Overenie služby
```bash
# Skontrolujte stav služby
sudo systemctl status beer-dispenser-specific-kiosk

# Zobrazenie logov
sudo journalctl -u beer-dispenser-specific-kiosk -f
```

---

## KROK 6: Ovládanie systému

### 6.1 Manuálne ovládanie
```bash
# Spustenie
./specific_version_kiosk.sh

# Spustenie cez službu
sudo systemctl start beer-dispenser-specific-kiosk

# Zastavenie služby
sudo systemctl stop beer-dispenser-specific-kiosk

# Reštart služby
sudo systemctl restart beer-dispenser-specific-kiosk
```

### 6.2 Vypnutie automatického spustenia
```bash
sudo systemctl disable beer-dispenser-specific-kiosk
```

### 6.3 Znovu zapnutie automatického spustenia
```bash
sudo systemctl enable beer-dispenser-specific-kiosk
```

---

## KROK 7: Finálny test

### 7.1 Reštart Raspberry Pi
```bash
sudo reboot
```

### 7.2 Po reštarte
- Raspberry Pi by sa malo samo prihlásiť
- Automaticky sa spustí kiosk mód
- Vaša aplikácia sa zobrazí na celej obrazovke

---

## Riešenie problémov

### Chromium sa nespustí
```bash
# Skontrolujte či beží X server
ps aux | grep X

# Spustite X server
startx &
export DISPLAY=:0
```

### Aplikácia je nedostupná
```bash
# Test pripojenia
ping google.com
curl -I https://5dcf7b66-5269-4c09-8918-de0a505d8e4c.replit.app
```

### Služba sa nespustí
```bash
# Detailné logy
sudo journalctl -u beer-dispenser-specific-kiosk -n 50

# Manuálne spustenie pre diagnostiku
cd ~/beer-dispenser-kiosk
./specific_version_kiosk.sh
```

### Obrazovka je prázdna
```bash
# Skontrolujte rozlíšenie
xrandr

# Nastavte správne rozlíšenie
xrandr --output HDMI-1 --mode 1920x1080
```

---

## Užitočné príkazy

```bash
# Zobrazenie spustených procesov
ps aux | grep chromium

# Zabití všetkých Chromium procesov
pkill -f chromium

# Kontrola sieťového pripojenia
ip addr show

# Kontrola dostupných služieb
systemctl list-units --type=service | grep beer

# Editácia služby
sudo systemctl edit beer-dispenser-specific-kiosk
```

---

## Kontakt na podporu

Ak máte problémy s inštaláciou alebo spustením, dokumentujte:
1. Chybové hlásenia
2. Výstup z `sudo journalctl -u beer-dispenser-specific-kiosk -n 50`
3. Výstup z `./test_deployment_url.sh`
4. Verziu Raspberry Pi OS: `cat /etc/os-release`