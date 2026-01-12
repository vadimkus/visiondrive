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
  AlertCircle
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Pricing constants
const MONTHLY_PRICE = 199 // AED per sensor
const YEARLY_DISCOUNT = 0.10 // 10% off
const YEARLY_MONTHLY_PRICE = Math.round(MONTHLY_PRICE * (1 - YEARLY_DISCOUNT))
const YEARLY_TOTAL_PRICE = YEARLY_MONTHLY_PRICE * 12

// Mock subscription data
const SUBSCRIPTION = {
  status: 'active', // 'active', 'trial', 'expired', 'cancelled'
  plan: 'yearly',
  sensors: 5,
  startDate: new Date('2026-01-01'),
  nextBillingDate: new Date('2027-01-01'),
  trialEndsAt: null,
  monthlyTotal: YEARLY_MONTHLY_PRICE * 5,
  yearlyTotal: YEARLY_TOTAL_PRICE * 5,
}

// Mock payment history
const PAYMENT_HISTORY = [
  { id: 'pay-1', date: 'Jan 1, 2026', amount: 10740, status: 'paid', description: 'Yearly Plan - 5 sensors' },
  { id: 'pay-2', date: 'Jan 1, 2025', amount: 10740, status: 'paid', description: 'Yearly Plan - 5 sensors' },
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
  const monthlyTotal = selectedPlan === 'monthly' ? MONTHLY_PRICE * sensorCount : YEARLY_MONTHLY_PRICE * sensorCount
  const yearlyTotal = YEARLY_TOTAL_PRICE * sensorCount
  const savings = selectedPlan === 'yearly' ? (MONTHLY_PRICE * 12 - YEARLY_TOTAL_PRICE) * sensorCount : 0

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

        {/* Pricing Plans */}
        <div className="mb-6">
          <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Available Plans</h3>
          
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
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{MONTHLY_PRICE}</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AED</span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/ sensor / month</span>
              </div>
              
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {sensorCount} sensors = <span className="font-semibold">{(MONTHLY_PRICE * sensorCount).toLocaleString()} AED/month</span>
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
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{YEARLY_MONTHLY_PRICE}</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AED</span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/ sensor / month</span>
                <span className={`text-xs line-through ml-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{MONTHLY_PRICE} AED</span>
              </div>
              
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {sensorCount} sensors = <span className="font-semibold">{(YEARLY_TOTAL_PRICE * sensorCount).toLocaleString()} AED/year</span>
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
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>What's Included</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: Zap, text: 'Real-time temperature monitoring', color: 'text-amber-500' },
              { icon: Shield, text: 'Dubai Municipality compliance tracking', color: 'text-blue-500' },
              { icon: TrendingUp, text: 'Advanced analytics & reports', color: 'text-emerald-500' },
              { icon: AlertCircle, text: 'Instant alerts (Email, SMS, WhatsApp)', color: 'text-red-500' },
              { icon: Calendar, text: 'Historical data (up to 2 years)', color: 'text-purple-500' },
              { icon: Sparkles, text: 'Priority support', color: 'text-orange-500' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <feature.icon className={`h-4 w-4 ${feature.color}`} />
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{feature.text}</span>
              </div>
            ))}
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
          <p className="text-xs">
            Need help with billing? Contact us at{' '}
            <a href="mailto:billing@visiondrive.ae" className="text-orange-500 hover:underline">
              billing@visiondrive.ae
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
