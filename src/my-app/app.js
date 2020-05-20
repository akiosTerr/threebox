// This example downloads a truck model from an external OBJ/MTL file, adds it to the map, and drives it around via paths fetched from the Mapbox Directions API
//import * as token from './data/config'
const token = require('./data/config');

if (!token) console.error("Config not set! Make a copy of 'config_template.js', add in your access token, and save the file as 'config.js'.");

mapboxgl.accessToken = token.accessToken;

//costa do sauipe: -37.9254, -12.4444,
//planetagps: -46.638325 ,-23.538736

var origin = [-46.638325, -23.538736];
var destination, line;
var truck;

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: origin,
    zoom: 18,
    pitch: 60,
    bearing: 90
});

map.on('style.load', () => {

    map
        .addLayer({
            id: 'custom_layer',
            type: 'custom',
            renderingMode: '3d',
            onAdd: (map, mbxContext) => {

                window.tb = new Threebox(
                    map,
                    mbxContext,
                    { defaultLights: true }
                );


                // import truck from an external obj file, "scaling up its size 10x" bullshit !
                var options = {
                    obj: 'models/fiat_uno_rev3.obj',
                    mtl: 'models/fiat_uno_rev3.mtl',
                    scale: .07
                }

                tb.loadObj(options, (model) => {

                    truck = model.setCoords(origin);

                    tb.add(truck);
                })

            },

            render: (gl, matrix) => {
                tb.update();
            }
        });
})
    .on('click', (e) => {
        var pt = [e.lngLat.lng, e.lngLat.lat];
        console.log(pt);

        travelPath(pt);
    })

//enable3dBuildings(map);
var arr = ['a', 'b', 'c', 'd'];
var delay = 1000;
// run_coordinates(arr);

function run_coordinates(c) {
    for (let i = 0; i < c.length; i++) {
        setTimeout(function timer() {
            console.log(rngRound(1, 100));
        }, i * delay);
    }
}


function travelPath(destination) {

    // request directions. See https://docs.mapbox.com/api/navigation/#directions for details


    var url = "https://api.mapbox.com/directions/v5/mapbox/driving/" + [origin, destination].join(';') + "?geometries=geojson&access_token=" + token.accessToken


    fetchFunction(url, (data) => {

        // extract path geometry from callback geojson, and set duration of travel
        var options = {
            path: data.routes[0].geometry.coordinates,
            duration: 2000
        }

        // start the truck animation with above options, and remove the line when animation ends
        truck.followPath(
            options,
            () => {
                tb.remove(line);
            }
        );

        // set up geometry for a line to be added to map, lofting it up a bit for *style*
        var lineGeometry = options.path
            .map((coordinate) => {
                return coordinate
            })

        // create and add line object
        line = tb.line({
            geometry: lineGeometry,
            width: 5,
            color: 'lightblue'
        })

        tb.add(line);

        // set destination as the new origin, for the next trip
        origin = destination;
    })
}

//convenience function for fetch

function fetchFunction(url, cb) {
    fetch(url)
        .then(
            (response) => {
                if (response.status === 200) {
                    response.json()
                        .then((data) => {
                            cb(data)
                        })
                }
            }
        )
}