#target photoshop;
//@include "./lib/json.js"

var doc = app.activeDocument;

function resetLayers() {
    var layerIdList = getAllIds("Layer");
    hideLayers(layerIdList);
    var groupIdList = getAllIds("LayerSet");
    showLayers(groupIdList);
}

function hideLayers(idList) {
    for (var j = 0; j < idList.length; j++) {
        if (idList[j]) {
            selectLayerByID(idList[j]);
            activeDocument.activeLayer.visible = false;
        }
    }
};

function showLayers(idList) {
    for (var j = 0; j < idList.length; j++) {
        if (idList[j]) {
            selectLayerByID(idList[j]);
            activeDocument.activeLayer.visible = true;
        }
    }
};

function selectLayerByID(ID) {
    try {
        if (doesIdExists(ID)) {
            var ref = new ActionReference();

            ref.putIdentifier(charIDToTypeID('Lyr '), ID);

            var desc = new ActionDescriptor();

            desc.putReference(charIDToTypeID('null'), ref);

            desc.putBoolean(charIDToTypeID('MkVs'), false);

            executeAction(charIDToTypeID('slct'), desc, DialogModes.NO);
        } 
    } catch (error) {
        //alert(error);
    }

};

function doesIdExists(id) {
    var res = true;
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID('Lyr '), id);
    try { var desc = executeActionGet(ref) } catch (err) { res = false };
    return res;
}

function getAllIds(type) {
    try {

        var ref = new ActionReference();

        ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID('NmbL'));

        ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));

        var count = executeActionGet(ref).getInteger(charIDToTypeID('NmbL')) + 1;

        var LayerIDs = [];

        try {

            activeDocument.backgroundLayer;

            var i = 0;
        } catch (e) { var i = 1; };

        for (var i = 0; i < count; i++) {

            if (i == 0) continue;

            ref = new ActionReference();

            ref.putIndex(charIDToTypeID('Lyr '), i);

            var desc = executeActionGet(ref);

            var ID = desc.getInteger(stringIDToTypeID('layerID'));
            var layerType = ({ 'true': 'LayerSet', 'false': 'Layer' })[!(typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID('layerSection'))).split('Content').length - 1)]

            if (layerType === type) {
                LayerIDs.push(ID);
            }
        };

        return LayerIDs;
    } catch (err) {
    }
};

function getIdFromLayerName(layerName) {
    try {

        var ref = new ActionReference();

        ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID('NmbL'));

        ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));

        var count = executeActionGet(ref).getInteger(charIDToTypeID('NmbL')) + 1;

        try {

            activeDocument.backgroundLayer;

            var i = 0;
        } catch (e) { var i = 1; };

        for (var i = 0; i < count; i++) {

            if (i == 0) continue;

            ref = new ActionReference();

            ref.putName(charIDToTypeID('Lyr '), layerName);

            var desc = executeActionGet(ref);

            var ID = desc.getInteger(stringIDToTypeID('layerID'));
            var name = desc.getString(charIDToTypeID('Nm  '));

            if (name.match(/^<\/Layer group/)) continue;

            return ID
        };
    } catch (err) {
    }
};

function getTraitValue(traitType, attributes) {
    for (var a = 0; a < attributes.length; a++) {
        if (attributes[a].trait_type === traitType) {
            return attributes[a].value;
        }
    }
}

function generateImage(metaData, fileName) {
    try {
        var idList = [];

        var attributes = metaData.attributes;
        var mainColor = getTraitValue("Main Color", attributes);
        var baseColor = getTraitValue("Base Color", attributes);

        for (var j = 0; j < attributes.length; j++) {
            var attributeName = attributes[j].trait_type;
            var attributeValue = attributes[j].value;
            
            if (attributeName === "Dog Breed" || attributeName === "Background") {
                idList.push(getIdFromLayerName(attributeValue));
            } else {
                idList.push(getIdFromLayerName(attributeValue + "_layer"));                
                idList.push(getIdFromLayerName(attributeValue + "_" + mainColor));
                idList.push(getIdFromLayerName(attributeValue + "_" + baseColor));
            }            
        }

        showLayers(idList);
        saveImage("./assets", fileName)
        hideLayers(idList);

    } catch (error) {
        //alert(error);
    }
}

function saveImage(filePath, fileName) {
    var pngFile = File(filePath + "/" + fileName + ".png");
    pngSaveOptions = new PNGSaveOptions();
    doc.saveAs(pngFile, pngSaveOptions, true, Extension.LOWERCASE);
}

function start() {
    resetLayers();

    var i = 0;
    for (var i = 0; i < 2; i++) {
        var scriptFile = File("./assets/" + i + ".json");
        scriptFile.open('r');
        var content = scriptFile.read();
        scriptFile.close();
        var metaData = JSON.parse(content);

        if (metaData) {
            generateImage(metaData, i);
        }
    }
}

start();