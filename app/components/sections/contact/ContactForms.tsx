'use client'

import { useState } from 'react'
import Section from '../../common/Section'
import Button from '../../common/Button'
import { useLanguage } from '../../../contexts/LanguageContext'
import { contactTranslations } from '../../../translations/contact'

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

export default function ContactForms() {
  const { language } = useLanguage()
  const t = contactTranslations[language]
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message')
      }

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <Section id="contact-forms">
      <div className="max-w-2xl mx-auto px-2">
        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-green-800 mb-1">Message Sent!</h3>
            <p className="text-green-700 mb-4">Thank you for reaching out. We&apos;ll get back to you shortly.</p>
            <button
              onClick={() => setStatus('idle')}
              className="text-sm text-green-600 underline hover:text-green-800"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm space-y-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {errorMsg || 'Failed to send message. Please try again.'}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t.form.name} {t.form.required}
              </label>
              <input
                type="text"
                id="name"
                required
                disabled={status === 'sending'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t.form.email} {t.form.required}
              </label>
              <input
                type="email"
                id="email"
                required
                disabled={status === 'sending'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                {t.form.message} {t.form.required}
              </label>
              <textarea
                id="message"
                required
                rows={4}
                disabled={status === 'sending'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : t.form.send}
            </Button>
          </form>
        )}
      </div>
    </Section>
  )
}

