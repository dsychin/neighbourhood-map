var viewModel = {
    placeIds: ['ChIJ4cpG9LrgeUgRnNCiZBYuFRg', 'ChIJX2yJc7DgeUgR4RHis-kpEuo'],
    places: ko.observableArray(),
    markers: []
};

var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 52.772099,
            lng: -1.206166
        },
        zoom: 15
    });

    var infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);

    // For each location, find the place details from the place id and
    // make a marker.
    for (var i = 0; i < viewModel.placeIds.length; i++) {
        service.getDetails({
            placeId: viewModel.placeIds[i]
        }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                viewModel.places.push(place);
                createMarker(place, infowindow);
            } else {
                alert('Error! Problem retrieving place details!');
            }
        })
    }
}

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

function populateInfoWindow(marker, infowindow, place) {
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        var content = '<strong>' + place.name + '</strong>';
        infowindow.setContent(content);
        infowindow.open(map, marker);
    }

}