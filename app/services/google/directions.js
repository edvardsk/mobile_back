const { GOOGLE_API_KEY } = process.env;

const googleMapsClient = require('@google/maps').createClient({
    key: GOOGLE_API_KEY,
    Promise: Promise,
});

// constants
const { DEFAULT_LANGUAGE } = require('constants/languages');

const getDirection = ({ uploading_points, downloading_points }, language = DEFAULT_LANGUAGE) => {
    let items = uploading_points.concat(downloading_points).map(({ longitude, latitude }) => ({ longitude, latitude }));
    const [origin, ...waypoints] = items;
    const destination = waypoints.pop();

    return googleMapsClient.directions({
        origin,
        waypoints,
        destination,
        language,
    })
        .asPromise()
        .then((response) => {
            const routes = response.json.routes;
            if (routes.length) {
                const [{ legs }] = routes;
                const distance = legs.reduce((acc, leg) => acc += leg.distance.value, 0);
                const distanceKm = Math.round(distance / 1000);
    
                return distanceKm;
            }
            return Number.MAX_VALUE;
        });
};

module.exports = {
    getDirection,
};
