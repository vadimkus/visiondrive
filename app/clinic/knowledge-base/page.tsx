'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  CalendarClock,
  CircleDollarSign,
  FileText,
  Package,
  Search,
  Send,
  Stethoscope,
  Users,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type Article = {
  id: string
  category: string
  title: string
  summary: string
  steps: string[]
  link?: string
}

const articlesEn: Article[] = [
  {
    id: 'appointments-command-center',
    category: 'Appointments',
    title: 'Run the day from the appointment drawer',
    summary: 'Use one drawer for patient context, status, visit actions, payments, reminders, and history.',
    steps: [
      'Open Appointments and switch to Day view for the current agenda.',
      'Tap any appointment to open the command drawer.',
      'Confirm arrival, start the visit, complete the visit, send WhatsApp reminders, or create a follow-up.',
      'Check the history section before changing time or status.',
    ],
    link: '/clinic/appointments',
  },
  {
    id: 'availability',
    category: 'Appointments',
    title: 'Set working hours, buffers, and private time',
    summary: 'Define when patients can be booked and hide lunch, personal time, or supplier runs.',
    steps: [
      'Open Availability from the Appointments screen.',
      'Enable working days and set start/end time, slot interval, and minimum lead time.',
      'Add blocked time for lunch, leave, training, or private commitments.',
      'Use the slot preview to confirm real availability before using online booking later.',
    ],
    link: '/clinic/appointments/availability',
  },
  {
    id: 'public-booking',
    category: 'Appointments',
    title: 'Share your private booking link',
    summary: 'Let clients choose a service and available time without exposing the internal panel.',
    steps: [
      'Open Dashboard and use Booking link.',
      'Clients choose a service, pick an available slot, and enter DOB/contact details.',
      'The booking uses your working hours, blocked time, buffers, and minimum lead time.',
      'New bookings arrive as online appointments and schedule a 24h WhatsApp reminder.',
    ],
    link: '/clinic',
  },
  {
    id: 'patients',
    category: 'Patients',
    title: 'Keep the patient record clean and private',
    summary: 'Store contact details, medical history, internal notes, visits, photos, payments, and CRM notes.',
    steps: [
      'Create the patient before booking the first appointment.',
      'Use staff notes for private context that must not appear in patient-safe exports.',
      'Log anamnesis, allergies, medications, and conditions before treatment.',
      'Use the timeline filters to review appointments, visits, payments, and CRM history quickly.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'photos-summary',
    category: 'Patients',
    title: 'Capture photos and patient-safe PDF exports',
    summary: 'Take iPhone/iPad photos, attach before/after media to visits, delete mistakes, and export a clean patient summary.',
    steps: [
      'Open a patient record and go to Photos.',
      'Use Take photo on iPhone/iPad to open the camera, or Choose existing photo to attach from Photos or Files.',
      'Choose Before, After, or Other, add a short caption, and link the photo to a visit when possible.',
      'Delete duplicate or incorrect photos from the photo card. Private media stays behind clinic authentication.',
      'Use Patient summary PDF for a patient-safe export.',
      'Remember: internal notes, payments, photos, and clinical free text stay out of the PDF.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'data-export-deletion',
    category: 'Patients',
    title: 'Export or delete a full patient record',
    summary: 'Download a structured JSON archive before irreversible patient deletion.',
    steps: [
      'Open the patient card and use Full data export (JSON) when the practitioner or patient needs a complete internal archive.',
      'The JSON export includes appointments, visits, clinical text, payments, refunds, consents, packages, treatment plans, portal requests, CRM notes, reviews, and photo metadata.',
      'Media binaries are not embedded in the JSON; download private media from the listed authenticated media paths before deleting the patient.',
      'Use Delete patient record only after export and only when the record is truly no longer needed.',
      'Deletion requires typing the exact confirmation phrase and then removes the patient plus linked appointments, visits, payments, photos, consents, packages, portal links, and CRM history.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'inventory',
    category: 'Inventory',
    title: 'Track consumables and avoid low-stock surprises',
    summary: 'Use stock items, reorder levels, barcode lookup, movements, and low-stock alerts.',
    steps: [
      'Create each product or consumable in Inventory with SKU/barcode when available.',
      'Set minimum stock and reorder quantity.',
      'Review movements after purchase order receiving or visit completion.',
      'Enable browser push in Account to receive low-stock notifications.',
    ],
    link: '/clinic/inventory',
  },
  {
    id: 'purchase-orders',
    category: 'Inventory',
    title: 'Receive supplier orders into stock',
    summary: 'Create purchase orders, receive lines, and let inventory update automatically.',
    steps: [
      'Open Purchase orders and create a new order for a supplier.',
      'Add item lines with quantities and unit cost.',
      'Receive the order when products arrive.',
      'Confirm inventory movements and low-stock status after receiving.',
    ],
    link: '/clinic/purchase-orders',
  },
  {
    id: 'supplier-profiles',
    category: 'Inventory',
    title: 'Track suppliers, settlements, and unpaid stock costs',
    summary: 'Keep supplier contacts, purchase history, received value, payments, and outstanding balances in one place.',
    steps: [
      'Open Suppliers and create a profile with contact details, WhatsApp, payment terms, and reorder notes.',
      'When creating a purchase order, choose the supplier profile instead of typing a loose name.',
      'Receive purchase orders as usual; received line cost becomes the payable supplier amount.',
      'Record supplier settlements when you pay, using amount, method, reference, and note.',
      'Use the unpaid amount card to see what is still owed for received stock.',
    ],
    link: '/clinic/suppliers',
  },
  {
    id: 'procedure-bill-of-materials',
    category: 'Inventory',
    title: 'Attach a bill of materials to each procedure',
    summary: 'Deduct multiple consumables automatically when a treatment visit is completed.',
    steps: [
      'Create stock items first in Inventory.',
      'Open Procedures and find the service that consumes those materials.',
      'In Bill of materials, add each item with quantity per visit and unit cost.',
      'When a linked appointment visit is completed, the system deducts every active material row if enough stock is available.',
    ],
    link: '/clinic/procedures',
  },
  {
    id: 'stock-taking-variance',
    category: 'Inventory',
    title: 'Run stock-taking and record variance',
    summary: 'Count physical bag or clinic stock, explain differences, and post audited adjustments.',
    steps: [
      'Open Stock-taking and start a new count. The session snapshots all active inventory items.',
      'Enter the physical count for each item from your treatment bag, case, or clinic shelf.',
      'If the count differs from expected stock, choose a reason such as expired, damaged, lost, found, or count correction.',
      'Finalize the count only after every line is counted. The system creates adjustment movements and updates on-hand stock.',
    ],
    link: '/clinic/stock-takes',
  },
  {
    id: 'product-sales-from-visit',
    category: 'Inventory',
    title: 'Sell aftercare products from a visit',
    summary: 'Record retail products during the appointment, deduct stock, and count the sale as revenue.',
    steps: [
      'Open the appointment drawer after the visit has started or completed.',
      'In Product sales, select the aftercare product, quantity, unit price, payment method, and status.',
      'Save the sale. The product is deducted from inventory and a product-sale payment is created for finance revenue.',
      'Review the patient Payments tab to see retail sales history without turning it into patient balance credit.',
    ],
    link: '/clinic/appointments',
  },
  {
    id: 'finance',
    category: 'Finance',
    title: 'Read true profitability, not only revenue',
    summary:
      'Track net revenue, product sales, direct material costs, operating expenses, profit, margin, and profit per procedure.',
    steps: [
      'Record payments from patient records or appointment flow.',
      'Open Finance to review net revenue, direct costs, gross profit, operating profit, pending payments, and expenses.',
      'Use P&L v2 to compare procedures by paid revenue, refunds, BOM material cost, gross profit, margin, and profit per hour.',
      'Add expenses with category, vendor, description, amount, and date.',
      'Review category breakdown to see where money is going and which services may need repricing.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'payment-fee-rules',
    category: 'Finance',
    title: 'Subtract payment fees automatically',
    summary: 'Configure card, POS, Stripe, transfer, and cash fee rules so Finance shows net profit.',
    steps: [
      'Open Finance and find Payment fee rules.',
      'Set the percentage and optional fixed fee for each payment method.',
      'New paid payments store the processing fee automatically when recorded from a visit, patient card, product sale, or package sale.',
      'Processing fees are not charged to the patient balance; they are internal acquiring costs.',
      'Finance subtracts processing fees from direct costs, gross profit, procedure profitability, and operating profit.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'discount-rules',
    category: 'Finance',
    title: 'Use discounts without hiding margin loss',
    summary: 'Create named promotions for visits and packages, require a reason, and review discount impact in Finance.',
    steps: [
      'Open Finance and find Discount rules.',
      'Create simple percent or fixed-amount rules such as birthday offer, referral thank-you, or launch promo.',
      'When recording a visit payment or selling a package, choose the rule or enter a manual discount.',
      'Always write the reason before saving; the system blocks non-zero discounts without one.',
      'Review total discounts, recent reasons, and procedure-level discount impact in P&L v2 before repeating a promotion.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'gift-cards',
    category: 'Finance',
    title: 'Sell and redeem gift cards',
    summary: 'Use prepaid vouchers without mixing them into treatment packages or client credit.',
    steps: [
      'Open Finance and find Gift cards.',
      'Create a card with buyer name, optional recipient, amount, payment method, and optional expiry date.',
      'Give the generated code to the buyer or recipient.',
      'When the patient uses it, open the patient Payments tab and redeem the gift-card code for the visit amount.',
      'Finance shows sold, redeemed, and outstanding gift-card balances; Daily close includes card-sale cash by method.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'daily-close',
    category: 'Finance',
    title: 'Close each day with counted totals',
    summary: 'Reconcile expected payments against counted cash, card, POS, Stripe, transfer, and other totals.',
    steps: [
      'Open Finance and choose the business date in Daily close.',
      'Review expected totals by method from paid and refunded payment rows for that date.',
      'Enter the counted amount for each method from cash, POS batch reports, bank transfers, and Stripe.',
      'Save a draft if the day is still being checked, or finalize the close once discrepancies are explained.',
      'Use the note field to record shortages, tips, bank delays, or manual corrections needed later.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'reminders-followups',
    category: 'Communication',
    title: 'Use WhatsApp reminders and follow-ups',
    summary: 'Keep reminders simple and personal for a solo practice.',
    steps: [
      'Open Reminders to adjust WhatsApp templates for reminders, no-shows, and rebooking.',
      'Open an appointment drawer to send now or schedule a 24h reminder.',
      'After completing a visit, create a 2/4/6/8 week repeat booking from Follow-up automation.',
      'If the patient has no future appointment, schedule a rebooking nudge for the same 2/4/6/8 week windows.',
      'Use No-show follow-up when a client misses the appointment.',
      'Check the delivery log and appointment history to see what was prepared.',
    ],
    link: '/clinic/reminders',
  },
  {
    id: 'reviews-reputation',
    category: 'Communication',
    title: 'Capture reviews before publishing',
    summary: 'Ask for feedback after completed visits and keep ratings internal first.',
    steps: [
      'Open a completed appointment and send a review request from the Reputation block.',
      'WhatsApp opens with your review template and the request is tracked in Reputation.',
      'When the client replies, record the internal rating and notes.',
      'Only mark a review as published after you decide the text is safe to share externally.',
    ],
    link: '/clinic/reputation',
  },
  {
    id: 'client-tags',
    category: 'Patients',
    title: 'Segment clients with categories and tags',
    summary: 'Use simple labels to spot VIPs, sensitive clients, follow-up due cases, and late payers.',
    steps: [
      'Add or edit a patient and choose one category such as VIP, Regular, New, Sensitive, or High-risk.',
      'Add tags like Follow-up due or Late payer when the label should be temporary or operational.',
      'Use the patient list filters to focus on one segment before outreach.',
      'Check appointment drawers for tags before calling, messaging, or taking payment.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'prepaid-treatment-packages',
    category: 'Finance',
    title: 'Sell prepaid treatment packages',
    summary: 'Use 3/5/10-session packages to stabilize repeat revenue and track remaining sessions.',
    steps: [
      'Open a patient record and go to Packages.',
      'Create a package with a name, session count, price, expiry, and optional service restriction.',
      'When a matching visit is completed, the system deducts one session automatically.',
      'Check remaining sessions and the one-session-left warning before booking the next treatment.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'inline-payments-receipts',
    category: 'Finance',
    title: 'Close the visit with payment and receipt',
    summary: 'Record payment, discount, fee, method, refund/void status, and receipt from the appointment drawer.',
    steps: [
      'Open Appointments and select the patient appointment.',
      'Use the Payment snapshot section to enter the amount, method, discount, fee, status, reference, and note.',
      'Save the payment before leaving the drawer so the client balance updates immediately.',
      'Use Receipt to download a patient-safe PDF, or Refund/Void when the payment should no longer count as paid.',
    ],
    link: '/clinic/appointments',
  },
  {
    id: 'refund-corrections',
    category: 'Finance',
    title: 'Refund or void payments without losing the audit trail',
    summary: 'Use payment corrections when money is returned or a mistaken payment must be voided.',
    steps: [
      'Open the appointment drawer or the patient Payments tab.',
      'Choose Refund on a paid payment, enter the amount, and record the reason. The original payment stays intact and a refund adjustment row is created.',
      'Choose Void only for mistaken payments that should never count as collected; a reason is required.',
      'Review correction history under the payment to see refund amount, method, reason, and timestamp.',
      'Finance, client balance, and Daily close read the correction rows without rewriting visit history.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'consent-contraindication-forms',
    category: 'Patients',
    title: 'Capture consent and contraindications before treatment',
    summary: 'Use reusable consent templates and signed patient snapshots before medical-adjacent home visits.',
    steps: [
      'Open a patient record and go to Consents.',
      'Create a consent template with procedure-specific text, contraindications, and aftercare wording.',
      'Before treatment, select the template, review contraindications, link the consent to a visit if needed, and record the patient signature name.',
      'The signed record stores a snapshot of the exact text accepted, so future template edits do not change past consent.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'treatment-plans',
    category: 'Patients',
    title: 'Structure repeat care with treatment plans',
    summary: 'Create a planned course with target sessions, cadence, service, photo checkpoints, and linked visits.',
    steps: [
      'Open a patient record and go to Treatment plans.',
      'Create the plan with expected sessions, target dates, goals, next steps, and photo milestones.',
      'When logging a visit, link it to the active treatment plan so progress updates automatically.',
      'Pause, activate, or complete the plan as the course changes.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'notification-center',
    category: 'Communication',
    title: 'Work from one daily notification center',
    summary: 'Use Inbox to catch reminders due, online bookings, reschedules, reviews, unpaid visits, and low stock.',
    steps: [
      'Open Inbox from the clinic navigation.',
      'Review urgent items first: due reminders, unpaid completed visits, and stock at zero.',
      'Use filters to focus on bookings, reschedules, review requests, payments, or inventory.',
      'Open the linked appointment, patient workflow, reminder, reputation, or stock item to resolve the task.',
    ],
    link: '/clinic/inbox',
  },
  {
    id: 'retention-analytics',
    category: 'Finance',
    title: 'Use retention analytics to bring clients back',
    summary: 'Track rebook rate, returning clients, no-shows, follow-up conversion, lost patients, and repeat interval by procedure.',
    steps: [
      'Open Retention from the clinic navigation.',
      'Use 90 days, 180 days, or 1 year to compare rebook rate, returning clients, no-show rate, and follow-up conversion.',
      'Switch dormant filters between 60, 90, and 120 days depending on how assertive you want the reactivation list to be.',
      'Review repeat interval by procedure to understand how often clients normally return for each service.',
      'Use Dormant reactivation to preview the message, copy it, open WhatsApp, or review the patient chart before sending.',
    ],
    link: '/clinic/retention',
  },
  {
    id: 'booking-funnel-analytics',
    category: 'Finance',
    title: 'Measure the public booking funnel',
    summary:
      'Track link views, source/UTM performance, abandoned sessions, completed bookings, and procedure conversion.',
    steps: [
      'Share the public booking link from the dashboard after booking is enabled.',
      'Add source or UTM parameters when you share links from Instagram, Google, or a partner.',
      'Open Booking funnel from the clinic navigation.',
      'Use 7 days, 30 days, or 90 days to compare how many sessions reach each step.',
      'Check conversion by source and procedure, then copy or open the abandoned-booking WhatsApp follow-up for warm leads.',
    ],
    link: '/clinic/booking-funnel',
  },
  {
    id: 'occasion-messages',
    category: 'Patients',
    title: 'Send birthday and occasion messages',
    summary:
      'Use upcoming birthdays to send personal, low-pressure WhatsApp greetings without building a heavy loyalty program.',
    steps: [
      'Open Occasions from the clinic navigation.',
      'Choose the next 7, 30, or 90 days depending on how far ahead you want to prepare.',
      'Review the birthday message preview and adjust manually in WhatsApp if needed.',
      'Copy the message, open WhatsApp, or open the patient chart before sending.',
    ],
    link: '/clinic/occasions',
  },
  {
    id: 'referral-tracking',
    category: 'Patients',
    title: 'Track who sends you new clients',
    summary:
      'Use a simple referred-by field and referral note before adding complex rewards or points.',
    steps: [
      'When creating or editing a patient, fill Referred by with the client, partner, Instagram source, or campaign that brought them.',
      'Use Referral note for a small reward promise, context, or manual follow-up note.',
      'Open Referrals from the clinic navigation to see referred clients by source/person.',
      'Review recent referred patients and open the patient chart before sending any thank-you or reward message.',
    ],
    link: '/clinic/referrals',
  },
  {
    id: 'patient-portal-lite',
    category: 'Patients',
    title: 'Share a private patient portal link',
    summary:
      'Give a patient one secure link for upcoming appointments, aftercare, package balance, receipts, consents, and reschedule/cancel requests.',
    steps: [
      'Open the patient chart and find Patient portal lite under the header.',
      'Create a portal link; the old active link is revoked automatically and the new link expires after 90 days.',
      'Send the copied link privately through WhatsApp or email.',
      'Review portal requests in the patient chart and CRM timeline when a patient asks to reschedule or cancel.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'service-intake-fields',
    category: 'Appointments',
    title: 'Add service-specific public intake fields',
    summary:
      'Collect the right allergy, contraindication, pregnancy, address, or preparation answers for each service before the booking reaches the calendar.',
    steps: [
      'Open Procedures and find the service you want to prepare for.',
      'Use Public intake questions to add short text, long text, or yes/no questions.',
      'Mark important questions as required so the public booking form cannot be submitted without them.',
      'When a client books online, answers are saved to the appointment as a staff-only intake snapshot.',
    ],
    link: '/clinic/procedures',
  },
  {
    id: 'client-import-excel',
    category: 'Patients',
    title: 'Import clients from Excel',
    summary:
      'Bring an existing client spreadsheet into Practice OS with duplicate checks before any patient cards are created.',
    steps: [
      'Open Patients and click Import clients.',
      'Upload an .xlsx or .csv file with columns such as full name, DOB, phone, email, address, category, tags, and notes.',
      'Review the preview: invalid rows and duplicates by phone/email are clearly marked and skipped.',
      'Click Create patients to import only clean rows, then continue working from the patient list.',
    ],
    link: '/clinic/patients/import',
  },
  {
    id: 'product-import-excel',
    category: 'Inventory',
    title: 'Import products from Excel',
    summary:
      'Set up inventory faster by importing stock catalogs with SKU, barcode, on-hand quantity, reorder point, supplier, cost, and notes.',
    steps: [
      'Open Inventory and click Import products.',
      'Upload an .xlsx or .csv file with product/name, SKU, barcode, unit, quantity, reorder point, consume per visit, procedure, supplier, cost, and notes.',
      'Review duplicate warnings by barcode, SKU, or name. Rows with unknown linked procedures are marked invalid.',
      'Click Create products to create only clean inventory rows. Opening quantities create receipt movements automatically.',
    ],
    link: '/clinic/inventory/import',
  },
]

const articlesRu: Article[] = [
  {
    id: 'appointments-command-center',
    category: 'Записи',
    title: 'Ведите день через карточку записи',
    summary: 'Одна карточка показывает пациента, статус, визит, оплату, напоминания и историю.',
    steps: [
      'Откройте Записи и переключитесь на вид День.',
      'Нажмите на любую запись, чтобы открыть карточку.',
      'Подтвердите, отметьте приход, начните визит, завершите визит, отправьте WhatsApp или создайте повторную запись.',
      'Перед изменениями проверяйте историю записи.',
    ],
    link: '/clinic/appointments',
  },
  {
    id: 'availability',
    category: 'Записи',
    title: 'Настройте рабочее время, буферы и личные слоты',
    summary: 'Управляйте тем, когда можно записывать пациентов, и закрывайте личное время.',
    steps: [
      'Откройте Доступность из раздела Записи.',
      'Включите рабочие дни, задайте время, интервал слотов и минимальное время до записи.',
      'Добавьте закрытые слоты для обеда, отпуска, обучения или личных дел.',
      'Проверьте доступные слоты в превью перед онлайн-записью.',
    ],
    link: '/clinic/appointments/availability',
  },
  {
    id: 'public-booking',
    category: 'Записи',
    title: 'Поделитесь приватной ссылкой для записи',
    summary: 'Клиент выбирает услугу и свободное время без доступа к внутренней панели.',
    steps: [
      'Откройте Дашборд и используйте ссылку для записи.',
      'Клиент выбирает услугу, слот и вводит дату рождения/контакты.',
      'Запись учитывает рабочие часы, закрытые слоты, буферы и минимальное время до записи.',
      'Новая запись создаётся как онлайн-запись и планирует WhatsApp-напоминание за 24 часа.',
    ],
    link: '/clinic',
  },
  {
    id: 'patients',
    category: 'Пациенты',
    title: 'Держите карту пациента чистой и приватной',
    summary: 'Контакты, анамнез, внутренние заметки, визиты, фото, оплаты и CRM находятся в одной карте.',
    steps: [
      'Создайте пациента перед первой записью.',
      'Используйте внутренние заметки для приватной информации.',
      'Заполните анамнез, аллергии, лекарства и состояния перед процедурой.',
      'Используйте фильтры таймлайна для быстрого просмотра истории.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'photos-summary',
    category: 'Пациенты',
    title: 'Фото и безопасный PDF для пациента',
    summary: 'Делайте фото на iPhone/iPad, прикрепляйте до/после к визитам, удаляйте ошибки и экспортируйте чистое резюме.',
    steps: [
      'Откройте карту пациента и вкладку Фото.',
      'Используйте Сделать фото на iPhone/iPad, чтобы открыть камеру, или Выбрать готовое фото для загрузки из Фото или Файлов.',
      'Выберите тип До, После или Другое, добавьте короткую подпись и по возможности привяжите фото к визиту.',
      'Удаляйте дубликаты или ошибочные фото из карточки фото. Приватные медиа остаются за авторизацией клиники.',
      'Используйте PDF резюме пациента для безопасного экспорта.',
      'Внутренние заметки, оплаты, фото и клинический текст не попадают в PDF.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'data-export-deletion',
    category: 'Пациенты',
    title: 'Экспорт или удаление полной карты пациента',
    summary: 'Скачайте структурированный JSON-архив перед необратимым удалением пациента.',
    steps: [
      'Откройте карту пациента и используйте Полный экспорт данных (JSON), когда практику или пациенту нужен полный внутренний архив.',
      'JSON включает записи, визиты, клинический текст, платежи, возвраты, согласия, пакеты, планы лечения, запросы из кабинета, CRM-заметки, отзывы и метаданные фото.',
      'Файлы фото не встраиваются в JSON; перед удалением скачайте приватные медиа по указанным защищенным путям.',
      'Используйте Удалить карту пациента только после экспорта и только если запись действительно больше не нужна.',
      'Удаление требует точную контрольную фразу и затем удаляет пациента вместе со связанными записями, визитами, платежами, фото, согласиями, пакетами, ссылками кабинета и CRM-историей.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'inventory',
    category: 'Склад',
    title: 'Контролируйте расходники и низкие остатки',
    summary: 'Товары, минимальные остатки, штрихкоды, движения и уведомления.',
    steps: [
      'Создайте товар или расходник на складе, добавьте SKU/штрихкод.',
      'Укажите минимальный остаток и количество для заказа.',
      'Проверяйте движения после закупки или завершения визита.',
      'Включите push-уведомления в Аккаунте, чтобы получать низкие остатки.',
    ],
    link: '/clinic/inventory',
  },
  {
    id: 'purchase-orders',
    category: 'Склад',
    title: 'Принимайте закупки от поставщиков',
    summary: 'Закупки автоматически пополняют склад после приемки.',
    steps: [
      'Откройте Закупки и создайте заказ поставщику.',
      'Добавьте позиции с количеством и ценой.',
      'Примите заказ, когда товар пришел.',
      'Проверьте движения склада и статус низких остатков.',
    ],
    link: '/clinic/purchase-orders',
  },
  {
    id: 'supplier-profiles',
    category: 'Склад',
    title: 'Ведите поставщиков, оплаты и долги за склад',
    summary: 'Контакты поставщика, история закупок, принятая сумма, оплаты и остаток к оплате в одном месте.',
    steps: [
      'Откройте Поставщики и создайте профиль с контактами, WhatsApp, сроком оплаты и заметками по дозакупке.',
      'При создании закупки выбирайте профиль поставщика, а не вводите свободный текст.',
      'Принимайте закупки как обычно; стоимость принятых строк становится суммой к оплате поставщику.',
      'Записывайте оплаты поставщику с суммой, методом, референсом и заметкой.',
      'Смотрите карточку к оплате, чтобы понимать долг по уже принятым товарам.',
    ],
    link: '/clinic/suppliers',
  },
  {
    id: 'procedure-bill-of-materials',
    category: 'Склад',
    title: 'Привяжите состав материалов к каждой процедуре',
    summary: 'Автоматически списывайте несколько расходников при завершении лечебного визита.',
    steps: [
      'Сначала создайте расходники в Складе.',
      'Откройте Процедуры и найдите услугу, которая расходует эти материалы.',
      'В блоке Состав процедуры добавьте каждую позицию, количество на визит и цену единицы.',
      'Когда визит по связанной записи завершён, система спишет все активные материалы, если остатка достаточно.',
    ],
    link: '/clinic/procedures',
  },
  {
    id: 'stock-taking-variance',
    category: 'Склад',
    title: 'Проводите инвентаризацию и фиксируйте расхождения',
    summary: 'Пересчитывайте физические остатки в сумке или кабинете, объясняйте разницу и создавайте аудит корректировок.',
    steps: [
      'Откройте Инвентаризацию и начните новый пересчет. Сессия зафиксирует все активные позиции склада.',
      'Введите фактическое количество каждой позиции из рабочей сумки, кейса или полки.',
      'Если фактическое количество отличается от ожидаемого, выберите причину: просрочено, повреждено, потеряно, найдено или коррекция пересчета.',
      'Завершайте инвентаризацию только после пересчета всех строк. Система создаст корректирующие движения и обновит остатки.',
    ],
    link: '/clinic/stock-takes',
  },
  {
    id: 'product-sales-from-visit',
    category: 'Склад',
    title: 'Продавайте домашний уход из визита',
    summary: 'Записывайте розничные товары во время записи, списывайте склад и учитывайте продажу как выручку.',
    steps: [
      'Откройте карточку записи после начала или завершения визита.',
      'В блоке Продажи товаров выберите товар домашнего ухода, количество, цену, метод оплаты и статус.',
      'Сохраните продажу. Товар спишется со склада, а платеж продажи попадет в финансовую выручку.',
      'В карте пациента на вкладке Оплаты смотрите историю розничных продаж без превращения ее в кредит баланса пациента.',
    ],
    link: '/clinic/appointments',
  },
  {
    id: 'finance',
    category: 'Финансы',
    title: 'Смотрите реальную прибыльность, а не только выручку',
    summary:
      'Чистая выручка, продажи товаров, прямые материальные затраты, операционные расходы, прибыль, маржа и прибыльность процедур.',
    steps: [
      'Записывайте оплаты из карты пациента или процесса визита.',
      'Откройте Финансы, чтобы увидеть чистую выручку, прямые затраты, валовую прибыль, операционную прибыль, ожидание оплат и расходы.',
      'Используйте P&L v2, чтобы сравнить процедуры по оплаченной выручке, возвратам, материалам BOM, валовой прибыли, марже и прибыли в час.',
      'Добавляйте расходы с категорией, поставщиком, описанием, суммой и датой.',
      'Смотрите разбивку по категориям, чтобы понимать структуру затрат и какие услуги пора переоценить.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'payment-fee-rules',
    category: 'Финансы',
    title: 'Автоматически вычитайте комиссии оплат',
    summary: 'Настройте комиссии карты, POS, Stripe, перевода и наличных, чтобы Финансы показывали чистую прибыль.',
    steps: [
      'Откройте Финансы и найдите Правила комиссий оплат.',
      'Укажите процент и, при необходимости, фиксированную комиссию для каждого метода оплаты.',
      'Новые оплаченные платежи автоматически сохраняют комиссию при оплате визита, из карты пациента, продаже товара или пакета.',
      'Комиссия эквайринга не увеличивает баланс пациента; это внутренняя себестоимость приема платежа.',
      'Финансы вычитают комиссии из прямых затрат, валовой прибыли, прибыльности процедур и операционной прибыли.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'discount-rules',
    category: 'Финансы',
    title: 'Давайте скидки, не пряча потерю маржи',
    summary: 'Создавайте именованные акции для визитов и пакетов, указывайте причину и смотрите влияние в Финансах.',
    steps: [
      'Откройте Финансы и найдите Правила скидок.',
      'Создайте простое правило в процентах или фиксированной сумме: день рождения, благодарность за рекомендацию или запуск акции.',
      'При записи оплаты визита или продаже пакета выберите правило либо введите ручную скидку.',
      'Всегда указывайте причину перед сохранением; система не сохранит ненулевую скидку без причины.',
      'Проверяйте общую сумму скидок, последние причины и влияние на прибыльность процедур в P&L v2 перед повтором акции.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'gift-cards',
    category: 'Финансы',
    title: 'Продавайте и списывайте подарочные карты',
    summary: 'Используйте предоплаченные ваучеры отдельно от пакетов процедур и клиентского кредита.',
    steps: [
      'Откройте Финансы и найдите Подарочные карты.',
      'Создайте карту: покупатель, получатель при необходимости, сумма, метод оплаты и срок действия.',
      'Передайте сгенерированный код покупателю или получателю.',
      'Когда пациент использует карту, откройте вкладку Платежи в карте пациента и спишите код на нужную сумму визита.',
      'Финансы показывают продано, списано и открытый баланс; Закрытие дня включает поступления от продажи карт по методам оплаты.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'daily-close',
    category: 'Финансы',
    title: 'Закрывайте день по фактическим суммам',
    summary:
      'Сверяйте ожидаемые платежи с фактическими суммами по наличным, карте, POS, Stripe, переводам и другим методам.',
    steps: [
      'Откройте Финансы и выберите бизнес-дату в блоке Закрытие дня.',
      'Проверьте ожидаемые суммы по методам из оплаченных и возвращенных платежей за эту дату.',
      'Введите фактические суммы по кассе, отчетам POS, банковским переводам и Stripe.',
      'Сохраните черновик, если день еще проверяется, или зафиксируйте закрытие, когда расхождения объяснены.',
      'В заметке указывайте недостачи, чаевые, задержки банка или ручные исправления, которые нужно сделать позже.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'reminders-followups',
    category: 'Коммуникации',
    title: 'WhatsApp напоминания и повторные записи',
    summary: 'Простая персональная коммуникация для соло-практики.',
    steps: [
      'Откройте Напоминания, чтобы настроить шаблоны WhatsApp.',
      'Откройте карточку записи, чтобы отправить сейчас или запланировать за 24 часа.',
      'После завершения визита создайте повтор через 2/4/6/8 недель в блоке автоматизации повторов.',
      'Если будущей записи нет, запланируйте WhatsApp-напоминание о повторной записи на те же 2/4/6/8 недель.',
      'Используйте сообщение после неявки, если клиент пропустил запись.',
      'Проверяйте журнал отправок и историю записи.',
    ],
    link: '/clinic/reminders',
  },
  {
    id: 'reviews-reputation',
    category: 'Коммуникации',
    title: 'Собирайте отзывы до публикации',
    summary: 'Запрашивайте обратную связь после визита и сначала храните оценки внутри.',
    steps: [
      'Откройте завершенную запись и отправьте запрос отзыва из блока Репутация.',
      'Откроется WhatsApp с шаблоном, а запрос попадет в раздел Репутация.',
      'Когда клиент ответит, внесите внутреннюю оценку и заметки.',
      'Отмечайте отзыв опубликованным только после проверки текста.',
    ],
    link: '/clinic/reputation',
  },
  {
    id: 'client-tags',
    category: 'Пациенты',
    title: 'Сегментируйте клиентов категориями и тегами',
    summary: 'Отмечайте VIP, чувствительных клиентов, follow-up и задержки оплаты.',
    steps: [
      'Создайте или отредактируйте пациента и выберите категорию: VIP, постоянный, новый, чувствительный или высокий риск.',
      'Добавьте теги вроде Нужен follow-up или Задержка оплаты для операционных задач.',
      'Используйте фильтры списка пациентов, чтобы быстро найти нужный сегмент.',
      'Проверяйте теги в карточке записи перед звонком, сообщением или оплатой.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'prepaid-treatment-packages',
    category: 'Финансы',
    title: 'Продавайте предоплаченные пакеты процедур',
    summary: 'Пакеты на 3/5/10 сеансов помогают удерживать повторную выручку и видеть остаток сеансов.',
    steps: [
      'Откройте карту пациента и вкладку Пакеты.',
      'Создайте пакет с названием, количеством сеансов, ценой, сроком действия и ограничением по услуге при необходимости.',
      'Когда подходящий визит завершён, система автоматически спишет один сеанс.',
      'Проверяйте остаток и предупреждение об одном оставшемся сеансе перед следующей записью.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'inline-payments-receipts',
    category: 'Финансы',
    title: 'Закрывайте визит оплатой и чеком',
    summary: 'Записывайте оплату, скидку, комиссию, метод, возврат/аннулирование и чек из карточки записи.',
    steps: [
      'Откройте Записи и выберите нужную запись пациента.',
      'В блоке оплаты внесите сумму, метод, скидку, комиссию, статус, референс и заметку.',
      'Сохраните оплату до выхода из карточки, чтобы баланс клиента обновился сразу.',
      'Используйте Чек для PDF, либо Возврат/Аннулировать, если оплата не должна считаться оплаченной.',
    ],
    link: '/clinic/appointments',
  },
  {
    id: 'refund-corrections',
    category: 'Финансы',
    title: 'Делайте возвраты и аннулирования без потери аудита',
    summary: 'Используйте корректировки оплат, когда деньги возвращены или ошибочную оплату нужно аннулировать.',
    steps: [
      'Откройте карточку записи или вкладку Оплаты в карте пациента.',
      'Выберите Возврат у оплаченного платежа, укажите сумму и причину. Исходная оплата остается, а система создает отдельную строку возврата.',
      'Используйте Аннулировать только для ошибочных платежей, которые не должны считаться полученными; причина обязательна.',
      'Смотрите историю корректировок под оплатой: сумма, метод, причина и дата сохраняются.',
      'Финансы, баланс клиента и Закрытие дня читают корректировки без переписывания истории визита.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'consent-contraindication-forms',
    category: 'Пациенты',
    title: 'Собирайте согласия и противопоказания до процедуры',
    summary: 'Используйте шаблоны согласий и подписанные снимки текста перед выездными процедурами.',
    steps: [
      'Откройте карту пациента и вкладку Согласия.',
      'Создайте шаблон согласия с текстом для процедуры, противопоказаниями и правилами ухода после.',
      'Перед процедурой выберите шаблон, проверьте противопоказания, при необходимости привяжите согласие к визиту и сохраните имя подписи пациента.',
      'Подписанная запись хранит снимок принятого текста, поэтому будущие изменения шаблона не меняют прошлые согласия.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'treatment-plans',
    category: 'Пациенты',
    title: 'Ведите повторное лечение через планы',
    summary: 'Создавайте курс с количеством сеансов, ритмом, услугой, фото-контролем и связанными визитами.',
    steps: [
      'Откройте карту пациента и вкладку Планы лечения.',
      'Создайте план с ожидаемыми сеансами, датами, целями, следующими шагами и фото-этапами.',
      'При логировании визита привяжите его к активному плану, чтобы прогресс обновлялся автоматически.',
      'Ставьте план на паузу, активируйте или завершайте его по мере изменения курса.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'notification-center',
    category: 'Коммуникации',
    title: 'Работайте из единого центра уведомлений',
    summary: 'Во Входящих видны напоминания, онлайн-записи, переносы, отзывы, неоплаченные визиты и низкий склад.',
    steps: [
      'Откройте Входящие в навигации клиники.',
      'Сначала проверьте срочные пункты: просроченные напоминания, неоплаченные завершённые визиты и нулевые остатки.',
      'Используйте фильтры для записей, переносов, отзывов, оплат или склада.',
      'Откройте связанную запись, напоминание, репутацию или складскую позицию, чтобы закрыть задачу.',
    ],
    link: '/clinic/inbox',
  },
  {
    id: 'retention-analytics',
    category: 'Финансы',
    title: 'Используйте аналитику удержания, чтобы возвращать клиентов',
    summary:
      'Повторная запись, повторные клиенты, неявки, конверсия follow-up, потерянные пациенты и интервалы повторов по процедурам.',
    steps: [
      'Откройте Удержание в навигации клиники.',
      'Выберите 90 дней, 180 дней или 1 год, чтобы сравнить повторную запись, повторных клиентов, неявки и конверсию follow-up.',
      'Переключайте фильтр спящих клиентов между 60, 90 и 120 днями в зависимости от того, насколько активно хотите возвращать клиентов.',
      'Смотрите интервалы повторов по процедурам, чтобы понимать нормальный ритм возврата клиентов по каждой услуге.',
      'В блоке Возврат спящих пациентов просматривайте текст, копируйте его, открывайте WhatsApp или проверяйте карту пациента перед отправкой.',
    ],
    link: '/clinic/retention',
  },
  {
    id: 'booking-funnel-analytics',
    category: 'Финансы',
    title: 'Измеряйте воронку публичной записи',
    summary:
      'Просмотры ссылки, источники/UTM, незавершенные сессии, завершенные записи и конверсия по процедурам.',
    steps: [
      'Поделитесь публичной ссылкой из дашборда после включения онлайн-записи.',
      'Добавляйте source или UTM-параметры, когда делитесь ссылкой в Instagram, Google или у партнера.',
      'Откройте Воронку записи в навигации клиники.',
      'Выберите 7 дней, 30 дней или 90 дней, чтобы сравнить, сколько сессий доходит до каждого этапа.',
      'Смотрите конверсию по источникам и услугам, затем копируйте или открывайте WhatsApp follow-up для теплых лидов.',
    ],
    link: '/clinic/booking-funnel',
  },
  {
    id: 'occasion-messages',
    category: 'Пациенты',
    title: 'Отправляйте сообщения ко дню рождения и личным поводам',
    summary:
      'Используйте ближайшие дни рождения для личных мягких WhatsApp-сообщений без тяжелой программы лояльности.',
    steps: [
      'Откройте Поводы в навигации клиники.',
      'Выберите следующие 7, 30 или 90 дней в зависимости от того, насколько заранее хотите готовиться.',
      'Проверьте текст сообщения и при необходимости поправьте его вручную в WhatsApp.',
      'Скопируйте сообщение, откройте WhatsApp или сначала откройте карту пациента.',
    ],
    link: '/clinic/occasions',
  },
  {
    id: 'referral-tracking',
    category: 'Пациенты',
    title: 'Отслеживайте, кто приводит новых клиентов',
    summary:
      'Используйте простое поле "кто рекомендовал" и заметку, не строя сложную систему баллов.',
    steps: [
      'При создании или редактировании пациента заполните Кто рекомендовал: клиент, партнер, Instagram-источник или кампания.',
      'В заметке по рекомендации сохраните обещанный бонус, контекст или ручное follow-up действие.',
      'Откройте Рекомендации в навигации клиники, чтобы увидеть клиентов по источникам/людям.',
      'Проверяйте последние карты пациентов перед благодарностью или обещанным бонусом.',
    ],
    link: '/clinic/referrals',
  },
  {
    id: 'patient-portal-lite',
    category: 'Пациенты',
    title: 'Отправляйте приватную ссылку кабинета пациента',
    summary:
      'Одна защищённая ссылка для будущих записей, рекомендаций, баланса пакетов, чеков, согласий и запросов на перенос/отмену.',
    steps: [
      'Откройте карту пациента и найдите блок Личный кабинет пациента Lite под шапкой.',
      'Создайте ссылку: старая активная ссылка отзывается автоматически, новая действует 90 дней.',
      'Отправьте скопированную ссылку приватно через WhatsApp или email.',
      'Проверяйте запросы из кабинета в карте пациента и CRM-ленте, когда пациент просит перенос или отмену.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'service-intake-fields',
    category: 'Записи',
    title: 'Добавляйте вопросы анкеты под конкретную услугу',
    summary:
      'Собирайте ответы по аллергиям, противопоказаниям, беременности, адресу или подготовке до того, как запись попадёт в календарь.',
    steps: [
      'Откройте Процедуры и выберите нужную услугу.',
      'В блоке Вопросы публичной анкеты добавьте короткий текст, длинный текст или вопрос да/нет.',
      'Отметьте важные вопросы как обязательные, чтобы клиент не мог отправить форму без ответа.',
      'При онлайн-записи ответы сохраняются в запись как staff-only снимок анкеты.',
    ],
    link: '/clinic/procedures',
  },
  {
    id: 'client-import-excel',
    category: 'Пациенты',
    title: 'Импортируйте клиентов из Excel',
    summary:
      'Перенесите существующую клиентскую базу в Practice OS с проверкой дублей до создания карт пациентов.',
    steps: [
      'Откройте Пациенты и нажмите Импорт клиентов.',
      'Загрузите .xlsx или .csv с колонками: ФИО, дата рождения, телефон, email, адрес, категория, теги и заметки.',
      'Проверьте предпросмотр: строки с ошибками и дубли по телефону/email будут отмечены и пропущены.',
      'Нажмите Создать пациентов, чтобы импортировать только чистые строки, затем работайте со списком пациентов.',
    ],
    link: '/clinic/patients/import',
  },
  {
    id: 'product-import-excel',
    category: 'Склад',
    title: 'Импортируйте товары из Excel',
    summary:
      'Быстро настройте склад: SKU, штрихкоды, остатки, минимальные остатки, поставщики, себестоимость и заметки.',
    steps: [
      'Откройте Склад и нажмите Импорт товаров.',
      'Загрузите .xlsx или .csv с колонками: товар/название, SKU, штрихкод, единица, остаток, минимум, расход на визит, процедура, поставщик, себестоимость и заметки.',
      'Проверьте предупреждения о дублях по штрихкоду, SKU или названию. Строки с неизвестной процедурой будут помечены как ошибочные.',
      'Нажмите Создать товары, чтобы создать только чистые позиции. Начальные остатки автоматически создают движения поступления.',
    ],
    link: '/clinic/inventory/import',
  },
]

const categoryIcons = {
  Appointments: CalendarClock,
  Записи: CalendarClock,
  Patients: Users,
  Пациенты: Users,
  Inventory: Package,
  Склад: Package,
  Finance: CircleDollarSign,
  Финансы: CircleDollarSign,
  Communication: Send,
  Коммуникации: Send,
}

export default function ClinicKnowledgeBasePage() {
  const { locale, t } = useClinicLocale()
  const isRu = locale === 'ru'
  const articles = isRu ? articlesRu : articlesEn
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

  const copy = {
    title: isRu ? 'База знаний' : 'Knowledge base',
    subtitle: isRu
      ? 'Короткие инструкции по функциям VisionDrive Practice OS, в стиле справочного центра Altegio.'
      : 'Short, practical articles for VisionDrive Practice OS, formatted like a help center.',
    search: isRu ? 'Поиск по базе знаний...' : 'Search the knowledge base...',
    all: isRu ? 'Все' : 'All',
    open: isRu ? 'Открыть раздел' : 'Open section',
    empty: isRu ? 'Ничего не найдено.' : 'No matching articles.',
    featured: isRu ? 'Рекомендуемые статьи' : 'Featured articles',
  }

  const categories = useMemo(
    () => Array.from(new Set(articles.map((article) => article.category))),
    [articles]
  )
  const filtered = articles.filter((article) => {
    const haystack = `${article.title} ${article.summary} ${article.steps.join(' ')}`.toLowerCase()
    const matchesSearch = !query || haystack.includes(query.toLowerCase())
    const matchesCategory = category === 'all' || article.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-orange-50 via-white to-gray-50 border border-orange-100 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="max-w-2xl">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-orange-700" aria-hidden />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">{copy.title}</h1>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{copy.subtitle}</p>
          </div>
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.search}
              className="w-full min-h-12 rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm h-fit">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={clsx(
              'w-full flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold min-h-11',
              category === 'all' ? 'bg-orange-50 text-orange-900' : 'text-gray-700 hover:bg-gray-50'
            )}
          >
            {copy.all}
            <span className="text-xs text-gray-400">{articles.length}</span>
          </button>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat as keyof typeof categoryIcons] || FileText
            const count = articles.filter((article) => article.category === cat).length
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={clsx(
                  'mt-1 w-full flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-semibold min-h-11',
                  category === cat ? 'bg-orange-50 text-orange-900' : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="w-4 h-4" aria-hidden />
                  {cat}
                </span>
                <span className="text-xs text-gray-400">{count}</span>
              </button>
            )
          })}
        </aside>

        <section className="space-y-4">
          <h2 className="font-semibold text-gray-900">{copy.featured}</h2>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              {copy.empty}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filtered.map((article) => (
                <article key={article.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                    {article.category}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 mt-2">{article.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{article.summary}</p>
                  <ol className="mt-4 space-y-2">
                    {article.steps.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-orange-800">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  {article.link && (
                    <Link
                      href={article.link}
                      className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      {copy.open}
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400">{t.docsFooter}</p>
        </section>
      </div>
    </div>
  )
}
