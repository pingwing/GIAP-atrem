/**
 * Created by przemek on 18.02.2016.
 */
// get geometry type
var $drawGeometryType = $('#geom_type');
var drawingMode = $drawGeometryType.val();

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

// get the interaction type
var $interaction_type = $('[name="interaction_type"]');
// rebuild interaction when changed
$interaction_type.on('click', function (e) {
    // add new interaction
    if (this.value === 'draw') {
        addDrawInteraction(drawingMode);
    } else {
        addModifyInteraction();
    }
});

// rebuild interaction when the geometry type is changed
$drawGeometryType.on('change', function (e) {
    map.removeInteraction(drawInteraction);
    addDrawInteraction(drawingMode);
});

addDrawInteraction(drawingMode);