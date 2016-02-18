/**
 * Created by przemek on 18.02.2016.
 */
// get active layer
var $currentEditLayerChoice = $('#layer_to_edit');

// get geometry type
var $drawGeometryType = $('#geom_type');

// get the interaction type
var $interaction_type = $('[name="interaction_type"]');

$('#customControlDelete').on('click', function () {
    deleteFeatures();
});

$('#customControlUndo').on('click', function () {
    featuresToInsert = [];
    featuresToUpdateObject = {};
    featuresToDelete = [];
    if (selectInteraction) selectInteraction.getFeatures().clear();
    clearDragIconPointFeatures(editableLayers[$currentEditLayerChoice.val()].vectorSource);
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

$currentEditLayerChoice.on('change', function () {
    console.log('PINGWIN: $interaction_type.value', $interaction_type.value);
    if ($interaction_type.val() === 'draw') {
        if (this.value == 'rury_gazociagu') {
            addDrawInteraction($currentEditLayerChoice.val(), 'LineString');
        }
        else if (this.value == 'stacje_gazowe') {
            addDrawInteraction($currentEditLayerChoice.val(), 'Point');
        }
        else {
            addDrawInteraction($currentEditLayerChoice.val(), $drawGeometryType.val());
        }

    } else {
        addModifyInteraction($currentEditLayerChoice.val());
    }
});

// rebuild interaction when changed
$interaction_type.on('click', function (e) {
    // add new interaction
    if (this.value === 'draw') {
        $drawGeometryType.prop("disabled", false);
        addDrawInteraction($currentEditLayerChoice.val(), $drawGeometryType.val());
    } else {
        $drawGeometryType.prop("disabled", true);
        addModifyInteraction($currentEditLayerChoice.val());
    }
});

// rebuild interaction when the geometry type is changed
$drawGeometryType.on('change', function (e) {
    console.log('PINGWIN: $drawGeometryType.val()', $drawGeometryType.val());
    addDrawInteraction($currentEditLayerChoice.val(), $drawGeometryType.val());
});

addDrawInteraction($currentEditLayerChoice.val(), $drawGeometryType.val());