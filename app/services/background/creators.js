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

const extractExchangeRateCreator = (countryId, extractingDate) => {
    const msg = {
        payload: {
            countryId,
            extractingDate,
        },
        type: ACTION_TYPES.EXTRACT_CHANGE_RATE,
    };
    childProcess.send(msg);
};

const autoCancelUnconfirmedDealCreator = (dealId) => {
    const msg = {
        payload: {
            dealId,
        },
        type: ACTION_TYPES.AUTO_CANCEL_UNCONFIRMED_DEAL,
    };
    childProcess.send(msg);
};

const autoSetGoingToUploadDealStatusCreator = (dealId, timeToExecute) => {
    const msg = {
        payload: {
            dealId,
            timeToExecute,
        },
        type: ACTION_TYPES.AUTO_SET_GOING_TO_UPLOAD_DEAL_STATUS,
    };
    childProcess.send(msg);
};

module.exports = {
    translateCoordinatesCreator,
    extractExchangeRateCreator,
    autoCancelUnconfirmedDealCreator,
    autoSetGoingToUploadDealStatusCreator,
};
