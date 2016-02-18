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
    clearTransactionFeatures();
    if (selectInteraction) selectInteraction.getFeatures().clear();
    clearDragIconPointFeatures(editableLayers[$currentEditLayerChoice.val()].vectorSource);
    _.each(_.values(editableLayers), function (layer) {
        layer.vectorSource.clear();
    });
});

$('#customControlSave').on('click', function () {
    console.log('PINGWIN: featuresToInsert', featuresToInsert);
    console.log('PINGWIN: featuresToUpdateObject', featuresToUpdateObject);
    console.log('PINGWIN: featuresToDelete', featuresToDelete);
    //transactWFS();
    clearTransactionFeatures();
    if (selectInteraction) selectInteraction.getFeatures().clear();
    clearDragIconPointFeatures(editableLayers[$currentEditLayerChoice.val()].vectorSource);
});

$currentEditLayerChoice.on('change', function () {
    if ($('[name="interaction_type"]:checked').val() === 'draw') {
        if (this.value == 'rury_gazociagu') {
            $drawGeometryType.val("LineString");
            addDrawInteraction($currentEditLayerChoice.val(), 'LineString');
        }
        else if (this.value == 'stacje_gazowe') {
            $drawGeometryType.val("Point");
            addDrawInteraction($currentEditLayerChoice.val(), 'Point');
        }
        else {
            addDrawInteraction($currentEditLayerChoice.val(), $drawGeometryType.val());
        }

    } else {
        if (this.value == 'rury_gazociagu') {
            $drawGeometryType.val("LineString");
        }
        else if (this.value == 'stacje_gazowe') {
            $drawGeometryType.val("Point");
        }
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