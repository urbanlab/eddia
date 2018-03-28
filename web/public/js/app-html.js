
var DOM_screen = $('.screen'),
    DOM_screenBackground = $('.screen-background'),
    screenW = DOM_screen.width(),
    screenH = DOM_screen.height();

var DATA;
// Si tu veux utiliser les DATA en dur comme ca
// Decommente ca

DATA = {
 "name": "Retard au travail",
 "children": [
	 {
		 "name": "Transports",
		 "children": [
			{"name": "Mot lié à Transport"},
			{"name": "Autre mot lié à Transport"},
			{"name": "Encore un mot lié à Transport"}
		 ]
	 },
	 {
		 "name": "Imprévus externes",
		 "children": [
			{"name": "Mot lié à Imprévus externes"},
			{"name": "Autre mot lié à Imprévus externes"}
		 ]
	 },
	 {
		 "name": "Imprévus personnels",
		 "children": [
			{"name": "Mot lié à Imprévus personnels"},
			{"name": "Autre mot lié à Imprévus personnels"},
			{"name": "Tiens, un mot lié à Imprévus personnels"},
			{"name": "Nouveau mot lié à Imprévus personnels"},
		 ]
	 },
 ]
};

var svgPaths = [
	'M49.5-16.2c-0.2-1.1-0.6-2.2-0.9-3.3c0-0.1,0-0.3-0.1-0.4c-0.2-0.7-0.5-1.4-0.7-2c-0.2-0.4-0.4-0.8-0.6-1.2 c-1.3-2.7-3.2-5-5.6-6.8c-2.6-2-13.5-9.7-17-10.9c-2.5-0.8-4.9-1.8-7.3-2.9c-3-1.4-5.9-2.7-8.9-4c-3.8-1.6-7.8-2.4-12-2.2 c-2.3,0.2-4.5,0.6-6.6,1.2c-0.9,0.3-1.8,0.6-2.8,0.9c-0.1,0-0.2,0-0.3,0c-1.1,0.4-2.2,0.8-3.2,1.2c-0.6,0.2-1.1,0.5-1.7,0.7 c-2.9,1.1-5.7,2.3-8.5,3.7c-5.2,2.8-9.3,6.8-12.1,12c-2,3.7-3.7,7.6-5.5,11.4c-1.5,3.2-2.8,6.4-3.8,9.8c-1.2,4.1-2,8.2-1.7,12.5 c0.2,3.4,1,6.6,2.3,9.7c3,7.1,8.1,12.2,14.6,16.2c3.3,2,6.8,3.8,10.3,5.4c4.7,2.1,9.1,4.7,13.6,7.1c4,2.2,8.1,4.3,12.4,5.9 c3.4,1.2,6.9,2.1,10.6,2.1c2,0,4-0.2,6-0.8c0.1,0,0.2,0,0.2,0c0.5-0.2,1-0.4,1.5-0.5c0.3-0.2,0.7-0.3,1-0.5c4.1-1.9,7.2-4.9,9.9-8.5 c2.4-3.2,4.4-6.6,6.1-10.3c1.9-4,3.7-8.1,5.5-12.2c1.3-2.8,2.6-5.6,3.8-8.5C49.8,4.6,50.6-11.3,49.5-16.2z',
	'M48.7-31.6c-0.7-2.1-1.6-4-2.9-5.8c0-0.1-0.1-0.2-0.1-0.2c-0.4-0.5-0.7-0.9-1.1-1.4c-0.3-0.3-0.6-0.6-0.8-0.9 c-3.4-3.5-7.5-5.7-12.1-7.3c-4.1-1.4-8.3-2.3-12.6-2.8c-4.8-0.6-9.6-1-14.4-1.5c-3.3-0.3-6.7-0.7-10-1c-4.9-0.4-9.9-0.3-14.8,0.4 c-5.4,0.8-10.5,2.6-15.2,5.4c-1,0.6-2,1.3-3.1,2c-0.1,0.1-0.3,0.1-0.4,0.2c-0.6,0.5-1.2,1-1.9,1.5c-0.4,0.3-0.7,0.7-1.1,1 c-2.4,2.3-4,5-5.1,8.1c-1.1,3.3-1.6,6.8-1.7,10.3c-0.1,4,0,8,0,12c0,2.8-0.2,5.7-0.5,8.5c-0.4,3.5-0.8,7-1,10.5 c-0.3,4.5,0.2,8.9,1.9,13.1c0.9,2.3,2.1,4.4,3.5,6.4c0.6,0.9,1.2,1.7,1.8,2.5c0.1,0.1,0.1,0.2,0.1,0.3c0.8,1,1.5,1.9,2.3,2.9 c0.4,0.5,0.9,1,1.3,1.5c2.1,2.6,4.3,5.1,6.7,7.4c4.6,4.4,10.1,7.3,16.4,8.3c4.5,0.7,9.1,1.2,13.6,1.8c3.8,0.4,7.6,0.7,11.4,0.6 c4.6-0.1,9.1-0.8,13.4-2.5c3.4-1.3,6.4-3.3,9.2-5.7c6.3-5.5,9.8-12.5,11.6-20.5c1-4.1,1.6-8.3,2.1-12.4c0.6-5.5,1.7-10.9,2.7-16.4 c0.9-4.9,1.7-9.8,1.8-14.7C50.2-23.9,49.9-27.8,48.7-31.6z',
	'M49.9,10.4c-0.4-3.9-1.3-7.8-2.6-11.5c-1.4-4.2-2.9-8.3-4.3-12.5c-1-2.9-2-5.8-3-8.7c-1.6-4.2-3.5-8.3-6-12 c-2.8-4.1-6.2-7.7-10.3-10.5c-0.9-0.6-1.9-1.2-2.8-1.8c-0.1-0.1-0.2-0.2-0.3-0.2c-0.6-0.3-1.3-0.6-1.9-1c-0.4-0.2-0.8-0.3-1.3-0.5 c-2.8-1.1-5.7-1.4-8.7-1.1C5.3-49,2.3-48-0.7-46.7c-3.3,1.5-6.6,3.1-10,4.6c-2.3,1.1-4.7,2.1-7.2,2.9c-3.1,1-6.1,2.1-9.1,3.2 c-3.8,1.5-7.3,3.6-10.1,6.6c-1.5,1.6-2.8,3.4-3.9,5.3c-0.5,0.8-0.9,1.7-1.4,2.5c0,0.1-0.1,0.1-0.2,0.2c-0.5,1-1,2-1.5,3 c-0.3,0.6-0.5,1.1-0.8,1.7c-1.3,2.7-2.5,5.5-3.5,8.4C-50.2-2.6-50.4,3-48.8,8.7c1.1,4,2.5,8,3.8,11.9c1.1,3.3,2.4,6.5,3.9,9.6 c1.9,3.8,4.2,7.2,7.3,10.1c2.4,2.3,5.2,4.1,8.3,5.4c7,3.1,14.1,3.3,21.5,1.7c3.8-0.8,7.5-1.9,11.1-3.1c4.8-1.6,9.7-2.8,14.6-4.1 c4.4-1.2,8.7-2.4,12.9-4.2c3.3-1.4,6.4-3.2,9-5.6c1.5-1.4,2.7-2.9,3.7-4.6c0-0.1,0.1-0.1,0.2-0.2c0.2-0.5,0.5-0.9,0.7-1.4 c0.1-0.3,0.3-0.7,0.4-1C50.1,19.1,50.3,14.8,49.9,10.4z'
];


