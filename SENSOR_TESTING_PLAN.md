# 🎯 2-Sensor Local Testing Plan (14 Days)

**Objective:** Validate technical approach with real sensors before RTA pilot  
**Timeline:** Sensors arrive in ~14 days  
**Scope:** Local testing (no RTA/compliance requirements)

---

## 📦 Pre-Arrival Checklist (Complete Before Sensors Arrive)

### 1. Purchase & Activate Du SIM Card
- [ ] Buy Du IoT SIM card (NB-IoT enabled)
- [ ] Activate SIM with data plan
- [ ] Confirm APN settings with Du
- [ ] Test SIM in mobile device first (verify connectivity)

### 2. Set Up Local MQTT Broker
- [ ] Install EMQX on laptop/cloud server
- [ ] Configure TLS 8883 (generate self-signed cert for testing)
- [ ] Set up username/password authentication
- [ ] Test broker: publish/subscribe from command line

### 3. Implement Decoder & Dashboard
- [ ] Code PSL HEX decoder (use vendor example payloads)
- [ ] Write unit tests with golden vectors
- [ ] Build simple web dashboard:
  - Real-time sensor status
  - Battery %, temperature
  - Occupancy status (empty/occupied)
  - Radar validity flag
  - Last seen timestamp
- [ ] Test decoder with vendor HEX examples

### 4. Prepare Bluetooth Tools
- [ ] Install Bluetooth terminal app (iOS: LightBlue, Android: Serial Bluetooth Terminal)
- [ ] Create AT command cheat sheet:
  ```
  AT+SWRDSTATUS?   → Check sensor status
  AT+SWQUERY?      → Preview HEX payload
  AT+SWRDENABLE=1  → Enable radar
  AT+SWRDPARKTYPE=0 → Set parallel parking
  AT+SWRDCALI      → Calibrate (20s)
  AT+CSQ?          → Check signal quality
  ```

