proj4.defs("EPSG:2180","+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");proj4.defs("EPSG:2179","+proj=tmerc +lat_0=0 +lon_0=24 +k=0.999923 +x_0=8500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");proj4.defs("EPSG:4326","+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
var transformationFromWebTo2180=ol.proj.getTransform("EPSG:3857","EPSG:2180"),transformationFromWebTo4326=ol.proj.getTransform("EPSG:3857","EPSG:4326"),transformationFromWebTo2179=ol.proj.getTransform("EPSG:3857","EPSG:2179"),getTransformFunction=function(a){if("EPSG:2180"===a)return transformationFromWebTo2180;if("EPSG:4326"===a)return transformationFromWebTo4326;if("EPSG:2179"===a)return transformationFromWebTo2179},transformationFlipCoords=function(a){for(var b=0;b<a.length;b+=2){var c=a[b];a[b]=
a[b+1];a[b+1]=c}return a};function removeLowerCaseGeometryNodeForInsert(a){for(a=a.getElementsByTagName("geometry");geometryNode=a[0];)geometryNode.parentNode.removeChild(geometryNode)}function removeNodeForWfsUpdate(a,b){for(var c=a.getElementsByTagName("Property"),d=0;d<c.length;d++){var e=c[d];e.firstElementChild.firstChild.nodeValue===b&&e.parentNode.removeChild(e)}}function construct(a,b){function c(){return a.apply(this,b)}c.prototype=a.prototype;return new c}
var createLayers=function(a){var b={};_.each(a,function(a){a=construct(editableLayer,a);b[a.layerName]=a});return b},addLayers=function(a){_.each(_.values(a),function(a){map.addLayer(a.vector)})};
