const axios = require('axios');

const currencyService = {
  // Cache exchange rates with TTL
  exchangeRateCache: {
    rate: 83.50,
    lastUpdated: Date.now(),
    TTL: 24 * 60 * 60 * 1000, // 24 hours
  },

  async getExchangeRate(from = 'USD', to = 'INR') {
    // Check cache
    if (this.exchangeRateCache.lastUpdated + this.exchangeRateCache.TTL > Date.now()) {
      return this.exchangeRateCache.rate;
    }

    try {
      // Use free API (e.g., api.exchangerate-api.com)
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${from}`,
        { timeout: 5000 }
      );
      
      const rate = response.data.rates[to];
      
      // Update cache
      this.exchangeRateCache = {
        rate,
        lastUpdated: Date.now(),
        TTL: 24 * 60 * 60 * 1000,
      };
      
      return rate;
    } catch (error) {
      console.error('Error fetching exchange rate:', error.message);
      // Fallback to cached rate
      return this.exchangeRateCache.rate;
    }
  },

  convert(amount, from = 'USD', to = 'INR', rate) {
    if (!rate) rate = this.exchangeRateCache.rate;
    return parseFloat((amount * rate).toFixed(2));
  },
};

module.exports = currencyService;
