/**
 * Created by przemek on 18.02.2016.
 */

var formatWFS = new ol.format.WFS();

var transactWFS = function () {
    _.each(editableLayers, function (layer) {
        var formatGML = new ol.format.GML({
            featureNS: 'atrem',
            featureType: layer.name,
            srsName: 'EPSG:2180'
        });

        var _thisLayerFeaturesToInsert = featuresToInsert[layer.name];
        var _thisLayerFeaturesToUpdateObject = featuresToUpdateObject[layer.name];
        var _thisLayerFeaturesToDelete = featuresToDelete[layer.name];

        var _thisLayerFeaturesToUpdate = [];
        _.each(_.values(_thisLayerFeaturesToUpdateObject), function (modifiedFeat) {
            var geometryInMapCRS = modifiedFeat.getGeometry();
            var geometryInMapCRSClone = geometryInMapCRS.clone();
            geometryInMapCRSClone.applyTransform(transformationFromWebToPL);
            geometryInMapCRSClone.applyTransform(transformationFlipCoords);
            modifiedFeat.set('geom', geometryInMapCRSClone);
            _thisLayerFeaturesToUpdate.push(modifiedFeat);
        });

        var _totalFeaturesInTransaction = _thisLayerFeaturesToInsert.length + _thisLayerFeaturesToUpdate.length + _thisLayerFeaturesToDelete.length;

        console.log('PINGWIN: _thisLayerFeaturesToInsert', _thisLayerFeaturesToInsert);
        console.log('PINGWIN: _thisLayerFeaturesToUpdate', _thisLayerFeaturesToUpdate);
        console.log('PINGWIN: _thisLayerFeaturesToDelete', _thisLayerFeaturesToDelete);
        var node = formatWFS.writeTransaction(_thisLayerFeaturesToInsert, _thisLayerFeaturesToUpdate, _thisLayerFeaturesToDelete, formatGML);

        if (_totalFeaturesInTransaction > 0) {
            console.log('PINGWIN: w transactWFS dla warstwy',layer.name, 'zmienia',_totalFeaturesInTransaction,'rekordów');

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
        }
    });
};