### 5. Test Location Scouting
- [ ] Identify street parking location (open sky, good Du coverage)
- [ ] Identify semi-covered location (optional, for sensor #2 comparison)
- [ ] Verify Du NB-IoT coverage at both locations (check coverage map or ask Du)

---

## 📥 Upon Sensor Arrival (Day 1–3)

### Day 1: Unboxing & Documentation
- [ ] Unbox sensors, take photos
- [ ] Record sensor UUIDs (critical for MQTT topic matching)
- [ ] Document hardware: part numbers, firmware version
- [ ] Measure initial battery level

### Day 2: Configuration & Calibration
**Sensor #1:**
1. [ ] Insert Du SIM card (confirm activated)
2. [ ] Connect via Bluetooth
3. [ ] Run diagnostics: `AT+SWRDSTATUS?` → record baseline (RSSI, radar values, errors)
4. [ ] Configure APN based on Du settings
5. [ ] Enable radar: `AT+SWRDENABLE=1`
6. [ ] Set parking type: `AT+SWRDPARKTYPE=0` (parallel for street)
7. [ ] Calibrate: `AT+SWRDCALI` (clear 1m radius for 20s)
8. [ ] Verify: `AT+SWQUERY?` → preview HEX payload

**Sensor #2:**
- [ ] Repeat same process as Sensor #1

### Day 3: Deployment
- [ ] Install Sensor #1 in street parking bay (open sky)
- [ ] Wait 5 minutes → verify first MQTT message arrives
- [ ] Decode HEX payload → confirm battery, temp, occupancy status
- [ ] Install Sensor #2 in semi-covered location (if available)

---

## 🧪 Local Validation Tests (Day 3–14)

### Test 1: Occupancy Detection Accuracy
- [ ] **Vacant → Occupied:** Park car over sensor → verify event arrives within 30s
- [ ] **Occupied → Vacant:** Remove car → verify event arrives within 30s
- [ ] Repeat 10 times at different times of day
- [ ] Record false positives/negatives

### Test 2: Heartbeat & Latency
- [ ] Monitor for 24 hours continuously
- [ ] Record heartbeat interval (should be configurable, default ~1 hour?)
- [ ] Measure event delivery latency:
  - Sensor timestamp (from HEX payload)
  - MQTT broker receipt timestamp
  - Calculate p50/p95 latency
- [ ] Check for missed messages (gaps in sequence?)

### Test 3: Signal Quality
- [ ] Check signal strength: `AT+CSQ?` (RSSI values)
- [ ] Record at different times: morning, noon, evening, night
- [ ] Compare Sensor #1 (open sky) vs Sensor #2 (semi-covered)
- [ ] Note any connection drops or reconnects

### Test 4: Battery Monitoring
- [ ] Query battery level daily: decode from HEX payload
- [ ] Calculate drain rate (%/day)
- [ ] Extrapolate expected lifetime (months/years)

### Test 5: Water Coverage Detection (Optional)
- [ ] Pour water over sensor
- [ ] Verify BIT3 water_coverage flag triggers alert
- [ ] Confirm sensor recovers after water dries

### Test 6: Decoder Validation
- [ ] Collect 100+ real HEX payloads
- [ ] Verify decoder parses all fields correctly:
  - Battery %
  - Temperature °C
  - Occupancy status (BIT4)
  - Radar validity (BIT7)
  - Water coverage (BIT3)
  - Radar/magnetic metrics
- [ ] Identify any unknown/undocumented bytes
- [ ] Compare with vendor documentation

---

## 📊 Validation Report (After 7–14 Days)

### Signal Quality
- RSSI values (min/avg/max)
- Connection stability (uptime %, reconnects)
- Event delivery success rate (% of expected messages received)

### Accuracy
- False positive rate (occupied when vacant)
- False negative rate (vacant when occupied)
- Overall detection reliability (%)

### Latency
- p50 event delivery time (sensor → MQTT broker)
- p95 event delivery time
- Heartbeat interval adherence

### Battery
- Daily drain rate (%/day)
- Extrapolated lifetime (estimate)

### Coverage
- Du NB-IoT performance at test locations
- Open sky vs semi-covered comparison
- Any dead zones or weak signal areas?

### Decoder
- All HEX fields parsed correctly? (Yes/No)
- Any unknown bytes? (document)
- Discrepancies vs vendor docs? (list)

### Lessons Learned
- Recommended calibration procedure
- Optimal parking type setting
- Any threshold adjustments needed?
- Installation best practices

---

## ⚠️ Critical Alignment Check

Does this local test validate our assumptions for RTA pilot?

| Assumption | Test Result | Status |
|------------|-------------|--------|
| Du NB-IoT works reliably in UAE | RSSI: ___, Success rate: ___% | ✅ / ❌ |
| Event latency ≤30s (street) | p95: ___ seconds | ✅ / ❌ |
| Occupancy detection accurate | False flips: ___/day | ✅ / ❌ |
| Battery lasts >1 year | Drain rate: ___% /day → ___ months | ✅ / ❌ |
| Decoder parses all fields | Unknown bytes: ___ | ✅ / ❌ |

**If any ❌:** Document issue and propose mitigation before RTA pilot.

---

## 📝 Deliverable: 2–3 Page Validation Report

**Use this report to:**
1. Inform RTA pilot proposal (demonstrate technical readiness)
2. Tune configuration baseline (calibration SOP, thresholds)
3. Identify risks early (coverage gaps, decoder issues, false positives)

**Report Sections:**
1. Executive Summary (1 paragraph)
2. Test Setup (location, equipment, duration)
3. Results (signal, accuracy, latency, battery)
4. Lessons Learned (calibration, installation tips)
5. Recommendations (go/no-go for RTA pilot, tuning needed)

---

## 🚀 Next Steps After Validation

**If tests pass (✅):**
- Include validation report in RTA pilot proposal
- Use tuned configuration for pilot deployment
- Scale to 10–20 sensors for official RTA pilot

**If tests reveal issues (❌):**
- Work with vendor to resolve (firmware update, calibration procedure)
- Consider alternative carrier if Du coverage insufficient
- Adjust acceptance criteria based on real-world performance

---

**Timeline:** 14 days from sensor arrival → validation report complete  
**Owner:** Technical Lead  
**Support:** Vendor (Swiott/Omni) for troubleshooting, Du for coverage questions
