/**
 * Created by przemek on 18.02.2016.
 */
// get active layer
var $currentEditLayerChoice = $('#layer_to_edit');

// get geometry type
var $drawGeometryType = $('#geom_type');

// get the interaction type
var $interaction_type = $('[name="interaction_type"]');

var layer_to_edit = document.getElementById('layer_to_edit');
_.each(editableLayers, function(editableLayer) {
    layer_to_edit.options[layer_to_edit.options.length] = new Option(editableLayer.name, editableLayer.layerName);
});


$('#customControlDelete').on('click', function () {
    deleteFeatures($currentEditLayerChoice.val());
});

$('#customControlUndo').on('click', function () {
    clearTransactionFeatures();
    if (selectInteraction) selectInteraction.getFeatures().clear();
    clearDragIconMultiPointFeatures($currentEditLayerChoice.val());
    _.each(_.values(editableLayers), function (layer) {
        layer.vectorSource.clear();
    });
});

$('#customControlSave').on('click', function () {
    console.log('PINGWIN: featuresToInsert', featuresToInsert);
    console.log('PINGWIN: featuresToUpdateObject', featuresToUpdateObject);
    console.log('PINGWIN: featuresToDelete', featuresToDelete);
    transactWFS();
    clearTransactionFeatures();
    if (selectInteraction) selectInteraction.getFeatures().clear();
    clearDragIconMultiPointFeatures();
});

$currentEditLayerChoice.on('change', function () {
    if ($('[name="interaction_type"]:checked').val() === 'draw') {
        if (this.value == 'rury_gazociagu') {
            $drawGeometryType.val("MultiLineString");
            addDrawInteraction($currentEditLayerChoice.val(), 'MultiLineString');
        }
        else if (this.value == 'stacje_gazowe') {
            $drawGeometryType.val("MultiPoint");
            addDrawInteraction($currentEditLayerChoice.val(), 'MultiPoint');
        }
        else {
            addDrawInteraction($currentEditLayerChoice.val(), $drawGeometryType.val());
        }

    } else {
        if (this.value == 'rury_gazociagu') {
            $drawGeometryType.val("MultiLineString");
        }
        else if (this.value == 'stacje_gazowe') {
            $drawGeometryType.val("MultiPoint");
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
    //console.log('PINGWIN: $drawGeometryType.val()', $drawGeometryType.val());
    addDrawInteraction($currentEditLayerChoice.val(), $drawGeometryType.val());
});

addDrawInteraction($currentEditLayerChoice.val(), $drawGeometryType.val());