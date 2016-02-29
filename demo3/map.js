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
        center: ol.proj.fromLonLat([16.8561817, 52.4873407]),
        zoom: 18
    }),
    controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
        })
    }).extend([
        scaleLineControl, mousePositionControl
    ])
});

var editableLayer = function (workspace, layerName, WFSurl, maxResolution) {
    this.maxResolution = typeof this.maxResolution !== 'undefined' ? this.maxResolution : 2; //default value = 2

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
        maxResolution: maxResolution
    });
};

var drogipolska = new editableLayer('atrem', 'drogipolska', 'http://uslugi.giap.pl/geoserver/wfs', 1000);
var ugg_all_l = new editableLayer('atrem', 'ugg_all_l', 'http://uslugi.giap.pl/geoserver/wfs', 2);
var ugg_all_p = new editableLayer('atrem', 'ugg_all_p', 'http://uslugi.giap.pl/geoserver/wfs', 2);
var ugg_all_s = new editableLayer('atrem', 'ugg_all_s', 'http://uslugi.giap.pl/geoserver/wfs', 2);
var ugg_all_t = new editableLayer('atrem', 'ugg_all_t', 'http://uslugi.giap.pl/geoserver/wfs', 2);
var uww_all_l = new editableLayer('atrem', 'uww_all_l', 'http://uslugi.giap.pl/geoserver/wfs', 2);
var uww_all_p = new editableLayer('atrem', 'uww_all_p', 'http://uslugi.giap.pl/geoserver/wfs', 2);
var uww_all_s = new editableLayer('atrem', 'uww_all_s', 'http://uslugi.giap.pl/geoserver/wfs', 2);
var uww_all_t = new editableLayer('atrem', 'uww_all_t', 'http://uslugi.giap.pl/geoserver/wfs', 2);

var editableLayers = {
    'drogipolska': drogipolska,
    'ugg_all_l': ugg_all_l,
    'ugg_all_p': ugg_all_p,
    'ugg_all_s': ugg_all_s,
    'ugg_all_t': ugg_all_t,
    'uww_all_l': uww_all_l,
    'uww_all_p': uww_all_p,
    'uww_all_s': uww_all_s,
    'uww_all_t': uww_all_t,
};

_.each(_.values(editableLayers), function (layer) {
    map.addLayer(layer.vector);
});

/*var deleteFeature = function () {
 selectInteraction.getFeatures().on('change:length', function (e) {
 transactWFS('delete', e.target.item(0));
 });
 }*/
