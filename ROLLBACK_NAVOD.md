# 🔄 Rollback na verziu 5dcf7b66-5269-4c09-8918-de0a505d8e4c

## Presný postup rollback

### 1. Otvorte Replit deployment panel
- Prejdite na váš Replit projekt
- Kliknite na záložku "Deployments" (vedľa "Files")

### 2. Nájdite cieľovú verziu
- V zozname deployments nájdite verziu: `5dcf7b66-5269-4c09-8918-de0a505d8e4c`
- Táto verzia by mala byť označená ako produkčná

### 3. Vykonajte rollback
- Kliknite na tlačidlo "Rollback" vedľa tejto verzie
- Potvrďte rollback

### 4. Overenie rollback
Po rollback by mal byť váš deployment dostupný na:
- **URL:** https://5dcf7b66-5269-4c09-8918-de0a505d8e4c.replit.app
- **Customer endpoint:** https://5dcf7b66-5269-4c09-8918-de0a505d8e4c.replit.app/customer

### 5. Test funkčnosti
Otestujte funkčnosť:
```bash
curl -I https://5dcf7b66-5269-4c09-8918-de0a505d8e4c.replit.app/customer
```

## Pre Raspberry Pi kiosk mód

Po rollback môžete pokračovať s kiosk módom:

### 1. Otestujte dostupnosť na Raspberry Pi
```bash
./test_deployment_url.sh
```

### 2. Spustite kiosk mód
```bash
./specific_version_kiosk.sh
```

### 3. Nastavte automatické spustenie
```bash
./setup_specific_version_kiosk.sh
```

## Poznámky

- Rollback môžete urobiť iba vy v Replit interface
- Všetky kiosk súbory sú už pripravené pre túto verziu
- Po rollback nebude potrebná žiadna úprava konfigurácií
- Kiosk mód bude fungovať okamžite po rollback

## Ak rollback nefunguje

1. Skontrolujte že verzia `5dcf7b66-5269-4c09-8918-de0a505d8e4c` existuje
2. Overte že máte práva na rollback
3. Skúste obnoviť stránku a zopakovať
4. Kontaktujte Replit support ak problém pretrváva

**Po rollback budete mať stabilnú produkčnú verziu pripravenú pre kiosk mód na Raspberry Pi.**