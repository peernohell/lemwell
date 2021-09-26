<script>
  // import * as pkg from 'https://cdn.pika.dev/@sveltejs/pancake@^0.0.9';
  // import * as pkg from 'https://unpkg.com/@sveltejs/pancake@0.0.9?module';
  // import * as Pancake from '@sveletejs/pancake';

  import Line from './svelte-chartjs/Line.svelte';
  import Bar from './svelte-chartjs/Bar.svelte';
  import profitwell from './profitwell';

  // default chartjs options
  Chart.defaults.scale.gridLines.display = false;
  Chart.defaults.scale.ticks.display = false;
  Chart.defaults.global.legend.display = false;

  export let company;
  export let key;

  // https://stackoverflow.com/a/6117889/958898
  export function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
  }

  const responseToGrapData = (growth, [name, dataPoint]) => {
    const values = dataPoint.map(point => point.value);
    const convert = values.find(value => (value !== (value | 0))) ? toEuro : (value => value);

    return {
      name: name.replace(/_/g, ' '),
      value: convert(growth ? values.reduce((a, b) => a + b) : values[values.length - 1]),
      type: growth ? 'bar' : 'line',
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          scaleLabel: { display: false },
          xAxes: [{
            scaleLabel: {
              display: false,
            },

          }],
          yAxes: [{
            scaleLabel: {
              display: false,
            },
          }],
        },
        tooltips: {
          callbacks: {
            label(tooltipItem) {
              console.log(tooltipItem);
              return toEuro(tooltipItem.yLabel);
            },
          },
        },
      },
      graphData: {
        labels: dataPoint.map(point => point.date),
        datasets: [
          {
            label: false,
            fill: false,
            lineTension: 0,
            borderColor: "#333",
            borderDash: [],
            borderDashOffset: 0.0,
            pointRadius: 1,
            pointHitRadius: 10,
            data: values,
          },
        ]
      },
    };
  };

  const currencyToSymbol = currency => ({ eur: '€', usd: '$'}[currency] || currency);

  const monthlyRecuringRevenue = async () => {
    const response = await profitwell.api(key, '/v2/metrics/monthly/?plan_id=&metrics=recurring_revenue');
    const data = await response.json();

    return Object.entries(data.data).map(responseToGrapData.bind(null, false));
  }

  const lastAndCurrentWeekRevenue = async (growth = true) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const previousYear = currentYear + (currentMonth ? 0 : -1);
    const previousMonth = currentMonth + (currentMonth ? -1 : 11);

    const previousMonthData = await profitwell.api(key, `/v2/metrics/daily/?month=${previousYear}-0${previousMonth + 1}&plan_id=&metrics=recurring_revenue`);
    const currentMonthData = await profitwell.api(key, `/v2/metrics/daily/?month=${currentYear}-0${currentMonth + 1}&plan_id=&metrics=recurring_revenue`);
    const previousMonthRecurringRevenue = (await previousMonthData.json()).data.recurring_revenue;
    const currentMonthRecurringRevenue = (await currentMonthData.json()).data.recurring_revenue;

    console.log('lastAndCurrentWeekRevenue', previousMonthRecurringRevenue, currentMonthRecurringRevenue);
    const recurringRevenue = previousMonthRecurringRevenue.concat(currentMonthRecurringRevenue);
    console.log('lastAndCurrentWeekRevenue', recurringRevenue);

    const [,currentWeek] = getWeekNumber(today);
    const [,startWeek] = getWeekNumber(new Date(recurringRevenue[0].date));
    let previousValue = recurringRevenue[0].value

    const newData = recurringRevenue.reduce((data, { date, value }) => {
      const [year, week] = getWeekNumber(new Date(date));
      const growthValue = value - previousValue;
      previousValue = value;

      if (week === startWeek || week > currentWeek) return data;

      if (!data[`recurring_revenue_${year}-${week}`]) data[`recurring_revenue_${year}-${week}`] = [];
      data[`recurring_revenue_${year}-${week}`].push({ date, value: growth ? growthValue : value });

      return data;
    }, {});

    Object.keys(newData).slice(0, -3).forEach(key => { delete newData[key]; });

    return Object.entries(newData).map(responseToGrapData.bind(null, growth));
  }

  // let promise = monthlyRecuringRevenue();
  // let promise = lastAndCurrentWeekRevenue();
  let promise = Promise.all([lastAndCurrentWeekRevenue(), monthlyRecuringRevenue()]).then(([a, b]) => a.concat(b));

  let closest;

  function toEuro (num) {
    return num >= 10000 ? `${num / 1000 | 0}K ${currencyToSymbol(company.currency)}` : `${Math.round((num + Number.EPSILON) * 100) / 100} ${currencyToSymbol(company.currency)}`;
  }

  const months = 'Jan Feb Mar Apr May June July Aug Sept Oct Nov Dec'.split(' ');
  const format = date => {
    return new Date(date).toLocaleDateString();
    const year = ~~date;
    const month = Math.floor((date % 1) * 1.2);
    return `${months[month]} ${year}`;
  };
  const pc = date => {
    return 100 * (date - minx) / (max - minx);
  };
</script>

<div>
  <h2>{company.name}</h2>
  {#await promise}
    <p>...waiting</p>
  {:then result}
    <div class="result">
      {#each result as graph}
        <div class="data">
          <div class="header"><div class="title">{graph.name}</div><div class="value">{graph.value}</div></div>
          <div class="chart">
            {#if graph.type === 'bar'}
              <Bar data={graph.graphData} width={100} height={50} options={graph.options} />
            {:else}
              <Line data={graph.graphData} width={100} height={50} options={graph.options} />
            {/if}
          </div>
        </div>
      {/each}
    </div>
    {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>


<style>

  h2 {
    text-align: center;
  }

  .result {
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }

  .header {
    display: flex;
    padding-bottom: 20px;
  }

  .header .title {
    flex: 1;
  }

  .header .value {
    align-self: flex-end;
  }

  .data {
    display: flex;
    flex-direction: column;
    margin: 40px 0;
    width: 300px
  }

  .chart {
    width: 100%;
    height: 150px;
    margin: 0 0 36px 0;
  }

  input {
    font-size: inherit;
    font-family: inherit;
    padding: 0.5em;
  }

  .grid-line {
    position: relative;
    display: block;
  }

  .grid-line.horizontal {
    width: calc(100% + 2em);
    left: -2em;
    border-bottom: 1px dashed #ccc;
  }

  .grid-line span {
    position: absolute;
    left: 0;
    bottom: 2px;
    font-family: sans-serif;
    font-size: 14px;
    color: #999;
  }

  .x-label {
    position: absolute;
    width: 4em;
    left: -2em;
    bottom: -22px;
    font-family: sans-serif;
    font-size: 14px;
    color: #999;
    text-align: center;
  }

  path.data {
    stroke: rgba(0,0,0,0.2);
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 1px;
    fill: none;
  }

  .highlight {
    stroke: #ff3e00;
    fill: none;
    stroke-width: 2;
  }

  .annotation {
    position: absolute;
    white-space: nowrap;
    bottom: 1em;
    line-height: 1.2;
    background-color: rgba(255,255,255,0.9);
    padding: 0.2em 0.4em;
    border-radius: 2px;
  }

  .annotation-point {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #ff3e00;
    border-radius: 50%;
    transform: translate(-50%,-50%);
  }

  .annotation strong {
    display: block;
    font-size: 20px;
  }

  .annotation span {
    display: block;
    font-size: 14px;
  }
</style>