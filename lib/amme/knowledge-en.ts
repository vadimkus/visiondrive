import type { KnowledgeArticle } from './knowledge'

export const KNOWLEDGE_CATEGORY_EN: Record<string, string> = {
  'Старт смены': 'Starting a shift',
  'Записи и баня': 'Bookings & banya',
  'Счета и кухня': 'Bills & kitchen',
  CRM: 'CRM',
  'Отчёты': 'Reports',
  'Правила учёта': 'Operating rules',
}

export const KNOWLEDGE_ARTICLES_EN: Record<string, Omit<KnowledgeArticle, 'id' | 'minutes'>> = {
  'shift-start': {
    title: 'How to start a shift',
    category: 'Starting a shift',
    summary: 'Open the day, check bookings and read the dashboard.',
    body: [
      'Sign in to visiondrive.ae/amme with your email and password.',
      'The dashboard shows guests in the venue, kitchen queue, waiting bookings and revenue for the selected period.',
      'Choose the operating date in the header when working with a day other than today.',
      'Open Bookings and reconcile the list. Import text or add a guest manually when needed.',
      'The kitchen view can stay open on a second tablet or phone and updates automatically.',
    ],
  },
  'bookings-flow': {
    title: 'Bookings: arrived, no-show and banya',
    category: 'Bookings & banya',
    summary: 'The administrator flow before opening a bill.',
    body: [
      'Each row shows the time, guest, party size and whether the booking includes banya.',
      'Arrived creates a visit and bill, adding the banya charge when enabled.',
      'No-show marks the booking; Return moves it back to waiting.',
      'A delay over 15 minutes is highlighted as a prompt to call or reschedule.',
      'Banya can be toggled only while the booking is waiting.',
      'For import, paste text such as “10:00 Name 2 guests banya”.',
    ],
  },
  walkin: {
    title: 'Walk-in guest',
    category: 'Bookings & banya',
    summary: 'For guests arriving without a booking.',
    body: [
      'In Bills, choose “+ walk-in guest”.',
      'Enter the name, party size and whether banya is required.',
      'A visit and bill open immediately.',
    ],
  },
  ordering: {
    title: 'Adding an order to a bill',
    category: 'Bills & kitchen',
    summary: 'Menu → bill → automatic kitchen send.',
    body: [
      'Select a guest card to open their bill.',
      'Tapping a menu item adds it to the active bill and locks its current price.',
      'Draft items go to the kitchen automatically after the short countdown, or choose Send now.',
      'Line states are draft → sent → done.',
      'Quantity can be changed only while the item is a draft.',
    ],
  },
  'split-tabs': {
    title: 'Splitting bills and moving items',
    category: 'Bills & kitchen',
    summary: 'Multiple bills for one visit.',
    body: [
      'Select items using the checkboxes.',
      'Move to new bill creates another bill for the same visit.',
      'Items can also move to another open bill in the visit.',
      'Every move is recorded in the audit log.',
    ],
  },
  kitchen: {
    title: 'Kitchen display',
    category: 'Bills & kitchen',
    summary: 'Tickets, urgency timer and Served.',
    body: [
      'Kitchen sees sent items grouped by guest.',
      'The timer starts when an item is sent; after 10 minutes the ticket becomes urgent.',
      'Served marks the item done. A bill cannot close while draft or sent items remain.',
      'The dedicated display is designed for a kitchen tablet.',
    ],
  },
  'pay-close': {
    title: 'Payment and closing',
    category: 'Bills & kitchen',
    summary: 'How to close a guest correctly.',
    body: [
      'Pay records payment time on the bill.',
      'Close bill requires every item to be served.',
      'When every bill is closed, the visit leaves the active guest list.',
      'Nothing is physically deleted; cancellations and moves remain in the log.',
    ],
  },
  'banya-strip': {
    title: 'Banya live strip',
    category: 'Bookings & banya',
    summary: 'Who is in banya and how to finish a session.',
    body: [
      'The Bills screen shows who is in banya and the live banya total.',
      'End session records the finish time without closing the food bill.',
      'Banya is a normal line on the same bill.',
    ],
  },
  reports: {
    title: 'Reading reports',
    category: 'Reports',
    summary: 'Revenue, food per banya guest, no-shows and print.',
    body: [
      'Choose today, 7 days, 30 days or a custom period.',
      'Core metrics include revenue, average bill, food share, banya share and no-shows.',
      'Food per banya guest is AMMÉ’s signature operating metric.',
      'Daily and hourly charts reveal trend and service rhythm.',
      'Print creates a clean owner report.',
      'Top items show what contributes most to revenue.',
    ],
  },
  'menu-edit': {
    title: 'Editing menu and prices',
    category: 'Reports',
    summary: 'Change prices without altering historical bills.',
    body: [
      'Menu lets an owner change a name, price or item availability.',
      'Historical bills keep the price captured when ordered.',
      'Disabled items disappear from ordering but remain in history.',
    ],
  },
  'crm-profiles': {
    title: 'CRM guest profiles',
    category: 'CRM',
    summary: 'One guest, one profile, history and shift notes.',
    body: [
      'CRM stores identity, phone, tags, notes, LTV and no-shows separately from today’s visit.',
      'Phone is the primary identity key: one WhatsApp number equals one profile.',
      'Bookings, imports and walk-ins find or create profiles automatically.',
      'Segments include VIP, regular, new, dormant, banya, high spend, no-show and caution.',
      'Bills surface notes, dietary requirements and LTV.',
      'VIP can be set manually or awarded from visit and spend thresholds.',
    ],
  },
  'five-rules': {
    title: 'Five operating rules',
    category: 'Operating rules',
    summary: 'The accounting principles that protect the operation.',
    body: [
      '1. Price is copied to the line when ordered.',
      '2. Moving an item means changing its bill and recording an event.',
      '3. Nothing is deleted; cancellation is a status with author and reason.',
      '4. Readiness belongs to each line, not the whole bill.',
      '5. Banya is a line on the same bill.',
      'The system’s value is a trustworthy operational record.',
    ],
  },
  'admin-vs-owner': {
    title: 'Administrator and owner responsibilities',
    category: 'Operating rules',
    summary: 'Where the effort goes and who gets the value.',
    body: [
      'The administrator records a few more actions than in Notes, creating verifiable operations.',
      'The owner receives a report they can trust, including food per banya guest.',
      'AMMÉ must be the single operating record, not a parallel system.',
      'The product intentionally joins banya, food and owner reporting.',
    ],
  },
}
