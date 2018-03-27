
window.onload = function () {

	var url_array = document.location.pathname.split('/');
	var room = url_array[1];

	if (room === "")
		var socket = io();
	else
		var socket = io("/" + room);

	socket.on("get id", function(data) {
		console.log(data.id);

	});

	var svg = d3.select("svg"),
	    margin = 20,
	    diameter = +svg.attr("width"),
	    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

	var color = d3.scaleLinear()
	    .domain([-1, 5])
	    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
	    .interpolate(d3.interpolateHcl);

	var pack = d3.pack()
	    .size([diameter - margin, diameter - margin])
	    .padding(2);
/*
	d3.json("nodes.json", function(error, root) {
	  if (error) throw error;
*/

	var DATA = {
	 "name": "TOPIC",
	 "children": [
		 {
			 "name": "TOPIC 2",
			 "children": [
				{"name": "3", "size": 5000},
				{"name": "4", "size": 3938}
			 ]
		 },
		 {"name": "1", "size": 3938},
		 {"name": "2", "size": 3938},
	 ]
	};

	var antiflood = 1;
	var view, focus;

	function update() {

		console.log('update');

	  root = d3.hierarchy(DATA)
	      .sum(function(d) { return d.size; })
	      .sort(function(a, b) { return b.value - a.value; });

	  focus = root;
	  var nodes = pack(root).descendants();

/*
				console.log(DATA);
				console.log(nodes);
				*/

	  var circle = g.selectAll("circle")
	    .data(nodes)
			.enter().append("circle")
	      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
				.attr('id', function(d) { return d.data.name; })
	      .style("fill", function(d) { return d.children ? color(d.depth) : null; })
	      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

	  var text = g.selectAll("text")
	    .data(nodes)
	    .enter().append("text")
	      .attr("class", "label")
	      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
	      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
	      .text(function(d) { return d.data.name; });

	  var node = g.selectAll("circle,text");

	  svg
	      .style("background", color(-1))
	      .on("click", function() { zoom(root); });

		function zoom(d) {
		  var focus0 = focus;

			focus = d;

			console.log(d.data);

			console.log("view", view);
			console.log("focus", focus);
		  var transition = d3.transition()
		      .duration(750)
		      .tween("zoom", function(d) {
		        var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
		        return function(t) { zoomTo(i(t)); };
		      });

		  transition.selectAll("text")
		    .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
		      .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
		      .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
		      .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
		}

		function zoomTo(v) {
		  var k = diameter / v[2]; view = v;
		  g.selectAll('circle,text').attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
		  g.selectAll('circle').attr("r", function(d) { return d.r * k; });
		}

		if (antiflood == 1) {
			zoomTo([focus.x, focus.y, focus.r * 2 + margin]);
			console.log("viewafter", view);
			antiflood = 2;
		}
		zoom(focus);
	}



	update();


	setTimeout(function(){
		DATA.children[0].children.push({"name": "YOUHOU", "size": 3938});

		update();
	}, 2000);






//	});



};
