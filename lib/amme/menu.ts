export const AMME_DEFAULT_MENU = [
  { code: 'm1', name: 'Lamb Stew', price: 200000, category: 'Main dishes', station: 'Кухня' },
  { code: 'm2', name: 'BBQ Chicken', price: 150000, category: 'Main dishes', station: 'Кухня' },
  { code: 'm3', name: 'Olivier Salad', price: 100000, category: 'Main dishes', station: 'Кухня', vegFlag: 'Veg' },
  { code: 'm4', name: 'Beetroot Caviar', price: 100000, category: 'Main dishes', station: 'Кухня', vegFlag: 'V' },
  { code: 'm5', name: 'Grill Fish', price: 150000, category: 'Main dishes', station: 'Кухня' },
  { code: 'm6', name: 'Radish Salad', price: 80000, category: 'Main dishes', station: 'Кухня', vegFlag: 'V' },
  { code: 'd1', name: 'Salmon', price: 200000, category: 'Dumplings', station: 'Кухня' },
  { code: 'd2', name: 'Chicken', price: 150000, category: 'Dumplings', station: 'Кухня' },
  { code: 'd3', name: 'Potato', price: 100000, category: 'Dumplings', station: 'Кухня' },
  { code: 's1', name: 'Syrniki', price: 100000, category: 'Desserts', station: 'Кухня' },
  { code: 'b1', name: 'Cacao', price: 80000, category: 'Drinks', station: 'Бар' },
  { code: 'b2', name: 'Coffee', price: 50000, category: 'Drinks', station: 'Бар' },
  { code: 'b3', name: 'Matcha', price: 80000, category: 'Drinks', station: 'Бар' },
  { code: 'b4', name: 'Lemon Lemonade', price: 60000, category: 'Drinks', station: 'Бар' },
  { code: 'b5', name: 'Coconut', price: 30000, category: 'Drinks', station: 'Бар' },
] as const

export const AMME_MENU_CATEGORIES = ['Main dishes', 'Dumplings', 'Desserts', 'Drinks'] as const

export const BANYA_PRICE_DEFAULT = 800_000
export const SEND_DELAY_SEC = 6