window.onload = function () {

	var url_array = document.location.pathname.split('/');
	var room = url_array[1];
	var socket;
	var once = 1;

	if (room === "")
		socket = io();
	else
		socket = io("/" + room);

	socket.on("get id", function(data) {
		console.log(data.id);
	});
/*
	// Commente ca
	socket.on("update data", function(data) {
		console.log("UPDATEDATA");
		DATA = data;
	});

	// Et ca
	socket.emit("get data");

	// Et ca
	socket.on("get data", function(data) {
		DATA = data;
		start();
	});
	*/

	// Decommente ca
	 init();
}

function init() {
  DOM_screen.attr('data-view','topic');

  DOM_screenBackground.on('click', function(e){
    DOM_screen.attr('data-view','topic');
    updateView();
  });

  createBubble('topic',{
    name: DATA.name
  });

  createBubble('interest',{
    name: 'Transports'
  });

  createBubble('interest',{
    name: 'Imprévus externes'
  });

  createBubble('interest',{
    name: 'Imprévus internes'
  });

setTimeout(function(){
  changeBubbleSize('inc',{
    type: 'interest',
    name: 'Transports'
  });
},1000);
}

function changeBubbleSize(mode, d) {
  var changeDiff = .1;
  var bubble = $('.bubble[data-type="'+d.type+'"][data-name="'+d.name+'"]');
  var newScale;

  if (mode == 'inc') {
    newScale = bubble.data('scale') + changeDiff;
  }
  if (mode == 'dec') {
    newScale = bubble.data('scale') - changeDiff;
  }

  bubble.find('.bubble-scale').css({
    transform: 'scale('+newScale+')'
  });
}

