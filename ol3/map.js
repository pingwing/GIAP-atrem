/**
 * Created by przemek on 18.02.2016.
 */
var scaleLineControl = new ol.control.ScaleLine();

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
        scaleLineControl
    ])
});

var editableLayer = function (workspace, layerName, WFSurl) {
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

var rury_gazociagu = new editableLayer('atrem', 'rury_gazociagu', 'http://uslugi.giap.pl/geoserver/wfs');
var stacje_gazowe = new editableLayer('atrem', 'stacje_gazowe', 'http://uslugi.giap.pl/geoserver/wfs');

var editableLayers = {'rury_gazociagu': rury_gazociagu, 'stacje_gazowe': stacje_gazowe};

_.each(_.values(editableLayers), function (layer) {
    map.addLayer(layer.vector);
});

/*var deleteFeature = function () {
 selectInteraction.getFeatures().on('change:length', function (e) {
 transactWFS('delete', e.target.item(0));
 });
 }*/
