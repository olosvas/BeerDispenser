# 🎯 Presný rollback postup

## Identifikovaná situácia

**Aktuálny commit:** `6de00d3` (Add instructions to revert code to the previous working deployment)
**Target commit:** `b788a59` (Enable production kiosk mode for streamlined deployment on Raspberry Pi)

**Dátum target commit:** Wed Jul 16 10:27:37 2025 +0000

## Rollback postup

### 1. Rollback Git na target commit
```bash
# Rollback na commit b788a59
git reset --hard b788a59

# Forcovať zmeny (POZOR: stratíte nesavedované zmeny!)
git push --force-with-lease origin main
```

### 2. Overenie rollback
```bash
# Skontrolovať aktuálny commit
git log --oneline -3

# Malo by byť:
# b788a59 (HEAD -> main) Enable production kiosk mode for streamlined deployment on Raspberry Pi
```

### 3. Reštart aplikácie
- Aplikácia sa automaticky reštartuje po Git push
- Skontrolujte že aplikácia funguje v preview

## Čo sa stane po rollback

### Súbory ktoré sa vrátia:
- `KIOSK_SETUP_GUIDE.md` - zmenený
- `PRODUCTION_DEPLOYMENT_README.md` - pridaný
- `production_kiosk.sh` - pridaný
- `replit.md` - aktualizovaný
- `setup_production_kiosk.sh` - pridaný
- `start_kiosk.sh` - upravený

### Súbory ktoré sa odstránia:
- `ROLLBACK_NAVOD.md`
- `REPLIT_PREVIEW_INFO.md`
- `PRODUCTION_VERSION_INFO.md`
- `ZISTI_VERZIU_NAVOD.md`
- `specific_version_kiosk.sh`
- `setup_specific_version_kiosk.sh`
- `test_deployment_url.sh`

## Po rollback kroky

### 1. Vytvoriť nový deployment
- Po rollback vytvorte nový deployment v Replit
- Nové deployment ID bude odlišné od `5dcf7b66-5269-4c09-8918-de0a505d8e4c`

### 2. Aktualizovať kiosk súbory
- Aktualizovať `production_kiosk.sh` s novým deployment ID
- Aktualizovať `setup_production_kiosk.sh`

### 3. Aktualizovať dokumentáciu
- Aktualizovať `replit.md` s novým deployment ID
- Aktualizovať `PRODUCTION_DEPLOYMENT_README.md`

## Príkazy na spustenie

```bash
# 1. Rollback
git reset --hard b788a59
git push --force-with-lease origin main

# 2. Overenie
git log --oneline -3

# 3. Test aplikácie
# Skontrolujte že aplikácia funguje v preview
```

## Dôležité upozornenia

⚠️ **POZOR:** `git reset --hard` odstráni všetky nesavedované zmeny!
⚠️ **POZOR:** `git push --force-with-lease` prepíše Git históriu!
⚠️ **POZOR:** Po rollback budete musieť vytvoriť nový deployment!

## Chcete pokračovať?

Ak súhlasíte, spustím rollback príkazy. Po rollback:
1. Vytvoríme nový deployment
2. Aktualizujeme kiosk súbory s novým ID
3. Otestujeme kiosk mód na Raspberry Pi