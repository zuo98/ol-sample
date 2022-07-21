import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { defaults as defaultControls, ScaleLine } from 'ol/control.js';
import TileLayer from 'ol/layer/Tile.js';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';

import {token} from '../config.js';

var map = new Map({
    controls: defaultControls().extend([
        new ScaleLine({
            units: 'metric'
        })
    ]),
    layers: [],
    target: 'map',
    view: new View({
        projection: 'EPSG:4326',
        center: [114.30263654660828, 30.590732724008863],
        zoom: 7
    })
});

map.on("click", (e) => {
    let center = map.getView().getCenter();
    let zoom = map.getView().getZoom();
    let resolution = map.getView().getResolution();

    console.log("click point: ", e.coordinate);
    console.log("map center: ", center);
    console.log("map zoom: ", zoom);
    console.log("map resolution: ", resolution);
});


//======
let crs = "EPSG:4326";
let url = "http://t{0-7}.tianditu.com/DataServer";


let tdt_img_c = new TileLayer({
    source: new XYZ({
        url:url+"?T=img_c&x={x}&y={y}&l={z}&tk="+token,
        projection: crs,
    })
});

let tdt_cia_c = new TileLayer({
    source: new XYZ({
        url:url+"?T=cia_c&x={x}&y={y}&l={z}&tk="+token,
        projection: crs,
    })
});
let tdt_groupLayer = new LayerGroup({
    layers:[tdt_img_c, tdt_cia_c,]
})
map.addLayer(tdt_groupLayer)
