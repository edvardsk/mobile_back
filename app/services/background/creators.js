const childProcess = require('fork');
const { ACTION_TYPES } = require('constants/background');

const translateCoordinatesCreator = (pointId, language) => {
    const msg = {
        payload: {
            pointId,
            language,
        },
        type: ACTION_TYPES.TRANSLATE_COORDINATES_NAME,
    };
    childProcess.send(msg);
};

module.exports = {
    translateCoordinatesCreator,
};
