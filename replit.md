# Beer Dispensing System - Project Documentation

## Overview
Automatizovaný systém na výdaj nápojov s AI-powered age verification pre Raspberry Pi 4B. Systém poskytuje webové rozhranie pre zákazníkov a admin panel pre správu. Podporuje tri druhy nápojov (Pivo, Kofola, Birel) s age verification pre alkoholické nápoje.

## Current State
- **Version**: 1.0.0 (Released: July 16, 2025)
- **Status**: Production ready
- **Deployment**: Ready for Raspberry Pi 4B

## Recent Changes
- ✅ Created comprehensive Git deployment solution
- ✅ Added deploy_from_git.sh script for automatic installation
- ✅ Created .gitignore for proper Git repository management
- ✅ Added requirements_pi.txt for Python dependencies
- ✅ Created README.md with Git-based installation instructions
- ✅ Added utility scripts for Git updates and monitoring
- ✅ Documented complete deployment process

## Project Architecture

### Core Components
- **main.py**: Entry point, initializes hardware and starts Flask app
- **config.py**: Configuration settings and constants
- **version.py**: Version information (1.0.0)

### Modules
- **age_verification/**: AI-powered age detection using OpenAI Vision API
- **controllers/**: System control logic and dispensing sequences
- **hardware/**: GPIO hardware interfaces and mock implementations
- **web_interface/**: Flask web application with templates and routes

### Database
- PostgreSQL database for logging and state management
- Tables for system events, dispensing logs, error tracking

### Web Interface
- Customer interface: Beverage selection, cart management, age verification
- Admin interface: System monitoring, statistics, error logs
- Multilingual support (Slovak/English)

## Hardware Configuration
- **Target**: Raspberry Pi 4B
- **GPIO Pins**: Configured for pumps, sensors, emergency stop
- **Camera**: Required for age verification
- **Database**: PostgreSQL for logging

## Deployment Options

### Option 1: Git Clone (Recommended)
```bash
git clone <repository-url>
cd beer-dispenser
./deploy_from_git.sh
```

### Option 2: Direct Download
```bash
# Download all files manually
./deploy_to_pi.sh
```

### Option 3: One-line Git Install
```bash
curl -sSL <raw-github-url>/deploy_from_git.sh | bash
```

## User Preferences
- **Language**: Slovak preferred for documentation and interface
- **Deployment**: Git-based workflow preferred
- **Hardware**: Raspberry Pi 4B target platform
- **Documentation**: Comprehensive, step-by-step instructions

## Key Features
- Multi-beverage support (Beer, Kofola, Birel)
- AI age verification for alcoholic beverages
- Responsive web interface
- Admin dashboard with monitoring
- Automatic dispensing sequence
- Error handling and logging
- GPIO hardware integration
- PostgreSQL database backend

## Development Guidelines
- Use mock hardware when GPIO not available
- Maintain separation between development and production
- Follow Flask best practices
- Implement proper error handling
- Version control with Git
- Document all configuration changes

## Security Considerations
- Age verification for alcoholic beverages (18+)
- Firewall configuration
- Database security
- API key management
- Input validation

## Monitoring and Maintenance
- System status monitoring
- Error logging and reporting
- Automatic backups
- Git-based updates
- Performance monitoring

## Future Enhancements
- Remote monitoring capabilities
- Inventory management
- Payment system integration
- Advanced analytics
- Mobile app interface

## Technical Decisions
- **Framework**: Flask for web interface
- **Database**: PostgreSQL for reliability
- **AI Service**: OpenAI Vision API for age verification
- **Hardware**: RPi.GPIO for Raspberry Pi integration
- **Deployment**: systemd service for production
- **Version Control**: Git-based workflow

## Documentation Files
- `README.md`: Project overview and quick start
- `RASPBERRY_PI_SETUP.md`: Detailed installation guide
- `QUICK_START_GUIDE.md`: 5-minute setup guide
- `FILES_TO_COPY.md`: File listing for manual deployment
- `HARDWARE_SETUP_GUIDE.md`: Hardware configuration
- `WIRING_DIAGRAM.md`: Circuit diagrams
- `COMPONENTS_SHOPPING_LIST.md`: Parts list

## Scripts and Utilities
- `deploy_from_git.sh`: Git-based deployment
- `deploy_to_pi.sh`: Local file deployment
- `git_update.sh`: Update from Git repository
- `status.sh`: System monitoring
- `backup.sh`: Database backup
- `system_update.sh`: System updates

## Configuration Files
- `.env`: Environment variables
- `requirements_pi.txt`: Python dependencies
- `gpio_config.py`: GPIO pin configuration
- `.gitignore`: Git ignore patterns

## Known Issues
- Camera initialization may require manual configuration
- GPIO permissions need proper user groups
- OpenAI API key must be configured manually

## Support and Troubleshooting
- Check systemd service status: `sudo systemctl status beer-dispenser`
- View logs: `sudo journalctl -u beer-dispenser -f`
- Monitor system: `./status.sh`
- Update code: `./git_update.sh`