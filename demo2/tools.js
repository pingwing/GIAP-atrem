proj4.defs("EPSG:2180", "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");

var transformationFromWebToPL = ol.proj.getTransform('EPSG:3857', 'EPSG:4326');

var transformationFlipCoords = function (a) {
    for (var i = 0; i < a.length; i += 2) {
        var t = a[i];
        a[i] = a[i + 1];
        a[i + 1] = t;
    }
    return a;
};

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