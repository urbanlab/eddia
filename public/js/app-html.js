var audioContext = null;
var meter = null;
var rafID = null;
var mediaStreamSource = null;
var recognizing = false;
var recognition;

var socket;

var DOM_screen = $('.screen'),
    DOM_screenBackground = $('.screen-background'),
    screenW = DOM_screen.width(),
    screenH = DOM_screen.height();

var L_logo = 100, H_logo = 100;
var x_logo = 5, y_logo = screenH - H_logo -10;

var maxBubbleScale = 3,
    minBubbleScale = .8;
var removeZoneSize = 150; // width and height of delete zones

var lastView = 'topic',
    currentView = 'topic';

var defaultRotation = 90;

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

var block_acquisition = true;
var mode_ajout_mots = false;
var transcription_ordre = '';

var topics;
var current_topic;

window.onload = function () {
  // Disable right click
	document.addEventListener('contextmenu', event => event.preventDefault());

	var url_array = decodeURI(document.location.pathname).split('/');
  var topic = url_array[1];
    	room = url_array[2];
  
  socket = io();

	socket.emit('room', {
  	"topic": topic,
		"room_id": room
	});

	socket.emit('get_data');

  socket.on('topics', function(topics_data) {
    topics = topics_data.topic_list;
    current_topic = topics_data.current_topic;
    init_microphone(socket);

    socket.on('get_data', function(datas) {
      init(datas);
    });

    socket.on('bubble/add', function(bubble) {
      console.log("on('bubble/add')", bubble);
      createBubble(bubble);
    });

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    try {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      navigator.getUserMedia(
      {
        "audio": {
          "mandatory": {
            "googEchoCancellation": "false",
            "googAutoGainControl": "false",
            "googNoiseSuppression": "false",
            "googHighpassFilter": "false"
          },
        "optional": []
        },
      }, () => console.log('Got audio stream'), () => alert('Stream generation failed.'));
    } catch (e) {
      alert('getUserMedia threw exception :' + e);
    }
  });
}

//----------------------------------------------------------------------------------------------------------------

function init_microphone(socket) {
	if (!('webkitSpeechRecognition' in window)) {
		upgrade();
	} else {
		var transcription = '';
		recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = 'fr-FR';
		recognition.start();

		recognition.onstart = function() {
			console.log('Recognition started');
			recognizing = true;
		}

		recognition.onresult = function(event) {
      if(block_acquisition) {
        return
      };
      if(mode_ajout_mots) {
        for (var i = event.resultIndex; i < event.results.length; ++i)
          if (event.results[i].isFinal) {
            transcription_ordre += (event.results[i][0].transcript + ' ');
          }
      } else {
  			for (var i = event.resultIndex; i < event.results.length; ++i)
  				if (event.results[i].isFinal) {
  					transcription += event.results[i][0].transcript;
  				};
        if (transcription != '') {
    			console.log('transcription:', transcription);
    			socket.emit('transcription/send', transcription);
    			transcription = '';
          recognition.stop();
        };
      };
		}

		recognition.onerror = function(event) {
			console.log('Recognition error');
			recognizing = false;
		}

		recognition.onend = function() {
			console.log('Recognition finished.');
			recognizing = false;
      recognition.start();
		}
	}
}

