/**
 * Created by przemek on 18.02.2016.
 */
// get active layer
var currentEditLayer = $('#layer_to_edit').val();

// get geometry type
var $drawGeometryType = $('#geom_type');

$('#customControlDelete').on('click', function () {
    deleteFeatures();
});

$('#customControlUndo').on('click', function () {
    featuresToInsert = [];
    featuresToUpdateObject = {};
    featuresToDelete = [];
    if (selectInteraction) selectInteraction.getFeatures().clear();
    clearDragIconPointFeatures();
    _.each(_.values(editableLayers), function (layer) {
        layer.vectorSource.clear();
    });
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
        addDrawInteraction(currentEditLayer, $drawGeometryType.val());
    } else {
        addModifyInteraction(currentEditLayer);
    }
});

// rebuild interaction when the geometry type is changed
$drawGeometryType.on('change', function (e) {
    console.log('PINGWIN: $drawGeometryType.val()', $drawGeometryType.val());
    map.removeInteraction(drawInteraction);
    addDrawInteraction(currentEditLayer, $drawGeometryType.val());
});

addDrawInteraction(currentEditLayer, $drawGeometryType.val());