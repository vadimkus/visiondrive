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
  Star,
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
    id: 'route-mode-on-my-way',
    category: 'Appointments',
    title: 'Run home visits with Route Mode',
    summary: 'Use the day view to open the full driving route and send an “On my way” WhatsApp before each stop.',
    steps: [
      'Open Appointments and switch to Day view.',
      'Check that each home visit has a visit address, area, and access or parking note.',
      'Use Full route to open the ordered day route in Google Maps.',
      'Tap On my way before leaving for a patient; the system prepares WhatsApp copy and logs the handoff in the timeline.',
      'Open the appointment drawer if you need payments, reminders, or visit actions after arrival.',
    ],
    link: '/clinic/appointments',
  },
  {
    id: 'group-classes-events',
    category: 'Appointments',
    title: 'Handle workshops without group booking',
    summary: 'Group classes are deferred; use simple one-to-one workflows until courses become a real product line.',
    steps: [
      'For now, keep normal appointments as the source of truth for paid treatment time.',
      'If you run a small workshop, create a blocked time for the event and record expenses in Finance.',
      'Keep interested clients in patient notes, CRM notes, or a simple tag until there is enough demand.',
      'Collect payments as normal patient payments only when the workshop has a clear patient record.',
      'Do not add class capacity, attendee rosters, or waitlists until courses/workshops are a recurring revenue stream.',
    ],
    link: '/clinic/appointments/availability',
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
    id: 'before-after-comparison-v2',
    category: 'Patients',
    title: 'Review before/after comparison v2',
    summary: 'The Photos tab automatically pairs Before and After media for fast progress review.',
    steps: [
      'Open a patient card and go to Photos.',
      'Upload at least one Before and one After image, ideally linked to the same visit or treatment plan milestone.',
      'Use the Before / after review section to compare paired photos side by side.',
      'Keep photo protocol checks consistent so lighting, angle, and background are comparable.',
      'Use face maps separately when you need injection marks or correction planning on top of the photo.',
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
    id: 'patient-safe-export',
    category: 'Patients',
    title: 'Export a patient-safe treatment PDF',
    summary: 'Share treatment summaries, receipts, accepted consents, and aftercare without exposing internal notes.',
    steps: [
      'Open the patient card.',
      'Use Patient-safe treatment export (PDF) when the patient needs a fuller copy than the short summary.',
      'The export includes demographics, anamnesis, completed treatment summaries, aftercare, receipts, and accepted consent snapshots.',
      'It intentionally excludes internal notes, staff notes, CRM history, appointment private notes, and photos.',
      'Use Full data export (JSON) only for internal portability, not as a patient handout.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'pre-visit-patient-tasks',
    category: 'Patients',
    title: 'Use pre-visit tasks in the patient portal',
    summary: 'Patients can confirm address, access details, health changes, and treatment readiness before a home visit.',
    steps: [
      'Create or reuse the patient portal link from the patient card.',
      'Send the private link before a home visit.',
      'The patient opens the portal and ticks the pre-visit checklist on the upcoming appointment.',
      'Every save creates a patient portal request, CRM activity, and appointment history event.',
      'Review the checklist status before leaving or when opening the appointment drawer.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'client-wallet',
    category: 'Patients',
    title: 'Share the client wallet in the patient portal',
    summary: 'Give patients one private place for balances, unpaid requests, quotes, packages, gift cards, saved cards, and receipts.',
    steps: [
      'Open the patient card and create or reuse a patient portal link.',
      'Send the private link when the patient asks about a balance, quote, package, deposit, or receipt.',
      'The client wallet shows amount due, credit, pending payment requests, remaining package sessions, and gift-card balance.',
      'Only patient-safe items are shown: sent/accepted/expired quotes, masked saved payment methods, receipt links, and package balances.',
      'Draft quotes, internal notes, processor fees, and raw card data are never exposed in the portal.',
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
    id: 'injectable-batch-expiry',
    category: 'Inventory',
    title: 'Track injectable batch and expiry',
    summary: 'Record lot numbers and expiry dates for Botox, fillers, ampoules, and other regulated consumables.',
    steps: [
      'Open Inventory and create or edit an injectable stock item.',
      'Use Injectable batch tracking to enter the batch/lot number and expiry date.',
      'Watch the inventory list for Batch tracked, Expiring soon, or Expired batch badges.',
      'When receiving a new lot, update the batch fields and record a stock receipt movement.',
      'Do not use expired batches; adjust or write them off with an audited stock movement.',
    ],
    link: '/clinic/inventory',
  },
  {
    id: 'account-notification-preferences',
    category: 'Account',
    title: 'Set account and notification preferences',
    summary: 'Save your practitioner profile, language, password, alert channels, and alert types.',
    steps: [
      'Open Account from the Practice OS sidebar.',
      'Save your display name and preferred EN/RU language.',
      'Choose email and browser push channels.',
      'Turn alert types on or off: bookings, reschedules, reminders, reviews, unpaid visits, low stock, and package expiry.',
      'Enable browser push on each device where you want alerts.',
      'Use Change password when you need to rotate credentials.',
    ],
    link: '/clinic/account',
  },
  {
    id: 'solo-practitioner-assignment',
    category: 'Account',
    title: 'Understand solo practitioner assignment',
    summary: 'Practice OS does not use “any professional” routing because the product is built for one practitioner.',
    steps: [
      'Open Account to see Solo practitioner mode.',
      'The signed-in practitioner is the operational owner for appointments, visits, reminders, and follow-ups.',
      'Use blocked time and availability rules to protect capacity instead of assigning work to another staff member.',
      'If an assistant helps with admin, track that as Assistant / support cost in Finance, not as appointment ownership.',
      'Add staff assignment only if the practice grows beyond solo work.',
    ],
    link: '/clinic/account',
  },
  {
    id: 'pwa-practitioner-mode',
    category: 'Account',
    title: 'Use Practice OS as a mobile app',
    summary: 'Install the workspace and use the dashboard as a focused today screen.',
    steps: [
      'Open Practice OS on the phone or tablet you use in the field.',
      'Use the Practitioner mode card on the dashboard to install the app when the browser offers it.',
      'Use Today agenda for the next few appointments and quick actions for new bookings or patient cards.',
      'When signal is weak, type notes into Offline note draft. It stays on that device until you move it into a patient visit draft.',
      'Enable browser push from Account on each device where you want alerts.',
    ],
    link: '/clinic',
  },
  {
    id: 'offline-safe-visit-draft',
    category: 'Patients',
    title: 'Review and sync offline visit drafts',
    summary: 'Autosave visit notes on the device while offline, then sync them into the patient chart.',
    steps: [
      'Open the patient card and use Log a visit.',
      'Clinical fields, aftercare choice, and linked treatment plan autosave locally on that device as you type.',
      'If you started in the dashboard Offline note draft, use Use dashboard draft to move it into the selected patient visit.',
      'In Photos, failed or offline uploads stay in the Offline photo queue until you sync them.',
      'Review the draft before saving. When online, Save visit writes the normal clinic visit and clears the local draft.',
      'If sync fails, the local draft stays available for retry instead of being lost.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'patient-price-quotes',
    category: 'Patients',
    title: 'Send a patient price quote quickly',
    summary: 'Create a polished treatment estimate with service prices, PDF, WhatsApp text, and email text.',
    steps: [
      'Open the patient card and go to Quotes.',
      'Choose services from the procedure catalog or add custom rows.',
      'Set quantity, price, validity date, discount, note, and terms.',
      'Save the quote, then download the PDF or share the generated text by WhatsApp/email.',
      'Use the quote history to see what was drafted, sent, accepted, expired, or declined.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'whatsapp-assistant',
    category: 'Messages',
    title: 'Use WhatsApp AI receptionist v2',
    summary: 'Prepare price answers, quote messages, reschedule/cancel replies, waitlist slot offers, and approval briefs without auto-sending.',
    steps: [
      'Open WhatsApp Assistant from the sidebar.',
      'Choose the reply type: booking link, prices, quote, reschedule, cancel, waitlist, approval brief, intake, status, or reminder.',
      'Select a patient when you want the text personalized and routed to their phone.',
      'For price and waitlist replies, choose services from the procedure catalog; for quote replies, pick an existing quote or selected services.',
      'Use the context box to paste the patient question or preferred time so the reply is more specific.',
      'Review the preview, then save it to patient history and open WhatsApp. The final send stays manual.',
    ],
    link: '/clinic/whatsapp-assistant',
  },
  {
    id: 'message-history',
    category: 'Messages',
    title: 'Keep message history on the patient card',
    summary: 'Save WhatsApp and email touchpoints so the next reply has context.',
    steps: [
      'Open WhatsApp Assistant and choose the patient before sending a reply.',
      'Use Save to history or Open WhatsApp + save to attach the prepared text to the patient card.',
      'Open the patient card and go to CRM to see Message history above the full CRM log.',
      'For manual touchpoints, log an interaction and choose WhatsApp or Email as the type.',
      'This first pass stores practitioner-reviewed outgoing/history notes only; inbound WhatsApp capture remains a later integration.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'call-log',
    category: 'Messages',
    title: 'Log calls with outcome and next action',
    summary: 'Keep patient call attempts and follow-up decisions visible without telephony setup.',
    steps: [
      'Open the patient card and go to CRM.',
      'Use Call log to choose outgoing or incoming, then select the outcome.',
      'Write a short summary and next action before saving.',
      'Use Call patient when the patient has a phone number and you are on a device that can place calls.',
      'Recent calls are shown separately above Message history and the full CRM log.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'phone-workflow-no-telephony',
    category: 'Messages',
    title: 'Use phone calls without IP telephony',
    summary: 'Keep calls simple: call from the phone, then save outcome and follow-up in the patient card.',
    steps: [
      'Open the patient card from Patients or an appointment drawer.',
      'Tap Call patient when the patient has a phone number, or use your normal mobile dialer.',
      'After the call, open CRM and save a Call log entry with direction and outcome.',
      'Write the summary and next action while the conversation is fresh.',
      'Use reminders, WhatsApp Assistant, or a future appointment for the follow-up. Do not connect IP telephony until call volume justifies it.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'practitioner-push-notifications',
    category: 'Account',
    title: 'Send practitioner push alerts',
    summary: 'Run browser push for due reminders, new bookings, schedule changes, unpaid visits, low stock, and package expiry.',
    steps: [
      'Enable browser push on each device from Account.',
      'Use notification preferences to choose channels and alert types.',
      'Run `/api/clinic/practitioner-push/run` from cron using `CRON_SECRET`, or while signed in for the current tenant.',
      'The scanner uses the same source rows as Inbox and records delivery rows so repeated runs do not spam the same alert.',
      'Check Inbox for the same operational items when a push alert needs follow-up.',
    ],
    link: '/clinic/account',
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
    id: 'service-analytics',
    category: 'Finance',
    title: 'Compare services by profit per hour',
    summary: 'Use a focused procedure report for revenue, count, average price, material cost, and profit per hour.',
    steps: [
      'Open Service analytics from the sidebar or dashboard quick actions.',
      'Choose this month or the last 30 days.',
      'Sort procedures by gross profit, profit per hour, or completed visit count.',
      'Watch average price versus material cost to find services that need repricing.',
      'Use Finance when you need the full P&L, expenses, discounts, gift cards, and payment fees.',
    ],
    link: '/clinic/service-analytics',
  },
  {
    id: 'revenue-plan',
    category: 'Finance',
    title: 'Track the monthly revenue target',
    summary: 'Set a monthly revenue plan and see achieved revenue, gap, required visits, and daily pace.',
    steps: [
      'Open Revenue plan from the sidebar or dashboard quick actions.',
      'Enter the monthly revenue target and, optionally, the expected average visit value.',
      'Review achieved revenue from paid payments minus refunds for the current month.',
      'Use required visits and required daily pace to decide whether to add follow-ups, promotions, or available slots.',
      'Refresh during the day after recording payments to see the latest gap.',
    ],
    link: '/clinic/revenue-plan',
  },
  {
    id: 'owner-income',
    category: 'Finance',
    title: 'Use owner income instead of payroll',
    summary: 'For a solo practice, track owner take-home and assistant costs without a payroll module.',
    steps: [
      'Open Finance and choose this month or the last 30 days.',
      'Review Owner income to see operating profit as the owner take-home estimate.',
      'Record assistant, freelancer, or helper payments as expenses in the Assistant / support category.',
      'Watch owner income per visit to understand whether the schedule is worth the time.',
      'Use this instead of multi-employee payroll until the practice truly has staff.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'occupancy-report',
    category: 'Finance',
    title: 'Find free slots and wasted capacity',
    summary: 'Use occupancy to see booked working time, free windows, blocked time, and travel-buffer pressure.',
    steps: [
      'Open Occupancy from the sidebar or dashboard quick actions.',
      'Choose the next 7 or 14 days.',
      'Review booked time versus planned working time from your availability rules.',
      'Use the best free windows to add follow-ups, short services, or reactivation appointments.',
      'Watch the travel-buffer readout to see when home-visit travel is consuming too much of the week.',
    ],
    link: '/clinic/occupancy',
  },
  {
    id: 'service-areas',
    category: 'Appointments',
    title: 'Use service areas instead of branches',
    summary: 'See which neighborhoods create demand and where upcoming home visits are clustered.',
    steps: [
      'Open Service areas from the sidebar or dashboard quick actions.',
      'Use the 30-day or 90-day view to see area demand.',
      'Check busiest areas before adding follow-ups or opening extra availability.',
      'Fix patient cards without an area so route planning and occupancy analysis stay useful.',
      'This replaces chain/location management for solo work; no branch table is needed.',
    ],
    link: '/clinic/service-areas',
  },
  {
    id: 'review-analytics',
    category: 'Reputation',
    title: 'Track review replies and private feedback',
    summary: 'Use review analytics to see requested, replied, published, average rating, and low-rated private feedback.',
    steps: [
      'Open Review analytics from the sidebar or dashboard quick actions.',
      'Choose the last 30 days, last 90 days, or all time.',
      'Check request, reply, publish, and average-rating KPIs.',
      'Review the rating mix to see whether client sentiment is improving.',
      'Use the negative feedback queue to follow up privately before asking for public publication.',
    ],
    link: '/clinic/review-analytics',
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
    id: 'before-after-photo-protocol',
    category: 'Clinical',
    title: 'Capture consistent before/after photos',
    summary: 'Use the photo checklist so progress photos are comparable and marketing consent is explicit.',
    steps: [
      'Open a patient card and go to Photos.',
      'Link the photo to the visit when possible so the procedure-specific prompt is shown.',
      'Before taking the photo, check same lighting, angle, distance, clean background, and treatment-area clarity.',
      'Use the marketing-consent checkbox only when consent for public use is documented for that image.',
      'Review photo cards for protocol completion and marketing-consent badges before using images in follow-up or promotion.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'voice-comments',
    category: 'Clinical',
    title: 'Dictate treatment comments after a visit',
    summary: 'Use the microphone on the patient card to turn spoken notes into CRM text before saving.',
    steps: [
      'Open the patient card and go to CRM.',
      'Tap Dictate note after the treatment and speak the comment naturally.',
      'Watch the live transcript, then stop dictation when finished.',
      'Review and edit the text before saving it as a normal patient note.',
      'If dictation is unavailable, use Chrome, Edge, or Safari and allow microphone permission.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'aftercare-library',
    category: 'Clinical',
    title: 'Send consistent aftercare after each visit',
    summary: 'Create procedure-based aftercare messages and document links, then snapshot them on completed visits.',
    steps: [
      'Open Procedures and find the service.',
      'In Aftercare library, save a short message and optional PDF/document URL.',
      'Use placeholders like {{firstName}}, {{service}}, and {{date}} to personalize the message.',
      'When completing an appointment, choose the aftercare template to copy/open WhatsApp and store the patient-facing snapshot.',
      'The patient portal shows the saved aftercare text and document link without exposing staff notes.',
    ],
    link: '/clinic/procedures',
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
      'Open the patient chart and find Patient portal under the header.',
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
  {
    id: 'solo-practice-day-one',
    category: 'Account',
    title: 'Day-one setup for a solo home-visit practice',
    summary:
      'A launch checklist for turning the empty console into a working mobile practice system.',
    steps: [
      'Open Account first: set the practitioner name, language, and notification preferences.',
      'Create core procedures with duration, price, buffers, materials, and any service-specific intake questions.',
      'Set Availability so online booking and manual scheduling use real working hours, private time, and minimum lead time.',
      'Import existing clients or create the first patient cards manually before booking visits.',
      'Add key stock items and suppliers if you need inventory, low-stock alerts, purchase orders, or material costing.',
      'Enable the private booking link only after services, availability, reminders, and intake questions are reviewed.',
    ],
    link: '/clinic/account',
  },
  {
    id: 'solo-mobile-daily-workflow',
    category: 'Appointments',
    title: 'Daily iPhone/iPad workflow',
    summary:
      'Run the day without a PC: agenda, patient card, visit draft, photos, payments, and follow-up from one mobile flow.',
    steps: [
      'Start from Dashboard or install the PWA so Practice OS opens directly to the mobile practitioner screen.',
      'Use Today screen to see the next appointment and open the patient card before the visit.',
      'During treatment, use offline-safe visit drafts, voice comments, and before/after photos from the patient card.',
      'Record payment or package redemption before leaving the client.',
      'Send aftercare, review request, reminder, or follow-up via WhatsApp while the context is fresh.',
      'Check Inbox at the end of the day for unpaid visits, low stock, review replies, portal requests, and follow-ups.',
    ],
    link: '/clinic',
  },
  {
    id: 'solo-patient-journey',
    category: 'Patients',
    title: 'Patient journey from price question to rebooking',
    summary:
      'A compact workflow for handling WhatsApp enquiries, quotes, booking, consent, treatment, aftercare, and reactivation.',
    steps: [
      'Use WhatsApp Assistant or a patient price quote when someone asks about services and prices.',
      'Send the private booking link when the patient is ready, or create the appointment manually from the clinic panel.',
      'Capture intake answers, contraindications, and consent before treatment.',
      'Complete the visit with notes, photos, payment, package usage, and inventory consumption.',
      'Share aftercare and, when appropriate, a patient-safe export or private patient portal link.',
      'Use retention, occasions, referrals, and dormant-patient reactivation reports to bring the patient back.',
    ],
    link: '/clinic/whatsapp-assistant',
  },
  {
    id: 'monthly-business-review',
    category: 'Finance',
    title: 'Monthly business review routine',
    summary:
      'A simple management cadence for solo practitioners: target, occupancy, service profit, cash, stock, and reviews.',
    steps: [
      'Open Revenue plan to compare achieved revenue, daily pace, and the remaining gap.',
      'Open Occupancy to find unused free windows and excessive travel-buffer pressure.',
      'Open Service analytics and Finance to compare profit per hour, material costs, payment fees, expenses, and refunds.',
      'Review inventory low-stock alerts, purchase orders, stock-taking variance, and supplier balances.',
      'Check Review analytics for reply rate, public review candidates, and private negative-feedback follow-up.',
      'Adjust prices, availability, promotions, reminders, and follow-up messages before the next month starts.',
    ],
    link: '/clinic/revenue-plan',
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
    id: 'route-mode-on-my-way',
    category: 'Записи',
    title: 'Ведите выезды через Route Mode',
    summary: 'В виде День открывайте общий маршрут и отправляйте WhatsApp «Уже выезжаю» перед каждым адресом.',
    steps: [
      'Откройте Записи и переключитесь на вид День.',
      'Проверьте, что у каждого выездного визита есть адрес, район и заметки по входу или парковке.',
      'Нажмите Весь маршрут, чтобы открыть порядок адресов в Google Maps.',
      'Перед выездом к пациенту нажмите Уже выезжаю: система подготовит WhatsApp-текст и сохранит действие в истории.',
      'После прибытия откройте карточку записи для оплаты, напоминаний или действий по визиту.',
    ],
    link: '/clinic/appointments',
  },
  {
    id: 'group-classes-events',
    category: 'Записи',
    title: 'Проводите воркшопы без групповой записи',
    summary: 'Групповые занятия отложены; используйте простые 1:1 процессы, пока курсы не станут отдельным продуктом.',
    steps: [
      'Пока платное лечебное время должно оставаться в обычных записях.',
      'Если проводите небольшой воркшоп, создайте заблокированное время под событие и внесите расходы в Финансы.',
      'Интересующихся клиентов фиксируйте в заметках пациента, CRM или простым тегом, пока спрос не станет регулярным.',
      'Оплаты проводите как обычные платежи пациента только когда есть понятная карта клиента.',
      'Не добавляйте вместимость класса, списки участников и waitlist, пока курсы/воркшопы не станут повторяемой выручкой.',
    ],
    link: '/clinic/appointments/availability',
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
    id: 'before-after-comparison-v2',
    category: 'Пациенты',
    title: 'Сравнивайте до/после v2',
    summary: 'Вкладка Фото автоматически подбирает пары До и После для быстрой оценки прогресса.',
    steps: [
      'Откройте карту пациента и вкладку Фото.',
      'Загрузите хотя бы одно фото До и одно фото После, лучше с привязкой к одному визиту или этапу плана лечения.',
      'Используйте блок Обзор до / после, чтобы сравнить фото рядом.',
      'Соблюдайте одинаковый протокол фото: свет, угол и фон.',
      'Карту лица используйте отдельно, когда нужно отмечать точки инъекций или план коррекции поверх фото.',
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
    id: 'patient-safe-export',
    category: 'Пациенты',
    title: 'Экспортируйте безопасный PDF лечения',
    summary: 'Передавайте пациенту резюме процедур, чеки, принятые согласия и рекомендации без внутренних заметок.',
    steps: [
      'Откройте карту пациента.',
      'Используйте Безопасный экспорт лечения (PDF), когда пациенту нужна более полная копия, чем короткая сводка.',
      'Экспорт включает демографию, анамнез, завершенные резюме процедур, рекомендации, чеки и снимки принятых согласий.',
      'В него специально не попадают внутренние заметки, заметки персонала, CRM-история, приватные заметки записи и фото.',
      'Полный экспорт данных (JSON) используйте только для внутреннего переноса, не как выдачу пациенту.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'pre-visit-patient-tasks',
    category: 'Пациенты',
    title: 'Используйте задачи перед визитом в кабинете пациента',
    summary: 'Пациент подтверждает адрес, доступ, изменения здоровья и готовность к процедуре до выезда.',
    steps: [
      'Создайте или используйте существующую приватную ссылку кабинета пациента из карты пациента.',
      'Отправьте ссылку перед выездным визитом.',
      'Пациент открывает кабинет и отмечает чеклист перед визитом в будущей записи.',
      'Каждое сохранение создаёт запрос из кабинета, CRM-запись и событие в истории записи.',
      'Проверьте статус чеклиста перед выездом или при открытии карточки записи.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'client-wallet',
    category: 'Пациенты',
    title: 'Отправляйте кошелёк клиента в кабинете пациента',
    summary: 'У пациента есть одно приватное место для баланса, оплат, расчётов, пакетов, подарочных карт, сохранённых карт и чеков.',
    steps: [
      'Откройте карту пациента и создайте или используйте существующую ссылку кабинета пациента.',
      'Отправьте приватную ссылку, когда пациент спрашивает про баланс, расчёт, пакет, депозит или чек.',
      'Кошелёк показывает сумму к оплате, кредит клиента, ожидающие запросы оплаты, остаток сеансов в пакетах и баланс подарочных карт.',
      'Пациент видит только безопасные данные: отправленные/принятые/истёкшие расчёты, маскированные способы оплаты, ссылки на чеки и балансы пакетов.',
      'Черновики расчётов, внутренние заметки, комиссии процессинга и полные данные карты в кабинет не выводятся.',
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
    id: 'injectable-batch-expiry',
    category: 'Склад',
    title: 'Учитывайте партии и сроки годности инъекций',
    summary: 'Фиксируйте номера лотов и сроки годности ботокса, филлеров, ампул и других расходников.',
    steps: [
      'Откройте Склад и создайте или отредактируйте инъекционный товар.',
      'В блоке Партия и срок годности инъекций укажите номер партии/лота и дату истечения.',
      'Следите за бейджами в списке: Партия учтена, Скоро истекает или Просроченная партия.',
      'При получении новой партии обновите поля партии и добавьте движение прихода.',
      'Не используйте просроченные партии; спишите или скорректируйте их через аудируемое движение склада.',
    ],
    link: '/clinic/inventory',
  },
  {
    id: 'account-notification-preferences',
    category: 'Аккаунт',
    title: 'Настройте аккаунт и уведомления',
    summary: 'Сохраните профиль специалиста, язык, пароль, каналы и типы уведомлений.',
    steps: [
      'Откройте Аккаунт в боковом меню Practice OS.',
      'Сохраните имя и предпочитаемый язык EN/RU.',
      'Выберите каналы: email и push в браузере.',
      'Включайте и выключайте типы уведомлений: записи, переносы, напоминания, отзывы, неоплаченные визиты, низкие остатки и истечение пакетов.',
      'Включите push на каждом устройстве, где нужны уведомления.',
      'Используйте смену пароля, когда нужно обновить доступ.',
    ],
    link: '/clinic/account',
  },
  {
    id: 'solo-practitioner-assignment',
    category: 'Аккаунт',
    title: 'Как работает назначение в соло-практике',
    summary: 'Practice OS не использует маршрутизацию “любой специалист”, потому что продукт рассчитан на одного врача.',
    steps: [
      'Откройте Аккаунт и проверьте блок Режим соло-практика.',
      'Текущий врач является владельцем записей, визитов, напоминаний и follow-up.',
      'Используйте доступность и заблокированное время, чтобы защищать загрузку, вместо назначения работы другому сотруднику.',
      'Если ассистент помогает с админкой, отражайте это как Помощник / поддержка в Финансах, а не как владельца записи.',
      'Назначение сотрудников стоит добавлять только если практика вырастет за пределы соло-работы.',
    ],
    link: '/clinic/account',
  },
  {
    id: 'pwa-practitioner-mode',
    category: 'Аккаунт',
    title: 'Используйте Practice OS как мобильное приложение',
    summary: 'Установите рабочее пространство клиники и используйте дашборд как экран на сегодня.',
    steps: [
      'Откройте Practice OS на телефоне или планшете, который используете на выездах.',
      'В карточке Режим специалиста на дашборде установите приложение, когда браузер предложит это.',
      'Используйте повестку на сегодня для ближайших записей и быстрые действия для новых записей или карт пациентов.',
      'При слабой связи пишите в Офлайн-черновик. Он хранится на этом устройстве, пока вы не перенесёте его в черновик визита пациента.',
      'Включите push в Аккаунте на каждом устройстве, где нужны уведомления.',
    ],
    link: '/clinic',
  },
  {
    id: 'offline-safe-visit-draft',
    category: 'Пациенты',
    title: 'Проверяйте и синхронизируйте офлайн-черновики визитов',
    summary: 'Сохраняйте заметки визита на устройстве без связи, затем синхронизируйте их в карту пациента.',
    steps: [
      'Откройте карту пациента и блок Лог визита.',
      'Клинические поля, выбор aftercare и привязка к плану лечения автоматически сохраняются локально на этом устройстве.',
      'Если начали с Офлайн-черновика на дашборде, нажмите Взять черновик с дашборда в нужной карте пациента.',
      'В Фото неудачные или офлайн-загрузки остаются в офлайн-очереди, пока вы их не синхронизируете.',
      'Проверьте черновик перед сохранением. Когда связь есть, Сохранить визит создаёт обычный визит и очищает локальный черновик.',
      'Если синхронизация не удалась, локальный черновик остаётся доступным для повторной попытки.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'patient-price-quotes',
    category: 'Пациенты',
    title: 'Быстро отправляйте пациенту расчёт стоимости',
    summary: 'Создавайте аккуратный estimate с ценами услуг, PDF, текстом для WhatsApp и email.',
    steps: [
      'Откройте карту пациента и вкладку Расчёты.',
      'Выберите услуги из каталога процедур или добавьте свои строки.',
      'Укажите количество, цену, срок действия, скидку, заметку и условия.',
      'Сохраните расчёт, затем скачайте PDF или отправьте готовый текст через WhatsApp/email.',
      'В истории расчётов видно, что было в черновике, отправлено, принято, истекло или отклонено.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'whatsapp-assistant',
    category: 'Сообщения',
    title: 'Используйте WhatsApp AI receptionist v2',
    summary: 'Готовьте ответы по ценам, расчётам, переносу/отмене, окнам листа ожидания и одобрению специалиста без автоотправки.',
    steps: [
      'Откройте WhatsApp-ассистент в боковом меню.',
      'Выберите тип ответа: ссылка записи, цены, расчёт, перенос, отмена, лист ожидания, одобрение, intake, статус или follow-up.',
      'Выберите пациента, если нужен персональный текст и отправка на его номер.',
      'Для цены и листа ожидания выберите услуги из каталога; для расчёта выберите существующий расчёт или услуги.',
      'В поле контекста вставьте вопрос пациента или желаемое время, чтобы ответ был точнее.',
      'Проверьте предпросмотр, затем сохраните его в историю пациента и откройте WhatsApp. Финальная отправка остаётся ручной.',
    ],
    link: '/clinic/whatsapp-assistant',
  },
  {
    id: 'message-history',
    category: 'Сообщения',
    title: 'Храните историю сообщений в карте пациента',
    summary: 'Сохраняйте касания в WhatsApp и email, чтобы следующий ответ был с контекстом.',
    steps: [
      'Откройте WhatsApp-ассистент и выберите пациента перед отправкой ответа.',
      'Используйте Сохранить в историю или Открыть WhatsApp + сохранить, чтобы прикрепить подготовленный текст к карте пациента.',
      'Откройте карту пациента и вкладку CRM: История сообщений показана над общим CRM-журналом.',
      'Для ручных касаний создайте CRM-запись и выберите тип WhatsApp или Email.',
      'Первый проход хранит только проверенные специалистом исходящие сообщения/заметки; входящие WhatsApp-сообщения остаются для будущей интеграции.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'call-log',
    category: 'Сообщения',
    title: 'Записывайте звонки с результатом и следующим шагом',
    summary: 'Храните попытки дозвона и решения по follow-up без настройки телефонии.',
    steps: [
      'Откройте карту пациента и вкладку CRM.',
      'В блоке Журнал звонков выберите входящий или исходящий звонок и результат.',
      'Перед сохранением напишите краткое описание и следующий шаг.',
      'Используйте Позвонить пациенту, если у пациента есть номер и устройство поддерживает звонки.',
      'Последние звонки показаны отдельно над Историей сообщений и общим CRM-журналом.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'phone-workflow-no-telephony',
    category: 'Сообщения',
    title: 'Звоните без IP-телефонии',
    summary: 'Оставьте звонки простыми: звонок с телефона, затем исход и follow-up в карте пациента.',
    steps: [
      'Откройте карту пациента из Пациентов или карточки записи.',
      'Нажмите Позвонить пациенту, если есть номер, или используйте обычный набор номера на телефоне.',
      'После звонка откройте CRM и сохраните запись Журнала звонков с направлением и результатом.',
      'Запишите краткое резюме и следующий шаг, пока разговор свежий.',
      'Для follow-up используйте напоминания, WhatsApp-ассистент или будущую запись. IP-телефонию подключайте только если объём звонков реально это оправдывает.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'practitioner-push-notifications',
    category: 'Аккаунт',
    title: 'Отправляйте push-уведомления специалисту',
    summary: 'Push для напоминаний, новых записей, переносов/отмен, неоплаченных визитов, низких остатков и истечения пакетов.',
    steps: [
      'Включите push на каждом устройстве в Аккаунте.',
      'В настройках уведомлений выберите каналы и типы уведомлений.',
      'Запускайте `/api/clinic/practitioner-push/run` из cron через `CRON_SECRET` или под авторизованным пользователем для текущей клиники.',
      'Сканер использует те же исходные данные, что и Входящие, и пишет журнал доставок, чтобы повторные запуски не спамили один и тот же алерт.',
      'Открывайте Входящие, чтобы обработать операционные задачи из push.',
    ],
    link: '/clinic/account',
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
    id: 'service-analytics',
    category: 'Финансы',
    title: 'Сравнивайте услуги по прибыли в час',
    summary: 'Отдельный отчёт по процедурам: выручка, количество, средний чек, материалы и прибыль в час.',
    steps: [
      'Откройте Аналитику услуг в боковом меню или быстрых действиях дашборда.',
      'Выберите этот месяц или последние 30 дней.',
      'Сортируйте процедуры по валовой прибыли, прибыли в час или количеству завершённых визитов.',
      'Сравнивайте средний чек и стоимость материалов, чтобы увидеть услуги для пересмотра цены.',
      'Используйте Финансы, когда нужен полный P&L, расходы, скидки, подарочные карты и комиссии оплат.',
    ],
    link: '/clinic/service-analytics',
  },
  {
    id: 'revenue-plan',
    category: 'Финансы',
    title: 'Следите за месячной целью выручки',
    summary: 'План выручки показывает достигнутую сумму, разрыв, нужные визиты и дневной темп.',
    steps: [
      'Откройте План выручки в боковом меню или быстрых действиях дашборда.',
      'Введите цель на месяц и, при необходимости, ожидаемый средний чек визита.',
      'Смотрите достигнутую выручку из оплаченных платежей минус возвраты за текущий месяц.',
      'Используйте нужные визиты и нужный дневной темп, чтобы решить, нужны ли follow-up сообщения, акции или свободные слоты.',
      'Обновляйте отчёт в течение дня после записи оплат, чтобы видеть актуальный разрыв.',
    ],
    link: '/clinic/revenue-plan',
  },
  {
    id: 'owner-income',
    category: 'Финансы',
    title: 'Используйте доход владельца вместо payroll',
    summary: 'Для соло-практики достаточно видеть доход владельца и затраты на помощника без модуля зарплат.',
    steps: [
      'Откройте Финансы и выберите текущий месяц или последние 30 дней.',
      'Смотрите Доход владельца: это операционная прибыль как ориентир take-home.',
      'Платежи ассистенту, фрилансеру или помощнику записывайте как расходы в категории Помощник / поддержка.',
      'Следите за доходом владельца на визит, чтобы понимать, окупается ли загрузка.',
      'Используйте это вместо multi-employee payroll, пока в практике реально нет команды сотрудников.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'occupancy-report',
    category: 'Финансы',
    title: 'Находите свободные окна и потерянную ёмкость',
    summary: 'Загрузка показывает занятые рабочие часы, свободные окна, блокировки и давление буферов поездок.',
    steps: [
      'Откройте Занятость в боковом меню или быстрых действиях дашборда.',
      'Выберите следующие 7 или 14 дней.',
      'Сравните занятое время с плановым рабочим временем из правил доступности.',
      'Используйте лучшие свободные окна для follow-up, коротких услуг или реактивации пациентов.',
      'Следите за оценкой буферов поездок, чтобы видеть, когда выездная логистика съедает слишком много недели.',
    ],
    link: '/clinic/occupancy',
  },
  {
    id: 'service-areas',
    category: 'Записи',
    title: 'Используйте районы выезда вместо филиалов',
    summary: 'Смотрите, какие районы дают спрос и где сгруппированы ближайшие выездные визиты.',
    steps: [
      'Откройте Районы выезда в боковом меню или быстрых действиях дашборда.',
      'Выберите 30 или 90 дней, чтобы увидеть спрос по районам.',
      'Проверяйте самые активные районы перед follow-up сообщениями или расширением доступности.',
      'Исправляйте карты пациентов без района, чтобы маршруты и отчёты оставались полезными.',
      'Это заменяет управление сетью филиалов для соло-работы; отдельная таблица филиалов не нужна.',
    ],
    link: '/clinic/service-areas',
  },
  {
    id: 'review-analytics',
    category: 'Репутация',
    title: 'Следите за ответами и приватной обратной связью',
    summary: 'Аналитика отзывов показывает запросы, ответы, публикации, среднюю оценку и низкие приватные оценки.',
    steps: [
      'Откройте Аналитику отзывов в боковом меню или быстрых действиях дашборда.',
      'Выберите последние 30 дней, последние 90 дней или весь период.',
      'Смотрите KPI: запрошено, получено ответов, опубликовано и средняя оценка.',
      'Проверяйте распределение оценок, чтобы понять динамику настроения клиентов.',
      'Используйте очередь негативной обратной связи для личного follow-up перед публичной публикацией.',
    ],
    link: '/clinic/review-analytics',
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
    id: 'before-after-photo-protocol',
    category: 'Клиника',
    title: 'Снимайте сопоставимые фото до/после',
    summary: 'Используйте чеклист съемки, чтобы прогресс был сравнимым, а согласие на маркетинг было явным.',
    steps: [
      'Откройте карту пациента и вкладку Фото.',
      'По возможности привяжите фото к визиту, чтобы появился процедурный контекст.',
      'Перед съемкой отметьте тот же свет, угол, расстояние, чистый фон и понятную зону обработки.',
      'Отмечайте согласие на маркетинг только если оно зафиксировано именно для этого изображения.',
      'Проверяйте бейджи фотопротокола и маркетингового согласия перед использованием фото в коммуникациях или рекламе.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'voice-comments',
    category: 'Клиника',
    title: 'Диктуйте комментарии после процедуры',
    summary: 'Используйте микрофон в карте пациента, чтобы превратить голосовую заметку в текст CRM перед сохранением.',
    steps: [
      'Откройте карту пациента и вкладку CRM.',
      'Нажмите Надиктовать заметку после процедуры и говорите естественно.',
      'Следите за живой расшифровкой, затем остановите диктовку.',
      'Проверьте и отредактируйте текст перед сохранением как обычную заметку пациента.',
      'Если диктовка недоступна, используйте Chrome, Edge или Safari и разрешите доступ к микрофону.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'aftercare-library',
    category: 'Клиника',
    title: 'Отправляйте единые рекомендации после визита',
    summary: 'Создавайте рекомендации и ссылки на документы по процедурам, затем сохраняйте их снимком в визите.',
    steps: [
      'Откройте Процедуры и выберите услугу.',
      'В Библиотеке рекомендаций сохраните короткое сообщение и, при необходимости, URL PDF/документа.',
      'Используйте переменные {{firstName}}, {{service}} и {{date}} для персонализации.',
      'При завершении записи выберите шаблон: система скопирует текст, откроет WhatsApp и сохранит снимок для пациента.',
      'В кабинете пациента видны сохраненный текст и ссылка на документ без внутренних заметок.',
    ],
    link: '/clinic/procedures',
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
      'Откройте карту пациента и найдите блок Личный кабинет пациента под шапкой.',
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
  {
    id: 'solo-practice-day-one',
    category: 'Аккаунт',
    title: 'Настройка первого дня для solo home-visit практики',
    summary:
      'Чеклист запуска: как превратить пустой портал в рабочую мобильную систему практики.',
    steps: [
      'Сначала откройте Аккаунт: укажите имя врача, язык и предпочтения уведомлений.',
      'Создайте основные процедуры с длительностью, ценой, буферами, материалами и вопросами анкеты под услугу.',
      'Настройте Доступность, чтобы онлайн-запись и ручное расписание учитывали реальные часы, личное время и минимальный срок записи.',
      'Импортируйте существующих клиентов или создайте первые карты пациентов вручную до записи визитов.',
      'Добавьте ключевые товары и поставщиков, если нужны склад, минимальные остатки, заказы поставщикам или себестоимость материалов.',
      'Включайте приватную ссылку записи только после проверки услуг, доступности, напоминаний и вопросов анкеты.',
    ],
    link: '/clinic/account',
  },
  {
    id: 'solo-mobile-daily-workflow',
    category: 'Записи',
    title: 'Ежедневный сценарий с iPhone/iPad',
    summary:
      'Ведите день без ПК: повестка, карта пациента, черновик визита, фото, оплата и follow-up в одном мобильном потоке.',
    steps: [
      'Начинайте с Дашборда или установите PWA, чтобы Practice OS открывался сразу на мобильном экране врача.',
      'Откройте Today screen, посмотрите следующую запись и перейдите в карту пациента до визита.',
      'Во время процедуры используйте offline-safe черновик визита, голосовые комментарии и before/after фото из карты пациента.',
      'Запишите оплату или списание пакета до ухода от клиента.',
      'Отправьте уходовые рекомендации, запрос отзыва, напоминание или follow-up через WhatsApp, пока контекст свежий.',
      'В конце дня проверьте Inbox: неоплаченные визиты, низкие остатки, ответы на отзывы, запросы из кабинета и follow-up.',
    ],
    link: '/clinic',
  },
  {
    id: 'solo-patient-journey',
    category: 'Пациенты',
    title: 'Путь пациента от вопроса о цене до повторной записи',
    summary:
      'Короткий сценарий для WhatsApp-запросов, смет, записи, согласия, процедуры, рекомендаций и реактивации.',
    steps: [
      'Используйте WhatsApp Assistant или смету, когда пациент спрашивает об услугах и ценах.',
      'Отправьте приватную ссылку записи, когда пациент готов, или создайте запись вручную в панели.',
      'Соберите ответы анкеты, противопоказания и согласие до процедуры.',
      'Завершите визит с заметками, фото, оплатой, списанием пакета и расходом материалов.',
      'Отправьте рекомендации, а при необходимости patient-safe export или приватную ссылку кабинета пациента.',
      'Используйте Retention, события, рефералы и реактивацию спящих пациентов, чтобы вернуть пациента.',
    ],
    link: '/clinic/whatsapp-assistant',
  },
  {
    id: 'monthly-business-review',
    category: 'Финансы',
    title: 'Ежемесячный бизнес-разбор',
    summary:
      'Простой управленческий ритм для solo врача: цель, занятость, прибыль услуг, деньги, склад и отзывы.',
    steps: [
      'Откройте План выручки и сравните достигнутую сумму, дневной темп и оставшийся разрыв.',
      'Откройте Занятость, чтобы найти свободные окна и чрезмерные буферы поездок.',
      'Откройте Аналитику услуг и Финансы, чтобы сравнить прибыль в час, материалы, комиссии оплат, расходы и возвраты.',
      'Проверьте низкие остатки, заказы поставщикам, расхождения инвентаризации и балансы поставщиков.',
      'Откройте Аналитику отзывов: доля ответов, кандидаты на публикацию и приватный follow-up по низким оценкам.',
      'Настройте цены, доступность, акции, напоминания и follow-up сообщения до начала следующего месяца.',
    ],
    link: '/clinic/revenue-plan',
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
  Messages: Send,
  Сообщения: Send,
  Account: Users,
  Аккаунт: Users,
  Clinical: Stethoscope,
  Клиника: Stethoscope,
  Reputation: Star,
  Репутация: Star,
}

const workflowArticleIds = [
  'solo-practice-day-one',
  'solo-mobile-daily-workflow',
  'solo-patient-journey',
  'monthly-business-review',
]

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
    workflowGuides: isRu ? 'Рабочие сценарии' : 'Workflow guides',
    categoryOverview: isRu ? 'Разделы помощи' : 'Help sections',
    articleCount: isRu ? 'статей' : 'articles',
    showing: isRu ? 'Показано' : 'Showing',
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
  const workflowArticles = workflowArticleIds
    .map((id) => articles.find((article) => article.id === id))
    .filter((article): article is Article => !!article)
  const categoryCards = categories.map((cat) => ({
    name: cat,
    count: articles.filter((article) => article.category === cat).length,
    icon: categoryIcons[cat as keyof typeof categoryIcons] || FileText,
  }))

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

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">{copy.workflowGuides}</h2>
            <p className="mt-1 text-sm text-gray-500">{copy.showing} {articles.length} {copy.articleCount}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {workflowArticles.map((article) => (
            <button
              key={article.id}
              type="button"
              onClick={() => {
                setCategory(article.category)
                setQuery(article.title)
              }}
              className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-left transition-colors hover:bg-orange-100/70"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">{article.category}</p>
              <h3 className="mt-2 text-sm font-semibold text-gray-950">{article.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">{article.summary}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-950">{copy.categoryOverview}</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {categoryCards.map(({ name, count, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setCategory(name)
                setQuery('')
              }}
              className={clsx(
                'flex min-h-20 flex-col items-start justify-between rounded-2xl border p-3 text-left transition-colors',
                category === name
                  ? 'border-orange-200 bg-orange-50 text-orange-950'
                  : 'border-gray-100 bg-gray-50/70 text-gray-800 hover:bg-gray-100'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>
                <span className="block text-sm font-semibold">{name}</span>
                <span className="text-xs text-gray-500">{count} {copy.articleCount}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

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
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-semibold text-gray-900">{copy.featured}</h2>
            <p className="text-xs text-gray-500">{copy.showing} {filtered.length} / {articles.length}</p>
          </div>
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
