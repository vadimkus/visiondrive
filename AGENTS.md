# AI Agent Instructions for VisionDrive

## Important: Read Documentation First

Before making any changes or answering questions about this project, **you MUST read the documentation files** in the `docs/` folder.

## Documentation Location

All project documentation is centralized in the `docs/` directory:

```
docs/
├── README.md                    # Documentation index and overview
├── PROJECT_STRUCTURE.md         # Project architecture and folder structure
├── clinic/                      # Practice OS (current product)
│   ├── README.md
│   ├── PLAN.md
│   ├── ARCHITECTURE.md
│   └── CHUNKS.md
├── archive/                     # Legacy parking-era docs
│
├── # Compliance & Certificates
├── IOT_CERTIFICATE_ADDITION.md  # Legacy company certificate reference
├── CONTRIBUTING.md              # Contribution guidelines
│
├── # Setup & Configuration
├── QUICK_SETUP.md               # Quick start guide
├── SETUP_DB.md                  # Database setup
├── README_AUTH.md               # Authentication setup
│
├── # Development
├── NOTES_REORGANIZATION_SUMMARY.md
├── SENSOR_TESTING_PLAN.md       # Sensor testing procedures
├── README_IMAGES.md             # Image guidelines
│
├── # Feature Documentation (11.x series)
├── 11-action-plan.md            # Overall action plan
├── 11.1-foundation.md           # Foundation setup
├── 11.2-simulated-ingestion.md  # Data ingestion simulation
├── 11.3-operator-portal-mvp.md  # Operator portal MVP
├── ... (and more 11.x files)
│
├── api/                         # API documentation
│   └── README.md
│
└── architecture/                # Architecture documentation
    └── README.md
```

## Key Files to Read

1. **For project overview**: `docs/README.md`, `docs/PROJECT_STRUCTURE.md`
2. **For practice / clinic product**: `docs/clinic/README.md`, `docs/clinic/PLAN.md`, `docs/clinic/ARCHITECTURE.md`
3. **For codebase structure**: `docs/CODEBASE_REFERENCE.md`
4. **For company certificate references**: `docs/IOT_CERTIFICATE_ADDITION.md`

## Project Context

VisionDrive (FZ-LLC) is building **practice operations software** for the UAE (`/clinic`, `docs/clinic/`). Practice OS is the active product direction; legacy non-practice application surfaces have been removed.

## Before Making Changes

1. Read relevant documentation in `docs/`
2. Check existing implementations in the codebase
3. Follow the established patterns and coding style
4. Update documentation if you make significant changes
