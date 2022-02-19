const attributeRarity = (allAttributes, generatedAttributes, totalNumber) => {
    for (let entry of Object.entries(allAttributes)) {
        let traitType = entry[0];
        let traitList = entry[1];
        console.log(`For ${traitType}:`);
        console.log("******************");

        let totalPercentage = 0;
        let rarityList = [];

        for (let trait of traitList) {
            let traitValue = trait.value;

            let match = generatedAttributes.filter(attributes => (
                attributes.some(attribute => (
                    attribute.trait_type === traitType
                    &&
                    attribute.value === traitValue
                ))
            ))

            let percentage = Math.round((match.length / totalNumber) * 100);
            totalPercentage += percentage;

            rarityList.push({ value: traitValue, percentage })
        }

        rarityList.sort((a, b) => (a.percentage - b.percentage));
        rarityList.forEach(item => {
            console.log(`${item.value} - ${item.percentage}%`)
        })
        console.log("\n");

        if (totalPercentage !== 100) {
            console.log(`Beware: totalPercentage is not at 100% - Result: ${totalPercentage}`);
        }
    }
}

const traitTypeCheck = (allAttributes, generatedAttributes) => {
    let incompleteAttributeIndexes = [];

    for (let keys of Object.keys(allAttributes)) {
        let traitType = keys;

        for (let i = 0; i < generatedAttributes.length; i++) {
            if (!generatedAttributes[i].some(attribute => attribute.trait_type === traitType)) {
                incompleteAttributeIndexes.push(i)
            }
        }
    }

    if (incompleteAttributeIndexes && incompleteAttributeIndexes.length > 0) {
        console.log("Beware: some metaDatas are missing attributes at indexes: " + incompleteAttributeIndexes.join(" , "))
        console.log(generatedAttributes[incompleteAttributeIndexes[0]])
    }
}

module.exports = {
    attributeRarity,
    traitTypeCheck,
};