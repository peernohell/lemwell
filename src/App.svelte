<script>
  import ProfitwellDashboard from './ProfitwellDashboard.svelte';
  import profitwell from './profitwell';
  let error = '';

  let config = JSON.parse(localStorage.getItem('lemwellConfig')) || [];

  $: {
    console.log(`Save config into local storage ${config.length}`);
    localStorage.setItem('lemwellConfig', JSON.stringify(config));
  }

  async function submitNewApiKey (event) {
    const key = event.target.key.value;
    if (!key) return;

    if (!(await profitwell.test(key))) { error = 'Invalid API Key'; return; }

    if (config.find(conf => conf.key === key)) { error = 'API Key already registered'; return; }
    const company = await profitwell.company(key);

config = [...config, { company, key }];
    event.target.key.value = '';
  }

  function removeProject (i) {
    config.splice(i, 1);
    config = config;
  }
</script>

<div class="lemwell">
  {#if config.length}
    {#each config as { company, key }, i}
    <section>
      <ProfitwellDashboard company={company} key={key} />
    </section>
    {/each}
  {:else}
    <header>
      <h1>lemwell - Track your growth at each new tab</h1>
    </header>
    <section class="config-add">
      <p>Registered your profitwell project.<br> To do so, you need to go to your <a href="https://www2.profitwell.com/app/account/integrations" target="_blank">integrations</a> section then click on API KEYS/DEV KIT. Copy your private token and enter it in the above form.</p>
      <form on:submit|preventDefault={submitNewApiKey}>
        <input type="password" name="key" placeholder="e83ef71c13...">
        {#if error}<span class="error">{error}</span>{/if}
        <button type="submit">Save</button>
      </form>
    </section>
  {/if}
</div>

<style>
  :global(html) {
    display: flex;
  }
  :global(body) {
    flex: 1;
    display: flex;

    color: #333;
    font-family: nexa,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  }
  .lemwell {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .lemwell > header {
    margin-top: 30px;
    text-align: center;
  }
  
  section.config-add {
    flex: 1;
    width: 90vw;
    max-width: 600px;
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  form {
    margin-top: 30px;
    display: flex;
    justify-content: center;
  }

  input, button {
    margin-right: 20px;
    padding: 8px 12px;
    border: 1px solid #beccef;
    border-radius: 8px;
    background-color: white;
  }
</style>