//----------------------------------------------------------------------------------------------------------------
// Graphic
//----------------------------------------------------------------------------------------------------------------

  function init(datas) {
    var speak_logo = $('<img/>')
      .addClass('add_word_icon')
      .attr('src', '/img/logo_parler_simple.png')
      .attr({width:String(L_logo), height:String(H_logo)})
      .attr('draggable', false)
      .css({"transform": 'translate(' + String(x_logo) + 'px, ' + String(y_logo) + 'px)'})
      .css('position', 'absolute')
      .css('z-index', 9999);

    $('.screen').append(speak_logo);

    speak_logo.on('click', function() {
      if(!mode_ajout_mots) {
        $("#beep_sound")[0].play(); // émettre un 'bip'
        mode_ajout_mots = true;
        setTimeout(function() {
          socket.emit('voice/add_new_word', transcription_ordre);
          mode_ajout_mots = false;
          transcription_ordre = '';
          $("#beep_sound")[0].play(); // émettre un 'bip'
        }, 8000);
      }
    });

    var toggleListeningLogo = $('<img/>')
      .addClass('toggle_listening_icon')
      .attr('src', '/img/micro_barre.png')
      .attr({width:String(L_logo), height:String(H_logo)})
      .attr('draggable', false)
      .css({"transform": 'translate(' + String(screenW - x_logo - L_logo) + 'px, ' + String(y_logo) + 'px)'})
      .css('position', 'absolute')
      .css('z-index', 9999);

    toggleListeningLogo.on('click', function() {
      block_acquisition = !block_acquisition;
      $('.toggle_listening_icon').attr('src', {true:'/img/micro_barre.png', false:'/img/micro_fonctionnel.png'}[String(block_acquisition)]);
    })

    $('.screen').append(toggleListeningLogo);

    DOM_screenBackground.on('click', function(e){
      setPreviousView();
    });

   $('.eye').on('click', function(){
      setEye($(this).data('side'));
    });

    createBubble({"type":"topic", 'topic':current_topic});
    for(interest in datas[current_topic]) {
      createBubble({"type":"interest", "topic":current_topic, "interest": interest});
      for(word in datas[current_topic][interest]) {
  	    createBubble({"type":"word", "topic":current_topic, "interest": interest, "word": word});
        for(const content of datas[current_topic][interest][word]) {
          createBubble({"type":"content", "topic":current_topic, "interest":interest, "word": word,"content":content});
        };
      };
    };

    for(var i=0; i < topics.length; i++) {
      if(topics[i] != current_topic) {
        var topic_cell = $('<td/>')
          .addClass('topic-cell')
          .html(topics[i]);
        topic_cell.on('click', function() {location.href = '/' + $(this).html()});
        $('.topic-choice').append(topic_cell);
      };
      $('.topic-choice').addClass('topics-invisible');
    };

    $('.bubble--topic .bubble-inner').on('click', function() {
      if ($('.topic-choice').hasClass('topics-invisible')) {
        $('.topic-choice').removeClass('topics-invisible');
        $('.topic-choice').addClass('topics-visible');
      };
    });

    $('.screen').on('click', function(event) {
      if (!$(event.target).closest('.topic-choice').length &&
          !$(event.target).closest('.bubble--topic').length &&
          !$(event.target).closest('.bubble-inner').length) {
        if ($('.topic-choice').hasClass('topics-visible')) {
          $('.topic-choice').removeClass('topics-visible');
          $('.topic-choice').addClass('topics-invisible');
        };

      };
    });

    setView('topic');
    setEye('bottom');

  }

//----------------------------------------------------------------------------------------------------------------

  function setEye(side) {
    DOM_screen.attr('data-eye-side', side);

    var sides = {
      'bottom': 0,
      'left': 90,
      'right': -90,
      'top': 180
    };

    defaultRotation = sides[side];

    $('.bubble-inner, .bubble--content .bubble-container')
      .css({
        transform: 'rotate('+defaultRotation+'deg)'
      });

    $('.bubble--word')
      .data('rotation', defaultRotation);

    var new_x_logo = {'bottom':x_logo, 'left': x_logo, 'right':screenW - L_logo - x_logo, 'top':screenW - L_logo - x_logo}[side],
        new_y_logo = {'bottom':y_logo, 'left': screenH - H_logo - y_logo, 'right':y_logo, 'top':screenH - H_logo - y_logo}[side];
    $('.add_word_icon').css({"transform": 'translate(' + String(new_x_logo) + 'px, ' + String(new_y_logo) + 'px)'});

    var new_x_micro = {'bottom':screenW - L_logo - x_logo, 'left':x_logo, 'right':screenW - L_logo - x_logo, 'top':x_logo}[side],
        new_y_micro = {'bottom':y_logo, 'left':y_logo, 'right':screenH - H_logo - y_logo, 'top':screenH - H_logo - y_logo}[side];
    $('.toggle_listening_icon').css({"transform": 'translate(' + String(new_x_micro) + 'px, ' + String(new_y_micro) + 'px)' + ' rotate(' + String(sides[side]) +'deg)'});


    for(s in sides) {
      if(s == side) {
        $('.topic-choice').addClass(s);
      } else if($('.topic-choice').hasClass(s)) {
        $('.topic-choice').removeClass(s);
      };
    };
  };

//----------------------------------------------------------------------------------------------------------------

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
        transform: 'scale('+Math.min(Math.max(newScale, minBubbleScale), maxBubbleScale)+')'
      });
  }


