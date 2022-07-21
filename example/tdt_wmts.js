import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { defaults as defaultControls, ScaleLine } from 'ol/control.js';
import TileLayer from 'ol/layer/Tile.js';
import WMTS from 'ol/source/WMTS';
import { get } from 'ol/proj';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { getTopLeft, getWidth } from 'ol/extent';

import {token} from '../config';

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

let url = "http://t{0-7}.tianditu.gov.cn/";


let projection = get(crs);          // 坐标系
let projectionExtent = projection.getExtent();      // 坐标系的四至范围
let width = getWidth(projectionExtent);   // 坐标系的水平宽度，
let resolutions = new Array(19);                               // 瓦片地图分辨率
let matrixIds = new Array(19);                                //矩阵ID
for (let z = 1; z < 19; z++) {
    resolutions[z] = width / (256 * Math.pow(2, z));
    matrixIds[z] = z;              // 注意这里的matrixId的格式为EPSG:900913:z
}

let wmtsTileGrid = new WMTSTileGrid({
    origin: getTopLeft(projectionExtent), // 原点（左上角）
    resolutions: resolutions,                       // 瓦片地图分辨率
    matrixIds: matrixIds                            // 矩阵ID，就是瓦片坐标系z维度各个层级的标识
});

let layerWMTS = new TileLayer({
    source: new WMTS({
        url: url+"img_c/wmts?tk="+token,
        layer:'img',
        matrixSet: 'c',
        projection: projection,
        format: "tiles",
        wrapX: true,
        tileGrid: wmtsTileGrid
    }),
})
map.addLayer(layerWMTS)

let layerWMTS2 = new TileLayer({
    source: new WMTS({
        url: url+"cia_c/wmts?tk="+token,
        layer:'cia',
        matrixSet: 'c',
        projection: projection,
        format: "tiles",
        wrapX: true,
        tileGrid: wmtsTileGrid
    }),
})

map.addLayer(layerWMTS2)