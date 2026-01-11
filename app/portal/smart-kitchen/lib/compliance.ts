/**
 * Dubai Municipality Food Safety Temperature Requirements
 * Reference: DM-HSD-GU46-KFPA2 (Technical Guidelines for Occupational Health & Safety in Kitchens)
 * 
 * Authority: Dubai Municipality - Health & Safety Department
 * Document Version: 3 (Issued: 09/05/2024)
 */

export type EquipmentType = 
  | 'refrigerator'      // Cold storage (0°C to 5°C)
  | 'freezer'           // Deep freeze (-18°C or below)
  | 'walk_in_cooler'    // Walk-in cold room (0°C to 5°C)
  | 'walk_in_freezer'   // Walk-in freezer (-18°C or below)
  | 'display_fridge'    // Display refrigerator (0°C to 5°C)
  | 'prep_fridge'       // Prep area fridge (0°C to 5°C)
  | 'hot_holding'       // Hot holding/bain-marie (≥60°C)
  | 'blast_chiller'     // Blast chiller (rapid cooling)

export interface TemperatureThreshold {
  min: number | null  // null = no minimum
  max: number | null  // null = no maximum
  critical: boolean
  warningBuffer: number  // degrees before critical threshold triggers warning
}

export interface EquipmentConfig {
  type: EquipmentType
  name: string
  nameAr: string  // Arabic name
  icon: string
  thresholds: TemperatureThreshold
  description: string
  dmReference: string  // Dubai Municipality reference
}

/**
 * Official Dubai Municipality Temperature Requirements
 * Based on DM Food Safety Code and HACCP guidelines
 */
export const EQUIPMENT_CONFIGS: Record<EquipmentType, EquipmentConfig> = {
  refrigerator: {
    type: 'refrigerator',
    name: 'Refrigerator',
    nameAr: 'ثلاجة',
    icon: '🧊',
    thresholds: {
      min: 0,
      max: 5,
      critical: true,
      warningBuffer: 2,  // Warning at 3°C or above
    },
    description: 'Standard cold storage for perishable foods',
    dmReference: 'DM Food Code: Cold storage 0°C to 5°C',
  },
  
  freezer: {
    type: 'freezer',
    name: 'Freezer',
    nameAr: 'فريزر',
    icon: '❄️',
    thresholds: {
      min: null,
      max: -18,
      critical: true,
      warningBuffer: 3,  // Warning at -21°C or above
    },
    description: 'Deep freeze storage for long-term preservation',
    dmReference: 'DM Food Code: Frozen foods ≤-18°C',
  },
  
  walk_in_cooler: {
    type: 'walk_in_cooler',
    name: 'Walk-in Cooler',
    nameAr: 'غرفة تبريد',
    icon: '🚪',
    thresholds: {
      min: 0,
      max: 5,
      critical: true,
      warningBuffer: 2,
    },
    description: 'Large cold room for bulk cold storage',
    dmReference: 'DM Food Code: Cold storage 0°C to 5°C',
  },
  
  walk_in_freezer: {
    type: 'walk_in_freezer',
    name: 'Walk-in Freezer',
    nameAr: 'غرفة تجميد',
    icon: '🏔️',
    thresholds: {
      min: null,
      max: -18,
      critical: true,
      warningBuffer: 3,
    },
    description: 'Large freezer room for bulk frozen storage',
    dmReference: 'DM Food Code: Frozen foods ≤-18°C',
  },
  
  display_fridge: {
    type: 'display_fridge',
    name: 'Display Fridge',
    nameAr: 'ثلاجة عرض',
    icon: '🛒',
    thresholds: {
      min: 0,
      max: 5,
      critical: true,
      warningBuffer: 2,
    },
    description: 'Customer-facing refrigerated display',
    dmReference: 'DM Food Code: Cold storage 0°C to 5°C',
  },
  
  prep_fridge: {
    type: 'prep_fridge',
    name: 'Prep Area Fridge',
    nameAr: 'ثلاجة التحضير',
    icon: '🔪',
    thresholds: {
      min: 0,
      max: 5,
      critical: true,
      warningBuffer: 2,
    },
    description: 'Food preparation area cold storage',
    dmReference: 'DM Food Code: Cold storage 0°C to 5°C',
  },
  
  hot_holding: {
    type: 'hot_holding',
    name: 'Hot Holding',
    nameAr: 'حفظ ساخن',
    icon: '🔥',
    thresholds: {
      min: 60,
      max: null,
      critical: true,
      warningBuffer: 5,  // Warning at 65°C or below
    },
    description: 'Bain-marie or hot display for ready-to-serve food',
    dmReference: 'DM Food Code: Hot holding ≥60°C',
  },
  
  blast_chiller: {
    type: 'blast_chiller',
    name: 'Blast Chiller',
    nameAr: 'مبرد سريع',
    icon: '💨',
    thresholds: {
      min: -10,
      max: 3,
      critical: true,
      warningBuffer: 2,
    },
    description: 'Rapid cooling equipment (60°C to 5°C in 90 mins)',
    dmReference: 'DM HACCP: Rapid cooling requirement',
  },
}

/**
 * Danger Zone Definition
 * Food in this temperature range is unsafe after 2 hours
 */
export const DANGER_ZONE = {
  min: 5,
  max: 60,
  description: 'Bacteria multiply rapidly between 5°C and 60°C',
  maxDuration: 2 * 60 * 60 * 1000,  // 2 hours in milliseconds
  dmReference: 'DM Food Code: Danger Zone 5°C-60°C',
}

/**
 * Cooking Temperature Requirements
 */
export const COOKING_TEMPS = {
  general: 75,
  poultry: 75,
  beef_ground: 75,
  pork: 75,
  fish: 75,
  eggs: 75,
  reheating: 75,
  description: 'Minimum internal core temperature for safe cooking',
  dmReference: 'DM Food Code: Cooking ≥75°C core temperature',
}