function createBubble(_type, d) {
  var type = _type;

  var DOM_bubble = $('<div/>')
    .addClass('bubble bubble--'+type)
    .attr('data-name', d.name)
    .attr('data-type', type)
    .data('scale', 1)
    .on('click', function(){
      DOM_screen.attr('data-view',type);

      if (type == 'topic') {
        $('.bubble--interest').removeClass('current');
        DOM_screen.attr('data-view','topic');
      }

      if (type == 'interest') {
        $('.bubble--interest').removeClass('current');
        $(this).addClass('current');
        DOM_screen.attr('data-view','interest');
      }

      updateView();
    });

  var DOM_bubbleContainer = $('<div/>')
    .addClass('bubble-container');

  var DOM_bubbleScale = $('<div/>')
    .addClass('bubble-scale');

  var DOM_bubbleBackground = $('<div/>')
    .addClass('bubble-background');

  var DOM_bubbleInner = $('<div/>')
    .addClass('bubble-inner')
    .text(d.name);


  DOM_bubbleScale
    .append(DOM_bubbleBackground)
    .append(DOM_bubbleInner);

  DOM_bubbleContainer
    .append(DOM_bubbleScale);

  DOM_bubble
    .append(DOM_bubbleContainer)
    .appendTo($('.layer--'+type));

  setTimeout(function(){
    DOM_bubble
      .addClass('visible')

    updateView();
  });
}

function updateView() {
  console.log('updateView');
  var view = DOM_screen.attr('data-view');

  if (view == 'topic') {
    setPositionOfInterestBubblesInTopicView();
  }

  if (view == 'interest') {
    setPositionOfInterestBubblesInInterestView();
  }
}

function setPositionOfInterestBubblesInInterestView() {
  console.log('setPositionOfInterestBubblesInInterestView');

  var radius = 850;
  var nbInterestBubbles = $('.bubble--interest').length;
  var angleOffset = 20;
  var angleMin = 360 * 0.0174532925 / nbInterestBubbles;

  for (var i = 0; i < nbInterestBubbles; i++) {
    var bubble = $('.bubble--interest').eq(i);

    if (bubble.hasClass('current')) {
    } else {
      bubble.css({
        transform: 'translate(' + (radius * Math.cos(angleMin * i + angleOffset) + screenW / 2) + 'px, ' + (radius * Math.sin(angleMin * i + angleOffset) + screenH / 2) + 'px)'
      });
    }
  }
}

function setPositionOfInterestBubblesInTopicView() {
  var radius = 350;
  var nbInterestBubbles = $('.bubble--interest').length;
  var angleOffset = 20;
  var angleMin = 360 * 0.0174532925 / nbInterestBubbles;

  for (var i = 0; i < nbInterestBubbles; i++) {
    $('.bubble--interest').eq(i).css({
      transform: 'translate(' + (radius * Math.cos(angleMin * i + angleOffset) + screenW / 2) + 'px, ' + (radius * Math.sin(angleMin * i + angleOffset) + screenH / 2) + 'px)'
    });
  }
}

