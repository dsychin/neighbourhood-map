var viewModel = {
    // Google place ids of the locations
    placeIds: [
        'ChIJ4cpG9LrgeUgRnNCiZBYuFRg',
        'ChIJX2yJc7DgeUgR4RHis-kpEuo',
        'ChIJp-RvI7DgeUgRPCtD04s49Jc',
        'ChIJ_b_l6bDgeUgRfFrMswMeYlo',
        'ChIJtygHfLrgeUgRCkUy8cbb51A'
    ],
    // List of places to be binded to the view and markers to be displayed
    places: ko.observableArray(),
    // List of all places that will remain unchanged after initialisation
    staticPlaces: [],
    // Array of google maps marker
    markers: [],
    search: ko.observable(''),
    // This function checks with the staticPlaces array with the search value
    // and add it to the observable array to be displayed
    // and create the markers
    doSearch: function (value) {
        viewModel.places.removeAll();
        deleteMarkers();
        for (var i = 0; i < viewModel.staticPlaces.length; i++) {
            if (viewModel.staticPlaces[i].name.toLowerCase()
                .indexOf(value.toLowerCase()) >= 0) {
                viewModel.places.push(viewModel.staticPlaces[i]);
                createMarker(viewModel.staticPlaces[i], infowindow);
            }
        }
    }
};

var map;
var infowindow;

// Callback function for the Google Maps JS API to initialise the map,
// get details of the place ids and make markers for them
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 52.772,
            lng: -1.207
        },
        zoom: 17
    });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);

    // For each location, find the place details from the place id and
    // make a marker
    for (var i = 0; i < viewModel.placeIds.length; i++) {
        service.getDetails({
            placeId: viewModel.placeIds[i]
        }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                viewModel.places.push(place);
                viewModel.staticPlaces.push(place);
                createMarker(place, infowindow);
            } else {
                alert('Error! Problem retrieving place details!');
            }
        })
    }
}

// This function takes the place object from the places api, and the infowindow
// object to create a marker and an info window for it
function createMarker(place, infowindow) {
    var marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name
    });
    viewModel.markers.push(marker);

    marker.addListener('click', function () {
        populateInfoWindow(this, infowindow, place)
    })
}

// This function is used to populate the info window of a marker with
// information
// The arguments are the marker to add the info window, the info window object
// and the place details for that marker
function populateInfoWindow(marker, infowindow, place) {
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        var content = '<strong>' + place.name + '</strong>';
        infowindow.setContent(content);
        infowindow.open(map, marker);
    }

}

// Deletes all existing markers
function deleteMarkers() {
    for (var i = 0; i < viewModel.markers.length; i++) {
        viewModel.markers[i].setMap(null);
    }
    viewModel.markers = [];
}

function getYelp() {
    var key = '0ia_7CyE6X3prezuNUtB8YOJK8D9UdoXm1Y5BRg4IZKWjTrFkhDzGGzgAhsvqFv2fp8hZT5iJCBjwv0BwExz5gdq_q5OZTLkS0tzvL7YxcKVvjTiyfVLN0_Hm35aWnYx';
    $.ajax({
        url: 'https://api.yelp.com/v3/businesses/search',
        headers: {
            'Authorization': 'Bearer ' + key,
            'Access-Control-Allow-Origin': '*'
        },
        dataType: 'json',
        data: {
            location: 'LE114QH'
        },
        cache: true,
        success: function (data, textStatus, jqXHR) {
            console.log(textStatus);
            console.log(data);
        }
    })
}