export type ComplianceStatus = 'compliant' | 'warning' | 'critical' | 'danger_zone'

/**
 * Check temperature compliance for a given equipment type
 */
export function checkCompliance(
  equipmentType: EquipmentType,
  temperature: number
): {
  status: ComplianceStatus
  message: string
  messageAr: string
  threshold: TemperatureThreshold
  deviation?: number
} {
  const config = EQUIPMENT_CONFIGS[equipmentType]
  const { thresholds } = config
  
  // Check for danger zone (5°C to 60°C for cold storage, below 60°C for hot holding)
  if (equipmentType === 'hot_holding') {
    if (temperature < DANGER_ZONE.max && temperature > DANGER_ZONE.min) {
      return {
        status: 'danger_zone',
        message: `DANGER ZONE: Food unsafe. Temperature ${temperature}°C is in danger zone (5-60°C)`,
        messageAr: `منطقة الخطر: الطعام غير آمن. درجة الحرارة ${temperature}°م في منطقة الخطر`,
        threshold: thresholds,
        deviation: DANGER_ZONE.max - temperature,
      }
    }
  } else {
    // Cold storage in danger zone
    if (temperature > DANGER_ZONE.min && temperature < DANGER_ZONE.max) {
      return {
        status: 'danger_zone',
        message: `DANGER ZONE: Food unsafe. Temperature ${temperature}°C is in danger zone (5-60°C)`,
        messageAr: `منطقة الخطر: الطعام غير آمن. درجة الحرارة ${temperature}°م في منطقة الخطر`,
        threshold: thresholds,
        deviation: temperature - DANGER_ZONE.min,
      }
    }
  }
  
  // Check critical thresholds
  if (thresholds.max !== null && temperature > thresholds.max) {
    const deviation = temperature - thresholds.max
    if (equipmentType === 'hot_holding') {
      // Hot holding above threshold is fine
      return {
        status: 'compliant',
        message: `Compliant: ${temperature}°C (above ${thresholds.min}°C minimum)`,
        messageAr: `متوافق: ${temperature}°م (فوق الحد الأدنى ${thresholds.min}°م)`,
        threshold: thresholds,
      }
    }
    return {
      status: 'critical',
      message: `CRITICAL: Temperature ${temperature}°C exceeds ${thresholds.max}°C limit by ${deviation.toFixed(1)}°C`,
      messageAr: `حرج: درجة الحرارة ${temperature}°م تتجاوز الحد ${thresholds.max}°م بمقدار ${deviation.toFixed(1)}°م`,
      threshold: thresholds,
      deviation,
    }
  }
  
  if (thresholds.min !== null && temperature < thresholds.min) {
    const deviation = thresholds.min - temperature
    if (equipmentType !== 'hot_holding') {
      // Cold storage below min is usually fine (colder is better)
      return {
        status: 'compliant',
        message: `Compliant: ${temperature}°C (within safe range)`,
        messageAr: `متوافق: ${temperature}°م (ضمن النطاق الآمن)`,
        threshold: thresholds,
      }
    }
    return {
      status: 'critical',
      message: `CRITICAL: Temperature ${temperature}°C is below ${thresholds.min}°C minimum by ${deviation.toFixed(1)}°C`,
      messageAr: `حرج: درجة الحرارة ${temperature}°م أقل من الحد الأدنى ${thresholds.min}°م بمقدار ${deviation.toFixed(1)}°م`,
      threshold: thresholds,
      deviation,
    }
  }
  
  // Check warning thresholds
  if (thresholds.max !== null) {
    const warningThreshold = thresholds.max - thresholds.warningBuffer
    if (temperature > warningThreshold) {
      return {
        status: 'warning',
        message: `Warning: Temperature ${temperature}°C approaching ${thresholds.max}°C limit`,
        messageAr: `تحذير: درجة الحرارة ${temperature}°م تقترب من الحد ${thresholds.max}°م`,
        threshold: thresholds,
        deviation: temperature - warningThreshold,
      }
    }
  }
  
  if (thresholds.min !== null && equipmentType === 'hot_holding') {
    const warningThreshold = thresholds.min + thresholds.warningBuffer
    if (temperature < warningThreshold) {
      return {
        status: 'warning',
        message: `Warning: Temperature ${temperature}°C approaching ${thresholds.min}°C minimum`,
        messageAr: `تحذير: درجة الحرارة ${temperature}°م تقترب من الحد الأدنى ${thresholds.min}°م`,
        threshold: thresholds,
        deviation: warningThreshold - temperature,
      }
    }
  }
  
  // Compliant
  return {
    status: 'compliant',
    message: `Compliant: ${temperature}°C within safe range`,
    messageAr: `متوافق: ${temperature}°م ضمن النطاق الآمن`,
    threshold: thresholds,
  }
}

/**
 * Get compliance color for UI
 */
export function getComplianceColor(status: ComplianceStatus): {
  bg: string
  text: string
  border: string
  dot: string
} {
  switch (status) {
    case 'compliant':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      }
    case 'warning':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      }
    case 'critical':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
      }
    case 'danger_zone':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        dot: 'bg-red-600 animate-pulse',
      }
  }
}

/**
 * Format temperature range for display
 */
export function formatThresholdRange(type: EquipmentType): string {
  const config = EQUIPMENT_CONFIGS[type]
  const { min, max } = config.thresholds
  
  if (min !== null && max !== null) {
    return `${min}°C to ${max}°C`
  } else if (min !== null) {
    return `≥${min}°C`
  } else if (max !== null) {
    return `≤${max}°C`
  }
  return 'N/A'
}
