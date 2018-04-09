

let g = new graphlib.Graph();

for (let i = 1; i <= 20; i += 1) {
    g.setNode(`${i}`);
}

for (let i = 1; i < 20; i += 1) {
    g.setEdge(`${i}`, `${i + 1}`, { h: 0.95 });
}

function connectionChance(grph, tries = 100) {
    const jsonDump = graphlib.json.write(grph);
    let graph = graphlib.json.read(jsonDump);
    let successes = 0;

    for (var i = 0; i < tries; i += 1) {
        graph.edges().forEach(element => {
            if (Math.random() > graph.edge(element).h) {
                graph.removeEdge(element);
            }
        });

        /*
        Finds all connected components in a graph and returns an array of these components. Each component is itself an array that contains the ids of nodes in the component.
        This function takes O(|V|) time.
        */
        if (graphlib.alg.components(graph).length > 1) {
            successes++;
        }

        // clone
        graph = graphlib.json.read(jsonDump);
    }

    return (1 - successes / tries) * 100;
}

/*
Napisz program szacujący niezawodność (rozumianą jako prawdopodobieństwo nierozspójnienia) takiej sieci w dowolnym interwale.
*/
console.log(`L Graph Convergence: ${connectionChance(g)}%`);

/*
Jak zmieni się niezawodność tej sieci po dodaniu krawędzi e(1,20) takiej, że h(e(1,20))=0.95
*/
g.setEdge('20', '1', { h: .95 });
console.log(`C Graph Convergence: ${connectionChance(g)}%`);

/*
A jak zmieni się niezawodność tej sieci gdy dodatkowo dodamy jeszcze krawędzie e(1,10) oraz e(5,15) takie, że: h(e(1,10))=0.8, a h(e(5,15))=0.7.
*/
g.setEdge('1', '10', { h: .8 });
g.setEdge('5', '15', { h: .7 });
console.log(`C+ Graph Convergence: ${connectionChance(g)}%`);
/*
A jak zmieni się niezawodność tej sieci gdy dodatkowo dodamy jeszcze 4 krawedzie pomiedzy losowymi wierzchołkami o h=0.4.
*/
for (var i = 0; i < 4; i += 1) {
    // g.setEdge(`${Math.floor(Math.random()*20)+1}`, `${Math.floor(Math.random()*20)+1}`, { h: .4 });
    g.setEdge(`${i + 7}`, `${i + 15}`, { h: .4 });
}
console.log(`C++ Graph Convergence: ${connectionChance(g)}%`);

// ================================================================================================================

function intensityMatrix(graph, min, max) {
    const nodes = graph.nodes();
    const matrix = [];
    for (var i = 0; i < nodes.length; i += 1) {
        for (var j = 0; j < nodes.length; j += 1) {
            matrix.push(Math.floor(Math.random() * (max - min)) + min);
        }
    }
    return matrix;
}

