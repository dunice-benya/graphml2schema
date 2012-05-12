# make deps and package.json
# make it to be a node module

((global)=>

	XMLParser = global.XMLParser or require?('xml2js').Parser
	_ = global._ or require?('underscore')

	class Graph

		constructor: (@xml)->
			@parser = new XMLParser()
			@JSON_graph = null
			@JSONschema = null

		convert: (callback) ->
			if @JSONschema? then return callback @JSONschema
			@parser.parseString @xml, (err, res)=>
				if err then throw err
				@JSON_graph = {
					edges : {}
					nodes : {}
					keys  : {}
 				}

				# keys
				_.each res.key, (keys) =>
					_.each keys, (key) =>
						if key.id?
							@JSON_graph.keys[key.id] = {
								for : key.for
							}
							if key["attr.name"]?
								_.extend @JSON_graph.keys[key.id], {
									name : key["attr.name"]
									type : key["attr.type"]
								}
							if keys.default?
								_.extend @JSON_graph.keys[key.id], {
									default : keys.default
								}

				# nodes
				_.each res.graph.node, (node) =>
					_.each node, (nodeObj) =>
						if nodeObj.id?
							@JSON_graph.nodes[nodeObj.id] = {
								attrs         : {
									outboundEdges : {}
									inboundEdges  : {}
								}
								id            : nodeObj.id
								uniqueQuestId : nodeObj.id
								title         : "label"
								description   : ""
								type          : ""
							}
						_.each node.data, (data) =>
							if nodeObj.id?
								if Object.keys(data).length is 1
									@JSON_graph.nodes[nodeObj.id].attrs[@JSON_graph.keys[data["@"].key].name] = false
								else
									_.each data, (eachData) =>
										if eachData instanceof Object
											unless eachData.key?
#												if eachData["@"].configuration?
#													_.extend @JSON_graph.nodes[nodeObj.id], {
#														type : eachData["@"].configuration
#													}
												if eachData["y:NodeLabel"]["#"]? and nodeObj.id?
													_.extend @JSON_graph.nodes[nodeObj.id], {
														title : eachData["y:NodeLabel"]["#"]
													}
										else
											@JSON_graph.nodes[nodeObj.id].attrs[@JSON_graph.keys[data["@"].key].name] = eachData

				# edges
				_.each res.graph.edge, (edges) =>
					_.each edges, (edge) =>
						if edge.id?
							@JSON_graph.edges[edge.id] = {
								id     : edge.id
								source : edge.source
								dest   : edge.target
							}
							if Object.keys(edges["data"]).length is 3 then _.each edges["data"], (data) =>
									_.each data, (eachData) =>
										if eachData not instanceof Object
											@JSON_graph.edges[edge.id][@JSON_graph.keys[data["@"].key].name] = eachData

				# inboundEdges and outboundEdges
				_.each @JSON_graph.edges, (edge) =>
					condition = "noCondition"
					if edge.Yes?
						condition = "isYes"
					else if edge.No?
						condition = "isNo"
					_.extend @JSON_graph.nodes[edge.source].attrs.outboundEdges[edge.id] = {
						source    : edge.source
						dest      : edge.dest
						id        : edge.id
						condition : condition
					}
					_.extend @JSON_graph.nodes[edge.dest].attrs.inboundEdges[edge.id] = {
						source : edge.source
						dest   : edge.dest
						condition : condition
					}

				# making JSON schema
				@JSONschema = {
					title       : 'Some Graph'
					id          : res.graph.data[1]["#"]
					description : 'BLAH BLAH'
					properties  : {}
				}
				_.each @JSON_graph.nodes, (node) =>
					@JSONschema.properties["question_#{node.id}"] = {
						attrs         : node.attrs
						uniqueQuestId : node.id
						title         : node.title
						description   : "node id is - #{node.id}"
						type          : node.type
						links         : _.map node.attrs.outboundEdges, (edge) =>
							href      : "#question_#{edge.dest}"
							source    : edge.source
							edgeId    : edge.id
							condition : edge.condition
					}
				callback @JSONschema

	_.extend global, {Graph}

)(module?.exports or window)

