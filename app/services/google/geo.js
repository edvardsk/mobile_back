const { GOOGLE_API_KEY } = process.env;

const googleMapsClient = require('@google/maps').createClient({
    key: GOOGLE_API_KEY,
    Promise: Promise,
});

// constants
const { DEFAULT_LANGUAGE } = require('constants/languages');

const getCityByCoordinates = (latitude, longitude, language = DEFAULT_LANGUAGE) => googleMapsClient.reverseGeocode({
    latlng: {
        lat: latitude,
        lng: longitude,
    },
    language,
})
    .asPromise()
    .then((response) => {
        const results = response.json.results;

        const resultsObj = {};

        results.forEach((res) => {
            const { types, address_components } = res;
            const fistType = types[0];

            const localResult = address_components.find(component => {
                const { types } = component;
                return types.includes(fistType);
            });

            if (localResult) {
                resultsObj[fistType] = localResult.long_name;
            }
        });

        const priorities = [
            'locality',
            'administrative_area_level_5',
            'administrative_area_level_4',
            'administrative_area_level_3',
            'administrative_area_level_2',
            'administrative_area_level_1',
            'political',
            'route',
            'country'
        ];
        let translationPlace = null;
        priorities.some(priority => {
            if (resultsObj[priority]) {
                translationPlace = resultsObj[priority];
                return true;
            } else {
                return false;
            }
        });
        return translationPlace;
    });

module.exports = {
    getCityByCoordinates,
};
