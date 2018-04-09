

let g = new graphlib.Graph({ directed: true, multigraph: true });

for(let i = 1; i <= 20; i += 1) {
    g.setNode(`${i}`);
}

for(let i = 1; i < 20; i += 1) {
    g.setEdge(`${i}`, `${i+1}`, { h: 0.95 });
}

function connectionChance(grph, tries = 100) {
    const jsonDump = graphlib.json.write(grph);
    let graph = graphlib.json.read(jsonDump);
    let successes = 0;
    
    for(var i = 0; i < tries; i += 1) {
        graph.edges().forEach(element => {
            if( Math.random() > graph.edge(element).h ) {
                graph.removeEdge(element);
            }
        });
    
        /*
        Finds all connected components in a graph and returns an array of these components. Each component is itself an array that contains the ids of nodes in the component.
        This function takes O(|V|) time.
        */
        if(graphlib.alg.components(graph).length > 1) {
            successes++;
        }
        
        // clone
        graph = graphlib.json.read(jsonDump);
    }

    return (1 - successes/tries)*100;
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
for(var i = 0; i < 4; i += 1) {
    // g.setEdge(`${Math.floor(Math.random()*20)+1}`, `${Math.floor(Math.random()*20)+1}`, { h: .4 });
    g.setEdge(`${i+7}`,`${i+15}`, { h: .4 });
}
console.log(`C++ Graph Convergence: ${connectionChance(g)}%`);

// ================================================================================================================

function intensityMatrix(graph, min, max) {
    const nodes = graph.nodes();
    const matrix = [];
    for(var i = 0; i < nodes.length; i += 1) {
        for(var j = 0; j < nodes.length; j += 1) {
            matrix.push(Math.floor(Math.random()*(max-min))+min);
        }
    }
    return matrix;
}

function range(min, max) {
    return Math.floor(Math.random()*(max-min))+min;
}

function graphSettings(minBand, maxBand) {
    return {
        h: 0.95,
        c: range(minBand, maxBand),
        a: 0,
        weight: 1,
    }
}

function newPetersen(min1, max1) {
    const graph = new graphlib.Graph({ directed: true, multigraph: true });

    for(var i = 1; i <= 10; i += 1) {
        graph.setNode(i+'');
    }
    
    for(var i = 1; i <= 5; i += 1) {
        graph.setEdge(`${i}`, `${(i%5+1)}`, graphSettings(20000, 40000));
        // graph.setEdge(`${(i%5+1)}`, `${i}`, graphSettings(20000, 40000));

        graph.setEdge(`${i}`, `${i+5}`, graphSettings(20000, 40000));
        // graph.setEdge(`${i+5}`, `${i}`, graphSettings(20000, 40000));

        graph.setEdge(`${i+5}`, `${(i+1)%5+6}`, graphSettings(20000, 40000));
        // graph.setEdge(`${(i+1)%5+6}`, `${i+5}`, graphSettings(20000, 40000));
    }

    // +warkocz
    for(var i = 1; i <= 4; i += 1) {
        graph.setEdge(`${i}`,`${((i+1)%5+1)}`, graphSettings(20000, 40000));
    }

    return graph;
}

const petersen = newPetersen(20000, 30000);
const matrix = intensityMatrix(petersen, 50, 100);
console.log(`Petersen Graph Convergence: ${connectionChance(petersen)}%`);


function findRoute(graph, start, endpoint, stack, routes) {
    var vertice = routes[endpoint];
    if(vertice.predecessor === undefined) {
        stack.push(start);
        return stack.reverse();
    } else {
        graph.edge(vertice.predecessor, endpoint).weight += 1;
        // console.log(graph.edge(vertice.predecessor, endpoint));
        stack.push(endpoint);    
        return findRoute(graph, start, vertice.predecessor, stack, routes)
    }
}

function rateRoute(edge) {
    return petersen.edge(edge).weight;
}

function canGo(graph, route, dataStream, m) {
    for(var i = 0; i < route.length-1; i+= 1) {
        if(graph.edge(route[i], route[i+1]).c / m - graph.edge(route[i], route[i+1]).a < dataStream) {
            return false;
        }
    }
    return true;
}

var packetSize = 64;
var routess;
routess = graphlib.alg.dijkstraAll(petersen, rateRoute);
console.log(routess);

for(let i = 1; i <= petersen.nodeCount(); i += 1) {
    for(let j = 1; j <= petersen.nodeCount(); j += 1) {
        if(i == j)
        continue;
        
        // console.log(`FROM ${i} to ${j}`);
        let ds = matrix[(i-1)*petersen.nodeCount() + j];graphlib
        
        let route = findRoute(petersen, i+'', j+'', [], routess[i]);
        
        if(canGo(petersen, route, ds, packetSize)) {
            for(let k = 0; k < route.length-1; k += 1) {
                petersen.edge(route[k], route[k+1]).a += ds;
            }
        }
    }
}

drawGraph(petersen.nodes(), petersen.edges());

// console.log(petersen)

