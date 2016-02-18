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

var featuresToInsert = [];
var featuresToUpdateObject = {};
var featuresToDelete = [];

var drawInteraction = null;
var selectInteraction = null;
var modifyInteraction = null;
var dragInteraction = null;
var dragIconPointFeatures = [];

function addModifyInteraction() {
    // remove other interactions
    map.removeInteraction(drawInteraction);

    selectInteraction = new ol.interaction.Select();
    map.addInteraction(selectInteraction);
    var selectedFeat = selectInteraction.getFeatures();

    selectInteraction.on('select', onSelect);

    modifyInteraction = new ol.interaction.Modify({
        features: selectedFeat,
        deleteCondition: function (event) {
            return ol.events.condition.shiftKeyOnly(event) &&
                ol.events.condition.singleClick(event);
        }
    });

    map.addInteraction(modifyInteraction);
    modifyInteraction.on('modifyend', modifiedFeatures);
}

function clearDragIconPointFeatures () {
    _.each(dragIconPointFeatures, function (toDeleteFeat) {
        vectorSource.removeFeature(toDeleteFeat);
    });

    dragIconPointFeatures = [];
}

function onSelect(event) {
    if (event.deselected.length > 0) {
        map.removeInteraction(dragInteraction);

        clearDragIconPointFeatures();
    }

    if (event.selected.length > 0) {
        var selectedFeature = event.selected[0];
        var selectedFeatureExtent = selectedFeature.getGeometry().getExtent();
        var centerPointOfSelectedFeatureExtent = ol.extent.getCenter(selectedFeatureExtent);

        var dragIconPointFeature = new ol.Feature({
            geometry: new ol.geom.Point(centerPointOfSelectedFeatureExtent)
        });

        dragIconPointFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#0000ff'
                })
            })
        }));
        vectorSource.addFeatures([dragIconPointFeature]);

        dragInteraction = new ol.interaction.Modify({
            features: new ol.Collection([dragIconPointFeature])
        });

        var initialPosition = centerPointOfSelectedFeatureExtent;
        var initialClonedGeometry = selectedFeature.getGeometry().clone();
        dragIconPointFeature.on('change', onDragPoint, {
            draggedFeature: selectedFeature,
            initialPosition: initialPosition,
            dragIconPointFeature: dragIconPointFeature,
            initialClonedGeometry: initialClonedGeometry
        });

        map.addInteraction(dragInteraction);
        dragIconPointFeatures.push(dragIconPointFeature);
    }
}

function onDragPoint() {
    var newCoords = this.dragIconPointFeature.getGeometry().getCoordinates();
    var translationVector = [newCoords[0] - this.initialPosition[0], newCoords[1] - this.initialPosition[1]]
    var geometryToTranslate = this.initialClonedGeometry.clone();
    geometryToTranslate.translate(translationVector[0], translationVector[1]);
    this.draggedFeature.setGeometry(geometryToTranslate);
    var modifiedFeatureId = this.draggedFeature.id_;
    featuresToUpdateObject[modifiedFeatureId] = this.draggedFeature;
}

// creates a draw interaction
function addDrawInteraction() {
    // remove other interactions
    map.removeInteraction(selectInteraction);
    map.removeInteraction(modifyInteraction);
    map.removeInteraction(dragInteraction);

    // create the interaction
    drawInteraction = new ol.interaction.Draw({
        source: vector.getSource(),
        type: /** @type {ol.geom.GeometryType} */ ($geom_type.val())
    });
    // add it to the map
    map.addInteraction(drawInteraction);

    // when a new feature has been drawn...
    drawInteraction.on('drawend', addedFeatures);
}

function deleteFeatures() {
    var selectedFeat = selectInteraction.getFeatures();
    if (selectedFeat.getLength() > 0) {
        _.each(selectedFeat.getArray(), function (toDeleteFeat) {
            vectorSource.removeFeature(toDeleteFeat);
            featuresToDelete.push(toDeleteFeat);
        });
        selectedFeat.clear();
        clearDragIconPointFeatures();
    }
    else
        window.alert("Wybierz najpierw obiekt do usunięcia");
}

