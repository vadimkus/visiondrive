# VisionDrive Architecture

```mermaid
flowchart TB
    subgraph Sensors["IoT Sensors"]
        SK[🌡️ Smart Kitchen<br/>Temperature Sensors]
    end

    subgraph Network["Network"]
        NB[du NB-IoT]
    end

    subgraph AWS["AWS me-central-1 (UAE)"]
        IOT[AWS IoT Core]
        Lambda[Lambda Functions]
        DB[(DynamoDB)]
        API[API Gateway]
    end

    subgraph Frontend["Frontend"]
        Web[Next.js Website<br/>visiondrive.ae]
        Portal[Kitchen Owner Portal]
    end

    subgraph Notifications["Alerts"]
        WA[WhatsApp]
        SNS[AWS SNS]
    end

    SK --> NB
    NB --> IOT
    IOT --> Lambda
    Lambda --> DB
    Lambda --> SNS
    SNS --> WA
    API --> Lambda
    Web --> API
    Portal --> API
```

## Components

| Component | Description |
|-----------|-------------|
| **Smart Kitchen** | Dragino temperature sensors for Dubai Municipality compliance |
| **AWS IoT Core** | Sensor data ingestion |
| **Lambda** | Data processing & alerts |
| **DynamoDB** | UAE data residency storage |
| **Next.js** | Web portal at visiondrive.ae |
