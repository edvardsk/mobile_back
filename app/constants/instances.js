function Geo(longitude, latitude) {
    this.longitude = parseFloat(longitude).toFixed(6);
    this.latitude = parseFloat(latitude).toFixed(6);
    this.toString = function () {
        return `ST_GeographyFromText('Point(${this.longitude} ${this.latitude})')`;
    };
    this.toCoordinatesString = function () {
        return `${this.longitude} ${this.latitude}`;
    };
}

function SqlArray(data) {
    this.data = [...data];
    this.toString = function () {
        return `ARRAY [${this.data.map(value => `'${value}'`).toString()}]`;
    };
}

module.exports = {
    Geo,
    SqlArray,
};
