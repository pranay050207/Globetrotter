import React, { useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { convertCurrency, formatCurrency, SUPPORTED_CURRENCIES } from '../utils/currency';

interface CurrencyConverterProps {
  className?: string;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ className = '' }) => {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [convertedAmount, setConvertedAmount] = useState<string>('');

  const handleConvert = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setConvertedAmount('');
      return;
    }

    const converted = convertCurrency(numericAmount, fromCurrency, toCurrency);
    setConvertedAmount(formatCurrency(converted, toCurrency));
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount('');
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setConvertedAmount('');
  };

  return (
    <div className={`glass-card rounded-xl shadow-sm border border-glass-border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-heading mb-4">Currency Converter</h3>
      
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-heading mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            min="0"
            step="0.01"
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-heading mb-2">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => {
                setFromCurrency(e.target.value);
                setConvertedAmount('');
              }}
              className="w-full px-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwapCurrencies}
              className="p-3 bg-base-100 hover:bg-base-200 text-body-muted rounded-xl transition-colors"
              title="Swap currencies"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-2">To</label>
            <select
              value={toCurrency}
              onChange={(e) => {
                setToCurrency(e.target.value);
                setConvertedAmount('');
              }}
              className="w-full px-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <ArrowRight className="w-5 h-5" />
          <span>Convert</span>
        </button>

        {/* Result */}
        {convertedAmount && (
          <div className="bg-base-50 rounded-xl p-4">
            <div className="text-center">
              <p className="text-sm text-body-muted mb-1">Converted Amount</p>
              <p className="text-2xl font-bold text-success-400">{convertedAmount}</p>
              <p className="text-xs text-body-muted mt-1">
                {formatCurrency(parseFloat(amount), fromCurrency)} = {convertedAmount}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Exchange Rate Info */}
      <div className="mt-6 pt-4 border-t border-glass-border">
        <p className="text-xs text-body-muted text-center">
          Exchange rates are approximate and may vary. For accurate rates, please check with your bank or currency exchange service.
        </p>
      </div>
    </div>
  );
};

export default CurrencyConverter;
