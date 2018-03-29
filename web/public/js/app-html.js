
var DOM_screen = $('.screen'),
    DOM_screenBackground = $('.screen-background'),
    screenW = DOM_screen.width(),
    screenH = DOM_screen.height();

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
	var socket = io();
	var once = 1;

	socket.emit('room', {"client": "app", "room_id": room});
	socket.emit('get_data');

	socket.on('get_data', function(datas) {
		init(datas);
	});
 
	socket.on('bubble/add', function(bubble) {
		console.log("on('bubble/add')", bubble);
		createBubble(bubble.type, bubble.bubble);
        });
	
}

function init(datas) {
 setView('topic');
 setEye('bottom');

  DOM_screenBackground.on('click', function(e){
    setView('topic');
  });

  $('.eye').on('click', function(){
    setEye($(this).data('side'));
  });

	// A enlever le topic mis en dur
  createBubble('topic', { name: datas.name });
  
  for (child in datas.children) {
    createBubble('interest', {"name": datas.children[child].name});
      for (word in datas.children[child].children) {
	createBubble('word', {"name": datas.children[child].children[word].name, "interest": datas.children[child].name});
      }
  }
  /*createBubble('interest', { name: 'Transports' });
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
  */
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
