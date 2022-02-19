const fs = require("fs");
const allAttributesBuffer = fs.readFileSync("./json/attributes.json");
const { attributeRarity, traitTypeCheck } = require("./tools/rarity");
const shuffle = require("./tools/shuffle");

let allAttributes = JSON.parse(allAttributesBuffer.toString());
var generatedAttributes = [];

const generateAttributes = () => {
    for (let entry of Object.entries(allAttributes)) {
        let traitType = entry[0];
        let traitList = entry[1];

        for (let i = 0; i < NFT_NUMBER; i++) {
            if (generatedAttributes[i] === undefined) {
                generatedAttributes[i] = {};
            }

            for (let j = 0; j < traitList.length; j++) {
                let traitValue = traitList[j].value;

                let matches = generatedAttributes.filter(attributes =>
                    attributes[traitType]?.trait_type === traitType
                    &&
                    attributes[traitType]?.value === traitValue
                )

                if (matches.length < NFT_NUMBER * traitList[j].rarity) {
                    generatedAttributes[i][traitType] = { trait_type: traitType, value: traitValue };
                    break;
                }
            }
        }

        shuffle(generatedAttributes);
    }


    if (!fs.existsSync("./assets/list")) {
        fs.mkdirSync("./assets/list");
    }

    let generatedAttributeList = generatedAttributes.map(attributes => Object.values(attributes));
    fs.writeFileSync(`./assets/list/attributeList.json`, JSON.stringify(generatedAttributeList, null, "\t"));
    return generatedAttributeList
}

const generateMetaData = (index, attributes) => {
    const metaDataBuffer = fs.readFileSync("./json/template.json");
    let metaData = JSON.parse(metaDataBuffer.toString());

    metaData.image = `${index}.${IMAGE_FORMAT}`;
    metaData.attributes = attributes;
    metaData.properties.files = [
        {
            "uri": `${index}.${IMAGE_FORMAT}`,
            "type": `image/${IMAGE_FORMAT}`
        }
    ]

    console.log(`MetaData ${index} generated`);
    return metaData
}

const start = (nftNumber) => {
    console.log("Starting process...");
    let generatedAttributes = generateAttributes();

    for (let i = 0; i < nftNumber; i++) {
        let attributes = generatedAttributes[i];
        let metaData = generateMetaData(i, attributes);

        fs.writeFileSync(`./assets/${i}.json`, JSON.stringify(metaData, null, "\t"));
    }

    console.log("Process complete. metaDatas generated.");
    console.log("\n")

    attributeRarity(allAttributes, generatedAttributes, NFT_NUMBER);
    traitTypeCheck(allAttributes, generatedAttributes)
}

const IMAGE_FORMAT = "png"
const NFT_NUMBER = 100;

start(NFT_NUMBER);