//----------------------------------------------------------------------------------------------------------------

  function setPreviousView() {
    var view = DOM_screen.attr('data-view');

    if (view == 'word') {
      setView('interest', { name: $('.bubble--interest.current').data('name') });
    }

    if (view == 'interest') {
      setView('topic');
    }
  }




  function setView(v, d = null) {
    lastView = currentView;
    currentView = v;

    if (v == 'topic') {
      $('.bubble--interest').removeClass('current');
      $('.bubble--word').removeClass('related current no-transition'); // flickr because of no-transition: deletable TODO
      $('.bubble--content').removeClass('related current');

      $('.bubble--word').each(function(){
        var interestBubbleParent = $('.bubble--interest[data-name="' + $(this).data('interest') + '"]');

        var interestBubbleParentX = interestBubbleParent.data('x');
        var interestBubbleParentY = interestBubbleParent.data('y');

        $(this).css({
          'transform': 'translate(' + interestBubbleParentX + 'px, ' + interestBubbleParentY + 'px)'
        })
      });
    }

    if (v == 'interest') {
      var interestBubble = $('.bubble--interest[data-name="'+d.name+'"]');

      $('.bubble--interest').removeClass('current');
      interestBubble.addClass('current');

      $('.bubble--word').removeClass('current related');
      $('.bubble--content').removeClass('related current');

      if (lastView != 'word') {
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
      } else {
        $('.bubble--word[data-interest="'+d.name+'"]')
          .addClass('related');
      }
    }

    if (v == 'word') {
      var interestBubble = $('.bubble--interest[data-name="'+d.interest+'"]');
      var wordBubble = $('.bubble--word[data-name="'+d.name+'"][data-interest="'+d.interest+'"]');

      $('.bubble--interest').removeClass('current');
      $('.bubble--word').removeClass('current');
      $('.bubble--content').removeClass('related current');

      interestBubble.addClass('current');
      wordBubble.addClass('current');

      if (lastView != 'xxx') {
        // Set initial wordBubble position to parent interestBubble
        $('.bubble--content[data-word="'+d.name+'"]')
          .addClass('no-transition')
          .css({
            'transform': 'translate('+(wordBubble.data('x'))+'px, '+(wordBubble.data('y'))+'px)'
          });

        // Then animate transition from interestBubble position to wordBubble position
        setTimeout(function(){
          $('.bubble--content[data-word="'+d.name+'"]').each(function(){
            $(this)
              .addClass('related')
              .removeClass('no-transition')
              .css({
                'transform': 'translate('+$(this).data('x')+'px, '+$(this).data('y')+'px)'
              });
          });
        },100);
      } else {
        $('.bubble--content[data-word="'+d.name+'"]')
          .addClass('related');
      }
    }

    DOM_screen.attr('data-view',currentView);

    updateView();
  }