function createInterestBubble(d) {
  var DOM_bubble = $('<div/>')
    .addClass('bubble bubble--interest')
    .on('click', function(){
      $('.bubble--interest').removeClass('current');
      $(this).addClass('current');
      DOM_screen.attr('data-view','interest');
    });

  var DOM_bubbleInner = $('<div/>')
    .addClass('bubble-inner')
    .text(d.name);

  DOM_bubble
    .append(DOM_bubbleInner)
    .appendTo(DOM_screen);
}




function start() {
	var svg = d3.select("svg"),
	    margin = 100,
	    diameter = +svg.attr("height"),
	    g = svg.append("g").attr("transform", "translate(" + svg.attr("width") / 2 + "," + diameter / 2 + ")");



	var color = d3.scaleLinear()
	    .domain([-1, 5])
	    .range(["rgb(56,64,100)", "rgb(80,230,200)"])
	    .interpolate(d3.interpolateHcl);

	var pack = d3.pack()
	    .size([diameter - margin, diameter - margin])
	    .padding(30);



	svg.style("background", color(-1))
		 .on("click", function() { zoom(root); });
/*
	d3.json("nodes.json", function(error, root) {
	  if (error) throw error;
*/
/*
	var DATA = {
	 "name": "TOPIC",
	 "children": [
		 {
			 "name": "CAT 1",
			 "children": [
				{"name": "3", "size": 5000},
				{"name": "4", "size": 3938},
 				{"name": "3", "size": 5000},
 				{"name": "4", "size": 3938},
				{"name": "4", "size": 3938},
 				{"name": "3", "size": 5000},
 				{"name": "4", "size": 3938},
				{"name": "4", "size": 3938},
 				{"name": "3", "size": 5000},
 				{"name": "4", "size": 3938},
			 ]
		 },
		 {
			 "name": "CAT 2",
			 "children": [
				{"name": "3", "size": 5000},
				{"name": "4", "size": 3938},
 				{"name": "3", "size": 5000},
 				{"name": "4", "size": 3938},
				{"name": "4", "size": 3938},
 				{"name": "3", "size": 5000},
 				{"name": "4", "size": 3938},
			 ]
		 },
		 {
			 "name": "CAT 3",
			 "children": [
				{"name": "3", "size": 5000},
				{"name": "4", "size": 3938},
 				{"name": "3", "size": 5000},
 				{"name": "4", "size": 3938},
				{"name": "4", "size": 3938},
 				{"name": "3", "size": 5000},
 				{"name": "4", "size": 3938},
			 ]
		 },
	 ]
	};
*/
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
/*
  	var circle = g.selectAll("circle")
		      .data(nodes)
		      .enter().append("circle")
				//	.attr('d','M738.2,250.4c-1.8-8.2-4.3-16.2-6.4-24.2c-0.3-1-0.3-2-0.5-3c-1.8-5.1-3.6-10.1-5.5-15.2c-1.5-3-3-6-4.5-9.1 c-9.7-20.4-23.8-37.1-41.7-50.7c-19.3-14.7-99.9-72.1-126-80.8c-18.5-6.1-36.6-13.3-54.3-21.5c-22-10.2-44-20.3-66.4-29.6 C404.5,4.5,374.8-1.8,343.6,0.4c-16.7,1.2-33.1,4.3-49.1,8.9c-6.9,2-13.6,4.3-20.4,6.5c-0.6,0.2-1.4,0.1-2.1,0.2 c-8,2.9-16,5.7-24,8.6c-4.3,1.8-8.5,3.6-12.8,5.3c-21.4,8.1-42.5,17-62.8,27.8c-38.9,20.6-69.3,50.1-89.6,89 c-14.5,27.8-27.8,56.3-41.1,84.7c-11.1,23.6-20.9,47.8-28.4,72.8C4,334.4-1.4,365.2,0.3,396.8c1.3,25.2,7.6,49.1,17.3,72.3 c22.1,52.6,60.2,90.6,108.1,120c24.7,15.1,50.4,28.3,76.6,40.4c34.6,15.9,67.6,34.8,100.9,52.9c29.8,16.2,60,31.9,92,43.5 c25.4,9.2,51.3,15.6,78.5,15.9c15,0.1,29.8-1.6,44.1-6.1c0.5-0.2,1.2-0.1,1.8-0.1c3.7-1.3,7.4-2.7,11.1-4c2.5-1.2,5-2.5,7.5-3.6 c30.3-14.2,53.7-36.5,73.8-62.7c18.1-23.6,32.9-49.2,45.6-76c14.1-29.9,27.3-60.1,40.9-90.2c9.5-20.9,19.2-41.7,28.2-62.9 C740,404.8,746.2,287,738.2,250.4z')
		      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
		      .attr('id', function(d) { return d.data.name; })
		      .style("fill", function(d) { return d.children ? color(d.depth) : null; })
		      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

					*/
			/*
			.attr('rscale', 0)
			.transition()
			.delay(function(d) { return d.depth * 50; })
			.duration(5000)
  		.attrTween("rscale", function(d) {
				return d3.interpolate(0, 1);
			});
			*/

			var path = g.selectAll("path")
						.data(nodes);

			path	.enter()
						.append("path")
				//		.attr('d', function(d) { return d.children ? 'M49.9,0.2c0,27.6-22.4,50-50,50s-50-22.4-50-50c0-19,10.6-35.5,26.2-44c7.1-3.8,15.2-6,23.8-6 c8,0,15.5,1.9,22.2,5.2C38.6-36.5,49.9-19.5,49.9,0.2z' : svgPaths[parseInt(Math.random() * svgPaths.length)]; })
						.attr('d', function(d) { return svgPaths[parseInt(Math.random() * svgPaths.length)]; })
						.attr('transform','scale(0)')
						.attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
						.attr('id', function(d) { return d.data.name; })
						.style("fill", function(d) { return d.children ? color(d.depth) : null; })
						.style("fill-opacity", function(d) { return 0; })
						.on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

			path.exit().remove();



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
			    .data(nodes);

	  text  .enter().append("text")
			    .attr("class", "label")
			    .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
			    .attr('css-visible', function(d) { return d.parent === root ? 'true' : 'false'; })
	     // .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
			    .text(function(d) { return d.data.name; });

	  text.exit().remove();

		var node = g.selectAll("path,text");

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

		/*
		console.log('>> ZOOM');
		console.log('Focus from [', focus0.data.name, '] to [', focus.data.name,']');
		console.log('Item focused:', d.data.name);
		*/

		var k = diameter / (focus.r * 2 + margin);


		g.selectAll('path')
			.transition()
			.duration(600)
			.attr("r", function(d) { return d.r * k; })
			.style("fill-opacity", function(d) { return d.parent != null ? d.parent.data.name === focus.data.name ? 1 : 0 : 0; })
			.attr("transform", function(d) { return "translate(" + (((d.x - focus.x) * k) - ((d.r*2/100) * k)/2) + "," + ((d.y - focus.y) * k - ((d.r*2/100) * k)/2) + ") scale("+ ((d.r*2/100) * k)+")"; });
																																																												// 100 = size of SVG path
																																																												// data.size [aka `d.r`] / 100 (size of SVG path) = scale value


 		g.selectAll('text')
 			.transition()
 			.duration(600)
 			.attr("transform", function(d) { return "translate(" + (d.x - focus.x) * k + "," + (d.y - focus.y) * k + ")"; })
			.style("fill-opacity", function(d) { return d.parent != null ? d.parent.data.name === focus.data.name ? 1 : 0 : 0; })
			.on("start", function(d) { if (d.parent != null) if (d.parent.data.name === focus.data.name) this.style.display = "inline"; })
			.on("end", function(d) { if (d.parent != null) if (d.parent.data.name !== focus.data.name) this.style.display = "none"; });

/*

		transition.selectAll("text")
		 .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
			 .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
			 .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
			 .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });

			 */

	}







	update();

	// Decommente ca aussi si tu as besoin

	setTimeout(function(){
		DATA.children.push({"name": "YOUHOU", "size":600});

		console.log(DATA);

		update();

		// setTimeout(function(){
		// 		$('svg').trigger('click');
		// },1500);
	}, 2000);

	// Pareil
	/*
	setTimeout(function(){
		DATA.children[0].children[0].size = 6000;

		update();
	}, 6000);
	*/





//	});



};
