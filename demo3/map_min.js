var scaleLineControl=new ol.control.ScaleLine,mousePositionControl=new ol.control.MousePosition({coordinateFormat:ol.coordinate.createStringXY(8),projection:"EPSG:4326",className:"custom-mouse-position",target:document.getElementById("pointer_position"),undefinedHTML:"&nbsp;"}),map=new ol.Map({target:"map",layers:[new ol.layer.Tile({source:new ol.source.OSM})],view:new ol.View({center:ol.proj.fromLonLat([16.916667,52.4]),zoom:10}),controls:ol.control.defaults({attributionOptions:{collapsible:!1}}).extend([scaleLineControl,
mousePositionControl])}),editableLayer=function(a,b,c){this.name=b;this.vectorSource=new ol.source.Vector({format:new ol.format.GeoJSON,url:function(d){return c+"?service=WFS&version=1.1.0&request=GetFeature&typename="+a+":"+b+"&outputFormat=application/json&srsname=EPSG:3857&bbox="+d.join(",")+",EPSG:3857"},strategy:ol.loadingstrategy.tile(ol.tilegrid.createXYZ({maxZoom:19}))});this.vector=new ol.layer.Vector({source:this.vectorSource,style:polygonStyleFunction})},rury_gazociagu=new editableLayer("atrem",
"rury_gazociagu","http://uslugi.giap.pl/geoserver/wfs"),stacje_gazowe=new editableLayer("atrem","stacje_gazowe","http://uslugi.giap.pl/geoserver/wfs"),editableLayers={rury_gazociagu:rury_gazociagu,stacje_gazowe:stacje_gazowe};_.each(_.values(editableLayers),function(a){map.addLayer(a.vector)});