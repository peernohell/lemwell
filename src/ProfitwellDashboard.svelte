<script>
  // import * as pkg from 'https://cdn.pika.dev/@sveltejs/pancake@^0.0.9';
  // import * as pkg from 'https://unpkg.com/@sveltejs/pancake@0.0.9?module';
  // import * as Pancake from '@sveletejs/pancake';

  import Line from "./svelte-chartjs/Line.svelte";
  import profitwell from './profitwell';

  // default chartjs options
  Chart.defaults.scale.gridLines.display = false;
  Chart.defaults.scale.ticks.display = false;
  Chart.defaults.global.legend.display = false;
  Chart.defaults.global.tooltips

  export let company;
  export let key;

  // override option depending of the name of the graph
  const graphOptions = graph => {
    graph.convert = a => a;

    if (graph.graphData.datasets[0].data.find(v => (v !== (v | 0)))) graph.convert = toEuro;

    return graph;
  };

  const currencyToSymbol = currency => ({ eur: '€', usd: '$'}[currency] || currency);

  let promise = profitwell.api(key, '/v2/metrics/monthly/?plan_id=&metrics=recurring_revenue').then(result => result.json()).then(r => {
    const result = Object.entries(r.data).map(([name, data]) => ({
      name: name.replace(/_/g, ' '),
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
      },
      graphData: {
        labels: data.map(point => point.date),
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
            data: data.map(point => point.value),
          },
        ]
      },
    })).map(graphOptions);
    return result;
  });

  let closest;

  function toEuro (num) {
    return num >= 10000 ? `${num / 1000 | 0}K ${currencyToSymbol(company.currency)}` : `${num} ${currencyToSymbol(company.currency)}`;
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
          <div class="header"><div class="title">{graph.name}</div><div class="value">{graph.convert(graph.graphData.datasets[0].data[graph.graphData.datasets[0].data.length - 1])}</div></div>
          <div class="chart">
            <Line data={graph.graphData} width={100} height={50} options={graph.options} />
          </div>
        </div>
      {/each}
    </div>
    {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>


<style>
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