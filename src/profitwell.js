
const profitwell = {
  api(apiKey, path = '/v2/api-status/') {
    const domain = window.location.hostname === 'localhost' ? 'private-anon-632cbc2a9b-profitwellapiv2.apiary-mock.com' : 'api.profitwell.com';
    return fetch(`https://${domain}${path}`, { headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' } });
  },
  async test(apiKey) {
    return (await profitwell.api(apiKey).then(result => result.status)) === 200;
  },
};

export default profitwell;