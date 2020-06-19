
const profitwell = {
  async api(key, path = '/v2/api-status/') {
    const domain = window.location.hostname === 'localhost' ? window.location.origin : 'https://api.profitwell.com';
    return fetch(domain + path, { headers: { Authorization: key, 'Content-Type': 'application/json' } });
  },
  async company(key) {
    return profitwell.api(key, '/v2/company/settings/').then(result => result.json());
  },
  async test(key) {
    return (await profitwell.api(key).then(result => result.status)) === 200;
  },
};

export default profitwell;