//----------------------------------------------------------------------------------------------------------------

  function createBubble(d) {

    if(d.name == undefined && d.type != 'content') {d.name = d[d.type]};

    var DOM_bubble = $('<div/>')
      .addClass('bubble bubble--'+d.type)
      .attr('data-name', d.name)
      .attr('data-type', d.type)
      .attr('data-word', d.word)
      .attr('data-interest', d.interest)
      .data('scale', 1)


      .on('click', function(){
        if (d.type == 'topic') {
          setView('topic');
        }

        if (d.type == 'interest') {
          if ($(this).hasClass('current')) {
            setView('topic');
          } else {
            setView('interest', { name: d.name });
          }
        }

        if (d.type == 'word') {
          if ($(this).hasClass('current')) {
            setView('interest', { name: d.interest });
          } else {
            setView('word', { name: d.name, interest: d.interest });
          }
        }

        if (d.type == 'content') {
          if (d.content.type == 'image') {
            if ($(this).hasClass('current')) {
              hideContentImage($(this));
            } else {
              showContentImage($(this));
            }
          }
        }
      });


    if (d.type == 'content') {
      DOM_bubble
        .attr('data-word', d.word)
        .attr('data-interest', d.interest)
        .attr('data-content-type', d.content.type);
    }

    if (d.type == 'word') {
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
        .data('rotation', defaultRotation)
        .attr('data-interest',d.interest);


      DOM_bubble
        .hammer({
          recognizers: [
            [Hammer.Pinch, { enable: true }],
            [Hammer.Pan, { enable: true }],
          ]
        })

        .on('panstart pinchstart', function(event) {
          var target = event.target;

          if (event.type == 'pinchstart') {
            $(target).data('startrotation', event.gesture.rotation);
          }

          if ($(target).hasClass('bubble--word') && $(target).hasClass('current')) {
            $(target).removeClass('current');
            setView('interest', { name: $(target).data('interest') });
          }
        })

        .on('pinch pan', function(event) {
          var target = event.target;

          $(target).addClass('no-transition');

          var currentDeltaX = $(target).data('x') + (event.gesture.deltaX);
          var currentDeltaY = $(target).data('y') + (event.gesture.deltaY);

          if ((currentDeltaX <= removeZoneSize && currentDeltaY <= removeZoneSize) // top left
           || (currentDeltaX <= removeZoneSize && currentDeltaY >= screenH - removeZoneSize) // bottom left
           || (currentDeltaX >= screenW - removeZoneSize && currentDeltaY <= removeZoneSize) // top right
           || (currentDeltaX >= screenW - removeZoneSize && currentDeltaY >= screenH - removeZoneSize)) { // bottom right
            $(target).addClass('deletable');
            DOM_screen.addClass('show-delete-ui');
          } else {
            $(target).removeClass('deletable');
            DOM_screen.removeClass('show-delete-ui');
          }

          $(target).data('lastx', currentDeltaX);
          $(target).data('lasty', currentDeltaY);

          $(target).css({
            'transform': 'translate(' + currentDeltaX + 'px,' + currentDeltaY + 'px)'
          });

          if (event.type == 'pinch') {
            var currentScale = Math.min(Math.max($(target).data('scale') * event.gesture.scale, minBubbleScale), maxBubbleScale);

            var diff = $(target).data('startrotation') - event.gesture.rotation;
            var currentRotation = $(target).data('rotation') - diff;

            $(target).find('.bubble-scale').css({
              'transform':'scale('+currentScale+')'
            });

            $(target).find('.bubble-inner').css({
              'transform':'rotate('+currentRotation+'deg)'
            });
          }
        })

        .on('panend pinchend', function(event) {
          var target = event.target;

          DOM_screen.removeClass('show-delete-ui');

          if (($(target).data('lastx') <= removeZoneSize && $(target).data('lasty') <= removeZoneSize) // top left
           || ($(target).data('lastx') <= removeZoneSize && $(target).data('lasty') >= screenH - removeZoneSize) // bottom left
           || ($(target).data('lastx') >= screenW - removeZoneSize && $(target).data('lasty') <= removeZoneSize) // top right
           || ($(target).data('lastx') >= screenW - removeZoneSize && $(target).data('lasty') >= screenH - removeZoneSize)) { // bottom right
            removeBubble($(target));
            return;
          }

          // Avoid pinchend flickering (because of these two fingers crashing the final position)
          if (event.type != "pinchend") {
            $(target).data('x', $(target).data('lastx'));
            $(target).data('y', $(target).data('lasty'));
          }

          // Only with a pinch
          if (event.type == 'pinchend') {
            var diff = $(target).data('startrotation') - event.gesture.rotation;
            var currentRotation = $(target).data('rotation') - diff;

            $(target).data('scale', ($(target).data('scale') * event.gesture.scale));
            $(target).data('rotation', currentRotation);
          }

          setTimeout(function(){
            $(target).removeClass('no-transition');
          },100);
        });
    }

    var DOM_bubbleContainer = $('<div/>')
      .addClass('bubble-container');

    var DOM_bubbleScale = $('<div/>')
      .addClass('bubble-scale');

    if (d.type == 'content') {
      if (d.content.type == 'image') {
        var DOM_bubbleThumbnail = $('<div/>')
          .addClass('bubble-thumbnail')
          .css({
            'background-image':'url('+d.content.file+')',
            transform: 'rotate('+defaultRotation+'deg)'
          });

        var DOM_bubbleThumbnailLabel = $('<div/>')
          .addClass('bubble-thumbnail-label')
          .text(d.content.content);

        DOM_bubbleScale
          .append(DOM_bubbleThumbnail)
          .append(DOM_bubbleThumbnailLabel);
      }

      if (d.content.type == 'quote') {
        var DOM_bubbleQuote = $('<div/>')
          .addClass('bubble-quote')
          .text(d.content.content);

        DOM_bubbleScale
          .append(DOM_bubbleQuote);
      }
    }

    var DOM_bubbleBackground = $('<div/>')
      .addClass('bubble-background');

    var DOM_bubbleBackgroundLayer1Wrapper = $('<div/>')
      .addClass('bubble-background-layer-wrapper bubble-background-layer-wrapper-1');

    var DOM_bubbleBackgroundLayer1 = $('<div/>')
      .addClass('bubble-background-layer bubble-background-layer-1')
      .css({
        'animation-delay': - parseInt(Math.random() * 10) +'s'
      });

    var DOM_bubbleBackgroundLayer2Wrapper = $('<div/>')
      .addClass('bubble-background-layer-wrapper bubble-background-layer-wrapper-2');

    var DOM_bubbleBackgroundLayer2 = $('<div/>')
      .addClass('bubble-background-layer bubble-background-layer-2')
      .css({
        'animation-delay': - parseInt(Math.random() * 10) +'s'
      });

    var DOM_bubbleInner = $('<div/>')
      .addClass('bubble-inner')
      .css({
        transform: 'rotate('+defaultRotation+'deg)'
      })
      .text(d.name);

    DOM_bubbleBackgroundLayer1Wrapper
      .append(DOM_bubbleBackgroundLayer1);

    DOM_bubbleBackgroundLayer2Wrapper
      .append(DOM_bubbleBackgroundLayer2);

    DOM_bubbleBackground
      .append(DOM_bubbleBackgroundLayer1Wrapper)
      .append(DOM_bubbleBackgroundLayer2Wrapper);

    DOM_bubbleScale
      .append(DOM_bubbleBackground)
      .append(DOM_bubbleInner);

    DOM_bubbleContainer
      .append(DOM_bubbleScale);

    DOM_bubble
      .append(DOM_bubbleContainer)
      .appendTo($('.layer--'+d.type));

    setTimeout(function(){
      DOM_bubble
        .addClass('exists')

      updateView();
    },100);
  }

  //----------------------------------------------------------------------------------------------------------------

  function updateView() {
    if (currentView == 'topic') {
      setPositionOfInterestBubblesInTopicView();
    }

    if (currentView == 'interest') {
      setPositionOfInterestBubblesInInterestView();
    }

    if (currentView == 'word') {
      setPositionOfContentBubblesInWordView();
    }
  }

