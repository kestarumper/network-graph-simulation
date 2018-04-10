function drawGraph(g, nodes, edges, targetId) {
    var arrE = [];

    
    for (let i = 0; i < edges.length; i++) {
      var percentage = (g.edge(edges[i]).a/g.edge(edges[i]).c*packetSize*100).toFixed(0);

      arrE.push({
        from: edges[i].v,
        to: edges[i].w,
        font: {align: 'middle'},
        label: percentage !== "NaN" ? `${percentage}%` : '',
      });
    }
  
    var arrN = [];
    for (let i = 0; i < nodes.length; i++) {
      arrN.push({
        id: nodes[i],
  
        label: `${nodes[i]}`
      });
    }
  
    var edges = new vis.DataSet(arrE);
    var nodes = new vis.DataSet(arrN);
  
    // create a network
    var container = document.getElementById(targetId);
    var data = {
      nodes: nodes,
      edges: edges
    };
    var options = {
      physics: true
    };
    var network = new vis.Network(container, data, options);
  }
  