function range(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function graphSettings(minBand, maxBand, chance) {
    return {
        h: chance,
        c: range(minBand, maxBand),
        a: 0,
        weight: 1,
    }
}

function newPetersen(min1, max1, chance) {
    const graph = new graphlib.Graph({ directed: false, multigraph: false });

    for (var i = 1; i <= 10; i += 1) {
        graph.setNode(i + '');
    }

    for (var i = 1; i <= 5; i += 1) {
        var setting = graphSettings(min1, max1, chance);
        graph.setEdge(`${i}`, `${(i % 5 + 1)}`, setting);
        // graph.setEdge(`${(i%5+1)}`, `${i}`, setting);

        setting = graphSettings(min1, max1, chance);
        graph.setEdge(`${i}`, `${i + 5}`, setting);
        // graph.setEdge(`${i+5}`, `${i}`, setting);

        setting = graphSettings(min1, max1, chance);
        graph.setEdge(`${i + 5}`, `${(i + 1) % 5 + 6}`, setting);
        // graph.setEdge(`${(i+1)%5+6}`, `${i+5}`, setting);
    }

    // +warkocz
    for (var i = 1; i <= 4; i += 1) {
        setting = graphSettings(min1, max1, chance);
        graph.setEdge(`${i}`, `${((i + 1) % 5 + 1)}`, setting);
        // graph.setEdge(`${((i+1)%5+1)}`, `${i}`, setting);
    }

    return graph;
}

const petersen = newPetersen(20000, 40000, 0.95);
const matrix = intensityMatrix(petersen, 10, 50);
console.log(`Petersen Graph Convergence: ${connectionChance(petersen)}%`);


function findRoute(graph, start, endpoint, stack, routes) {
    var vertice = routes[endpoint];
    if (vertice.predecessor === undefined) {
        stack.push(start);
        return stack.reverse();
    } else {
        graph.edge(vertice.predecessor, endpoint).weight += 1;
        stack.push(endpoint);
        return findRoute(graph, start, vertice.predecessor, stack, routes)
    }
}
//rating edge
//check that it is possible to send package this way
function canGo(graph, route, dataStream, m) {
    for (var i = 0; i < route.length - 1; i += 1) {
        if (graph.edge(route[i], route[i + 1]).c / m - graph.edge(route[i], route[i + 1]).a < dataStream) {
            return false;
        }
    }
    return true;
}

var packetSize = 200;

function simulate(graph, mtx, pSize) {
    function rateEdge(edge) {
        return graph.edge(edge).weight;
    }

    var routess;
    routess = graphlib.alg.dijkstraAll(graph, rateEdge, function (v) {
        return graph.nodeEdges(v);
    });

    
    for (let i = 1; i <= graph.nodeCount(); i += 1) {
        for (let j = 1; j <= graph.nodeCount(); j += 1) {
            // prevent sent to ourselves
            if (i == j)
                continue;
    
            for (var l = 0; l < 10; l += 1) {
                let ds = mtx[(i - 1) * graph.nodeCount() + j];
                //finding the shorthes path from A to B
                let route = findRoute(graph, i + '', j + '', [], routess[i]);
                // checking that we can send packadge this way
                if (canGo(graph, route, ds, pSize)) {
                    // set a for founds route 
                    for (let k = 0; k < route.length - 1; k += 1) {
                        graph.edge(route[k], route[k + 1]).a += ds;
                    }
                    //clearing weights
                    graph.edges().forEach((e) => {
                        graph.edge(e).weight = 1;
                    });
                    break;
                }
                // if(l === 9){
                //     console.log("rejected");
                // }
            }
    
        }
    }

}

simulate(petersen, matrix, packetSize);
drawGraph(petersen, petersen.nodes(), petersen.edges());

//===================================================================

function SUM_e(m, graph) {
    var result = 0;
    graph.edges().forEach(e => {
        var a = graph.edge(e).a
        var c = graph.edge(e).c
        
        result += (a / (c / m - a));
    });
    return result;
}

function T(matrix, sum_e) {
    var G = matrix.reduce((prev, curr, index, arr) => {
        return prev + curr;
    });
    
    return 1 / G * sum_e;
}

var tMax = T(matrix, SUM_e(packetSize, petersen));
console.log(tMax);

//===================================================================
function test(tries){
    var graphh = newPetersen(20000, 40000, 0.7);
    var successes = 0;
    const jsonDumpp = graphlib.json.write(graphh);
    for (var i = 0; i < tries; i++) {
    
        //zrobic kopie grafu
        graphh = graphlib.json.read(jsonDumpp);
        //usunac krawedzzie
        graphh.edges().forEach(element => {
            if (Math.random() > graphh.edge(element).h) {
                graphh.removeEdge(element);
            }
        });
    
        //sprawdzic czy jest spojny
        if (graphlib.alg.components(graphh).length > 1) {
            //jesli nie to continue
            continue;
        }
    
        simulate(graphh,matrix,packetSize);
        if ( tMax < T(matrix, SUM_e(packetSize, graphh))) {
            successes +=1;
        }
    
    
        //jesli tak test macierzy dla tego grafu
        
    
    
    }

    return successes/tries;
}

console.log(test(1000));
