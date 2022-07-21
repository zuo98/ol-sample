import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { defaults as defaultControls, ScaleLine } from 'ol/control.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON'
import TileWMS from 'ol/source/TileWMS.js';
import OSM from 'ol/source/OSM';
import axios from 'axios';

var layerOSM = new TileLayer({
        source: new OSM()
    });

var map = new Map({
    controls: defaultControls().extend([
        new ScaleLine({
            units: 'metric'
        })
    ]),
    layers: [layerOSM,],
    target: 'map',
    view: new View({
        projection: 'EPSG:4326',
        center: [146.16946334098182, -42.974199409348905],
        zoom: 10
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
let url = "http://localhost:8090/geoserver/wms";
let layer = "topp:tasmania_water_bodies";

let tileWMS = new TileWMS({
    url: url,
    params: {
        'LAYERS': layer,
        'TILED': true
    },
    serverType:'geoserver',
    crossOrigin:'anonymous',
})

var tileLayer = new TileLayer({
    source: tileWMS,
    // visible:false,
});
map.addLayer(tileLayer)

let vectorSource = new VectorSource({wrapX: true,})
let vectorLayer = new VectorLayer({
    source:vectorSource,
})
map.addLayer(vectorLayer);

map.on("click",(evt)=>{
    if(tileLayer.getVisible()){
        let viewResolution = map.getView().getResolution();
        let url = tileLayer.getSource()?.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution,
            crs,
            {"INFO_FORMAT":'application/json'}
        );
        if(url){
            axios.get(url).then((res) => {
                vectorSource.clear();
                document.getElementById('info').innerHTML=''
        
                let geoJSON = new GeoJSON();
                let features = geoJSON.readFeatures(res.data);
                vectorSource.addFeatures(features);
                let props = features[0].getProperties();
                let html = ""
                for(let item in props){
                    if(item != "geometry"){
                        html = html+"<p>"+item+":"+props[item]+"</p>";
                    }
                }
                document.getElementById('info').innerHTML=html;
            })
        }
    }
})
map.on("pointermove",(evt)=>{
    if(evt.dragging){
        return
    }
    let data = tileLayer.getData(evt.pixel);
    let hit = data && data[3] > 0; 
    map.getTargetElement().style.cursor= hit?"pointer":'';
})