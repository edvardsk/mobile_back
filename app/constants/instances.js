function Geo(longitude, latitude) {
    this.longitude = longitude;
    this.latitude = latitude;
    this.toString = function () {
        return `ST_GeographyFromText('Point(${this.longitude} ${this.latitude})')`;
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
