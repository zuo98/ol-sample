import Map from 'ol/Map';
import Stamen from 'ol/source/Stamen';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import {Heatmap as HeatmapLayer, Tile as TileLayer} from 'ol/layer';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

const blur = document.getElementById('blur');
const radius = document.getElementById('radius');


const count = 3500;
const features = new Array(count);
const e = 180;
for (let i = 0; i < count; ++i) {
//   const coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e];
  const coordinates = [74+ 62 * Math.random(), 3+ 50 * Math.random()];
  features[i] = new Feature(new Point(coordinates));
}

console.time();
console.timeLog()
const source = new VectorSource({
  features: features,
});

const vector = new HeatmapLayer({
  source: source,
  blur: parseInt(blur.value, 10),
  radius: parseInt(radius.value, 10),
//   weight: function (feature) {
//     // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
//     // standards-violating <magnitude> tag in each Placemark.  We extract it from
//     // the Placemark's name instead.
//     const name = feature.get('name');
//     const magnitude = parseFloat(name.substr(2));
//     return magnitude - 5;
//   },
});
console.timeLog()


const raster = new TileLayer({
  source: new Stamen({
    layer: 'toner',
  }),
});

new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    projection: 'EPSG:4326',
    center: [100, 25],
    zoom: 4,
  }),
});
console.timeLog()
console.timeEnd()
const blurHandler = function () {
  vector.setBlur(parseInt(blur.value, 10));
};
blur.addEventListener('input', blurHandler);
blur.addEventListener('change', blurHandler);

const radiusHandler = function () {
  vector.setRadius(parseInt(radius.value, 10));
};
radius.addEventListener('input', radiusHandler);
radius.addEventListener('change', radiusHandler);