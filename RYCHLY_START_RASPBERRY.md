# 🚀 RÝCHLY ŠTART - Kiosk mód na Raspberry Pi

## ⚡ Čo potrebujete
- Raspberry Pi 4B s Raspberry Pi OS
- Internetové pripojenie
- Terminál (SSH alebo priamy prístup)

## 📋 Presný postup (5 minút)

### 1️⃣ Príprava (1 minúta)
```bash
# Vytvorte priečinok
mkdir ~/beer-dispenser-kiosk
cd ~/beer-dispenser-kiosk

# Stiahnite súbory z tohto projektu na Raspberry Pi
# (použite USB kľúč, SSH alebo vytvorte ich manuálne)
```

### 2️⃣ Nastavenie práv
```bash
chmod +x *.sh
```

### 3️⃣ Inštalácia (3 minúty)
```bash
./install_kiosk_dependencies.sh
```

### 4️⃣ Test pripojenia (30 sekúnd)
```bash
./test_deployment_url.sh
```
**Musíte vidieť:** `✓ Deployment je plne funkčný pre kiosk mód`

### 5️⃣ Spustenie kiosk módu (10 sekúnd)
```bash
./specific_version_kiosk.sh
```

**HOTOVO!** Aplikácia sa zobrazí na celej obrazovke.

---

## 🔧 Automatické spustenie po štarte

```bash
./setup_specific_version_kiosk.sh
sudo reboot
```

Po reštarte sa kiosk mód spustí automaticky.

---

## 🎯 Súbory ktoré potrebujete

Vytvorte tieto súbory na Raspberry Pi pomocou `nano`:

### 1. install_kiosk_dependencies.sh
```bash
nano install_kiosk_dependencies.sh
```
(Skopírujte obsah z tohto projektu)

### 2. specific_version_kiosk.sh
```bash
nano specific_version_kiosk.sh
```
(Skopírujte obsah z tohto projektu)

### 3. setup_specific_version_kiosk.sh
```bash
nano setup_specific_version_kiosk.sh
```
(Skopírujte obsah z tohto projektu)

### 4. test_deployment_url.sh
```bash
nano test_deployment_url.sh
```
(Skopírujte obsah z tohto projektu)

---

## 🆘 Ak niečo nefunguje

### Chromium sa nespustí
```bash
export DISPLAY=:0
startx &
```

### Aplikácia je nedostupná
```bash
ping google.com
curl -I https://5dcf7b66-5269-4c09-8918-de0a505d8e4c.replit.app
```

### Zastavenie kiosk módu
```bash
# V terminále stlačte Ctrl+C
# Alebo
sudo systemctl stop beer-dispenser-specific-kiosk
```

---

## 📝 Ovládanie

```bash
# Spustenie
./specific_version_kiosk.sh

# Zastavenie
sudo systemctl stop beer-dispenser-specific-kiosk

# Reštart
sudo systemctl restart beer-dispenser-specific-kiosk

# Zobrazenie logov
sudo journalctl -u beer-dispenser-specific-kiosk -f
```

---

## 🎯 Vaša aplikácia

- **URL:** https://5dcf7b66-5269-4c09-8918-de0a505d8e4c.replit.app
- **Endpoint:** /customer
- **Rozlíšenie:** 1920x1080 (fullscreen)
- **Automatický reštart:** Áno

**Teraz už môžete používať aplikáciu v kiosk móde!**