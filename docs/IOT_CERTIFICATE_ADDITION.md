# TDRA IoT Services License Addition

**Date:** January 26, 2026  
**Document:** IoT_Certificate_IOT-26-100000007.pdf

## Overview

Added the official TDRA IoT Services License certificate to the VisionDrive website. This certificate provides TDRA (Telecommunications and Digital Government Regulatory Authority) authorization to deliver IoT services in the UAE.

## Certificate Details

- **Certificate Name:** TDRA IoT Services License
- **Certificate Number:** IOT-26-100000007
- **Issuing Authority:** TDRA (Telecommunications and Digital Government Regulatory Authority)
- **Purpose:** Authorization to deliver IoT services in the United Arab Emirates
- **File Location:** `/public/Certification/IoT_Certificate_IOT-26-100000007.pdf`

## Importance

This certificate is a critical regulatory document that:
- Grants official authority to provide IoT services in the UAE
- Demonstrates regulatory compliance with UAE telecommunications laws
- Required for enterprise clients and government contracts
- Validates VisionDrive's legal standing as an IoT service provider

## Implementation

### Files Modified

1. **`app/compliance/page.tsx`**
   - Added TDRA IoT Services License to `downloadableCertificates` array
   - Featured as the first/primary certificate with purple styling
   - Added to `certifications` badges section
   - Updated grid layouts for better visual presentation

2. **`app/certificates/page.tsx`**
   - Added TDRA IoT Services License to active certifications list
   - Updated grid layout to 3 columns on large screens

### File Added

- **`public/Certification/IoT_Certificate_IOT-26-100000007.pdf`**
  - The official PDF certificate from TDRA

## User Experience

### Compliance Page (`/compliance`)

Users can now download the certificate directly from the "Download Certificates" section:
- Prominent purple-themed card (first in the list)
- One-click PDF download
- Clear description of the certificate's purpose

### Certificates Page (`/certificates`)

The certificate is listed in the "Active Certifications" section alongside:
- TDRA Type Approval
- DESC ISR Compliance
- Trade License
- Data Protection Compliance

## Download URL

The certificate is accessible at:
```
/Certification/IoT_Certificate_IOT-26-100000007.pdf
```

## Related Certificates

The following certificates are also available for download:
| Certificate | Filename | Purpose |
|-------------|----------|---------|
| TDRA IoT Services License | IoT_Certificate_IOT-26-100000007.pdf | IoT service provider authorization |
| TDRA Type Approval | TDRA_TYPE_APPROVAL_Certificate.pdf | Device type approval |
| Authorized Dealer Certificate | Dealer_Certificate.pdf | Equipment distribution authorization |
| NOL Compliance Report | Nol_Report.pdf | Network operation licensing |

## Technical Notes

- Certificate served as static file from `/public/Certification/`
- No authentication required for download (public document)
- PDF format for universal compatibility
