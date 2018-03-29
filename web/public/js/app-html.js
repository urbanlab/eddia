
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

var wordPlaceholders = [
  [ 540, 540 ],
  [ 1400, 540 ],
  [ 625, 250 ],
  [ 1285, 820 ],
  [ 625, 820 ],
  [ 1285, 250 ],
  [ 370, 320 ],
  [ 1570, 760 ],
  [ 370, 760 ],
  [ 1570, 320 ],
];


window.onload = function () {
  document.addEventListener('contextmenu', event => event.preventDefault());

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
 setView('topic');
 setEye('bottom');

  DOM_screenBackground.on('click', function(e){
    setView('topic');
  });

  $('.eye').on('click', function(){
    setEye($(this).data('side'));
  });

  createBubble('topic', { name: DATA.name });
  createBubble('interest', { name: 'Transports' });
  createBubble('interest', { name: 'Imprévus externes' });

  createBubble('word', { name: 'Imprévu 1', interest: 'Imprévus externes' });
  createBubble('word', { name: 'Imprévu 2', interest: 'Imprévus externes' });
  createBubble('word', { name: 'Imprévu 3', interest: 'Imprévus externes' });

  createBubble('word', { name: 'Transports 1', interest: 'Transports' });
  createBubble('word', { name: 'Transports 2', interest: 'Transports' });
  createBubble('word', { name: 'Transports 3', interest: 'Transports' });
  createBubble('word', { name: 'Transports 4', interest: 'Transports' });
  createBubble('word', { name: 'Transports 5', interest: 'Transports' });
  createBubble('word', { name: 'Transports 6', interest: 'Transports' });
  createBubble('word', { name: 'Transports 7', interest: 'Transports' });
  createBubble('word', { name: 'Transports 8', interest: 'Transports' });

  createBubble('word', { name: 'Imprévu 1sfsfsef', interest: 'Imprévus internes' });
  createBubble('word', { name: 'Imprévu 2 sdfds fdsfd sds dsfdsf', interest: 'Imprévus internes' });
  createBubble('word', { name: 'Imprévu sdf dsf dsf dsf ds f sd fd3', interest: 'Imprévus internes' });

  createBubble('content', { type: 'quote', word: 'Transports 1', content: 'Lorem ipsum dolor sit amet lorem ipsum' });
  createBubble('content', { type: 'image', word: 'Transports 2', content: 'Texte de loi n°2', file: 'photo1.jpg' });

  setTimeout(function(){
    createBubble('interest', { name: 'Imprévus internes' });
  }, 1500);
  //
  // setTimeout(function(){
  //   changeBubbleSize('inc', { type: 'interest', name: 'Transports' });
  //   changeBubbleSize('inc', { type: 'interest', name: 'Transports' });
  //   changeBubbleSize('inc', { type: 'interest', name: 'Transports' });
  // },1000);

  // setView('interest', { name: 'Imprévus externes' });
}

function setEye(side) {
  DOM_screen.attr('data-eye-side', side);
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

  bubble
    .data('scale', newScale)
    .find('.bubble-scale').css({
      transform: 'scale('+newScale+')'
    });
}

function setView(v, d = null) {
  if (v == 'topic') {
    $('.bubble--interest').removeClass('current');
    $('.bubble--word').removeClass('related');

    // $('.bubble--word')
    //   .css({
    //     'transform': 'translate('+(screenW/2)+'px, '+(screenH/2)+'px)'
    //   });

    $('.bubble--word').each(function(){
      var interestBubbleParent = $('.bubble--interest[data-name="' + $(this).data('interest') + '"]');

      var interestBubbleParentX = interestBubbleParent.data('x');
      var interestBubbleParentY = interestBubbleParent.data('y');

      $(this).css({
        'transform': 'translate(' + interestBubbleParentX + 'px, ' + interestBubbleParentY + 'px)'
      })
    });

    DOM_screen.attr('data-view','topic');
  }

  if (v == 'interest') {
    var interestBubble = $('.bubble--interest[data-name="'+d.name+'"]');

    $('.bubble--interest').removeClass('current');
    interestBubble.addClass('current');

    $('.bubble--word').removeClass('related');

    // Set initial wordBubble position to parent interestBubble
    $('.bubble--word[data-interest="'+d.name+'"]')
      .addClass('no-transition')
      .css({
        'transform': 'translate('+(screenW/2)+'px, '+(screenH/2)+'px)'
      });

    // Then animate transition from interestBubble position to wordBubble position
    setTimeout(function(){
      $('.bubble--word[data-interest="'+d.name+'"]').each(function(){
        $(this)
          .addClass('related')
          .removeClass('no-transition')
          .css({
            'transform': 'translate('+$(this).data('x')+'px, '+$(this).data('y')+'px)'
          });
      });
    },100);

    DOM_screen.attr('data-view','interest');
  }

  if (v == 'word') {
    var interestBubble = $('.bubble--interest[data-name="'+d.interest+'"]');
    var wordBubble = $('.bubble--word[data-name="'+d.name+'"]');

    console.log(interestBubble);
    console.log(wordBubble);
  }

  updateView();
}

