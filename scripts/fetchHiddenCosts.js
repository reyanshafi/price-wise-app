import axios from 'axios';
import cheerio from 'cheerio';

export default async function fetchHiddenCosts(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Example selectors for hidden costs (adjust based on the website structure)
    const taxes = $('.taxes-selector').text().trim();
    const shippingCharges = $('.shipping-selector').text().trim();

    return {
      taxes: taxes || 'Not available',
      shippingCharges: shippingCharges || 'Not available'
    };
  } catch (error) {
    throw new Error('Failed to fetch hidden costs');
  }
}
