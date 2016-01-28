/* eslint-env worker */

import Graph from 'egraph/lib/graph'
import Layouter from 'egraph/lib/layouter/sugiyama'

const layouter = new Layouter()
  .layerMargin(100)
  .vertexWidth(({d}) => d.width)
  .vertexHeight(({d}) => d.height)
  .vertexMargin(30)
  .edgeWidth(() => 3)
  .edgeMargin(5);

const layout = (graph) => {
  const positions = layouter.layout(graph);

  const vertices = [];
  for (const u of graph.vertices()) {
    const d = graph.vertex(u);
    const {text, selected, community} = d;
    const {x, y, width, height} = positions.vertices[u];
    const textWidth = width;
    const textHeight = height;
    const x0 = d.x === undefined ? x : d.x;
    const y0 = d.y === undefined ? 0 : d.y;
    vertices.push({
      u, selected, x, y, x0, y0, width, height,
      textWidth, textHeight, community, text,
      rightMargin: d.width,
    });
  }

  const enterPoints = (u, v) => {
    const uD = graph.vertex(u),
      vD = graph.vertex(v),
      ux0 = uD.x === undefined ? positions.vertices[u].x : uD.x,
      uy0 = uD.y === undefined ? 0 : uD.y,
      vx0 = vD.x === undefined ? positions.vertices[v].x : vD.x,
      vy0 = vD.y === undefined ? 0 : vD.y;
    return [[ux0, uy0], [ux0, uy0], [vx0, vy0], [vx0, vy0], [vx0, vy0], [vx0, vy0]];
  };
  const edges = [];
  for (const [u, v] of graph.edges()) {
    const d = graph.edge(u, v);
    const {upper, lower} = d;
    const {points, reversed} = positions.edges[u][v];
    while (points.length < 6) {
      points.push(points[points.length - 1]);
    }
    const points0 = d.points === undefined ? enterPoints(u, v) : d.points;
    edges.push({u, v, points, points0, reversed, upper, lower});
  }

  for (const u of graph.vertices()) {
    const {x, y} = positions.vertices[u];
    Object.assign(graph.vertex(u), {x, y});
  }
  for (const [u, v] of graph.edges()) {
    const {points} = positions.edges[u][v];
    Object.assign(graph.edge(u, v), {points});
  }

  return {vertices, edges};
};

onmessage = ({data}) => {
  const graph = new Graph();
  for (const {u, d} of data.vertices) {
    graph.addVertex(u, d);
  }
  for (const {u, v, d} of data.edges) {
    graph.addEdge(u, v, d);
  }
  postMessage(layout(graph));
};