function createBubble(_type, d) {
  var type = _type;

  var DOM_bubble = $('<div/>')
    .addClass('bubble bubble--'+type)
    .attr('data-name', d.name)
    .attr('data-type', type)
    .data('scale', 1)
    .on('click', function(){
      if (type == 'topic') {
        setView('topic');
      }

      if (type == 'interest') {
        if ($(this).hasClass('current')) {
          setView('topic');
        } else {
          setView('interest', { name: d.name });
        }
      }

      if (type == 'word') {
        if ($(this).hasClass('current')) {
          setView('interest', { name: d.interest });
        } else {
          setView('word', { name: d.name, interest: d.interest });
        }
      }
    });

  if (type == 'word') {
    var placeholderIndex = $('.bubble--word[data-interest="'+d.interest+'"]').length || 0;

    if (placeholderIndex < wordPlaceholders.length) {
      // Defined position
      var x = wordPlaceholders[placeholderIndex][0];
      var y = wordPlaceholders[placeholderIndex][1];
    } else {
      // Then random positions
      if (Math.random() >= 0.5) {
        var x = (Math.random() * 500) + 100;
      } else {
        var x = screenW/2 + (Math.random() * 450) + 100;
      }
      var y = parseInt(Math.random() * (screenH - 300)) + 150;
    }

    DOM_bubble
      .css({
        transform: 'translate(' + x + 'px, ' + y + 'px)'
      })
      .data('x', x)
      .data('y', y)
      .data('scale', 1)
      .data('rotation', 0)
      .attr('data-interest',d.interest);

    DOM_bubble
      .hammer({
        recognizers: [
          [Hammer.Pinch, { enable: true }],
          [Hammer.Pan, { enable: true }],
        ]
      })

      .on('pinch pan', function(event) {
//        $('.console').text(event.type);
        console.log(event);

        var target = event.target;

        $(target).addClass('no-transition');

        var currentScale = $(target).data('scale') * event.gesture.scale;
        var currentDeltaX = $(target).data('x') + (event.gesture.deltaX);
        var currentDeltaY = $(target).data('y') + (event.gesture.deltaY);
        var currentRotation = $(target).data('rotation') + (event.gesture.rotation);

        $(target).css({
          'transform': 'translate(' + currentDeltaX + 'px,' + currentDeltaY + 'px)'
        });

        $(target).find('.bubble-scale').css({
          'transform':'scale('+currentScale+')'
        });

        $(target).find('.bubble-inner').css({
          'transform':'rotate('+currentRotation+'deg)'
        });
      })

      .on('panend pinchend', function(event) {
        var target = event.target;

        $(target).removeClass('no-transition');

        $(target).data('scale', ($(target).data('scale') * event.gesture.scale));
        $(target).data('x', ($(target).data('x') + (event.gesture.deltaX)));
        $(target).data('y', ($(target).data('y') + (event.gesture.deltaY)));
        $(target).data('rotation', ($(target).data('rotation') + (event.gesture.rotation)));
      });
  }

  var DOM_bubbleContainer = $('<div/>')
    .addClass('bubble-container');

  var DOM_bubbleScale = $('<div/>')
    .addClass('bubble-scale');

  var DOM_bubbleBackground = $('<div/>')
    .addClass('bubble-background');

  var DOM_bubbleBackgroundLayer1 = $('<div/>')
    .addClass('bubble-background-layer bubble-background-layer-1')
    .css({
      'animation-delay': - parseInt(Math.random() * 10) +'s'
    });

  var DOM_bubbleBackgroundLayer2 = $('<div/>')
    .addClass('bubble-background-layer bubble-background-layer-2')
    .css({
      'animation-delay': - parseInt(Math.random() * 10) +'s'
    });

  var DOM_bubbleInner = $('<div/>')
    .addClass('bubble-inner')
    .text(d.name);

  DOM_bubbleBackground
    .append(DOM_bubbleBackgroundLayer1)
    .append(DOM_bubbleBackgroundLayer2);

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
      .addClass('exists')

    updateView();
  },100);
}

function updateView() {
  console.log('updateView');
  var view = DOM_screen.attr('data-view');

  if (view == 'topic') {
    setPositionOfInterestBubblesInTopicView();
  }

  if (view == 'interest') {
    setPositionOfInterestBubblesInInterestView();
    setWordBubblesDraggable();
  }

  if (view == 'word') {
  }
}




function setWordBubblesDraggable() {

  /*$('.layer--word .bubble--word').draggable({

  });
  */
}


/*
 *  setPositionOfInterestBubblesInInterestView
 *
 *  Set the position of each interest bubble except the current one (handled with CSS)
 */

function setPositionOfInterestBubblesInInterestView() {
  var radius = 850;
  var nbInterestBubbles = $('.bubble--interest').length;
  var angleOffset = 20;
  var angleMin = 360 * 0.0174532925 / nbInterestBubbles;

  for (var i = 0; i < nbInterestBubbles; i++) {
    var bubble = $('.bubble--interest').eq(i);

    if (!bubble.hasClass('current')) {
      var x = (radius * Math.cos(angleMin * i + angleOffset) + screenW / 2);
      var y = (radius * Math.sin(angleMin * i + angleOffset) + screenH / 2);

      bubble
        .data('x', x)
        .data('y', y)
        .css({
          transform: 'translate(' + x + 'px, ' + y + 'px)'
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
    var x = (radius * Math.cos(angleMin * i + angleOffset) + screenW / 2);
    var y = (radius * Math.sin(angleMin * i + angleOffset) + screenH / 2);

    $('.bubble--interest')
      .eq(i)
      .data('x', x)
      .data('y', y)
      .css({
        transform: 'translate(' + x + 'px, ' + y + 'px)'
      });
  }
}
