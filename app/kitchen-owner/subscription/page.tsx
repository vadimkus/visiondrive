'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Check, 
  Calendar,
  Clock,
  Zap,
  Shield,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Receipt,
  AlertCircle,
  Package,
  Cpu
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Installation fee (one-time per sensor)
const INSTALLATION_FEE = 999 // AED per sensor
// Breakdown: Sensor 257 AED ($70 USD) + Shipping 65 AED (~$18) + SIM activation 25 AED + Installation + Training + Margin

// Sensor lifecycle
const SENSOR_REPLACEMENT_YEARS = 5 // Sensors must be replaced every 5 years (free with active subscription)

// Premium pricing tiers based on sensor count (Exclusive UAE provider - no competition)
const PRICING_TIERS = {
  starter: { min: 1, max: 2, monthlyPrice: 449, label: 'Starter', description: 'Small cafes & kiosks' },
  standard: { min: 3, max: 5, monthlyPrice: 399, label: 'Standard', description: 'Restaurants & bakeries' },
  professional: { min: 6, max: 15, monthlyPrice: 349, label: 'Professional', description: 'Hotels & catering' },
  enterprise: { min: 16, max: Infinity, monthlyPrice: 299, label: 'Enterprise', description: 'Chains & large operations' },
}

const YEARLY_DISCOUNT = 0.15 // 15% off for annual commitment

// Get pricing tier based on sensor count
const getPricingTier = (sensorCount: number) => {
  if (sensorCount <= 2) return PRICING_TIERS.starter
  if (sensorCount <= 5) return PRICING_TIERS.standard
  if (sensorCount <= 15) return PRICING_TIERS.professional
  return PRICING_TIERS.enterprise
}

// Mock subscription data
const SUBSCRIPTION = {
  status: 'active', // 'active', 'trial', 'expired', 'cancelled'
  plan: 'yearly',
  sensors: 5,
  tier: 'standard',
  startDate: new Date('2026-01-01'),
  nextBillingDate: new Date('2027-01-01'),
  trialEndsAt: null,
}

// Mock payment history (with premium pricing)
const PAYMENT_HISTORY = [
  { id: 'pay-1', date: 'Jan 1, 2026', amount: 20340, status: 'paid', description: 'Yearly Plan (Standard) - 5 sensors @ 339 AED' },
  { id: 'pay-2', date: 'Dec 15, 2025', amount: 4995, status: 'paid', description: 'Installation - 5 sensors @ 999 AED' },
]

