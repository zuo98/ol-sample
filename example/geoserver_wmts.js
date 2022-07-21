import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { defaults as defaultControls, ScaleLine } from 'ol/control.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/vector';
import WMTS from 'ol/source/WMTS';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON'
import { get } from 'ol/proj';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { getTopLeft, getWidth } from 'ol/extent';
import axios from 'axios';

import Control from 'ol/control/control';

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
let url = "http://localhost:8090/geoserver/gwc/service/wmts";
let layer = "topp:tasmania_water_bodies";

let projection = get(crs);          // 坐标系
let projectionExtent = projection.getExtent();      // 坐标系的四至范围
let width = getWidth(projectionExtent);   // 坐标系的水平宽度，
let resolutions = [];                               // 瓦片地图分辨率
let matrixIds = [];                                  //矩阵ID
for (let z = 0; z < 21; z++) {
    resolutions[z] = width / (256 * Math.pow(2, z + 1));
    matrixIds[z] = crs+ ":" + z;              // 注意这里的matrixId的格式为EPSG:900913:z
}

let wmtsTileGrid = new WMTSTileGrid({
    origin: getTopLeft(projectionExtent), // 原点（左上角）
    resolutions: resolutions,                       // 瓦片地图分辨率
    matrixIds: matrixIds                            // 矩阵ID，就是瓦片坐标系z维度各个层级的标识
});

let WMTSSource = new WMTS({
    url: url,
    layer: layer,
    matrixSet: crs,
    projection: projection,
    format: "image/png",
    wrapX: true,
    tileGrid: wmtsTileGrid
})

let layerWMTS = new TileLayer({
    source: WMTSSource,
})

map.addLayer(layerWMTS)

let vectorSource = new VectorSource({wrapX: true,})
let vectorLayer = new VectorLayer({
    source:vectorSource,
})
map.addLayer(vectorLayer);

map.on("click", (evt) => {
    let tileSize = 256;

    let url = WMTSSource.getUrls()[0];

    let clickCoor = evt.coordinate;
    let origin = getTopLeft(projectionExtent);
    let zoom = Math.round(map.getView().getZoom()) - 1;
    let resolution = resolutions[zoom];

    let fx = (clickCoor[0] - origin[0]) / (resolution * tileSize);
    let fy = (origin[1] - clickCoor[1]) / (resolution * tileSize)
    let tileCol = Math.floor(fx)
    let tileRow = Math.floor(fy)

    let tileI = Math.floor((fx - tileCol) * tileSize);
    let tileJ = Math.floor((fy - tileRow) * tileSize);

    let params = {
        layer: layer,
        tilematrixset: crs,
        Request: "GetFeatureInfo",
        TileMatrix: crs+ ":" + zoom,
        InfoFormat: "application/json",
        TileCol: tileCol,
        TileRow: tileRow,
        I: tileI,
        J: tileJ
    }
    axios.get(url, {
        params: params
    }).then((res) => {
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
})

map.on("pointermove",(evt)=>{
    if(evt.dragging){
        return
    }
    let data = layerWMTS.getData(evt.pixel);
    let hit = data && data[3] > 0; 
    map.getTargetElement().style.cursor= hit?"pointer":'';
})

let control =  new Control({element:document.createElement('div')});
control.setMap(map);
console.log(control);
