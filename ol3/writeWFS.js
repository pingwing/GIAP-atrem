/**
 * Created by przemek on 18.02.2016.
 */
/**
 * Created by przemek on 18.02.2016.
 */

var formatWFS = new ol.format.WFS();
var formatGML = new ol.format.GML({
    featureNS: 'atrem',
    featureType: 'rury_gazociagu',
    srsName: 'EPSG:2180'
});

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