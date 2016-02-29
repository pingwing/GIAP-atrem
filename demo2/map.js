/**
 * Created by przemek on 18.02.2016.
 */
var scaleLineControl = new ol.control.ScaleLine();

var mousePositionControl = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(8),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('pointer_position'),
    undefinedHTML: '&nbsp;'
});

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([16.916667, 52.4]),
        zoom: 10
    }),
    controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
        })
    }).extend([
        scaleLineControl, mousePositionControl
    ])
});

var editableLayer = function (workspace, layerName, WFSurl) {
    this.name = layerName;

    this.vectorSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: function (extent) {
            return WFSurl + '?service=WFS&' +
                'version=1.1.0&request=GetFeature&typename=' + workspace + ':' + layerName + '&' +
                'outputFormat=application/json&srsname=EPSG:3857&' +
                'bbox=' + extent.join(',') + ',EPSG:3857';
        },
        strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
            maxZoom: 19
        }))
    });

    this.vector = new ol.layer.Vector({
        source: this.vectorSource,
        style: polygonStyleFunction,
        //maxResolution: 50
    });
};

var lodzkie_buildings = new editableLayer('atrem', 'lodzkie-buildings', 'http://uslugi.giap.pl/geoserver/wfs');
var lodzkie_railways = new editableLayer('atrem', 'lodzkie-railways', 'http://uslugi.giap.pl/geoserver/wfs');
var lodzkie_roads = new editableLayer('atrem', 'lodzkie-roads', 'http://uslugi.giap.pl/geoserver/wfs');
var malopolskie_buildings = new editableLayer('atrem', 'malopolskie-buildings', 'http://uslugi.giap.pl/geoserver/wfs');
var malopolskie_railways = new editableLayer('atrem', 'malopolskie-railways', 'http://uslugi.giap.pl/geoserver/wfs');
var malopolskie_roads = new editableLayer('atrem', 'malopolskie-roads', 'http://uslugi.giap.pl/geoserver/wfs');
var podkarpackie_buildings = new editableLayer('atrem', 'podkarpackie-buildings', 'http://uslugi.giap.pl/geoserver/wfs');
var podkarpackie_railways = new editableLayer('atrem', 'podkarpackie-railways', 'http://uslugi.giap.pl/geoserver/wfs');
var swietokrzyskie_buildings = new editableLayer('atrem', 'swietokrzyskie-buildings', 'http://uslugi.giap.pl/geoserver/wfs');
var swietokrzyskie_railways = new editableLayer('atrem', 'swietokrzyskie-railways', 'http://uslugi.giap.pl/geoserver/wfs');
var swietokrzyskie_roads = new editableLayer('atrem', 'swietokrzyskie-roads', 'http://uslugi.giap.pl/geoserver/wfs');
var wielkopolskie_buildings = new editableLayer('atrem', 'wielkopolskie-buildings', 'http://uslugi.giap.pl/geoserver/wfs');
var wielkopolskie_railways = new editableLayer('atrem', 'wielkopolskie-railways', 'http://uslugi.giap.pl/geoserver/wfs');
var wielkopolskie_roads = new editableLayer('atrem', 'wielkopolskie-roads', 'http://uslugi.giap.pl/geoserver/wfs');

var editableLayers = {
    'lodzkie_buildings': lodzkie_buildings,
    'lodzkie_railways': lodzkie_railways,
    'lodzkie_roads': lodzkie_roads,
    'malopolskie_buildings': malopolskie_buildings,
    'malopolskie_railways': malopolskie_railways,
    'malopolskie_roads': malopolskie_roads,
    'podkarpackie_buildings': podkarpackie_buildings,
    'podkarpackie_railways': podkarpackie_railways,
    'swietokrzyskie_buildings': swietokrzyskie_buildings,
    'swietokrzyskie_railways': swietokrzyskie_railways,
    'swietokrzyskie_roads': swietokrzyskie_roads,
    'wielkopolskie_buildings': wielkopolskie_buildings,
    'wielkopolskie_railways': wielkopolskie_railways,
    'wielkopolskie_roads': wielkopolskie_roads
};

_.each(_.values(editableLayers), function (layer) {
    map.addLayer(layer.vector);
});

/*var deleteFeature = function () {
 selectInteraction.getFeatures().on('change:length', function (e) {
 transactWFS('delete', e.target.item(0));
 });
 }*/
