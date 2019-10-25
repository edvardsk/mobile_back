const parseStringToJson = (data, dataPath, parentData, parentDataProperty) => {
    try {
        const value = JSON.parse(parentData[parentDataProperty]);
        parentData[parentDataProperty] = value;
    } catch (error) {
        return false;
    }
    return true;
};

module.exports = {
    parseStringToJson,
};
