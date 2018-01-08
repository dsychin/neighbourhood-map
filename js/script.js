var viewModel = {
    locations: ko.observableArray([{
        name: 'Devonshire Fisheries',
        placeId: 'ChIJ4cpG9LrgeUgRnNCiZBYuFRg'
    }]),
    markers: []
};

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 52.772099,
            lng: -1.206166
        },
        zoom: 15
    });

    var infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    var markers = [];

    for (var i = 0; i < viewModel.locations().length; i++) {
        service.getDetails({
            placeId: viewModel.locations()[i].placeId
        }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                var marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: map
                });
                viewModel.markers.push(marker);
            }
        })
    }
}