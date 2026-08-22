// Currency conversion rates (simplified - in production, use a real API)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 83.0, // 1 USD = 83 INR (approximate)
  EUR: 0.92, // 1 USD = 0.92 EUR (approximate)
  GBP: 0.79, // 1 USD = 0.79 GBP (approximate)
  JPY: 150.0, // 1 USD = 150 JPY (approximate)
  CAD: 1.35, // 1 USD = 1.35 CAD (approximate)
  AUD: 1.52, // 1 USD = 1.52 AUD (approximate)
  CHF: 0.88, // 1 USD = 0.88 CHF (approximate)
  CNY: 7.2, // 1 USD = 7.2 CNY (approximate)
  SGD: 1.34, // 1 USD = 1.34 SGD (approximate)
};

// Currency symbols and formatting
const CURRENCY_FORMATS: Record<string, { symbol: string; position: 'before' | 'after'; decimalPlaces: number }> = {
  USD: { symbol: '$', position: 'before', decimalPlaces: 2 },
  INR: { symbol: '₹', position: 'before', decimalPlaces: 2 },
  EUR: { symbol: '€', position: 'before', decimalPlaces: 2 },
  GBP: { symbol: '£', position: 'before', decimalPlaces: 2 },
  JPY: { symbol: '¥', position: 'before', decimalPlaces: 0 },
  CAD: { symbol: 'C$', position: 'before', decimalPlaces: 2 },
  AUD: { symbol: 'A$', position: 'before', decimalPlaces: 2 },
  CHF: { symbol: 'CHF', position: 'before', decimalPlaces: 2 },
  CNY: { symbol: '¥', position: 'before', decimalPlaces: 2 },
  SGD: { symbol: 'S$', position: 'before', decimalPlaces: 2 },
};

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  position: 'before' | 'after';
  decimalPlaces: number;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', position: 'before', decimalPlaces: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', position: 'before', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', position: 'before', decimalPlaces: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', position: 'before', decimalPlaces: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', position: 'before', decimalPlaces: 0 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', position: 'before', decimalPlaces: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', position: 'before', decimalPlaces: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', position: 'before', decimalPlaces: 2 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', position: 'before', decimalPlaces: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', position: 'before', decimalPlaces: 2 },
];

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];
  
  if (!fromRate || !toRate) {
    console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
    return amount; // Return original amount if conversion not possible
  }
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

/**
 * Format currency amount with proper symbol and formatting
 */
export function formatCurrency(amount: number, currency: string): string {
  const format = CURRENCY_FORMATS[currency];
  if (!format) {
    return `${amount.toFixed(2)} ${currency}`;
  }
  
  const formattedAmount = amount.toFixed(format.decimalPlaces);
  
  if (format.position === 'before') {
    return `${format.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${format.symbol}`;
  }
}

/**
 * Format currency amount with conversion to user's preferred currency
 */
export function formatCurrencyForUser(amount: number, originalCurrency: string, userCurrency: string): string {
  if (originalCurrency === userCurrency) {
    return formatCurrency(amount, userCurrency);
  }
  
  const convertedAmount = convertCurrency(amount, originalCurrency, userCurrency);
  return formatCurrency(convertedAmount, userCurrency);
}

export function formatTripBudget(amount: number | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return 'Budget TBD';
  const currency = getUserPreferredCurrency();
  return formatCurrency(amount, currency);
}

export function getTripBudgetAmount(amount: number | undefined): number {
  return amount != null && Number.isFinite(amount) ? amount : 0;
}

/**
 * Get currency info by code
 */
export function getCurrencyInfo(currencyCode: string): CurrencyInfo | undefined {
  return SUPPORTED_CURRENCIES.find(currency => currency.code === currencyCode);
}

/**
 * Get user's preferred currency from localStorage or default to INR
 */
export function getUserPreferredCurrency(): string {
  try {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      return profile.currency || 'INR';
    }
  } catch (error) {
    console.warn('Error reading user currency preference:', error);
  }
  return 'INR'; // Default to INR as requested
}

/**
 * Get user's timezone from localStorage or default to IST
 */
export function getUserTimezone(): string {
  try {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      return profile.timezone || 'Asia/Kolkata';
    }
  } catch (error) {
    console.warn('Error reading user timezone preference:', error);
  }
  return 'Asia/Kolkata'; // Default to IST as requested
}

/**
 * Format price range for display
 */
export function formatPriceRange(minPrice: number, maxPrice: number, currency: string): string {
  const minFormatted = formatCurrency(minPrice, currency);
  const maxFormatted = formatCurrency(maxPrice, currency);
  return `${minFormatted} - ${maxFormatted}`;
}

/**
 * Parse price from string (removes currency symbols and converts to number)
 */
export function parsePrice(priceString: string): number {
  if (!priceString) return 0;
  
  // Remove currency symbols and non-numeric characters except decimal point
  const cleaned = priceString.replace(/[^\d.,]/g, '');
  
  // Handle different decimal separators
  const normalized = cleaned.replace(',', '.');
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1;
  
  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];
  
  if (!fromRate || !toRate) {
    console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
    return 1;
  }
  
  return toRate / fromRate;
}
