/**
 * Created by przemek on 18.02.2016.
 */
var drawInteraction = null;
var selectInteraction = null;
var modifyInteraction = null;
var dragInteraction = null;
var dragIconPointFeatures = [];

var featuresToInsert = {};
var featuresToUpdateObject = {};
var featuresToDelete = {};

function clearTransactionFeatures() {
    featuresToInsert = {};
    featuresToUpdateObject = {};
    featuresToDelete = {};
    _.each(editableLayers, function (layer) {
        console.log('PINGWIN: layer', layer);
        featuresToInsert[layer.name] = [];
        featuresToUpdateObject[layer.name] = {};
        featuresToDelete[layer.name] = [];
    });
}

clearTransactionFeatures();

function deleteFeatures() {
    var currentEditLayer = this;
    var selectedFeat = selectInteraction.getFeatures();
    if (selectedFeat.getLength() > 0) {
        _.each(selectedFeat.getArray(), function (toDeleteFeat) {
            vectorSource.removeFeature(toDeleteFeat);
            featuresToDelete[currentEditLayer].push(toDeleteFeat);
        });
        selectedFeat.clear();
        _.each(_.values(editableLayers), function (layer) {
            console.log('PINGWIN: layer', layer);
            clearDragIconPointFeatures(layer.vectorSource);
        });
    }
    else
        window.alert("Wybierz najpierw obiekt do usunięcia");
}

function modifiedFeatures(event) {
    var currentEditLayer = this;
    console.log('PINGWIN w modifiedFeatures: currentEditLayer', currentEditLayer);
    console.log('PINGWIN: event', event);
    var modifiedFeatures = event.features.getArray();
    if (event.features.getLength() > 0) {
        _.each(modifiedFeatures, function (modifiedFeat) {
            var modifiedFeatureId = modifiedFeat.id_;
            console.log('PINGWIN: featuresToUpdateObject', featuresToUpdateObject);
            featuresToUpdateObject[currentEditLayer][modifiedFeatureId] = modifiedFeat;

            /*var WKTWriter = new ol.format.WKT();
            var featureWKT = WKTWriter.writeFeature(modifiedFeat);
            console.log('PINGWIN: WKT', featureWKT);*/

            var GeoJSONWriter = new ol.format.GeoJSON();
            var featureGeoJSON = GeoJSONWriter.writeFeature(modifiedFeat);
            console.log('PINGWIN: GeoJSON', featureGeoJSON);
        });
    }
}

function addedFeatures(event) {
    var currentEditLayer = this;
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

    featuresToInsert[currentEditLayer].push(addedFeature);
}

// creates unique id's
var id = 0;
function uid() {
    id = id + 1;
    console.log('PINGWIN: id', id);
    return id;
}

function removeAllInteractions () {
    map.removeInteraction(selectInteraction);
    map.removeInteraction(modifyInteraction);
    map.removeInteraction(dragInteraction);
    map.removeInteraction(drawInteraction);
}

function addModifyInteraction(currentEditLayer) {
    console.log('PINGWIN: addModifyInteraction: currentEditLayer', currentEditLayer);
    // remove other interactions
    removeAllInteractions();

    selectInteraction = new ol.interaction.Select({layers: [editableLayers[currentEditLayer].vector]});
    map.addInteraction(selectInteraction);
    var selectedFeat = selectInteraction.getFeatures();

    selectInteraction.on('select', onSelect, currentEditLayer);

    modifyInteraction = new ol.interaction.Modify({
        features: selectedFeat,
        deleteCondition: function (event) {
            return ol.events.condition.shiftKeyOnly(event) &&
                ol.events.condition.singleClick(event);
        }
    });

    map.addInteraction(modifyInteraction);
    modifyInteraction.on('modifyend', modifiedFeatures, currentEditLayer);
}

function clearDragIconPointFeatures (currentEditLayerVectorSource) {
    console.log('PINGWIN: currentEditLayer', currentEditLayerVectorSource);
    _.each(dragIconPointFeatures, function (toDeleteFeat) {
        currentEditLayerVectorSource.removeFeature(toDeleteFeat);
    });

    dragIconPointFeatures = [];
}

function onSelect(event) {
    var currentEditLayer = this;
    if (event.deselected.length > 0) {
        map.removeInteraction(dragInteraction);
        console.log('PINGWIN:onSelect deselect currentEditLayer', currentEditLayer);
        clearDragIconPointFeatures(editableLayers[currentEditLayer].vectorSource);
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
        editableLayers[currentEditLayer].vectorSource.addFeatures([dragIconPointFeature]);

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
function addDrawInteraction(currentEditLayer, geometryType) {
    console.log('PINGWIN: addDrawInteraction: currentEditLayer, geometryType', currentEditLayer, geometryType);
    // remove other interactions
    removeAllInteractions();

    // create the interaction
    drawInteraction = new ol.interaction.Draw({
        source: editableLayers[currentEditLayer].vectorSource,
        type: /** @type {ol.geom.GeometryType} */ (geometryType)
    });
    // add it to the map
    map.addInteraction(drawInteraction);

    // when a new feature has been drawn...
    drawInteraction.on('drawend', addedFeatures, currentEditLayer);
}
