/**
 * Created by przemek on 18.02.2016.
 */
var getText = function (feature, resolution) {
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

var createTextStyle = function (feature, resolution) {
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
    var maxResolution = 5;
    var featureValue = feature.get('maxspeed');
    var styleValue = 50;
    if (featureValue) {
        styleValue = featureValue;
    }

    var strokeWidth = 3;
    if (resolution > maxResolution) {
        strokeWidth = 0;
    }
    var strokeColor = 'rgba(255, 239, 8, 255)';

    if (styleValue < 40) {
        strokeColor = 'rgba(255, 133, 62, 255)'
    }
    else if (styleValue >= 40 && styleValue < 60) strokeWidth = 3;
    else if (styleValue >= 60 && styleValue < 100) strokeWidth = 4;
    else if (styleValue >= 100) {
        strokeWidth = 5;
        strokeColor = 'rgba(0, 255, 0, 255)'
    }

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