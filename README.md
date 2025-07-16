# Beer Dispensing System 🍺

Automatizovaný systém na výdaj nápojov s AI-powered age verification pre Raspberry Pi 4B.

## Verzia
**1.0.0** - Prvé stabilné vydanie (9. apríl 2025)

## Funkcie
- 🍺 Automatický výdaj nápojov (Pivo, Kofola, Birel)
- 🔍 AI-powered age verification cez OpenAI Vision API
- 📱 Responsive web interface s multijazyčnou podporou (SK/EN)
- 🎛️ Admin dashboard pre monitoring a správu
- 🔧 Kompletná GPIO integrácia pre Raspberry Pi
- 📊 PostgreSQL databáza pre logovanie
- 🛡️ Bezpečnostné funkcie a error handling

## Rýchla inštalácia na Raspberry Pi 4B

### Metóda 1: Git Clone (Odporúčané)
```bash
# Pripojte sa na Raspberry Pi
ssh pi@<IP_ADRESA>

# Stiahni a spusti Git deployment script
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/beer-dispenser/main/deploy_from_git.sh | bash
```

### Metóda 2: Manuálne Git Clone
```bash
# Klonujte repository
git clone https://github.com/YOUR_USERNAME/beer-dispenser.git
cd beer-dispenser

# Spustite deployment script
chmod +x deploy_from_git.sh
./deploy_from_git.sh
```

### Metóda 3: Kopírovanie súborov
```bash
# Skopírujte všetky súbory a spustite
chmod +x deploy_to_pi.sh
./deploy_to_pi.sh
```

## Po inštalácii

1. **Nastavte OpenAI API kľúč**:
   ```bash
   nano ~/.env
   # Nastavte: OPENAI_API_KEY=sk-your-api-key-here
   ```

2. **Reštartujte službu**:
   ```bash
   sudo systemctl restart beer-dispenser
   ```

3. **Otvorte webové rozhranie**:
   - Zákaznícke: `http://IP_ADRESA:5000/customer`
   - Admin: `http://IP_ADRESA:5000/admin`

## Správa systému

### Aktualizácia z Git
```bash
cd ~/beer_dispenser
./git_update.sh
```

### Monitoring
```bash
./status.sh
```

### Zálohovanie
```bash
./backup.sh
```

### Logy
```bash
sudo journalctl -u beer-dispenser -f
```

## Štruktúra projektu

```
beer_dispenser/
├── main.py                 # Hlavný súbor aplikácie
├── config.py              # Konfigurácia
├── version.py             # Verzia systému
├── age_verification/      # AI age verification
├── controllers/           # Riadenie systému
├── hardware/              # GPIO a hardware
├── web_interface/         # Flask web aplikácia
├── deploy_from_git.sh     # Git deployment script
├── deploy_to_pi.sh        # Lokálny deployment script
└── requirements_pi.txt    # Python závislosti
```

## Hardware požiadavky

- Raspberry Pi 4B (4GB RAM odporúčané)
- Kamera modul
- GPIO komponenty:
  - Pumpy na nápoje (3x)
  - Cup dispenser
  - Weight sensor
  - Emergency stop button
  - Status LED indikátory

## Bezpečnosť

- Age verification pre alkoholické nápoje (18+)
- Firewall konfigurácia
- Secure database setup
- Error handling a logging

## Podpora

Pre detailné informácie pozrite:
- `RASPBERRY_PI_SETUP.md` - Kompletný návod
- `QUICK_START_GUIDE.md` - Rýchly štart
- `HARDWARE_SETUP_GUIDE.md` - Hardware setup
- `WIRING_DIAGRAM.md` - Schéma zapojenia

## Licencia

Tento projekt je určený pre vzdelávacie a vývojové účely.

## Autor

Vytvorené pomocou Replit AI systému pre automatizáciu beer dispensing systému.