
const profitwell = {
  api(apiKey, path = '/v2/api-status/') {
    const domain = window.location.hostname === 'localhost' ? window.location.origin : 'https://api.profitwell.com';
    return fetch(domain + path, { headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' } });
  },
  async test(apiKey) {
    return (await profitwell.api(apiKey).then(result => result.status)) === 200;
  },
};

export default profitwell;