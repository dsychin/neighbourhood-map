var viewModel = {
    error: ko.observable(null),
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
        viewModel.places([]);
        deleteMarkers();
        for (var i = 0; i < viewModel.staticPlaces.length; i++) {
            if (viewModel.staticPlaces[i].name.toLowerCase()
                .indexOf(value.toLowerCase()) >= 0 || value == '') {
                viewModel.places.push(viewModel.staticPlaces[i]);
                createMarker(viewModel.staticPlaces[i]);
            }
        }
    },
    // Called when a user click on the list
    bounce: function (place) {
        for (var i = 0; i < viewModel.markers.length; i++) {
            if (viewModel.markers[i].title == place.name) {
                populateInfoWindow(viewModel.markers[i], place);
                viewModel.markers[i].setAnimation(google.maps.Animation.BOUNCE);
                stopBounceDelay(i);
            }
        }
    }
};

var map;

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
                searchFoursquare(place);
            } else {
                viewModel.error('Error! Problem retrieving Google Maps place' +
                    ' details!');
            }
        })
    }
}

// This function takes the place object from the places api, and the infowindow
// object to create a marker and an info window for it
function createMarker(place) {
    var marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name
    });
    viewModel.markers.push(marker);

    marker.addListener('click', function () {
        populateInfoWindow(this, place);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function (marker) {
            marker.setAnimation(null);
        }, 1500, this);
    })
}

// This function is used to populate the info window of a marker with
// information
// The arguments are the marker to add the info window, the info window object
// and the place details for that marker
function populateInfoWindow(marker, place) {
    var infowindow = new google.maps.InfoWindow();
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        var content = '';
        content += '<img alt="icon" class="icon" src="' + place.icon + '">';
        content += ' <strong>' + place.name + '</strong><br>';
        content += '<em>' + place.vicinity + '<em><br>';
        if (place.foursquare) {
            if (place.foursquare.price) {
                content += 'Price: ' + place.foursquare.price.currency + '<br>';
            }
            content += 'Check ins: ' + place.foursquare.stats.checkinsCount +
                '<br>';
            content += '<a href="' + place.foursquare.canonicalUrl +
                '" target="_blank">Foursquare</a><br>';
        }
        content += '<a href="' + place.url +
            '" target="_blank">Google Maps</a><br>';
        if (place.website) {
            content += '<a href="' + place.website +
                '" target="_blank">Website</a><br>';
        }
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

// Search for the locations based on name and lat lng then pass the result
// to the getFoursquareVenue function
function searchFoursquare(place) {
    var urlSearch = 'https://api.foursquare.com/v2/venues/search';
    var clientId = '2WWEAMHMYKZHXBSFSGYKJZG1XMJC5MJMB2R1KRU4WNDXRL3L';
    var clientSecret = 'EFW23EHMB5WYDHS1ZSLQ32F51WJSXRHGWYTMPFKCBC5QOCXC';
    var versionDate = '20180121';

    $.ajax({
        url: urlSearch,
        dataType: 'json',
        data: {
            client_id: clientId,
            client_secret: clientSecret,
            ll: place.geometry.location.lat() + ',' +
                place.geometry.location.lng(),
            query: place.name,
            v: versionDate,
            limit: 1
        },
        success: function (data) {
            if (data.response.venues.length > 0) {
                getFoursquareVenue(data.response.venues[0].id, place);
            } else {
                createMarker(place);
            }
        },
        error: function () {
            viewModel.error('There was a problem reaching Foursquare!');
        }
    })
}

// Get the venue details from foursquare and update the view model
function getFoursquareVenue(venueId, place) {
    var urlDetails = 'https://api.foursquare.com/v2/venues/' + venueId;
    var clientId = '2WWEAMHMYKZHXBSFSGYKJZG1XMJC5MJMB2R1KRU4WNDXRL3L';
    var clientSecret = 'EFW23EHMB5WYDHS1ZSLQ32F51WJSXRHGWYTMPFKCBC5QOCXC';
    var versionDate = '20180121';

    $.ajax({
        url: urlDetails,
        dataType: 'json',
        data: {
            client_id: clientId,
            client_secret: clientSecret,
            v: versionDate
        },
        success: function (data) {
            // Get the place object by comparing venue name
            var oldPlace = $.grep(viewModel.places(), function (e) {
                return e.name == data.response.venue.name;
            })
            // Checks if results exist
            if (oldPlace.length > 0) {
                // Copy the old array to a new array variable
                var newPlace = $.extend(true, [], oldPlace);
                // Add foursquare data to new array object
                newPlace[0].foursquare = data.response.venue;
                // Create a new array which contains the updated place info
                var newArray = viewModel.staticPlaces.map(function (obj) {
                    if (obj == oldPlace[0]) {
                        return newPlace[0];
                    } else {
                        return obj;
                    }
                })
                // Replace viewmodel with updated array
                viewModel.staticPlaces = newArray;
                viewModel.places(newArray);

                createMarker(newPlace[0]);
            } else {
                createMarker(place);
            }
        },
        error: function () {
            viewModel.error('There was a problem reaching Foursquare!');
        }
    })
}

// Stop the Google Maps marker bounce animation after a delay
function stopBounceDelay(index) {
    setTimeout(function () {
        viewModel.markers[index].setAnimation(null);
    }, 1500)
}