export default function SubscriptionPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate time until next billing
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const diff = SUBSCRIPTION.nextBillingDate.getTime() - now.getTime()
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft({ days, hours, minutes })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  const handleCheckout = () => {
    setIsProcessing(true)
    // Placeholder for Stripe checkout
    setTimeout(() => {
      setIsProcessing(false)
      alert('Stripe checkout integration coming soon!')
    }, 1500)
  }

  const sensorCount = SUBSCRIPTION.sensors
  const currentTier = getPricingTier(sensorCount)
  const monthlyPrice = currentTier.monthlyPrice
  const yearlyMonthlyPrice = Math.round(monthlyPrice * (1 - YEARLY_DISCOUNT))
  const monthlyTotal = selectedPlan === 'monthly' ? monthlyPrice * sensorCount : yearlyMonthlyPrice * sensorCount
  const yearlyTotal = yearlyMonthlyPrice * 12 * sensorCount
  const savings = selectedPlan === 'yearly' ? (monthlyPrice * 12 - yearlyMonthlyPrice * 12) * sensorCount : 0

  return (
    <div className={`p-4 md:p-6 lg:p-8 min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Subscription</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your Smart Kitchen subscription</p>
        </div>

        {/* Current Plan Status */}
        <div className={`rounded-2xl border p-5 mb-6 ${
          isDark ? 'bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border-emerald-800' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${SUBSCRIPTION.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {SUBSCRIPTION.status === 'active' ? 'Active Subscription' : 'Subscription Status'}
                </span>
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {SUBSCRIPTION.plan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {sensorCount} sensors • Started {SUBSCRIPTION.startDate.toLocaleDateString('en-AE', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <Check className="h-3 w-3 inline mr-1" />
              Paid
            </div>
          </div>

          {/* Time Until Next Billing */}
          <div className={`mt-5 pt-5 border-t ${isDark ? 'border-emerald-800/50' : 'border-emerald-200'}`}>
            <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Time until next billing</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {timeLeft.days}
                </div>
                <div className={`text-[10px] uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Days</div>
              </div>
              <div className={`text-2xl ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>:</div>
              <div className="text-center">
                <div className={`text-3xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className={`text-[10px] uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Hours</div>
              </div>
              <div className={`text-2xl ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>:</div>
              <div className="text-center">
                <div className={`text-3xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className={`text-[10px] uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Minutes</div>
              </div>
              <div className="ml-auto">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Next billing</p>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {SUBSCRIPTION.nextBillingDate.toLocaleDateString('en-AE', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Fee Info */}
        <div className={`rounded-2xl border p-5 mb-6 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Installation Fee (One-Time)</h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Per sensor, includes hardware & setup</p>
            </div>
            <div className="ml-auto text-right">
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{INSTALLATION_FEE} AED</p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>per sensor</p>
            </div>
          </div>
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-blue-500" />
              <span>Dragino S31-NB Sensor</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>du NB-IoT SIM</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Professional Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Calibration & Testing</span>
            </div>
          </div>
          {/* Sensor Replacement Notice */}
          <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-start gap-2">
              <Clock className={`h-4 w-4 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <div>
                <p className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  Free Sensor Replacement Every {SENSOR_REPLACEMENT_YEARS} Years
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-amber-400/70' : 'text-amber-600/80'}`}>
                  Sensors are replaced at no additional cost after {SENSOR_REPLACEMENT_YEARS} years of continuous service with an active subscription.
                </p>
              </div>
            </div>
          </div>
          {/* Exclusive Provider Notice */}
          <div className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
            <div className="flex items-start gap-2">
              <Shield className={`h-4 w-4 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <div>
                <p className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Only DM-Compliant Solution in UAE
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/80'}`}>
                  VisionDrive is the exclusive provider of Dubai Municipality-compliant, TDRA-certified temperature monitoring with 100% UAE data residency.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className={`rounded-2xl border p-5 mb-6 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Subscription Tiers</h3>
          <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your current tier: <span className={`font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{currentTier.label}</span> ({sensorCount} sensors)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.values(PRICING_TIERS).map((tier) => (
              <div
                key={tier.label}
                className={`rounded-xl border p-4 ${
                  currentTier.label === tier.label
                    ? isDark ? 'border-orange-500 bg-orange-500/10' : 'border-orange-500 bg-orange-50'
                    : isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{tier.label}</h4>
                  {currentTier.label === tier.label && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">CURRENT</span>
                  )}
                </div>
                <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {tier.min}-{tier.max === Infinity ? '∞' : tier.max} sensors • {tier.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{tier.monthlyPrice}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>AED/sensor/month</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Cycle Selection */}
        <div className="mb-6">
          <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Billing Cycle</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Plan */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`relative rounded-2xl border p-5 text-left transition-all ${
                selectedPlan === 'monthly'
                  ? isDark ? 'border-orange-500 bg-orange-500/10' : 'border-orange-500 bg-orange-50'
                  : isDark ? 'border-gray-700 bg-[#2d2d2f] hover:border-gray-600' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Monthly</h4>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Flexible, cancel anytime</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'monthly'
                    ? 'border-orange-500 bg-orange-500'
                    : isDark ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  {selectedPlan === 'monthly' && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{monthlyPrice}</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AED</span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/ sensor / month</span>
              </div>
              
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {sensorCount} sensors = <span className="font-semibold">{(monthlyPrice * sensorCount).toLocaleString()} AED/month</span>
                </p>
              </div>
            </button>

            {/* Yearly Plan */}
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`relative rounded-2xl border p-5 text-left transition-all ${
                selectedPlan === 'yearly'
                  ? isDark ? 'border-orange-500 bg-orange-500/10' : 'border-orange-500 bg-orange-50'
                  : isDark ? 'border-gray-700 bg-[#2d2d2f] hover:border-gray-600' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Best Value Badge */}
              <div className="absolute -top-2 left-4">
                <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                  Save 10%
                </span>
              </div>

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Yearly</h4>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Best value, billed annually</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'yearly'
                    ? 'border-orange-500 bg-orange-500'
                    : isDark ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  {selectedPlan === 'yearly' && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{yearlyMonthlyPrice}</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AED</span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/ sensor / month</span>
                <span className={`text-xs line-through ml-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{monthlyPrice} AED</span>
              </div>
              
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {sensorCount} sensors = <span className="font-semibold">{yearlyTotal.toLocaleString()} AED/year</span>
                </p>
                {selectedPlan === 'yearly' && (
                  <p className="text-xs text-emerald-500 font-medium mt-1">
                    You save {savings.toLocaleString()} AED per year
                  </p>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className={`rounded-2xl border p-5 mb-6 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>What's Included (All Plans)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: Zap, text: '24/7 real-time temperature monitoring', color: 'text-amber-500' },
              { icon: Shield, text: 'Dubai Municipality compliance reports', color: 'text-blue-500' },
              { icon: TrendingUp, text: 'Advanced analytics & PDF exports', color: 'text-emerald-500' },
              { icon: AlertCircle, text: 'Instant alerts (Dashboard, WhatsApp, Email)', color: 'text-red-500' },
              { icon: Calendar, text: '2-year historical data retention', color: 'text-purple-500' },
              { icon: Clock, text: `Free sensor replacement after ${SENSOR_REPLACEMENT_YEARS} years`, color: 'text-cyan-500' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <feature.icon className={`h-4 w-4 ${feature.color}`} />
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{feature.text}</span>
              </div>
            ))}
          </div>
          
          {/* Value Proposition */}
          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Why VisionDrive? (The Only DM-Compliant Solution in UAE)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
                <p className="font-semibold">Avoid DM Fines</p>
                <p className="opacity-75">Up to 100K AED/violation</p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <p className="font-semibold">Prevent Spoilage</p>
                <p className="opacity-75">5K-30K AED/fridge failure</p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                <p className="font-semibold">Save Labor</p>
                <p className="opacity-75">500-1,500 AED/month</p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                <p className="font-semibold">UAE Data Residency</p>
                <p className="opacity-75">100% TDRA compliant</p>
              </div>
            </div>
            <p className={`text-[10px] mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              💡 Daily cost: ~15 AED (less than a sandwich). 1 prevented fine = 2+ years of subscription paid.
            </p>
          </div>
        </div>

        {/* Checkout Button */}
        <div className={`rounded-2xl border p-5 mb-6 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedPlan === 'yearly' ? 'Yearly total' : 'Monthly total'} for {sensorCount} sensors
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedPlan === 'yearly' ? yearlyTotal.toLocaleString() : monthlyTotal.toLocaleString()} AED
                <span className={`text-sm font-normal ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {selectedPlan === 'yearly' ? '/year' : '/month'}
                </span>
              </p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Checkout with Stripe
                </>
              )}
            </button>
          </div>
          <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            🔒 Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>

        {/* Payment History */}
        <div className={`rounded-2xl border p-5 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment History</h3>
            <button className={`text-xs font-medium ${isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'}`}>
              View All
            </button>
          </div>
          
          <div className="space-y-2">
            {PAYMENT_HISTORY.map((payment) => (
              <div 
                key={payment.id}
                className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                    <Receipt className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{payment.description}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{payment.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {payment.amount.toLocaleString()} AED
                  </p>
                  <p className="text-xs text-emerald-500 font-medium">
                    <Check className="h-3 w-3 inline mr-0.5" />
                    {payment.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Need Help */}
        <div className={`mt-6 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-xs">Need help with billing?</p>
          <a href="mailto:billing@visiondrive.ae" className="text-xs text-orange-500 hover:underline">
            billing@visiondrive.ae
          </a>
        </div>
      </div>
    </div>
  )
}
