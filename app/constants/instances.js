function Geo(longitude, latitude) {
    this.longitude = parseFloat(parseFloat(longitude).toFixed(6));
    this.latitude = parseFloat(parseFloat(latitude).toFixed(6));
    this.toString = function () {
        return `ST_GeographyFromText('Point(${this.longitude} ${this.latitude})')`;
    };
    this.toPointString = function () {
        return `POINT(${this.longitude} ${this.latitude})`;
    };
    this.toCoordinatesString = function () {
        return `${this.longitude} ${this.latitude}`;
    };
}

function GeoLine(longitudeA, latitudeA, longitudeB, latitudeB) {
    this.longitudeA = parseFloat(parseFloat(longitudeA).toFixed(6));
    this.latitudeA = parseFloat(parseFloat(latitudeA).toFixed(6));

    this.longitudeB = parseFloat(parseFloat(longitudeB).toFixed(6));
    this.latitudeB = parseFloat(parseFloat(latitudeB).toFixed(6));
    this.toString = function () {
        return `ST_GeographyFromText('LINESTRING(${this.longitudeA} ${this.latitudeA}, ${this.longitudeB} ${this.latitudeB})')`;
    };
}

function SqlArray(data) {
    this.data = [...data];
    this.toString = function () {
        return `ARRAY [${this.data.map(value => `'${value}'`).toString()}]`;
    };
}

function SqlString(data) {
    this.data = data;
    this.toString = function () {
        return `$$${data}$$`;
    };
}

module.exports = {
    Geo,
    GeoLine,
    SqlArray,
    SqlString,
};
