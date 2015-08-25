var destination,
    origin,
    activityMarker = [];

// returns the html button of the mark placer selected.
var whichMarker = function () {
  var i,
      markPlacers = $('.mark-placer'),
      markPlacer;

  for (i=0; i<markPlacers.length; i++) {
    markPlacer = markPlacers[i];
    if ($(markPlacer).hasClass('btn-primary')) {
      return markPlacer;
    }
  }
};

/*
 * inserts the value at the index into a new array, into the array.
 */
var insertAt = function (value, index, array) {
  return array.slice(0, index).concat([value]).concat(array.slice(index, array.length));
};

/*
 * removes an element form an array
 */
var remove = function (index, array) {
  return array.slice(0, index).concat(array.slice(index+1, array.length));
}

var doMarkerStuff = function (event) {
  var marker = whichMarker(),
      action = !whichMarker() || whichMarker().id;

  switch (action) {
  case 'mark-destination':
    placeDestination(event.latLng);
    break;
  case 'mark-origin':
    placeOrigin(event.latLng);
    break;
  case 'mark-activity':
    placeActivity(event.latLng);
    break;
  default:
    alert('ZOMG! that feature is not implemented yet :(');
    break;
  }
};

// initialices the google map. 
var initialize = function () {
  map = new google.maps.Map($('#adventure-map')[0],
                                {
                                  center : new google.maps.LatLng(-16.5189, -68.1321),
                                  zoom : 6,
                                  mapTypeId: google.maps.MapTypeId.ROADMAP
                                });

  // TODO: try to make the map load faster
  // markers listener...
  google.maps.event.addListener(map, 'click', doMarkerStuff);
};

/*
 * places a mark that will have only one instance, unlike the activity, that can
 * have several instances.
 */
var placeUniqueMark = function (position, icon, oldMark) {
  // since the mark is unique, delete the old mark...
  if (oldMark) {
    oldMark.setMap(null);
  }

  return placeMark(position, icon);
};

/*
 * places a mark on the map.
 */
var placeMark = function (position, icon) {
  return new google.maps.Marker({
    position : position,
    map : map,
    icon : icon
  });
};

/*
 * sets the final destination point of the travel.
 */
var placeDestination = function (latLng) {
  destination = placeUniqueMark(latLng, '/img/destination.png', destination);
  $('input[name=destination-lat-lng]')[0].value = JSON.stringify(latLng);
}

/*
 * sets the origin point of the travel.
 */
var placeOrigin = function (latLng) {
  origin = placeUniqueMark(latLng, '/img/origin.png', origin);
  $('input[name=origin-lat-lng]')[0].value = JSON.stringify(latLng);
};

/*
 * The activity's function for deletion
 */
var activityDeletion = function (event) {
  console.log(event.target);
};

/*
 * adds an activity on the itinerary.
 */
var placeActivity = function (latLng, position) {
  var marker = placeMark(latLng, 'img/activity.png');
  if (!position) {
    marker.index = activityMarker.length;
    activityMarker.push(marker);
  } else {
    marker.index = position;
    activityMarker = insertAt(marker, position, activityMarker);
  }

  marker.addListener('click', function (event) {
    if (whichMarker().id === 'remove-activity') {
      console.log("deleting " + this.index + " from ", activityMarker);
      activityMarker = remove(this.index, activityMarker);
      console.log(activityMarker);
      this.setMap(null);
    }
  })
};

$( document ).ready(function () {
  var markerPlacers = $('.mark-placer'),
      i,
      j,
      markerPlacer;

  for (i=0; i<markerPlacers.length; i++) {
    markerPlacer = markerPlacers[i];
    $(markerPlacer).click(function (event) {
      for (j=0; j<markerPlacers.length; j++) {
        if (markerPlacers[j] !== event.target) {
          $(markerPlacers[j]).removeClass('btn-primary');
        } else {
          $(markerPlacers[j]).addClass('btn-primary');
        }
      }
    })
  }

  $('#page-status')[0].innerText="La página está lista";

});

$( document ).submit(function (e) {

  if (!$('input[name=destination-lat-lng]')[0].value ||
      !$('input[name=origin-lat-lng]')[0].value) {
    alert('ZOMG!! no hay destino u origen marcado en el mapa...')
    e.preventDefault();
  }

  $('input[name="map-zoom"]')[0].value = map.zoom;
  $('input[name="map-lat-lng"]')[0].value = JSON.stringify(map.getCenter());

  // setting up activities...
  var activity = [];

  for (var i=0; i<activityMarker.length; i++) {
    console.log(activityMarker[i].position);
    activity.push({ position: JSON.stringify(activityMarker[i].position) });
  }

  $('input[name="activities"]')[0].value = JSON.stringify(activity);
});

google.maps.event.addDomListener(window, 'load', initialize);
