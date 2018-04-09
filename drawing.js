function drawGraph(nodes, edges) {
    var arrE = [];
    for (let i = 0; i < edges.length; i++) {
      arrE.push({
        from: edges[i].v,
        to: edges[i].w
      });
    }
  
    var arrN = [];
    for (let i = 0; i < nodes.length; i++) {
      arrN.push({
        id: nodes[i],
        group: "myGroup",
        label: `${nodes[i]}`
      });
    }
  
    var edges = new vis.DataSet(arrE);
    var nodes = new vis.DataSet(arrN);
  
    // create a network
    var container = document.getElementById("mynetwork");
    var data = {
      nodes: nodes,
      edges: edges
    };
    var options = {
      groups: {
          myGroup: {border:{background:'blue'}, borderWidth:3}
        },
      physics: true
    };
    var network = new vis.Network(container, data, options);
  }
  