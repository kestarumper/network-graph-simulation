const Graphlib = require('@dagrejs/graphlib');

let g = new Graphlib.Graph();

for(let i = 1; i <= 20; i += 1) {
    g.setNode(`${i}`);
}

for(let i = 1; i < 20; i += 1) {
    g.setEdge(`${i}`, `${i+1}`, { h: 0.95 });
}

function connectionChance(grph, tries = 1000) {
    const jsonDump = Graphlib.json.write(grph);
    let graph = Graphlib.json.read(jsonDump);
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
        if(Graphlib.alg.components(graph).length > 1) {
            successes++;
        }
        
        // clone
        graph = Graphlib.json.read(jsonDump);
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
    g.setEdge(`${Math.floor(Math.random()*20)+1}`, `${Math.floor(Math.random()*20)+1}`, { h: .4 });
}
console.log(`C++ Graph Convergence: ${connectionChance(g)}%`);

// ================================================================================================================

function intensityMatrix(graph) {
    const nodes = graph.nodes();
    const matrix = [];
    for(var i = 0; i < nodes.length; i += 1) {
        for(var j = 0; j < nodes.length; j += 1) {
            matrix.push(Math.floor(Math.random()*1000)+500);
        }
    }
    return matrix;
}

function intensity(min, max) {
    return Math.floor(Math.random()*(max-min))+min;
}

function bandwidth(min, max) {
    return Math.floor(Math.random()*(max-min))+min;
}

function graphSettings(minBand, maxBand, minIntense, maxIntense) {
    return {
        h: 0.95,
        c: bandwidth(minBand, maxBand),
        a: 0,
        weight: 1,
    }
}

function newPetersen(min1, max1, min2, max2) {
    const graph = new Graphlib.Graph();
    
    for(var i = 1; i <= 5; i += 1) {
        graph.setEdge(`${i}`,`${(i%5+1)}`, graphSettings(min1, max1, min2, max2));
        graph.setEdge(`${i}`,`${i+5}`, graphSettings(min1, max1, min2, max2));
    }

    // // +warkocz
    // for(var i = 1; i <= 2; i += 1) {
    //     //zle tworzymy edge 0 z czyms !
    //     graph.setEdge(`${i}`,`${(i+2)%5}`, graphSettings(min1, max1, min2, max2));
    // }
    
    graph.setEdge(`6`,`8`, graphSettings(min1, max1, min2, max2));
    graph.setEdge(`6`,`9`, graphSettings(min1, max1, min2, max2));
    graph.setEdge(`7`,`9`, graphSettings(min1, max1, min2, max2));
    graph.setEdge(`7`,`10`, graphSettings(min1, max1, min2, max2));
    graph.setEdge(`8`,`10`, graphSettings(min1, max1, min2, max2));

    return graph;
}

const petersen = newPetersen(20000, 30000, 500, 600);
const matrix = intensityMatrix(petersen);
console.log(`Petersen Graph Convergence: ${connectionChance(petersen)}%`);

function findRoute(graph, start, endpoint, stack, routes) {
    var vertice = routes[endpoint];
    if(vertice.predecessor === undefined) {
        stack.push(start);
        return stack.reverse();
    } else {
        graph.edge(vertice.predecessor, endpoint).weight++;
        // console.log(graph.edge(vertice.predecessor, endpoint));
        stack.push(endpoint);    
        return findRoute(graph, start, vertice.predecessor, stack, routes)
    }
}

function rateRoute(edge) {
    return petersen.edge(edge).weight;
}

function canGo(graph, route, packetSize) {
    for(var i = 0; i < route.length-1; i+= 1) {
        if(graph.edge(route[i], route[i+1]).c - graph.edge(route[i], route[i+1]).a > packetSize) {
            return true;
        }
    }
    return false;
}

var routess;
for(let i = 1; i <= petersen.nodes().length; i += 1) {
    for(let j = 1; j <= petersen.nodes().length; j += 1) {
        if(i == j)
            continue;

        routess = Graphlib.alg.dijkstra(petersen, i+'', rateRoute);

        let route = findRoute(petersen, i, j, [], routess);
        // console.log(petersen);
        
        if(canGo(petersen, route, matrix[i*petersen.nodes().length + j])) {
            for(let k = 0; k < route.length-1; k += 1) {
                petersen.edge(route[k], route[k+1]).a += matrix[i*petersen.nodes().length + j];
            }
        }
    }
}

