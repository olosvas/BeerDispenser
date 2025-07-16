# 🔄 Rollback kódu na deployment verziu

## Deployment verzia: 5dcf7b66-5269-4c09-8918-de0a505d8e4c

## Možnosti rollback

### 1. Cez Replit Git (Odporúčané)

**Postup:**
1. Otvorte terminál v Replit
2. Spustite príkazy:
```bash
# Zobraziť Git históriu
git log --oneline -10

# Nájsť commit pre deployment verziu
git log --grep="5dcf7b66-5269-4c09-8918-de0a505d8e4c"

# Rollback na konkrétny commit (nahraďte COMMIT_HASH)
git reset --hard COMMIT_HASH

# Forcovať zmeny
git push --force-with-lease
```

### 2. Cez Replit Deployments

**Postup:**
1. Prejdite na záložku "Deployments"
2. Nájdite verziu `5dcf7b66-5269-4c09-8918-de0a505d8e4c`
3. Kliknite na "View Source" alebo "Download"
4. Manuálne skopírujte súbory späť

### 3. Manuálne obnovenie kľúčových súborov

Ak neviete presný commit, môžem vám pomôcť obnoviť kľúčové súbory na stabilný stav:

**Hlavné súbory na obnovenie:**
- `main.py` - entry point
- `web_interface/routes.py` - routing
- `web_interface/templates/customer.html` - UI
- `models.py` - databáza
- `config.py` - konfigurácia

## Čo urobiť po rollback

1. **Overiť funkčnosť:**
```bash
# Reštartovať aplikáciu
# Otestovať /customer endpoint
curl -I http://localhost:5000/customer
```

2. **Vytvoriť nový deployment:**
- Po rollback vytvoriť nový deployment
- Aktualizovať kiosk súbory s novým ID

3. **Aktualizovať dokumentáciu:**
- Upraviť `replit.md` s novým deployment ID
- Aktualizovať kiosk súbory

## Potrebujete pomoc?

Môžem vám pomôcť s:
- Obnovením konkrétnych súborov
- Opravou kódu po rollback
- Vytvorením nového deployment
- Aktualizáciou kiosk súborov

**Akú možnost preferujete?**