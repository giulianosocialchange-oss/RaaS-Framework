import { calculateArchWeight } from "@/services/graph/calculate/weight";
import type { WeightedPath } from "@/services/graph/types";
import type { TerrainPolygon } from "@/services/terrain/types";
import { type Coordinate } from "ol/coordinate";

export function calculatePathAStarFromTop(
  graph: Coordinate[][],
  terrains: TerrainPolygon[]
) {
  // Parto dal primo nodo
  const firstNode = graph.at(0)![0];
  const lastNode = graph.at(-1)![0];
  const crossedNodes: WeightedPath = {
    distance: 0,
    duration: 0,
    nodes: [firstNode],
    archs: [],
  };

  console.log("CalculatePathASTarFromTop----START")

  // Assegno valori dinamici
  let currentNode: Coordinate = firstNode;
  const goalNode: Coordinate = lastNode;
  let prevNode: Coordinate;
  let currentIndex = Math.floor(graph[1].length / 2);
  let currentLevel = 1;


  console.log("firstNode [%0]", firstNode);
  console.log("goalNode [%0]", lastNode);
  console.log("goalNode [%0]", terrains);

  // Concludo al raggiungimento del goal
  while (currentNode !== goalNode) {
    console.log("Ciclo currentNode [%0]", currentNode);
    // Definisco i valori
    const nextLevel = currentLevel + 1;
    const isLast = graph[nextLevel].includes(goalNode);

    console.log("getCloserNodes");
    // Recupero nodi raggiungibili
    const closerNodes = getCloserNodes(graph, currentLevel, currentIndex);
    console.log("getCloserNodes.length [%0]", closerNodes.length);
    const nextNodes = isLast
      ? [goalNode]
      : closerNodes.reduce((acc: Coordinate[], nodes) => {
        acc.push(
          ...(nodes.filter(
            (node) => node && node !== prevNode
          ) as Coordinate[])
        );
        return acc;
      }, []);

    console.log("getBestNode");
    // Recupero miglior nodo
    const nextBest = getBestNode(nextNodes, currentNode, goalNode, terrains);
    const [nextNode] = nextBest.nodes;
    const [nextArch] = nextBest.archs;

    // Appendo migliori nodi al grafo
    crossedNodes.distance += nextArch.distance;
    crossedNodes.duration += nextArch.duration;
    crossedNodes.nodes.push(nextNode);
    crossedNodes.archs.push(nextArch);

    // Aggiorno i valori dinamici
    prevNode = currentNode;
    currentNode = nextNode;
    closerNodes.forEach((nodeLevel, levelIndex) => {
      const nodeIndex = nodeLevel.findIndex((node) => node === nextNode);
      if (nodeIndex >= 0) {
        // Avanzo di livello
        if (levelIndex === 0) currentLevel -= 1;
        else if (levelIndex === 2) currentLevel += 1;
        // Muovo orizzontalmente
        currentIndex += nodeIndex - 1;
      }
    });
  }

  // Restituisco il grafo
  return {
    distance: crossedNodes.distance,
    duration: crossedNodes.duration,
    nodes: crossedNodes.nodes,
    archs: crossedNodes.archs,
  };
}

function getBestNode(
  nodes: Coordinate[],
  fromNode: Coordinate,
  toNode: Coordinate,
  terrains: TerrainPolygon[]
) {

  console.log("getBestNode nodes[%c] fromNode[%c] toNode[%c] terrains.length[%c]", nodes, fromNode, toNode, terrains.length);
  return nodes.reduce((acc: WeightedPath | null, node) => {
    // Calcolo la percorrenza fino al nodo
    const fromArch = calculateArchWeight(fromNode, node, terrains);
    // Stimo la percorrenza fino all'ultimo nodo (ignorando il terreno)
    const toArch =
      node === toNode
        ? {
          fromNode: toNode,
          toNode,
          descending: false,
          distance: 0,
          duration: 0,
          elevation: 0,
          slope: 0,
          speed: 0,
          terrain: [],
        }
        : calculateArchWeight(node, toNode, terrains);

    // Scelgo il nodo con minor tempo di percorrenza
    const duration = fromArch.duration + toArch.duration;

    if (!acc || acc.duration > duration) {
      return {
        distance: fromArch.distance + toArch.distance,
        duration: fromArch.duration + toArch.duration,
        nodes: [node],
        archs: [fromArch, toArch],
      };
    } else {
      return acc;
    }
  }, null)!;
}

function getCloserNodes(
  graph: Coordinate[][],
  currentLevel: number,
  currentIndex: number,
  reverse: boolean = false
) {
  const prevLevelNodes: Coordinate[] | undefined = graph[currentLevel - 1];
  const currLevelNodes: Coordinate[] = graph[currentLevel];
  const nextLevelNodes: Coordinate[] | undefined = graph[currentLevel + 1];

  // Nodi del livello corrente
  const closerNodes = [
    [
      currLevelNodes[currentIndex - 1],
      undefined,
      currLevelNodes[currentIndex + 1],
    ],
  ];

  // Nodi del livello precedente
  closerNodes.unshift(
    reverse && prevLevelNodes
      ? [
        prevLevelNodes[currentIndex - 1],
        prevLevelNodes[currentIndex],
        prevLevelNodes[currentIndex + 1],
      ]
      : []
  );
  // Nodi del livello successivo
  closerNodes.push(
    !reverse && nextLevelNodes
      ? [
        nextLevelNodes[currentIndex - 1],
        nextLevelNodes[currentIndex],
        nextLevelNodes[currentIndex + 1],
      ]
      : []
  );

  return closerNodes;
}
