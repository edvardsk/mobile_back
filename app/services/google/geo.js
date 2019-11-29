const { GOOGLE_API_KEY } = process.env;

const googleMapsClient = require('@google/maps').createClient({
    key: GOOGLE_API_KEY,
    Promise: Promise,
});

// constants
const { DEFAULT_LANGUAGE } = require('constants/languages');

const getPlaceByCoordinates = (latitude, longitude, language = DEFAULT_LANGUAGE) => googleMapsClient.reverseGeocode({
    latlng: {
        lat: latitude,
        lng: longitude,
    },
    language,
})
    .asPromise()
    .then((response) => {
        return response.json.results;
    });

module.exports = {
    getPlaceByCoordinates,
};