proj4.defs("EPSG:2180", "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

var transformationFromWebToPL = ol.proj.getTransform('EPSG:3857', 'EPSG:2180');

var transformationFlipCoords = function (a) {
    for (var i = 0; i < a.length; i += 2) {
        var t = a[i];
        a[i] = a[i + 1];
        a[i + 1] = t;
    }
    return a;
};

function modifiedFeatures(event) {
    console.log('PINGWIN: event', event);
    var modifiedFeatures = event.features.getArray();
    if (event.features.getLength() > 0) {
        _.each(modifiedFeatures, function (modifiedFeat) {
            var modifiedFeatureId = modifiedFeat.id_;
            featuresToUpdateObject[modifiedFeatureId] = modifiedFeat;

            var WKTWriter = new ol.format.WKT();
            var featureWKT = WKTWriter.writeFeature(modifiedFeat);
            console.log('PINGWIN: WKT', featureWKT);

            var GeoJSONWriter = new ol.format.GeoJSON();
            var featureGeoJSON = GeoJSONWriter.writeFeature(modifiedFeat);
            console.log('PINGWIN: GeoJSON', featureGeoJSON);
        });
    }
}

function addedFeatures(event) {
    // create a unique id
    // it is later needed to delete features
    var id = uid();
    // give the feature this id
    var addedFeature = event.feature;
    addedFeature.setId(id);

    var geometryInMapCRS = addedFeature.getGeometry();
    var geometryInMapCRSClone = geometryInMapCRS.clone();
    geometryInMapCRSClone.applyTransform(transformationFromWebToPL);
    addedFeature.set('geom', geometryInMapCRSClone);

    featuresToInsert.push(addedFeature);
}

// creates unique id's
var id = 0;
function uid() {
    id = id + 1;
    console.log('PINGWIN: id', id);
    return id;
}

$('#customControlDelete').on('click', function () {
    deleteFeatures();
});

$('#customControlUndo').on('click', function () {
    featuresToInsert = [];
    featuresToUpdateObject = {};
    featuresToDelete = [];
    if (selectInteraction) selectInteraction.getFeatures().clear();
    clearDragIconPointFeatures();
    vector.getSource().clear();
    vector2.getSource().clear();
});

$('#customControlSave').on('click', function () {
    transactWFS();
    featuresToInsert = [];
    featuresToUpdateObject = {};
    featuresToDelete = [];
    if (selectInteraction) selectInteraction.getFeatures().clear();
    clearDragIconPointFeatures();
});

var formatWFS = new ol.format.WFS();
var formatGML = new ol.format.GML({
    featureNS: 'atrem',
    featureType: 'rury_gazociagu',
    srsName: 'EPSG:2180'
});

function removeLowerCaseGeometryNodeForInsert(node) {
    var geometryNodes = node.getElementsByTagName("geometry"), element;
    while (geometryNode = geometryNodes[0]) {
        geometryNode.parentNode.removeChild(geometryNode);
    }
}

function removeNodeForWfsUpdate(node, valueToRemove) {
    var propNodes = node.getElementsByTagName("Property");
    for (var i = 0; i < propNodes.length; i++) {
        var propNode = propNodes[i];
        var propNameNode = propNode.firstElementChild;
        var propNameNodeValue = propNameNode.firstChild;
        if (propNameNodeValue.nodeValue === valueToRemove) {
            propNode.parentNode.removeChild(propNode);
        }
    }
}

var transactWFS = function () {

    var featuresToUpdate = [];
    _.each(_.values(featuresToUpdateObject), function(modifiedFeat) {
        var geometryInMapCRS = modifiedFeat.getGeometry();
        var geometryInMapCRSClone = geometryInMapCRS.clone();
        geometryInMapCRSClone.applyTransform(transformationFromWebToPL);
        geometryInMapCRSClone.applyTransform(transformationFlipCoords);
        modifiedFeat.set('geom', geometryInMapCRSClone);
        featuresToUpdate.push(modifiedFeat);
    });

    console.log('PINGWIN: w transactWFS');
    console.log('PINGWIN: featuresToInsert', featuresToInsert);
    console.log('PINGWIN: featuresToUpdate', featuresToUpdate);
    console.log('PINGWIN: featuresToDelete', featuresToDelete);

    var node = formatWFS.writeTransaction(featuresToInsert, featuresToUpdate, featuresToDelete, formatGML);

    removeLowerCaseGeometryNodeForInsert(node);
    removeNodeForWfsUpdate(node, "geometry");

    var s = new XMLSerializer();
    var str = s.serializeToString(node);
    $.ajax('http://uslugi.giap.pl/geoserver/wfs', {
        type: 'POST',
        dataType: 'xml',
        processData: false,
        contentType: 'text/xml',
        data: str
    }).done();
};

/*var deleteFeature = function () {
 selectInteraction.getFeatures().on('change:length', function (e) {
 transactWFS('delete', e.target.item(0));
 });
 }*/

// get the interaction type
var $interaction_type = $('[name="interaction_type"]');
// rebuild interaction when changed
$interaction_type.on('click', function (e) {
    // add new interaction
    if (this.value === 'draw') {
        addDrawInteraction();
    } else {
        addModifyInteraction();
    }
});

// get geometry type
var $geom_type = $('#geom_type');
// rebuild interaction when the geometry type is changed
$geom_type.on('change', function (e) {
    map.removeInteraction(drawInteraction);
    addDrawInteraction();
});

addDrawInteraction();