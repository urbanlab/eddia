
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
var twizzleLock = {},
    plonkLock = {};
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

	var firstRun = true;
	var view, focus;

	function update() {

		console.log('>> UPDATE');

	  root = d3.hierarchy(DATA)
	      .sum(function(d) { return d.size; })
	      .sort(function(a, b) { return b.value - a.value; });

		if (firstRun == true) {
	 		focus = root;
		}

	  var nodes = pack(root).descendants();

	  var circle = g.selectAll("circle")
	    .data(nodes)
			.enter().append("circle")
	      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
				.attr('id', function(d) { return d.data.name; })
				.style("fill", function(d) { return d.children ? color(d.depth) : null; })
	      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });
				/*
				.attr('rscale', 0)
				.transition()
				.delay(function(d) { return d.depth * 50; })
				.duration(5000)
    		.attrTween("rscale", function(d) {
					return d3.interpolate(0, 1);
				});
				*/


/*
		function plonk(path, duration) {
		  d3.select(plonkLock).transition()
		      .duration(duration)
		      .tween("style:fill", function() {
		        var i = d3.interpolateRgb("red", "green");
		        return function(t) { path.style("fill", i(t)); };
		      })
		    .transition()
		      .tween("style:fill", function() {
		        var i = d3.interpolateRgb("green", "red");
		        return function(t) { path.style("fill", i(t)); };
		      });

		  setTimeout(function() { plonk(path, duration); }, (Math.random() + 2) * duration);
		}
*/

	  var text = g.selectAll("text")
	    .data(nodes)
	    .enter().append("text")
	      .attr("class", "label")
	      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
				.attr('css-visible', function(d) { return d.parent === root ? 'true' : 'false'; })
	     // .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
	      .text(function(d) { return d.data.name; });

	  var node = g.selectAll("circle,text");

	  svg.style("background", color(-1))
	     .on("click", function() { zoom(root); });

		if (firstRun == true) {
			view = root;
		//	zoomTo([focus.x, focus.y, focus.r * 2 + margin]);
		}

		if (firstRun == true) {
			firstRun = false;
		}

		zoom(focus);
	}








	function zoom(d) {
		var focus0 = focus;
		focus = d;

		console.log('>> ZOOM');
		console.log('Focus from [', focus0.data.name, '] to [', focus.data.name,']');
		console.log('Item focused:', d.data.name);
	//	console.log('['+view[0]+','+view[1]+','+view[2]+']\r\n['+focus.x+','+focus.y+','+(focus.r * 2 + margin)+']');
/*

		var transition = d3.transition()
			 .duration(200)
			 .tween("zoom", function(d) {
				 var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
				 return function(t) { zoomTo(i(t)); };
			 });
*/
		var k = diameter / (focus.r * 2 + margin);

		g.selectAll('circle')
			.interrupt()
			.transition()
			.duration(600)
			.attr("r", function(d) { return d.r * k; })
			.attr("transform", function(d) { return "translate(" + (d.x - focus.x) * k + "," + (d.y - focus.y) * k + ")"; });


 		g.selectAll('text')
 			.transition()
 			.duration(600)
 			.attr("transform", function(d) { return "translate(" + (d.x - focus.x) * k + "," + (d.y - focus.y) * k + ")"; })
			.style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
			.on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
			.on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });

/*

		transition.selectAll("text")
		 .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
			 .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
			 .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
			 .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });

			 */

	}







	function zoomTo(v) {
		console.log('zoomTo');

		var k = diameter / v[2];

		view = v;

		// g.selectAll('circle')
		// 	.attr("r", function(d) { return (d.r) * k; });

		// g.selectAll('circle,text')
		// 	.attr("transform", function(d) { return "translate(" + ((d.x) - v[0]) * k + "," + ((d.y) - v[1]) * k + ")"; });

/*
		g.selectAll("text")
			 .each(function(d) {
			 	console.log(d.parent === focus ? d.data.name : '');
			 })
			 .filter(function(d) { return d.parent === focus })
				 .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
				 .attr('css-visible', function(d) { return d.parent === focus ? 'true' : 'false'; });
				 */
	}





	update();

	setTimeout(function(){
		DATA.children[0].children.push({"name": "YOUHOU", "size": 3938});

		update();
	}, 2000);


	setTimeout(function(){
		DATA.children[0].children[0].size = 6000;

		update();
	}, 6000);






//	});



};
