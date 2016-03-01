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

var editableLayer = function (workspace, layerName, WFSurl, maxResolution, cqlFilter) {
    this.name = layerName;

    this.vectorSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: function (extent, resolution, projection) {
            console.log('PINGWIN: resolution', resolution);
            var _cqlFilter = typeof cqlFilter !== 'undefined' ? cqlFilter(resolution) : function () {
                return '';
            };
            var _cqlFilterToURL = '';
            if (_cqlFilter.length > 0) {
                _cqlFilterToURL = 'CQL_FILTER=' + _cqlFilter + ' AND BBOX(geom, ' + extent.join(',') + ',\'EPSG:3857\')';
            }
            else _cqlFilterToURL = 'bbox=' + extent.join(',') + ',EPSG:3857';

            console.log('PINGWIN: _cqlFilterToURL', _cqlFilterToURL);
            return WFSurl + '?service=WFS&' +
                'version=1.1.0&request=GetFeature&typename=' + workspace + ':' + layerName + '&' +
                'outputFormat=application/json&srsname=EPSG:3857&' +
                _cqlFilterToURL;
        },
        strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
            maxZoom: 19
        }))
    });

    this.vector = new ol.layer.Vector({
        source: this.vectorSource,
        style: polygonStyleFunction,
        maxResolution: typeof maxResolution !== 'undefined' ? maxResolution : 2
    })
    ;
};

var cqlFilterDrogiPolska = function (resolution) {
    var _cqlFilter = '';
    if (resolution > 5 && resolution <= 350) {
        _cqlFilter = 'maxspeed>80';
    } else if (resolution > 350) {
        _cqlFilter = 'maxspeed>100';
    }
    return _cqlFilter;
};

var drogipolska = new editableLayer('atrem', 'drogipolska', 'http://uslugi.giap.pl/geoserver/wfs', 5000, cqlFilterDrogiPolska);
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