//----------------------------------------------------------------------------------------------------------------

  function showContentImage(b) {
    console.log('showContentImage');
    b.addClass('current');
  }

  function hideContentImage(b) { 
    b.removeClass('current');
  }


  //----------------------------------------------------------------------------------------------------------------


  function removeBubble(b) {
    var type = b.data('type');
    var interest = b.data('interest');
    var word = b.data('word');
    var name = b.data('name');

    $('.bubble--content[data-word="'+word+'"][data-interest="'+interest+'"]').addClass('deleted');
    $('.bubble--word[data-word="'+word+'"][data-interest="'+interest+'"]').addClass('deleted');
    socket.emit('bubble/word/remove', {  // The server side handles the deletion of the word and of the corresponding interest if needed
      'interest': interest,
      'word': word,
    });
    setTimeout(function() {
      $('.bubble--content[data-word="'+word+'"][data-interest="'+interest+'"]').remove();
      $('.bubble--word[data-word="'+word+'"][data-interest="'+interest+'"]').remove();
      if(!($('.bubble--word[data-interest="'+interest+'"]').length)) {
        setView('topic');
        $('.bubble--interest[data-interest="'+interest+'"]').addClass('deleted');
        setTimeout(function() {$('.bubble--interest[data-interest="'+interest+'"]').remove()}, 600);
      };
    }, 600);
  }

//----------------------------------------------------------------------------------------------------------------

  function setPositionOfContentBubblesInWordView() {
    var radius = 250;
    var angleOffset = 90;

    $('.bubble--word').each(function(){
      var wordName = $(this).data('name');
      var word = $('.bubble--word[data-name="'+wordName+'"]');

      var contentBubbles = $('.bubble--content[data-word="'+wordName+'"]');
      var nbContentBubbles = contentBubbles.length;

      var angleMin = 360 * 0.0174532925 / nbContentBubbles;

      for (var i = 0; i < nbContentBubbles; i++) {
        var contentBubble = contentBubbles.eq(i);

        if (!contentBubble.hasClass('current')) {
          var x = (radius * Math.cos(angleMin * i + angleOffset) + word.data('x'));
          var y = (radius * Math.sin(angleMin * i + angleOffset) + word.data('y'));

          contentBubble
            .data('x', x)
            .data('y', y)
            .css({
              transform: 'translate(' + x + 'px, ' + y + 'px)'
            });
        }
      }
    });
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
