$(document).ready(function(){
    unpackQuizHack();
});

// load the map with six california states
var loadMap = function () {
    $(".quiz-container").append("<div id='map-container' style='height: 400px; width: 100%;'></div>");
    var map = L.map("map-container",{
        scrollWheelZoom: false
    }).setView([37.335194502529724, -119.366455078125], 6);
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/examples.map-20v6611k/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 14,
        minZoom: 6
    }).addTo(map);

    for (var i=0; i<sixCalifornia.features.length; i++){
        if (sixCalifornia.features[i].properties.six_cali_1 === window.max){
            sixCalifornia.features[i].properties.selected = true;
        } else {
            sixCalifornia.features[i].properties.selected = false;
        }
    };

    geojson = L.geoJson(sixCalifornia, {style: style, onEachFeature: onEachFeature}).addTo(map);
};

function getColor(d) {
    return d == "Central California" ? '#800026' :
           d == "North California"  ? '#BD0026' :
           d == "South California"  ? '#E31A1C' :
           d == "West California"  ? '#FC4E2A' :
           d == "Silicon Valley"   ? '#FD8D3C' :
                                  '#FEB24C' ;
};

function style(feature) {
    if (feature.properties.selected === true){
        fillColor = 'black',
        weight = 3,
        color = 'black',
        fillOpacity = 0.7
    } else {
        fillColor = getColor(feature.properties.six_cali_1),
        weight = 1,
        color = 'black',
        fillOpacity = 0.7
    }
    return {
        fillColor: fillColor,
        weight: weight,
        color: color,
        fillOpacity: fillOpacity
    };
};

function resetStyle(feature) {
    return {
        fillColor: getColor(feature.properties.six_cali_1),
        weight: 1,
        color: 'black',
        fillOpacity: 0.7
    };
};

function onEachFeature(feature, layer) {
    layer.on({
        click: highlightFeature
    });
};

