var getText=function(b,d){var c=b.get("atrs1"),a="";c&&(a=c);100<d&&(a="");return a},createTextStyle=function(b,d){return new ol.style.Text({textAlign:"center",textBaseline:"middle",font:"bold 10px Verdana",text:getText(b,d),fill:new ol.style.Fill({color:"blue"}),stroke:new ol.style.Stroke({color:"#ffffff",width:3}),offsetX:0,offsetY:12,rotation:0})};
function createStrokeStyle(b,d){var c=b.get("srednica"),a=400;c&&(a=c);var c="#0000ff",e=3;150>a?(e=2,c="rgba(255, 133, 62, 255)"):150<=a&&350>a?e=3:350<=a&&500>a?e=4:500<=a&&(e=5);return new ol.style.Stroke({color:c,width:e})}function polygonStyleFunction(b,d){return new ol.style.Style({stroke:createStrokeStyle(b,d),fill:new ol.style.Fill({color:"rgba(0, 0, 255, 0.05)"}),image:new ol.style.Circle({radius:7,fill:new ol.style.Fill({color:"#ff0000"})}),text:createTextStyle(b,d)})};
