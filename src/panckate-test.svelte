<script>

let promise = profitwell.api(key, '/v2/metrics/monthly/?plan_id=&metrics=').then(result => result.json()).then(r => {

const result = Object.entries(r.data).map(([name, data]) => {
  let x1 = +Infinity;
  let x2 = -Infinity
  let y1 = +Infinity;
  let y2 = -Infinity;

  const graph = { name };

  graph.data = data.map(point => {
    console.log({ point })
    const splitDate = point.date.split('-');
    const dateStr = `${splitDate[0]}-${splitDate[1]}-${splitDate[3] || 1}`;
    const date = new Date(dateStr)
    point.x = +date;
    point.y = point.value;
    if (point.x < x1) x1 = point.x;
    if (point.x > x2) x2 = point.x;
    if (point.y < y1) y1 = point.y;
    if (point.y > y2) y2 = point.y;

    return point;
  });

  graph.points = graph.data.map(point => {
    return {
      x: point.x,
      y: point.y,
      graph,
    };
  });

  graph.x1 = x1;
  graph.x2 = x2;
  graph.y1 = y1;
  graph.y2 = y2;
  return graph;
});
return result;
});
</script>

<Pancake.Chart x1={graph.x1} x2={graph.x2} y1={graph.y1} y2={graph.y2}>
  <Pancake.Svg>
    <Pancake.SvgLine data={graph.data} let:d>
      <path class="data" {d}></path>
    </Pancake.SvgLine>

    {#if closest}
      <Pancake.SvgLine data={graph.data} let:d>
        <path class="highlight" {d}></path>
      </Pancake.SvgLine>
    {/if}
  </Pancake.Svg>

  {#if closest}
    <Pancake.Point x={closest.x} y={closest.y}>
      <span class="annotation-point"></span>
      <div class="annotation" style="transform: translate(-{100 * ((closest.x - graph.x1) / (graph.x2 - graph.x1))}%,0)">
        <!-- <strong>{closest.country}</strong> -->
        <span>{format(closest.x)}: {toEuro(closest.y)}</span>
      </div>
    </Pancake.Point>
  {/if}

  <Quadtree data={graph.points} bind:closest/>
</Pancake.Chart>