function highlightFeature(e) {
    var layer = e.target;
    var highlightedStyle = {
        weight: 3,
        fillOpacity: 0.7,
        fillColor: 'black'
    };
    geojson.setStyle(resetStyle);
    layer.setStyle(highlightedStyle);
    for (i=0; i<6; i++ ) {
        if (input[i].result == layer.feature.properties.six_cali_1) {
            $("#description").html(input[i].explanation);
            $("#facts").html(input[i].datapoints);
            $("#statename").html(input[i].result);
        }
    };
};

    //variables
    var answer,
        qnumber,
        score = 0,
        score_north = 0,
        score_jeff = 0,
        score_cen = 0,
        score_silicon = 0,
        score_west = 0,
        score_south = 0,
        currentQuestion = 0;

    // social media icons
    var facebook = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' style='height: 2.4em;'><circle cx='8' cy='8' r='8' class='shape-1'></circle><path fill='#fff' d='M8.5 3.7h1.4v1.6h-1c-.2 0-.4.1-.4.4v.9h1.4l-.1 1.7h-1.3v4.5h-1.9v-4.5h-.9v-1.7h.9v-1c0-.7.4-1.9 1.9-1.9z' class='shape-2'></path><foreignObject width='200' height='100'><text><tspan style='color:#414141; margin-right: 20px; margin-left: 15px;''>Facebook</tspan></text></foreignObject></svg>";
    var twitter = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' style='height: 2.4em;'><circle cx='8' cy='8' r='8' class='shape-1'></circle><path fill='#fff' d='M4 4.8c1 1.2 2.5 2 4.2 2.1l-.1-.4c0-1.1.9-2 2-2 .6 0 1.1.3 1.5.6.5-.1.9-.3 1.3-.5-.2.4-.5.8-.9 1.1l1.2-.3c-.3.4-.6.8-1 1.1v.3c0 2.7-2 5.8-5.8 5.8-1.1 0-2.2-.3-3.1-.9h.5c.9 0 1.8-.3 2.5-.9-.9 0-1.6-.6-1.9-1.4h.4c.2 0 .4 0 .5-.1-.9-.2-1.6-1-1.6-2 .3.2.6.2.9.3-.6-.5-.9-1.1-.9-1.8 0-.4.1-.7.3-1z' class='shape-2'></path><foreignObject width='200' height='100'><text><tspan style='color:#414141; margin-right: 20px;''>Twitter</tspan></text></foreignObject></svg>";

    // twitter links
    var account = "kpcc";

    // write questions and answers on html
    var buildQuiz = function (input) {
        qnumber = currentQuestion + 1;
        $(".quiz-container").html(
            "<div class='progressbar'>Question " + qnumber + "&nbsp;of&nbsp;" + input.length + "</div><div class='qq-question'><div class='qq-description'>" + input[currentQuestion].description + "</div><br><div class='question'>" + input[currentQuestion].question + "</div></div>" +
            "<div class='answers'><div id='option-a' class='list'>" + input[currentQuestion].a + "</div>" +
            "<div id='option-b' class='list'>" + input[currentQuestion].b + "</div>" +
            "<div id='option-c' class='list'>" + input[currentQuestion].c + "</div>" +
            "<div id='option-d' class='list'>" + input[currentQuestion].d + "</div>" +
            "<div id='option-e' class='list'>" + input[currentQuestion].e + "</div>" +
            "<div id='option-f' class='list'>" + input[currentQuestion].f + "</div></div>" +
            "<div class='answer'></div>"
        );

        if (currentQuestion === (input.length-1)) {
            $(".answer").append("<button class='qq-button check-score'>See Result</button>");
            $('.check-score').on('click', finalScore);
        } else {
            $(".answer").append("<button class='qq-button q" + qnumber + "'>Next</button>");
            $('.q' + qnumber).on('click', nextQuestion[qnumber]);
        }

        selectAnswer();
    };

    // write the final question and answers on html to break the tie
    var buildExtraQuiz = function () {
        $(".quiz-container").html(
            "<div class='progressbar'>Bonus Question</div><div class='qq-question'><div class='qq-description'>Oops.. Seems like you are a mixed type. Let's decide on this with the final strike!</div><br><div class='question'>What's your drink of choice?</div></div>" +
            "<div class='answers'></div>" +
            "<div class='answer'></div>"
        );

        var finalQuestion = [
            {"state": "North California", "drink": "Red wine"},
            {"state": "Jefferson", "drink": " Marijuana"},
            {"state": "Silicon Valley", "drink": "Martini"},
            {"state": "South California", "drink": "Tequila"},
            {"state": "West California", "drink": "Champagne"},
            {"state": "Central California", "drink": "Beer"}
        ];

        for (i = 0; i < finalQuestion.length; i++) {
            if (finalQuestion[i].state == window.max || finalQuestion[i].state == window.max_2) {
                $(".answers").append("<div class='finallist 'id='" + finalQuestion[i].state + "'>" + finalQuestion[i].drink + "</li>");
            }
        };

        $(".answer").append("<button class='qq-button check-score-final'>See Result</button>");
        $(".check-score-final").on("click", finalScoreFinal);
        selectAnswer();
    };

    // shows (1) out of (3) questinos
    var displayProgress = function () {
        $(".progressbar").html(
            "<div class='progressbar'>Question " + qnumber + "&nbsp;of&nbsp;" + input.length + "</div>"
        );
    };

    // style changes when user selects answers
    var selectAnswer = function () {
        $(".list, .finallist").click(function() {
            $(".selected").removeClass("selected");
            $(this).addClass("selected");
            $(".next").addClass("submit-highlight").fadeIn();
        });
    }

  // check selected input for each question and add scores for each state accordingly
  var checkAnswer = {

    "1" : function () {
      if ($(".selected").length > 0) {
        $('li').off('click');
        answer = $(".selected").attr('id');

        if (answer == 'option-a') {
          score_cen++;
          displayProgress();
        } else if (answer == 'option-b') {
          score_jeff++;
          displayProgress();
        }
        else if (answer == 'option-c') {
          score_west++;
          displayProgress();
        }
        else if (answer == 'option-d') {
          score_south++;
          displayProgress();
        }
        else if (answer == 'option-e') {
          score_north++;
          displayProgress();
        }
        else if (answer == 'option-f') {
          score_silicon++;
          displayProgress();
        };

        //console.log(score_cen, score_jeff, score_west, score_north, score_south, score_silicon);
      }
    },

    "2" : function () {
      if ($(".selected").length > 0) {
        $('li').off('click');
        answer = $(".selected").attr('id');

        if (answer == 'option-a') {
          score_silicon++;
          displayProgress();
        } else if (answer == 'option-b') {
          score_west++;
          displayProgress();
        }
        else if (answer == 'option-c') {
          score_north++;
          displayProgress();
        }
        else if (answer == 'option-d') {
          score_jeff++;
          score_cen++;
          displayProgress();
        }
        else if (answer == 'option-e') {
          score_south++;
          displayProgress();
        };

        //console.log(score_cen, score_jeff, score_west, score_north, score_south, score_silicon);
      }
    },

    "3" : function () {
      if ($(".selected").length > 0) {
        $('li').off('click');
        answer = $(".selected").attr('id');

        if (answer == 'option-a') {
          score_south++;
          displayProgress();
        } else if (answer == 'option-b') {
          score_cen++;
          score_north++;
          displayProgress();
        }
        else if (answer == 'option-c') {
          score_silicon++;
          displayProgress();
        }
        else if (answer == 'option-d') {
          score_west++;
          displayProgress();
        }
        else if (answer == 'option-e') {
          score_jeff++;
          displayProgress();
        };

        //console.log(score_cen, score_jeff, score_west, score_north, score_south, score_silicon);
      }
    },

    "4" : function () {
      if ($(".selected").length > 0) {
        $('li').off('click');
        answer = $(".selected").attr('id');

        if (answer == 'option-a') {
          score_jeff++;
          displayProgress();
        } else if (answer == 'option-b') {
          score_silicon++;
          displayProgress();
        }
        else if (answer == 'option-c') {
          score_north++;
          score_south++;
          displayProgress();
        }
        else if (answer == 'option-d') {
          score_west++;
          score_cen++;
          displayProgress();
        };

        //console.log(score_cen, score_jeff, score_west, score_north, score_south, score_silicon);

      }
    },

    "5" : function () {
      if ($(".selected").length > 0) {
        $('li').off('click');
        answer = $(".selected").attr('id');

        if (answer == 'option-a') {
          score_north++;
          score_jeff++;
          displayProgress();
        } else if (answer == 'option-b') {
          score_silicon++;
          score_cen++;
          displayProgress();
        }
        else if (answer == 'option-c') {
          score_south++;
          score_west++;
          displayProgress();
        };

        //console.log(score_cen, score_jeff, score_west, score_north, score_south, score_silicon);

      }
    },

    "6" : function () {
      if ($(".selected").length > 0) {
        $('li').off('click');
        answer = $(".selected").attr('id');

        if (answer == 'option-a') {
          score_jeff++;
          displayProgress();
        } else if (answer == 'option-b') {
          score_silicon++;
          displayProgress();
        }
        else if (answer == 'option-c') {
          score_west++;
          displayProgress();
        }
        else if (answer == 'option-d') {
          score_cen++;
          displayProgress();
        }
        else if (answer == 'option-e') {
          score_south++;
          displayProgress();
        }
        else if (answer == 'option-f') {
          score_north++;
          displayProgress();
        };

        //console.log(score_cen, score_jeff, score_west, score_north, score_south, score_silicon);
      }
    },

    "7" : function () {
      if ($(".selected").length > 0) {
        $('li').off('click');
        answer = $(".selected").attr('id');

        if (answer == 'option-a') {
          score_north++;
          displayProgress();
        } else if (answer == 'option-b') {
          score_jeff++;
          score_west++;
          displayProgress();
        }
        else if (answer == 'option-c') {
          score_south++;
          displayProgress();
        }
        else if (answer == 'option-d') {
          score_silicon++;
          score_cen++;
          displayProgress();
        };

        //console.log(score_cen, score_jeff, score_west, score_north, score_south, score_silicon);

      }
    },

    "8" : function () {
      if ($(".selected").length > 0) {
        $('li').off('click');
        answer = $(".selected").attr('id');

        if (answer == 'option-a') {
          score_north++;
          displayProgress();
        } else if (answer == 'option-b') {
          score_jeff++;
          displayProgress();
        }
        else if (answer == 'option-c') {
          score_silicon++;
          displayProgress();
        }
        else if (answer == 'option-d') {
          score_south++;
          displayProgress();
        }
        else if (answer == 'option-e') {
          score_west++;
          displayProgress();
        }
        else if (answer == 'option-f') {
          score_cen++;
          displayProgress();
        };

        //console.log(score_cen, score_jeff, score_west, score_north, score_south, score_silicon);
      }
    },

    "9" : function () {
      if ($(".selected").length > 0) {
        $('li').off('click');
        answer = $(".selected").attr('id');

        if (answer == 'Jefferson') {
          score_jeff++;
          displayProgress();
        } else if (answer == 'West California') {
          score_west++;
          displayProgress();
        }
        else if (answer == 'North California') {
          score_north++;
          displayProgress();
        }
        else if (answer == 'Central California') {
          score_cen++;
          displayProgress();
        }
        else if (answer == 'Silicon Valley') {
          score_silicon++;
          displayProgress();
        }
        else if (answer == 'South California') {
          score_south++;
          displayProgress();
        };

        //console.log(score_cen, score_jeff, score_west, score_north, score_south, score_silicon);
      }
    },

  };

    // click next button and jump to the next question
    var next = function () {
        currentQuestion++;
        buildQuiz(input);
    }

    var nextQuestion = {

        "1" : function () {
            checkAnswer[1]();
            next();
        },

        "2" : function () {
            checkAnswer[2]();
            next();
        },

        "3" : function () {
            checkAnswer[3]();
            next();
        },

        "4" : function () {
            checkAnswer[4]();
            next();
        },

        "5" : function () {
            checkAnswer[5]();
            next();
        },

        "6" : function () {
            checkAnswer[6]();
            next();
        },

         "7" : function () {
            checkAnswer[7]();
            next();
        },

         "8" : function () {
            checkAnswer[8]();
            next();
        },

    };

    // display final result card and social media sharing
    var link = document.URL

    var finalScoreFinal = function () {
        checkAnswer[9]();
        finalScore();
    };

    var finalScore = function () {

        // compare scores for six states and find the highest one
        var compareScore = [
            {"state": "North California", "score": score_north},
            {"state": "Jefferson", "score": score_jeff},
            {"state": "Silicon Valley", "score": score_silicon},
            {"state": "South California", "score": score_south},
            {"state": "West California", "score": score_west},
            {"state": "Central California", "score": score_cen}
        ];

        compareScore.sort(function (a, b){
        return a.score - b.score
        });

        window.max = compareScore[compareScore.length - 1].state,
        window.max_2 = compareScore[compareScore.length - 2].state;

        // add a final question if two states got the same score
        if (compareScore[compareScore.length - 1].score ==  compareScore[compareScore.length - 2].score){
            buildExtraQuiz();
        } else {

            // show the final resuilt of quiz
            //console.log(window.max);

            $(".quiz-container").html(
                "<div class='scorecard'><div id='youbelongto'>You belong to</div><div id='statename'>" + window.max +
                "</div><div id='content'><div id='facts' style='margin: 20px;'></div><div id='description' style='margin: 20px;'></div></div><div id='social-media'>Share the result on social media!<ul><li><a class=\"fb-share\" href='http://www.facebook.com/sharer.php?u=" + link + "' target='_blank'>" + facebook +
                "</a></li><li><a class=\"twitter-share\" href='http://twitter.com/home?status=I belong to " + max +
                " according to KPCC six California quiz! Check your result here." + link + " via @" + account +
                "' target='_blank'>" + twitter   + "</a></li></ul></div></div>"
            );

            // social media sharing buttons
            $('.quiz-container .fb-share').click(function() {

            });

            $('.quiz-container .twitter-share').click(function() {

            });

            showDescription(input);
            loadMap();
        };
    };

    function showDescription(input) {
        for (i = 0; i < 6; i++ ) {
            if (input[i].result == window.max) {
                $("#description").html(input[i].explanation);
                $("#facts").html(input[i].datapoints);
            };
        };
    };

    // move to the html
    $('head').append('<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />');
    $('head').append('<script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>');
    $('head').append('<script src="data/six_states.js"></script>');

    function unpackQuizHack() {
        var newInput = [];
        for ( var i = 0; i < input.length; i++ ) {
            newInput[i] = convertUrlinJson(input[i]);
        }
        input = newInput;
        buildQuiz(input);
    }

    function convertUrlinJson( data ) {
        $.each( data, function( key, value ) {
            if ( key == 'correct' || key == 'incorrect' ) {
                var j;
                var hexes = data[key].match(/.{1,4}/g) || [];
                var back = "";
                for( j = 0; j<hexes.length; j++ ) {
                    back += String.fromCharCode( parseInt( hexes[j], 16 ) );
                }
                data[key] = back;
            }
        });
        return data;
    }