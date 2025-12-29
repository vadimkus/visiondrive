'use client'

import { useState } from 'react'
import Section from '../components/common/Section'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface NoteSection {
  id: string
  title: string
  content: string[]
}

const noteSections: NoteSection[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PART A: STRATEGIC OVERVIEW & PLANNING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'executive',
    title: '1. Executive Summary (NB-IoT Decision)',
    content: [
      'VisionDrive is standardizing on NB-IoT parking sensors (PSL series / PSL01B-class) as the core "ground truth" layer for bay-level occupancy.',
      '',
      'Key decisions (locked):',
      '• Sensor uplink: NB-IoT → MQTT',
      '• Payload: HEX string (fixed byte layout; same format across LoRaWAN/NB-IoT in vendor docs)',
      '• Local install + diagnostics: Bluetooth AT commands (enable radar, set parking type, calibrate, query status)',
      '• Portal/UI: Next.js on Vercel',
      '• Ingestion: always-on MQTT subscriber service in UAE region (AWS me-central-1)',
      '• Database: UAE-hosted PostgreSQL (optionally time-series optimized)',
      '',
      'Document Structure:',
      '• Part A (Sections 1–3): Strategic overview, architecture, and business planning',
      '• Part B (Sections 4–7): Technical specifications (sensors, data, operations)',
      '• Part C (Sections 8–10): Compliance and regulatory requirements',
      '• Part D (Sections 11–12): Execution roadmap and action plan',
    ],
  },
  {
    id: 'architecture',
    title: '2. System Architecture (UAE-Compliant)',
    content: [
      'We are building two systems that talk over the internet:',
      '',
      'Flow A — Ingestion (always-on, not Vercel):',
      'Sensor → NB-IoT → MQTT broker (UAE) → AWS ingestion service → DB (UAE)',
      '',
      'Flow B — UI/API (stateless):',
      'User → Vercel (Next.js portal) → API calls → DB queries',
      '',
      'Why this is the right split:',
      '• MQTT subscription must be long-lived and reliable (Vercel is not built for that).',
      '• Ingestion and the system-of-record DB run in UAE region for residency and low latency.',
      '',
      'Important note on residency:',
      '• AWS IoT Core is the MQTT broker (not a database). The residency requirement applies to the database, logs, and backups.',
      '',
      'Broker recommendation (given current device constraints):',
      '• Primary broker: self-hosted EMQX in AWS me-central-1 (TLS 8883 + username/password).',
      '• Optional later: bridge EMQX → AWS IoT Core (mTLS on the bridge side) if we want AWS IoT Rules / fan-out.',
      '',
      'AWS UAE Foundation (me-central-1):',
      '• VPC: public subnets (ALB/NLB), private app subnets (EMQX/ingestion), private data subnets (DB)',
      '• Database: Postgres + TimescaleDB (self-hosted, no public IPs)',
      '• Storage: S3 for backups, logs (all in UAE region)',
      '• Encryption: AWS KMS keys (UAE region) for DB, S3, EBS',
      '• Monitoring: CloudTrail + CloudWatch (UAE region)',
      '• Access: SSM Session Manager (no public SSH), IAM least privilege',
    ],
  },
  {
    id: 'pilot-matrix',
    title: '3. Pilot Strategy & Acceptance Criteria',
    content: [
      'Before scaling to 2,000–5,000 sensors, we run a controlled pilot to validate coverage, reliability, and operations.',
      '',
      'Pilot design (minimum): 10–20 sensors across 3 environments:',
      '• Street (open sky)',
      '• Semi-covered (shaded/roofed)',
      '• Underground (edge + center + ramps)',
      '',
      'What we measure (per sensor):',
      '• Uplink reliability: % of events received within SLA',
      '• Latency: event time → ingestion time (p50/p95)',
      '• Stability: flapping rate (false transitions/hour)',
      '• Health: battery %, temp, water coverage flag, radar validity',
      '• Heartbeat: periodic reporting interval adherence (last_seen freshness)',
      '',
      'Acceptance criteria (suggested starting point):',
      '• ≥ 99% of occupancy change events arrive within 30 seconds (street/semi-covered)',
      '• ≥ 95% within 60 seconds (underground)',
      '• Flapping rate below agreed threshold (site-specific; start with < 2 false flips/day)',
      '• Any water coverage flag triggers an alert and is visible in the portal within 5 minutes',
      '',
      'Deliverables from pilot:',
      '• Coverage map: "good" vs "bad" spots with recommended installation rules',
      '• Tuned configuration baseline (park type, calibration SOP, thresholds)',
      '• Go/no-go decision for production scale-up',
      '',
      'Critical validation (underground risk):',
      '• NB-IoT performance is dominated by carrier coverage and bands deployed at the site',
      '• Band support confirmed: B1/B3/B5/B8/B20/B28 (suitable for Du/Etisalat on paper)',
      '• Do NOT assume "works underground everywhere" until measured at target sites',
      '• If underground coverage is weak: consider different carrier/SIM, indoor coverage solution, or prioritize street deployments',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PART B: TECHNICAL SPECIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sensor-protocol',
    title: '4. Sensor Protocol (MQTT + HEX Payload)',
    content: [
      'MQTT (NB-IoT uplink)',
      '• Topic: /psl/<id>/event',
      '• Payload: raw HEX string, example: 28648c100A54004600fc100000',
      '• <id> identity (confirmed): device UUID (globally unique, immutable)',
      '• Transport security (confirmed): TLS/SSL, port 8883',
      '• Authentication (confirmed): username + password (mTLS not supported in current firmware)',
      '• QoS (confirmed): 0 / 1 / 2',
      '• Message behavior (confirmed): event-based (occupancy change) + periodic heartbeat (configurable interval)',
      '',
      'Minimum fields we must decode and store',
      '• Temperature (°C), Battery (%)',
      '• Status byte bits:',
      '  • BIT3 water coverage',
      '  • BIT4 parking status (0 empty, 1 occupied)',
      '  • BIT7 radar validity',
      '• Radar + magnetic metrics (for debugging false positives and coverage issues)',
      '',
      'Open questions to confirm with vendor/carrier (blockers if unknown):',
      '• [ ] MQTT ACL model: ensure a device can only publish to /psl/<its-uuid>/event',
      '• [ ] Module part number + official RF spec sheet (for independent validation)',
    ],
  },
  {
    id: 'commissioning',
    title: '5. Installation & Commissioning (Field SOP)',
    content: [
      'This is the practical installer flow we must standardize (SOP):',
      '',
      'Installation steps (via Bluetooth AT commands):',
      '• Enable radar module (device may ship sleeping): AT+SWRDENABLE=1',
      '• Set parking type (parallel vs vertical/slanted): AT+SWRDPARKTYPE=<0|1>',
      '• Calibrate after first install (20s; clear 1m radius): AT+SWRDCALI',
      '• Configure SIM APN parameters (confirmed required): set APN via Bluetooth based on SIM provider',
      '',
      'On-site validation (before leaving the site):',
      '• AT+SWRDSTATUS? (raw radar/mag values, radar validity, error code)',
      '• AT+SWQUERY? (HEX payload preview used by our decoder)',
      '• Test occupancy change: place object over sensor and verify event appears in portal within 30 seconds',
      '• Wait for heartbeat: confirm periodic message arrives within expected interval',
      '',
      'Portal mapping requirement:',
      '• Every sensor must be bound to exactly one bay polygon (scan/enter sensor <id> → select bay → save).',
      '• Commissioning state: uncommissioned → commissioned (track in audit log)',
      '',
      'Documentation requirements:',
      '• Photo of sensor after installation (for maintenance/troubleshooting)',
      '• GPS coordinates or bay identifier',
      '• Installation date and technician name',
      '• Carrier/SIM details (Du or Etisalat)',
    ],
  },
  {
    id: 'data-model',
    title: '6. Data Model (Minimal Tables for NB-IoT Rollout)',
    content: [
      'Core inventory:',
      '• tenants, sites, zones, bays (bay polygons + attributes)',
      '• sensors (PSL devices) + sensor↔bay binding',
      '',
      'Events and derived state:',
      '• sensor_events (append-only): occurred_at, sensor_uuid, raw_hex, decoded fields (battery_pct, temp_c, flags, radar metrics)',
      '• bay_state (latest): occupied, last_seen, battery, flags, confidence',
      '',
      'Ops:',
      '• alerts (offline, low battery, water coverage, flapping, decode errors)',
      '• audit_log (mapping changes, thresholds, overrides)',
      '',
      'Key indexes for performance:',
      '• sensor_events: (sensor_uuid, occurred_at) for time-series queries',
      '• bay_state: (bay_id) for real-time occupancy lookups',
      '• alerts: (status, created_at) for ops dashboard',
      '',
      'Data retention strategy:',
      '• sensor_events (raw_hex): expire after 12–24 months (cost optimization)',
      '• sensor_events (decoded fields): retain forever (analytics asset)',
      '• bay_state: always current (latest snapshot)',
      '• alerts: archive resolved alerts after 12 months',
      '• audit_log: retain 5 years (compliance)',
    ],
  },
  {
    id: 'ops',
    title: '7. Operations & Reliability',
    content: [
      'Ingestion reliability:',
      '• reconnect handling + backpressure',
      '• dedup/idempotency (sensor_id + occurred_at + payload hash)',
      '• dead-letter for malformed messages (replayable)',
      '',
      'Data quality:',
      '• treat radar_valid=0 as low confidence',
      '• water_coverage=1 should trigger an ops alert and potentially suppress occupancy trust',
      '',
      'Maintenance:',
      '• battery drain analytics + replacement schedule',
      '• calibration procedure documented (and re-calibration when moved)',
      '',
      'Alert thresholds (suggested starting point):',
      '• Offline: no heartbeat for > 2 hours (street/semi-covered) or > 4 hours (underground)',
      '• Low battery: < 20% (warning), < 10% (critical)',
      '• Water coverage: any detection triggers immediate alert',
      '• Flapping: > 10 occupancy changes in 1 hour (investigate false positives)',
      '• Decode errors: 3+ malformed payloads in 24 hours',
      '',
      'Operational runbooks (must document):',
      '• Incident response: detection, containment, recovery, post-mortem',
      '• Restore procedure: database backup restore + verification',
      '• Credential rotation: MQTT broker, database, AWS IAM',
      '• Device decommissioning: unbind from bay, mark inactive, archive events',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PART C: COMPLIANCE & REGULATORY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'compliance',
    title: '8. Data Sovereignty & Compliance (RTA / TDRA / DESC ISR)',
    content: [
      'For projects involving Dubai Government entities (e.g., RTA) and IoT sensors, UAE data residency should be treated as a hard requirement.',
      '',
      'Practical requirement (what we must be able to prove):',
      '• Sensor data (raw + decoded), derived occupancy state, logs, and backups must remain within the UAE.',
      '• Third-party services must not replicate/backup the data outside the UAE.',
      '',
      'Regulatory drivers (to align with customer security review):',
      '• TDRA IoT regulatory policy: IoT data can be classified (Open/Confidential/Sensitive/Secret). Government-related or sensitive IoT telemetry is typically required to stay in-country.',
      '• DESC Information Security Regulation (ISR): Dubai Government entities enforce strict controls so sensitive/critical information does not leave the UAE.',
      '',
      'Architecture implication:',
      '• Do NOT use cloud DB products that store/backup outside UAE (unless they explicitly provide UAE region + UAE-only backups).',
      '• Use AWS Middle East (UAE) region (me-central-1) or Azure UAE North for all “system of record” components.',
      '',
      'Recommended wording for RTA proposal (copy/paste):',
      '• Data Sovereignty & Compliance: All IoT telemetry, derived occupancy data, audit logs, and database backups are hosted and retained exclusively within UAE regions (AWS me-central-1 / Azure UAE North). No production data is stored or backed up outside the UAE. Access is controlled via least-privilege IAM/RBAC and audited end-to-end.',
    ],
  },
  {
    id: 'retention',
    title: '9. Data Retention Policy (UAE / RTA-Ready)',
    content: [
      'We need explicit retention rules for compliance and for long-term business value.',
      '',
      '1) Financial & Tax Records — 5 Years (Mandatory)',
      '• Authority: UAE Federal Tax Authority (FTA) + UAE Commercial Companies Law',
      '• What: invoices, subscription payments (e.g., 29 AED/month), supplier invoices (Swiott/Omni), import/customs documents',
      '• Rule: retain for 5 years from end of tax period',
      '• Impact: even if a user deletes an account, payment/finance records must be retained for 5 years',
      '',
      '2) IoT & Connectivity Logs — 12 Months (Recommended baseline)',
      '• Authority: TDRA IoT regulatory expectations (traffic/connection data)',
      '• What: raw connectivity logs (timestamps, device UUID, broker auth attempts, IPs where applicable, connect/disconnect, QoS/dup events)',
      '• Rule: retain at least 12 months to support investigations and incident response',
      '• Impact: do not delete raw system logs immediately; implement a documented retention schedule',
      '',
      '3) Sensor Analytics Data — Forever (Business Asset)',
      '• Authority: internal business decision',
      '• What: historical occupancy timeline per bay/sensor (e.g., "Bay 101 occupied at 14:00")',
      '• Rule: retain indefinitely for forecasting/AI and long-term analytics',
      '• Cost strategy: keep decoded occupancy/status forever; expire raw HEX payloads after a defined window (e.g., 12–24 months) once decoder is trusted and audited',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PART D: EXECUTION ROADMAP
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'government-approval',
    title: '10. Government Approval & Regulatory Compliance',
    content: [
      '⚠️ BLOCKERS: Cannot deploy sensors in RTA zones until approvals are secured. Start this process immediately in parallel with technical build.',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'RTA (Roads and Transport Authority) Approvals',
      '═══════════════════════════════════════════════════════════════════════════',
      '',
      '• [ ] 1. NOC (No Objection Certificate) - Subcontractor approval for sensor installation',
      '  • Required for: Installing IoT sensors in public parking areas and RTA-managed roads',
      '  • Applies to: Our installation team/subcontractor performing physical installation work',
      '  • Process: Submit company registration, technical specifications, insurance certificates, installation methodology/SOP',
      '  • Timeline: 2–4 weeks (estimated)',
      '  • Owner: Business Development / Legal',
      '  • Deliverable: Approved NOC certificate from RTA',
      '  • ⚠️ BLOCKER: Cannot proceed with physical sensor installation in RTA zones until NOC is granted',
      '',
      '• [ ] 2. RTA Pilot Program Approval',
      '  • Required for: Running a pilot test with 10–100 sensors in RTA-managed parking zones',
      '  • Includes: Site selection approval, deployment timeline, data sharing requirements, pilot success criteria',
      '  • Documentation needed: Technical architecture (Section 2), data sovereignty statement (Section 8), pilot test matrix (Section 3), DESC ISR compliance summary (below)',
      '  • Timeline: 4–8 weeks (estimated)',
      '  • Owner: Business Development / Technical Lead',
      '  • Deliverable: Signed pilot agreement with RTA',
      '  • ⚠️ BLOCKER: Cannot run pilot in RTA-managed parking areas until pilot program approval is secured',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'DESC (Dubai Electronic Security Center) - ISR Compliance',
      '═══════════════════════════════════════════════════════════════════════════',
      '',
      'Important: DESC does NOT issue traditional "security clearances." Instead, they enforce compliance standards for systems handling Dubai Government data.',
      '',
      'What VisionDrive must demonstrate (DESC ISR-aligned architecture):',
      '',
      '• [ ] 1. Data Sovereignty & Classification Compliance',
      '  • IoT sensor data from RTA infrastructure is classified as Sensitive/Confidential under DESC data classification',
      '  • All production data (raw sensor events, occupancy state, logs, backups) must remain within UAE',
      '  • Evidence required: AWS UAE region (me-central-1) deployment diagram + backup policy + no offshore replication proof',
      '',
      '• [ ] 2. Access Controls & RBAC',
      '  • Implement role-based access control (RBAC) with least privilege',
      '  • Roles: MASTER_ADMIN, ADMIN, CUSTOMER_ADMIN, USER (read-only)',
      '  • All privileged actions (commissioning, configuration changes, data access) must be logged in audit trail',
      '  • Evidence required: RBAC documentation + audit log implementation',
      '',
      '• [ ] 3. Encryption & Data Protection',
      '  • Data in transit: TLS 1.2+ for all connections (MQTT broker 8883, API endpoints, DB connections)',
      '  • Data at rest: AWS KMS encryption for database, S3 backups, EBS volumes (all keys in UAE region)',
      '  • Evidence required: Encryption architecture diagram + KMS key policies',
      '',
      '• [ ] 4. Audit Logging & Monitoring',
      '  • Enable AWS CloudTrail (UAE region) for all API calls and infrastructure changes',
      '  • Application audit log: user actions, sensor commissioning, mapping changes, configuration updates',
      '  • Retention: connectivity logs 12 months minimum (TDRA requirement), audit logs 5 years (compliance)',
      '  • Evidence required: CloudTrail configuration + audit log schema + retention policy',
      '',
      '• [ ] 5. Incident Response Plan',
      '  • Document incident response procedures: detection, containment, eradication, recovery, post-mortem',
      '  • Define escalation path and RTA notification requirements (if data breach or system compromise)',
      '  • Evidence required: IR playbook document',
      '',
      '• [ ] 6. Personnel Background Checks (for staff with system access)',
      '  • Identity verification (Emirates ID) for all personnel with access to production systems or RTA data',
      '  • Background checks for database admins, DevOps engineers, and anyone with privileged access',
      '  • Training: security awareness and DESC ISR principles',
      '  • Evidence required: Personnel roster + verification records (managed by HR/Legal)',
      '',
      '• [ ] 7. Optional: DESC CSP Certification (only if RTA requires it)',
      '  • Required IF: VisionDrive is hosting/processing RTA data long-term as a managed service',
      '  • NOT required IF: RTA operates their own instance or data is co-managed',
      '  • Certification requires: ISO/IEC 27001, ISO/IEC 27002, ISO/IEC 27017 + third-party audit',
      '  • Timeline: 3–6 months for full certification',
      '  • ⚠️ ACTION: Clarify with RTA if CSP certification is mandatory or if ISR-aligned architecture is sufficient',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'TDRA (Telecommunications and Digital Government Regulatory Authority)',
      '═══════════════════════════════════════════════════════════════════════════',
      '',
      '• [ ] 1. IoT Device Type Approval (if required)',
      '  • Confirm if NB-IoT parking sensors require TDRA type approval/registration',
      '  • Vendor (Swiott/Omni) should provide: TDRA approval certificate or confirm exempt status',
      '  • Timeline: 2–4 weeks (if needed)',
      '',
      '• [ ] 2. Spectrum Compliance Verification',
      '  • NB-IoT operates on licensed spectrum (B1/B3/B5/B8/B20/B28)',
      '  • Confirm device RF certification: GSMA TAC/IMEI registration + EN 301 908 compliance',
      '  • Carrier confirmation: Du or Etisalat SIM cards approved for IoT use in government zones',
      '',
      '• [ ] 3. Connectivity Logs Retention (TDRA IoT Policy)',
      '  • Retain connectivity logs (device UUID, timestamps, connection events, auth attempts) for 12 months minimum',
      '  • Required for investigations and regulatory audits',
      '  • Evidence required: Log retention policy document + implementation (CloudWatch/S3 with lifecycle rules)',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Immediate Action Items (Start Now)',
      '═══════════════════════════════════════════════════════════════════════════',
      '',
      '• [ ] Prepare NOC application package: company registration, liability insurance, technical specs, installation SOP with photos',
      '• [ ] Draft RTA pilot proposal document (use sections 2, 3, 8 from these notes + compliance summary below)',
      '• [ ] Schedule presentation meeting with RTA Innovation/Smart City division',
      '• [ ] Clarify with RTA: Is DESC CSP certification mandatory, or is ISR-aligned architecture sufficient?',
      '• [ ] Confirm carrier selection (Du vs Etisalat) and obtain IoT SIM cards approved for RTA zones',
      '• [ ] Collect vendor compliance documents: TDRA approval, GSMA TAC/IMEI cert, RF/EMC test reports, battery safety datasheet',
      '• [ ] Prepare DESC ISR compliance evidence pack: architecture diagrams, encryption strategy, RBAC model, audit log schema, retention policy, IR plan',
      '• [ ] Initiate personnel background checks for team members with production system access',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Compliance Summary Statement (Use in RTA Proposal)',
      '═══════════════════════════════════════════════════════════════════════════',
      '',
      'VisionDrive architecture is designed in full alignment with Dubai Electronic Security Center (DESC) Information Security Regulation (ISR) requirements:',
      '',
      '• Data Sovereignty: All IoT telemetry, derived occupancy data, audit logs, and database backups are hosted and retained exclusively within UAE regions (AWS me-central-1). No production data is stored, processed, or backed up outside the UAE.',
      '',
      '• Access Control: Role-based access control (RBAC) with least privilege. All privileged actions are logged in an immutable audit trail.',
      '',
      '• Encryption: Data in transit protected by TLS 1.2+ (MQTT 8883, HTTPS APIs). Data at rest encrypted using AWS KMS (UAE-managed keys).',
      '',
      '• Audit & Monitoring: AWS CloudTrail enabled for infrastructure changes. Application audit log captures all user actions, sensor commissioning, and configuration changes. Connectivity logs retained for 12 months (TDRA compliance).',
      '',
      '• Incident Response: Documented incident response procedures with RTA escalation path for security events.',
      '',
      '• Personnel: Background checks and security training for all personnel with access to production systems or RTA data.',
      '',
      '(Copy/paste this section into the "Security & Compliance" section of the RTA proposal document)',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PART D: EXECUTION ROADMAP
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'action-plan',
    title: '11. Implementation Roadmap (Phases 0–9)',
    content: [
      'This is a concrete checklist to execute the UAE-compliant NB-IoT rollout (2,000–5,000 sensors). Execute phases in order. Mark items as • ✅ when done.',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Phase 0 — Government Approvals + Compliance Pack (Week 0–1) [CRITICAL PATH]',
      '═══════════════════════════════════════════════════════════════════════════',
      '• [ ] Submit RTA NOC application (company registration, insurance, technical specs, installation SOP)',
      '• [ ] Draft and submit RTA pilot proposal (use sections 2, 3, 8, 10 from these notes)',
      '• [ ] Schedule RTA presentation meeting (Innovation/Smart City division)',
      '• [ ] Clarify DESC CSP certification requirement with RTA (mandatory vs ISR-aligned sufficient)',
      '• [ ] Collect vendor compliance docs: TDRA approval, GSMA TAC/IMEI cert, RF/EMC reports (EN 301 908, EN 300 440), battery datasheet',
      '• [ ] Confirm carrier selection (Du vs Etisalat) + obtain IoT SIM cards for RTA zones',
      '• [ ] Write "Data Sovereignty & Compliance" statement for proposal (copy from Section 10)',
      '• [ ] Define retention policy in runbooks: Finance 5y, connectivity logs 12m, decoded occupancy forever, raw HEX 12–24m',
      '• [ ] Initiate personnel background checks (Emirates ID verification for team with production access)',
      '',
      '⚠️ BLOCKER: Physical installation and pilot cannot proceed until RTA NOC + pilot approval are secured',
      '⏱️ PARALLEL EXECUTION: Run Phase 0 in parallel with Phase 1–3 (AWS setup, database, MQTT broker)',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Phase 1 — AWS UAE Foundation (Week 1)',
      '═══════════════════════════════════════════════════════════════════════════',
      '═══════════════════════════════════════════════════════════════════════════',
      'Phase 1 — AWS UAE Foundation (Week 1)',
      '═══════════════════════════════════════════════════════════════════════════',
      '• [ ] Create AWS account/project for production (me-central-1) + KMS keys (UAE)',
      '• [ ] VPC layout: public subnets (ALB/NLB), private app subnets (EMQX/ingestion/API), private data subnets (DB)',
      '• [ ] No public SSH: enable SSM Session Manager; restrict IAM with least privilege',
      '• [ ] Logging: CloudTrail + CloudWatch (UAE), ALB/NLB logs to S3 (UAE) with retention policy',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Phase 2 — Database (TimescaleDB self-host in UAE) (Week 1–2)',
      '═══════════════════════════════════════════════════════════════════════════',
      '• [ ] Provision DB host(s) + storage plan (gp3 size/IOPS); no public IPs, DB only reachable from app subnets',
      '• [ ] Deploy Postgres+TimescaleDB with automated upgrades plan and monitored metrics',
      '• [ ] Configure backups: pgBackRest/pg_dump + WAL archiving to S3 (UAE) + EBS snapshots (UAE) + quarterly restore drill',
      '• [ ] Apply Prisma migrations to UAE DB; verify portal/API connectivity in staging',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Phase 3 — MQTT Broker (Week 2)',
      '═══════════════════════════════════════════════════════════════════════════',
      '• ✅ Confirm MQTT security: TLS 8883 + username/password + QoS 0/1/2',
      '• ✅ Confirm sensor identity: <id> = UUID (immutable)',
      '• [ ] Deploy EMQX in UAE (start 1 node for pilot, scale to 2–3 nodes for production) behind NLB :8883',
      '• [ ] Auth model: per-device credentials + ACL so each device can only publish to /psl/<uuid>/event',
      '• [ ] Define topic conventions for heartbeat vs event messages (if vendor supports separate topics)',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Phase 4 — Ingestion Service (Week 2–3)',
      '═══════════════════════════════════════════════════════════════════════════',
      '• [ ] Implement PSL HEX decoder + tests using vendor example payloads (golden vectors)',
      '• [ ] Ingestion worker: MQTT subscriber with reconnect + backpressure, QoS handling, and idempotent writes (dedup)',
      '• [ ] Persist sensor_events (raw_hex + decoded fields) and maintain bay_state (occupied + last_seen + health flags)',
      '• [ ] Add dead-letter queue + replay tool for malformed payloads',
      '• [ ] Optional durability: buffer to SQS (UAE) before DB writes for smoother load',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Phase 5 — Portal & Workflow Updates (Week 3)',
      '═══════════════════════════════════════════════════════════════════════════',
      '• [ ] Sensors UI: show sensor UUID as primary identity + commissioning state (uncommissioned/commissioned)',
      '• [ ] Commissioning UI: bind sensor UUID → bay polygon; enforce 1:1 mapping; show last commissioning change in audit log',
      '• [ ] Health UI: show battery %, temp, water_coverage, radar_valid, last_seen heartbeat, flapping indicator',
      '• [ ] Alerts UI: offline (last_seen threshold), water coverage, low battery, decode errors; ack/assign/resolve lifecycle',
      '• [ ] Reports: sensor uptime %, event latency p50/p95, flapping rate, coverage "bad spots" export for pilot report',
      '• [ ] RBAC: lock commissioning actions to ADMIN/CUSTOMER_ADMIN roles; keep audit trail for all mapping changes',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Phase 6 — Commissioning + Field SOP (Week 3)',
      '═══════════════════════════════════════════════════════════════════════════',
      '• [ ] Write installer SOP document: radar enable, park type, calibration, APN setup via BLE; photo/location checklist',
      '• [ ] Write field validation SOP: test occupancy change + periodic heartbeat at install location before leaving site',
      '• [ ] Define "offline" logic (heartbeat threshold: 2h street, 4h underground) and "flapping" detection rules (>10 changes/hour)',
      '• [ ] Train installation team on Bluetooth AT commands and portal commissioning workflow',
      '',
      '⏱️ GATE: Phase 6 completion + RTA pilot approval (Phase 0) → proceed to Phase 7 (pilot execution)',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Phase 7 — Pilot Execution (10–100 sensors) (Week 3–4)',
      '═══════════════════════════════════════════════════════════════════════════',
      '• [ ] Deploy pilot sensors across 3 environments: street (open sky), semi-covered (shaded/roofed), underground (edge/center/ramps)',
      '• [ ] Commission each sensor: bind to bay, verify on-site (AT commands), confirm first event arrives in portal',
      '• [ ] Monitor pilot metrics: reliability %, latency p50/p95, flapping rate, heartbeat adherence, water coverage alerts, battery trend',
      '• [ ] Identify coverage "bad spots" and document mitigation strategies',
      '• [ ] Produce pilot report: coverage map + tuned configuration baseline + go/no-go criteria for scale-up',
      '',
      '⏱️ GATE: Pilot acceptance criteria met (≥99% uplink reliability street, ≥95% underground, <2 false flips/day) → proceed to Phase 8',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Phase 8 — Production Hardening (2,000–5,000 sensors) (Week 4+)',
      '═══════════════════════════════════════════════════════════════════════════',
      '• [ ] Scale EMQX to multi-AZ (2–3 nodes); set up monitoring/alerts (connect failures, auth failures, lag, CPU/mem)',
      '• [ ] DB performance tuning: indexes on (sensor_uuid, occurred_at), retention/compression strategy, long-term rollups',
      '• [ ] Write operational runbooks: incident response, restore procedure, credential rotation, device decommissioning',
      '• [ ] Assemble security evidence pack: architecture diagrams, SG rules, KMS encryption, backup policy, restore drill logs (UAE-only proof)',
      '• [ ] Load testing: simulate 5,000 sensors sending events simultaneously, verify ingestion throughput and portal responsiveness',
      '• [ ] Disaster recovery drill: restore database from backup, verify data integrity, document recovery time',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Phase 9 — Build from Scratch (if clean rebuild needed) (Week 0–4)',
      '═══════════════════════════════════════════════════════════════════════════',
      '(Only execute if starting from empty repository)',
      '',
      '• [ ] Repo bootstrap: Next.js app + shared packages + environment config; enforce lint/typecheck in CI',
      '• [ ] Auth/RBAC: tenant/site scoping + roles (MASTER_ADMIN/ADMIN/CUSTOMER_ADMIN/USER) + audit log primitives',
      '• [ ] Core domain models: tenants, sites, zones, bays (polygons), sensors (UUID), sensor↔bay binding',
      '• [ ] Infrastructure-as-code: Terraform/CDK for VPC/subnets/SG, ALB/NLB, ECS/EC2, S3 (UAE), KMS, CloudWatch/CloudTrail',
      '• [ ] MQTT broker deployment: EMQX + TLS 8883 + per-device creds + ACL templates',
      '• [ ] Ingestion library: PSL HEX decoder + MQTT consumer + idempotent DB writes + DLQ + replay CLI',
      '• [ ] Database: Postgres+TimescaleDB install + Prisma migrations + seed scripts + backup/restore automation',
      '• [ ] API endpoints: commissioning, sensors, events, alerts, reports; pagination + filtering + exports',
      '• [ ] Portal pages: bays editor, sensors list/detail, commissioning UI, alerts dashboard, reports, settings',
      '• [ ] Observability: metrics dashboards (event lag, last_seen freshness, error rates), structured logs, alerting rules',
      '• [ ] Security hardening: SSM-only access, secret management (AWS Secrets Manager), key rotation, least privilege IAM, vulnerability scans',
      '• [ ] Acceptance tests: golden payload decoder tests, end-to-end simulated sensor publish → portal update verification',
      '• [ ] Go-live checklist: restore drill evidence, retention policies documented, runbooks complete, on-call rotation + escalation defined',
    ],
  },
  {
    id: 'quick-wins',
    title: '12. Quick Wins & Next Actions (Start Today)',
    content: [
      'If you need to make progress immediately while waiting for approvals, prioritize these tasks:',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      '🎯 IMMEDIATE OPPORTUNITY: 2 Test Sensors Arriving in 14 Days',
      '═══════════════════════════════════════════════════════════════════════════',
      '',
      '✅ We have 2 PSL sensors arriving in ~14 days for local testing (no compliance/RTA required).',
      'This is a critical opportunity to validate our technical assumptions before the formal pilot.',
      '',
      'Pre-arrival preparation (complete before sensors arrive):',
      '• [ ] Purchase Du IoT SIM card (NB-IoT enabled, confirm APN settings)',
      '• [ ] Verify Du NB-IoT coverage at intended test location (street parking near office/home)',
      '• [ ] Set up local MQTT broker (EMQX) on laptop/cloud for initial testing (TLS 8883)',
      '• [ ] Implement PSL HEX decoder with vendor example payloads + unit tests',
      '• [ ] Build simple web dashboard to display decoded sensor data (battery, temp, occupancy, radar metrics)',
      '• [ ] Prepare Bluetooth AT command cheat sheet (SWRDENABLE, SWRDPARKTYPE, SWRDCALI, SWRDSTATUS, SWQUERY)',
      '• [ ] Install Bluetooth terminal app on mobile device (for AT command testing)',
      '',
      'Upon sensor arrival (Day 1–3):',
      '• [ ] Unbox and document: take photos, record sensor UUIDs, check battery level',
      '• [ ] Insert Du SIM card into sensor (confirm SIM is activated and has data plan)',
      '• [ ] Connect via Bluetooth and run initial diagnostics: AT+SWRDSTATUS? (record baseline values)',
      '• [ ] Configure APN via Bluetooth based on Du IoT SIM provider settings',
      '• [ ] Enable radar module: AT+SWRDENABLE=1',
      '• [ ] Set parking type (parallel for street test): AT+SWRDPARKTYPE=0',
      '• [ ] Run calibration (clear 1m radius for 20s): AT+SWRDCALI',
      '',
      'Local validation tests (Day 3–14):',
      '• [ ] Install sensor #1 in outdoor street parking bay (open sky, good NB-IoT coverage expected)',
      '• [ ] Verify first MQTT message arrives in local broker within 5 minutes of install',
      '• [ ] Decode HEX payload and confirm: battery %, temp, occupancy status, radar_valid flag',
      '• [ ] Test occupancy detection: place car/object over sensor → verify occupancy=1 event within 30 seconds',
      '• [ ] Test vacancy detection: remove car/object → verify occupancy=0 event within 30 seconds',
      '• [ ] Monitor for 24 hours: record heartbeat interval, event delivery latency, false positives/negatives',
      '• [ ] Measure signal quality: AT+CSQ? (record RSSI values at different times of day)',
      '• [ ] Test water coverage detection (optional): pour water over sensor → verify BIT3 water_coverage flag',
      '',
      'Install sensor #2 in different environment (if possible):',
      '• [ ] Semi-covered location (e.g., parking under tree or awning) to compare coverage',
      '• [ ] Record same metrics: signal quality, event latency, heartbeat reliability',
      '',
      'Validation report (after 7–14 days of monitoring):',
      '• [ ] Signal quality: RSSI values, connection stability, event delivery success rate',
      '• [ ] Accuracy: false positive/negative rate, occupancy detection reliability',
      '• [ ] Latency: p50/p95 event delivery time (sensor timestamp → MQTT broker receipt)',
      '• [ ] Battery: drain rate over 1–2 weeks (extrapolate to expected lifetime)',
      '• [ ] Coverage: does Du NB-IoT work reliably at test locations? Any dead zones?',
      '• [ ] Decoder: are we correctly parsing all HEX payload fields? Any unknown bytes?',
      '',
      '⚠️ Critical alignment check with plan:',
      '• Does Du NB-IoT coverage meet expectations in UAE? (Compare street vs semi-covered)',
      '• Is event latency acceptable (≤30s for street, ≤60s for covered areas)?',
      '• Is occupancy detection accurate enough (≤2 false flips/day)?',
      '• Are there any unexpected behaviors (sensor sleeping, missed heartbeats, decode errors)?',
      '',
      '🎯 Deliverable: 2–3 page validation report to inform RTA pilot proposal:',
      '• Signal quality measurements (RSSI, connection stability)',
      '• Occupancy detection accuracy (false positive/negative rate)',
      '• Event latency (p50/p95)',
      '• Battery consumption trend',
      '• Lessons learned + recommended tuning (calibration, park type, threshold adjustments)',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      '🚀 Week 1 Priorities (Parallel with sensor prep):',
      '═══════════════════════════════════════════════════════════════════════════',
      '',
      '1. Government Approvals (CRITICAL PATH - longest lead time)',
      '• [ ] Draft RTA NOC application (2–4 weeks approval time)',
      '• [ ] Draft RTA pilot proposal document',
      '• [ ] Request meeting with RTA Innovation/Smart City division',
      '• [ ] Confirm carrier (Du vs Etisalat) for official pilot (may differ from test SIM)',
      '',
      '2. Vendor Documentation (required for approvals)',
      '2. Vendor Documentation (required for approvals)',
      '• [ ] Request TDRA approval certificate from Swiott/Omni (or confirm exempt)',
      '• [ ] Request GSMA TAC/IMEI registration certificate',
      '• [ ] Request RF/EMC test reports (EN 301 908, EN 300 440)',
      '• [ ] Request battery safety datasheet',
      '• [ ] Request detailed HEX payload specification (all byte positions documented)',
      '',
      '3. Technical Foundation (can start immediately)',
      '• [ ] Provision AWS UAE account (me-central-1) for production (parallel with local testing)',
      '• [ ] Set up VPC with public/private subnets',
      '• [ ] Enable CloudTrail + CloudWatch in UAE region',
      '• [ ] Deploy staging database (Postgres + TimescaleDB)',
      '• [ ] Set up local MQTT broker (EMQX) for sensor testing (can be laptop/cloud)',
      '',
      '4. Code & Decoder (can develop offline, test with real sensors in 14 days)',
      '• [ ] Implement PSL HEX decoder with vendor example payloads',
      '• [ ] Write unit tests for decoder (golden vectors)',
      '• [ ] Build simple sensor commissioning UI mockup',
      '• [ ] Create real-time dashboard to visualize sensor data (test with 2 sensors)',
      '',
      '5. Documentation (internal)',
      '• [ ] Write installer SOP (Bluetooth AT commands workflow)',
      '• [ ] Write field validation SOP (on-site testing checklist)',
      '• [ ] Draft data retention policy document (5y/12m/forever)',
      '• [ ] Draft incident response playbook',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Decision Points (clarify ASAP to avoid timeline delays):',
      '═══════════════════════════════════════════════════════════════════════════',
      '',
      '❓ Ask RTA:',
      '• Is DESC CSP certification mandatory, or is ISR-aligned architecture sufficient for pilot?',
      '• Which parking zones are available for 10–20 sensor pilot deployment?',
      '• What are the data sharing requirements (real-time API access for RTA vs periodic reports)?',
      '',
      '❓ Ask Vendor (Swiott/Omni):',
      '• MQTT ACL model: can each device be restricted to publish only to /psl/<its-uuid>/event?',
      '• Module part number + official RF spec sheet (for independent validation)?',
      '• Do sensors support separate MQTT topics for heartbeat vs occupancy-change events?',
      '• Complete HEX payload byte map (all fields documented with example values)?',
      '',
      '❓ Ask Du (for test SIM):',
      '• Which IoT SIM plan supports NB-IoT for test deployment (2 sensors)?',
      '• What APN configuration is required for sensor setup?',
      '• Can you provide coverage map: which areas have confirmed NB-IoT coverage (street, semi-covered, underground)?',
      '• Cost per SIM/month for IoT data plan?',
      '',
      '❓ Ask Du or Etisalat (for official RTA pilot):',
      '• Which carrier is approved for government IoT deployments (RTA zones)?',
      '• What is the procurement process for 100–5,000 IoT SIMs?',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Success Metrics (track weekly):',
      '═══════════════════════════════════════════════════════════════════════════',
      '',
      '📦 Test sensors (14-day countdown):',
      '• Du SIM purchased and activated?',
      '• Local MQTT broker running?',
      '• Decoder implemented and tested?',
      '• Test location identified (good NB-IoT coverage)?',
      '• Bluetooth AT commands cheat sheet ready?',
      '',
      '🏛️ Government approvals:',
      '• NOC submitted?',
      '• Pilot proposal submitted?',
      '• RTA meeting scheduled?',
      '',
      '💻 Technical progress:',
      '• AWS UAE account live?',
      '• Database deployed?',
      '• Decoder tested with real sensor data?',
      '',
      '📄 Vendor readiness:',
      '• Compliance docs received?',
      '• HEX payload specification complete?',
      '• Carrier SIMs obtained?',
      '',
      '👥 Team readiness:',
      '• Background checks initiated?',
      '• Installer SOP drafted?',
      '• Training plan defined?',
      '',
      '═══════════════════════════════════════════════════════════════════════════',
      'Timeline & Milestones:',
      '═══════════════════════════════════════════════════════════════════════════',
      '',
      '🎯 Milestone 1 (Day 1–14): Local sensor testing complete',
      '• 2 sensors deployed and monitored',
      '• Du NB-IoT coverage validated',
      '• Decoder verified with real payloads',
      '• Validation report produced (2–3 pages)',
      '',
      '🎯 Milestone 2 (Week 4–6): RTA approvals secured',
      '• NOC granted (2–4 weeks)',
      '• Pilot proposal approved (4–8 weeks)',
      '• Phase 0–6 technical build complete',
      '',
      '🎯 Milestone 3 (Week 7): Pilot deployment begins',
      '• 10–20 sensors deployed in RTA zones',
      '• Coverage map validation (street, semi-covered, underground)',
      '',
      '🎯 Milestone 4 (Week 8–10): Pilot acceptance',
      '• Acceptance criteria met (≥99% uplink street, ≥95% underground)',
      '• Go/no-go decision for production scale-up',
      '',
      '🎯 Milestone 5 (Week 12+): Production rollout',
      '• 2,000–5,000 sensors deployed',
      '• Full operations and monitoring',
    ],
  },
]

function computeActionPlanProgress(lines: string[]) {
  // Count actionable items as lines starting with "•"
  // Mark completed items as:
  // - "• ✅ ..."
  // - "• [x] ..."
  // - "• [X] ..."
  const total = lines.filter((l) => l.trim().startsWith('•')).length
  const done = lines.filter((l) => {
    const t = l.trim()
    if (!t.startsWith('•')) return false
    return /^•\s*(✅|\[x\]|\[X\])\s*/.test(t)
  }).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return { total, done, pct }
}

function CollapsibleNote({ section, isOpen, onToggle }: { section: NoteSection; isOpen: boolean; onToggle: () => void }) {
  // Sections that should show progress tracking
  const progressSections = ['action-plan', 'government-approval', 'quick-wins']
  const showProgress = progressSections.includes(section.id)
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-left">{section.title}</h3>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
          <div className="space-y-2 text-sm sm:text-base text-gray-700">
            {showProgress && (() => {
              const { done, total, pct } = computeActionPlanProgress(section.content)
              return (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">Progress</span>
                    <span>
                      {pct}% ({done}/{total})
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    Mark completed items as <span className="font-mono">• ✅</span> or <span className="font-mono">• [x]</span>.
                  </p>
                </div>
              )
            })()}
            {section.content.map((line, lineIdx) => (
              <p key={`${section.id}-line-${lineIdx}`} className={line === '' ? 'h-2' : line.startsWith('•') ? 'ml-2 sm:ml-4' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function NotesPage() {
  const [openSections, setOpenSections] = useState<string[]>(['executive', 'quick-wins'])

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    )
  }

  return (
    <div className="pt-20 sm:pt-24 pb-8 sm:pb-12">
      <Section background="white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              VisionDrive Technical Master Plan
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              NB-IoT Smart Parking System | UAE-Compliant Architecture | RTA Pilot-Ready
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Version: 2.0 | Updated: December 27, 2025
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Target Scale: 2,000–5,000 sensors | Pilot: 10–100 sensors
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-sm font-semibold text-blue-900 mb-2">📋 Document Structure</h2>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
              <li><strong>Part A (1–3):</strong> Strategic Overview — Executive summary, architecture, pilot strategy</li>
              <li><strong>Part B (4–7):</strong> Technical Specifications — Sensors, data model, operations</li>
              <li><strong>Part C (8–10):</strong> Compliance & Regulatory — Data sovereignty, retention, government approvals</li>
              <li><strong>Part D (11–12):</strong> Execution — Implementation roadmap & immediate actions</li>
            </ul>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {noteSections.map((section) => (
              <CollapsibleNote
                key={section.id}
                section={section}
                isOpen={openSections.includes(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}


