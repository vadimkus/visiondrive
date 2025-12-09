'use client'

import { useState } from 'react'
import Section from '../../common/Section'
import Button from '../../common/Button'
import { useLanguage } from '../../../contexts/LanguageContext'
import { contactTranslations } from '../../../translations/contact'

export default function ContactForms() {
  const { language } = useLanguage()
  const t = contactTranslations[language]
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <Section id="contact-forms">
      <div className="max-w-2xl mx-auto px-2">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm space-y-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t.form.name} {t.form.required}
            </label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            {t.form.send}
          </Button>
        </form>
      </div>
    </Section>
  )
}

