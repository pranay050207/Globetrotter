# Currency and Timezone Features

## Overview
The GlobeTrotter application now supports comprehensive currency conversion and timezone handling with IST (Indian Standard Time) and INR (Indian Rupee) as the default preferences.

## Features Added

### 1. Currency Support
- **Default Currency**: INR (Indian Rupee) - ₹
- **Supported Currencies**: USD, INR, EUR, GBP, JPY, CAD, AUD, CHF, CNY, SGD
- **Currency Conversion**: Real-time conversion between all supported currencies
- **Currency Formatting**: Proper symbol placement and decimal formatting for each currency

### 2. Timezone Support
- **Default Timezone**: IST (Asia/Kolkata) - UTC+5:30
- **Supported Timezones**: 15+ major timezones including IST, EST, PST, GMT, CET, JST, etc.
- **Timezone Conversion**: Automatic conversion of dates and times to user's preferred timezone
- **Timezone Formatting**: Proper display of dates and times in user's timezone

### 3. Currency Converter Tool
- **Interactive Converter**: Built-in currency converter in user profile
- **Real-time Conversion**: Instant conversion between any supported currencies
- **Swap Functionality**: Easy currency swapping with one click
- **Exchange Rate Display**: Shows current exchange rates (approximate)

## Implementation Details

### Currency Utilities (`src/utils/currency.ts`)
```typescript
// Key functions:
- convertCurrency(amount, fromCurrency, toCurrency)
- formatCurrency(amount, currency)
- formatCurrencyForUser(amount, originalCurrency, userCurrency)
- getUserPreferredCurrency()
- parsePrice(priceString)
```

### Timezone Utilities (`src/utils/timezone.ts`)
```typescript
// Key functions:
- formatDateInUserTimezone(date, options)
- formatTimeInUserTimezone(date, options)
- formatDateTimeInUserTimezone(date, options)
- getUserTimezone()
- convertToUserTimezone(date)
```

### Currency Converter Component (`src/components/CurrencyConverter.tsx`)
- Standalone currency converter component
- Integrated into user profile preferences
- Supports all 10 currencies with proper formatting

## Database Changes

### User Model Updates
- `timezone` field default changed to `'Asia/Kolkata'`
- `currency` field default changed to `'INR'`

### Activity Model Updates
- `currency` field default changed to `'INR'` for new activities
- `cost_amount` now properly supports currency conversion

### Booking Model Updates
- `currency` field default changed to `'INR'` for new bookings

## Frontend Integration

### Components Updated
1. **UserProfile**: Added currency and timezone preferences with IST/INR defaults
2. **ItineraryBuilder**: Currency conversion for activity costs and total budget
3. **ActivitySearch**: Currency conversion for activity prices
4. **CitySearch**: Currency conversion for daily budget ranges

### Price Display Updates
- All price displays now use `formatCurrencyForUser()` function
- Automatic conversion to user's preferred currency
- Proper currency symbol placement and formatting

## User Experience

### Default Preferences
- New users automatically get IST timezone and INR currency
- Existing users can change preferences in their profile
- Preferences are stored in localStorage for quick access

### Currency Conversion
- Prices are automatically converted to user's preferred currency
- Original currency is preserved in database
- Real-time conversion using approximate exchange rates

### Timezone Handling
- All dates and times are displayed in user's timezone
- Automatic conversion from UTC to user's timezone
- Support for relative time formatting (e.g., "2 hours ago")

## Exchange Rates
Current approximate exchange rates (USD base):
- INR: 1 USD = 83 INR
- EUR: 1 USD = 0.92 EUR
- GBP: 1 USD = 0.79 GBP
- JPY: 1 USD = 150 JPY
- CAD: 1 USD = 1.35 CAD
- AUD: 1 USD = 1.52 AUD
- CHF: 1 USD = 0.88 CHF
- CNY: 1 USD = 7.2 CNY
- SGD: 1 USD = 1.34 SGD

**Note**: These are approximate rates. For accurate rates, users should check with their bank or currency exchange service.

## Usage Examples

### Setting User Preferences
```typescript
// In UserProfile component
const [profileData, setProfileData] = useState({
  timezone: 'Asia/Kolkata',  // IST default
  currency: 'INR',           // INR default
  // ... other fields
});
```

### Converting Currency
```typescript
import { formatCurrencyForUser, getUserPreferredCurrency } from '../utils/currency';

// Convert activity cost to user's preferred currency
const displayPrice = formatCurrencyForUser(
  activity.cost_amount, 
  activity.currency, 
  getUserPreferredCurrency()
);
```

### Formatting Dates in User Timezone
```typescript
import { formatDateInUserTimezone } from '../utils/timezone';

// Format trip date in user's timezone
const displayDate = formatDateInUserTimezone(trip.start_date, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

## Future Enhancements
- Integration with real-time exchange rate APIs
- Support for more currencies
- Historical exchange rate tracking
- Currency conversion history
- Automatic timezone detection based on user location
