#!/bin/bash

# Install dependencies for kiosk mode on Raspberry Pi
# Run this script once to set up the system

echo "Updating system packages..."
sudo apt update

echo "Installing Chromium browser..."
sudo apt install -y chromium-browser

echo "Installing X11 utilities..."
sudo apt install -y xorg xserver-xorg-video-fbdev

echo "Installing unclutter to hide mouse cursor..."
sudo apt install -y unclutter

echo "Installing screen management utilities..."
sudo apt install -y screen

echo "Creating kiosk autostart directory..."
mkdir -p ~/.config/autostart

echo "Dependencies installed successfully!"
echo ""
echo "To start kiosk mode manually, run:"
echo "  ./start_kiosk.sh"
echo ""
echo "To set up automatic startup on boot, run:"
echo "  ./setup_autostart.sh"