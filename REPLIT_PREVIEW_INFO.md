# 🔍 Replit Preview vs Produkčná verzia

## Aktuálny stav

**Preview (Development):** Aktuálny kód v editore
**Produkčná verzia:** 5dcf7b66-5269-4c09-8918-de0a505d8e4c

## Dôležité rozdiely

### Replit Preview
- Zobrazuje aktuálny kód v editore
- Spúšťa sa cez "Run" tlačidlo
- URL: https://[repl-name].[username].repl.co
- Používa sa pre vývoj a testovanie

### Produkčná verzia (Deployment)
- Záložka "Deployments" v Replit
- Stabilná verzia pre produkčné použitie
- URL: https://5dcf7b66-5269-4c09-8918-de0a505d8e4c.replit.app
- Používa sa pre kiosk mód na Raspberry Pi

## Čo to znamená

1. **Pre vývoj:** Pracujeme v preview (aktuálny kód)
2. **Pre produkciu:** Používame deployment verziu na Raspberry Pi
3. **Kiosk mód:** Pripojuje sa na deployment, nie na preview

## Riešenie

### Ak chcete aktualizovať produkčnú verziu:
1. Dokončite zmeny v preview
2. Vytvorte nový deployment
3. Aktualizujte kiosk súbory s novým deployment ID

### Ak chcete pracovať na existujúcej produkčnej verzii:
1. Musíte urobiť rollback kódu na stav z deployment verzie
2. Alebo pokračovať vo vývoji a neskôr nasadiť

## Odporúčanie

Pokračujme vo vývoji v preview a keď budete spokojní, vytvoríme nový deployment pre Raspberry Pi.

**Preview je pre vývoj, Deployment je pre produkciu.**