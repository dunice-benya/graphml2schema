(function() {
  var _this = this;

  (function(global) {
    var Graph, XMLParser, _;
    XMLParser = global.XMLParser || (typeof require === "function" ? require('xml2js').Parser : void 0);
    _ = global._ || (typeof require === "function" ? require('underscore') : void 0);
    Graph = (function() {

      function Graph(xml) {
        this.xml = xml;
        this.parser = new XMLParser();
        this.JSON_graph = null;
        this.JSONschema = null;
      }

      Graph.prototype.convert = function(callback) {
        var _this = this;
        if (this.JSONschema != null) return callback(this.JSONschema);
        return this.parser.parseString(this.xml, function(err, res) {
          if (err) throw err;
          _this.JSON_graph = {
            edges: {},
            nodes: {},
            keys: {}
          };
          _.each(res.key, function(keys) {
            return _.each(keys, function(key) {
              if (key.id != null) {
                _this.JSON_graph.keys[key.id] = {
                  "for": key["for"]
                };
                if (key["attr.name"] != null) {
                  _.extend(_this.JSON_graph.keys[key.id], {
                    name: key["attr.name"],
                    type: key["attr.type"]
                  });
                }
                if (keys["default"] != null) {
                  return _.extend(_this.JSON_graph.keys[key.id], {
                    "default": keys["default"]
                  });
                }
              }
            });
          });
          _.each(res.graph.node, function(node) {
            return _.each(node, function(nodeObj) {
              if (nodeObj.id != null) {
                _this.JSON_graph.nodes[nodeObj.id] = {
                  attrs: {
                    outboundEdges: {},
                    inboundEdges: {}
                  },
                  id: nodeObj.id,
                  uniqueQuestId: nodeObj.id,
                  title: "label",
                  description: "",
                  type: ""
                };
              }
              return _.each(node.data, function(data) {
                if (nodeObj.id != null) {
                  if (Object.keys(data).length === 1) {
                    return _this.JSON_graph.nodes[nodeObj.id].attrs[_this.JSON_graph.keys[data["@"].key].name] = false;
                  } else {
                    return _.each(data, function(eachData) {
                      if (eachData instanceof Object) {
                        if (eachData.key == null) {
                          if ((eachData["y:NodeLabel"]["#"] != null) && (nodeObj.id != null)) {
                            return _.extend(_this.JSON_graph.nodes[nodeObj.id], {
                              title: eachData["y:NodeLabel"]["#"]
                            });
                          }
                        }
                      } else {
                        return _this.JSON_graph.nodes[nodeObj.id].attrs[_this.JSON_graph.keys[data["@"].key].name] = eachData;
                      }
                    });
                  }
                }
              });
            });
          });
          _.each(res.graph.edge, function(edges) {
            return _.each(edges, function(edge) {
              if (edge.id != null) {
                _this.JSON_graph.edges[edge.id] = {
                  id: edge.id,
                  source: edge.source,
                  dest: edge.target
                };
                if (Object.keys(edges["data"]).length === 3) {
                  return _.each(edges["data"], function(data) {
                    return _.each(data, function(eachData) {
                      if (!(eachData instanceof Object)) {
                        return _this.JSON_graph.edges[edge.id][_this.JSON_graph.keys[data["@"].key].name] = eachData;
                      }
                    });
                  });
                }
              }
            });
          });
          _.each(_this.JSON_graph.edges, function(edge) {
            var condition;
            condition = "noCondition";
            if (edge.Yes != null) {
              condition = "isYes";
            } else if (edge.No != null) {
              condition = "isNo";
            }
            _.extend(_this.JSON_graph.nodes[edge.source].attrs.outboundEdges[edge.id] = {
              source: edge.source,
              dest: edge.dest,
              id: edge.id,
              condition: condition
            });
            return _.extend(_this.JSON_graph.nodes[edge.dest].attrs.inboundEdges[edge.id] = {
              source: edge.source,
              dest: edge.dest,
              condition: condition
            });
          });
          _this.JSONschema = {
            title: 'Some Graph',
            id: res.graph.data[1]["#"],
            description: 'BLAH BLAH',
            properties: {}
          };
          _.each(_this.JSON_graph.nodes, function(node) {
            return _this.JSONschema.properties["question_" + node.id] = {
              attrs: node.attrs,
              uniqueQuestId: node.id,
              title: node.title,
              description: "node id is - " + node.id,
              type: node.type,
              links: _.map(node.attrs.outboundEdges, function(edge) {
                return {
                  href: "#question_" + edge.dest,
                  source: edge.source,
                  edgeId: edge.id,
                  condition: edge.condition
                };
              })
            };
          });
          return callback(_this.JSONschema);
        });
      };

      return Graph;

    })();
    return _.extend(global, {
      Graph: Graph
    });
  })((typeof module !== "undefined" && module !== null ? module.exports : void 0) || window);

}).call(this);
