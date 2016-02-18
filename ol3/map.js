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

var vectorSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: function (extent) {
        return 'http://uslugi.giap.pl/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=atrem:rury_gazociagu&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
        maxZoom: 19
    }))
});

var vectorSource2 = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: function (extent) {
        return 'http://uslugi.giap.pl/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=atrem:stacje_gazowe&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
        maxZoom: 19
    }))
});


var getText = function(feature, resolution) {
    var type = 'normal';
    var maxResolution = 100;
    var featureValue = feature.get('atrs1');
    var text = '';
    if (featureValue) {
        text = featureValue;
    }

    if (resolution > maxResolution) {
        text = '';
    } else if (type == 'hide') {
        text = '';
    } else if (type == 'shorten') {
        text = text.trunc(12);
    } else if (type == 'wrap') {
        text = stringDivider(text, 16, '\n');
    }

    return text;
};

var createTextStyle = function(feature, resolution) {
    var align = 'center';
    var baseline = 'middle';
    var size = '10px';
    var offsetX = 0;
    var offsetY = 12;
    var weight = 'bold';
    var rotation = 0;
    var fontName = 'Verdana';
    var font = weight + ' ' + size + ' ' + fontName;
    var fillColor = 'blue';
    var outlineColor = '#ffffff';
    var outlineWidth = 3;

    return new ol.style.Text({
        textAlign: align,
        textBaseline: baseline,
        font: font,
        text: getText(feature, resolution),
        fill: new ol.style.Fill({color: fillColor}),
        stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
        offsetX: offsetX,
        offsetY: offsetY,
        rotation: rotation
    });
};

function createStrokeStyle(feature, resolution) {
    var featureValue = feature.get('srednica');
    var diameter = 400;
    if (featureValue) {
        diameter = featureValue;
    }

    var strokeColor = 'rgba(255, 239, 8, 255)';
    var strokeWidth = 3;
    if (diameter < 150) {strokeWidth = 2; strokeColor = 'rgba(255, 133, 62, 255)'}
    else if (diameter >= 150 && diameter < 350) strokeWidth = 3;
    else if (diameter >= 350 && diameter < 500) strokeWidth = 4;
    else if (diameter >= 500) strokeWidth = 5;

    return new ol.style.Stroke({
        color: strokeColor,
        width: strokeWidth
    });
}

function polygonStyleFunction(feature, resolution) {
    return new ol.style.Style({
        stroke: createStrokeStyle(feature, resolution),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.05)'
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: '#0000ff'
            })
        }),
        text: createTextStyle(feature, resolution)
    });
}

var vector = new ol.layer.Vector({
    source: vectorSource,
    style: polygonStyleFunction,
    //maxResolution: 50
});

map.addLayer(vector);

var vector2 = new ol.layer.Vector({
    source: vectorSource2,
    style: polygonStyleFunction,
    //maxResolution: 50
});

map.addLayer(vector2);



/*var deleteFeature = function () {
 selectInteraction.getFeatures().on('change:length', function (e) {
 transactWFS('delete', e.target.item(0));
 });
 }*/
