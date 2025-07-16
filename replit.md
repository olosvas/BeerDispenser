# Beer Dispensing System - Replit Project Documentation

## Overview
Automated IoT-enabled beverage dispensing system with AI-powered age verification, designed for Raspberry Pi with web interface.

**Current Version:** 1.0.0 (April 9, 2025)
**Status:** Production deployment ready

## Architecture
- **Backend:** Python Flask with PostgreSQL database
- **Frontend:** Responsive web interface with JavaScript
- **Hardware:** Raspberry Pi GPIO control system
- **AI Integration:** OpenAI vision API for age verification
- **Deployment:** Gunicorn WSGI server on port 5000

## Key Features
- Multi-beverage support (Beer, Kofola, Birel)
- Size selection (300ml, 500ml)
- Shopping cart functionality
- AI-powered age verification (18+ for alcoholic beverages)
- Multilingual support (Slovak/English)
- Real-time logging and monitoring
- Mock hardware simulation for development

## Recent Changes
- **July 16, 2025:** Added kiosk mode support for Raspberry Pi fullscreen deployment
- **April 9, 2025:** Released stable version 1.0.0 with complete age verification and cart functionality

## Production Deployment
- Uses `main.py` as entry point
- Configured with gunicorn for production serving
- Database logging for system events and dispensing tracking
- Mock GPIO implementation for non-Pi environments

## User Preferences
- Interface language: Slovak preferred
- Deployment target: Raspberry Pi 4B
- Display mode: Fullscreen kiosk mode preferred
- Development approach: Production-ready implementations