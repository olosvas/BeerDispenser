# Produkčné nasadenie - Kiosk mód pre Raspberry Pi

## Verzia 1.0.0 (April 9, 2025)

Kompletný návod na nasadenie čapovacieho systému v kiosk móde pre produkčnú verziu.

## Rýchle spustenie

1. **Nainštalujte závislosti na Raspberry Pi:**
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

## Čo sa stane

### Automatická detekcia verzie
- Skript automaticky detekuje či beží na Replit deployment
- Používa environment variables `REPLIT_DOMAINS` alebo `REPLIT_DEV_DOMAIN`
- Automaticky zostavi správnu URL pre produkčnú verziu

### Kiosk mód
- Chromium sa spustí v celoobrazovkovom móde
- Skryje všetky ovládacie prvky prehliadača
- Automaticky sa pripojí na `/customer` endpoint
- Optimalizované pre dotykovú obrazovku

### Služby
- Vytvorí systemd službu `beer-dispenser-prod-kiosk.service`
- Automatický reštart pri páde aplikácie
- Spustenie po štarte systému

## Ovládanie

```bash
# Manuálne spustenie
./production_kiosk.sh

# Ovládanie služby
sudo systemctl start beer-dispenser-prod-kiosk.service
sudo systemctl stop beer-dispenser-prod-kiosk.service
sudo systemctl status beer-dispenser-prod-kiosk.service

# Zobrazenie logov
sudo journalctl -u beer-dispenser-prod-kiosk.service -f
```

## Výhody produkčnej verzie

- ✅ Žiadne lokálne závislosti (Flask, Python packages)
- ✅ Automatické aktualizácie cez Replit deployment
- ✅ Lepšia stabilita a výkon
- ✅ Centralizované logy a monitoring
- ✅ HTTPS zabezpečenie
- ✅ Škálovateľnosť

## Technické detaily

### Environment variables
- `REPLIT_DEPLOYMENT` - indikuje deployment
- `REPLIT_DOMAINS` - zoznam dostupných domén
- `REPLIT_DEV_DOMAIN` - dev doména

### Chromium optimalizácie
- Vypnuté aktualizácie a notifikácie
- Optimalizované pre embedded systém
- Minimálne využitie RAM a CPU
- Vypnuté zbytočné funkcie

### Bezpečnosť
- Sandboxing vypnutý pre lepšiu kompatibilitu s Raspberry Pi
- Lokálny user data directory
- Žiadne trvalé cookies alebo cache

## Riešenie problémov

### Aplikácia sa nespustí
```bash
# Manuálne overenie URL
curl -s https://your-domain.replit.app/customer

# Kontrola network connectivity
ping 8.8.8.8
```

### Chromium problémy
```bash
# Kontrola display
echo $DISPLAY
export DISPLAY=:0

# Zastavenie existujúcich procesov
pkill -f chromium-browser
```

### Služba nefunguje
```bash
# Reload systemd
sudo systemctl daemon-reload

# Kontrola statusu
sudo systemctl status beer-dispenser-prod-kiosk.service

# Manuálne spustenie skriptu
./production_kiosk.sh
```

## Podporované platformy

- Raspberry Pi 4B (odporúčané)
- Raspberry Pi 3B+
- Raspberry Pi OS (32-bit/64-bit)
- Ubuntu 20.04+ na ARM

## Kontakt

Pre technickú podporu a otázky kontaktujte správcu systému.