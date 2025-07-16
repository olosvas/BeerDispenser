#!/bin/bash

# Test script pre overenie dostupnosti špecifickej verzie
DEPLOYMENT_ID="5dcf7b66-5269-4c09-8918-de0a505d8e4c"
SPECIFIC_URL="https://${DEPLOYMENT_ID}.replit.app"

echo "=== Test dostupnosti deployment verzie ==="
echo "Deployment ID: $DEPLOYMENT_ID"
echo "URL: $SPECIFIC_URL"
echo "=========================================="

# Test základnej URL
echo "1. Testovanie základnej URL..."
if curl -s --connect-timeout 15 "$SPECIFIC_URL" > /dev/null 2>&1; then
    echo "✓ Základná URL je dostupná"
    
    # Test customer endpoint
    echo "2. Testovanie /customer endpoint..."
    if curl -s --connect-timeout 15 "$SPECIFIC_URL/customer" > /dev/null 2>&1; then
        echo "✓ Customer endpoint je dostupný"
        echo "✓ Deployment je plne funkčný pre kiosk mód"
    else
        echo "✗ Customer endpoint nie je dostupný"
        echo "Skúšam získať HTTP kód..."
        HTTP_CODE=$(curl -s --connect-timeout 15 -o /dev/null -w "%{http_code}" "$SPECIFIC_URL/customer")
        echo "HTTP kód: $HTTP_CODE"
    fi
else
    echo "✗ Základná URL nie je dostupná"
    echo "Možné príčiny:"
    echo "- Deployment nie je aktívny"
    echo "- Nesprávne Deployment ID"
    echo "- Sieťové problémy"
fi

echo ""
echo "=== Detailné testovanie ==="
echo "Pokus o načítanie hlavičiek..."
curl -I --connect-timeout 15 "$SPECIFIC_URL/customer" 2>&1 | head -10

echo ""
echo "Test dokončený."