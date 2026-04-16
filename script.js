
var map = L.map('map').setView([18.5204, 73.8567], 12);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


fetch('point.json')
    .then(res => res.json())
    .then(data => {

        var hospitals = data.hospitals;
        var parks = data.parks;

        var heatData = hospitals.concat(parks).map(p => [p.lat, p.lng, 0.5]);
        var heat = L.heatLayer(heatData).addTo(map);

        
        var cluster = L.markerClusterGroup();
        var hospitalMarkers = [];
        var parkMarkers = [];

        hospitals.forEach(p => {
            let m = L.marker([p.lat, p.lng]).bindPopup("Hospital");
            hospitalMarkers.push(m);
            cluster.addLayer(m);
        });

        parks.forEach(p => {
            let m = L.marker([p.lat, p.lng]).bindPopup("Park");
            parkMarkers.push(m);
            cluster.addLayer(m);
        });

        map.addLayer(cluster);

        
        document.getElementById("hospital").onchange = function() {
            toggleMarkers(hospitalMarkers, this.checked, cluster);
        };

        document.getElementById("park").onchange = function() {
            toggleMarkers(parkMarkers, this.checked, cluster);
        };

        function toggleMarkers(markers, show, cluster) {
            markers.forEach(m => {
                if (show) cluster.addLayer(m);
                else cluster.removeLayer(m);
            });
        }

    });


function searchLocation() {
    let query = document.getElementById("searchBox").value;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                map.flyTo([data[0].lat, data[0].lon], 14);
            }
        });
}


var distancePoints = [];

function enableDistance() {
    map.on('click', function(e) {
        distancePoints.push(e.latlng);

        if (distancePoints.length == 2) {
            let dist = map.distance(distancePoints[0], distancePoints[1]) / 1000;
            alert("Distance: " + dist.toFixed(2) + " km");
            distancePoints = [];
        }
    });
}


var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    draw: { polygon: true },
    edit: { featureGroup: drawnItems }
});

map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (e) {
    var layer = e.layer;
    drawnItems.addLayer(layer);
    console.log("Coordinates:", layer.getLatLngs());
});