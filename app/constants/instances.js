function Geo(longitude, latitude) {
    this.longitude = longitude;
    this.latitude = latitude;
    this.toString = function () {
        return `ST_GeometryFromText('Point(${this.longitude} ${this.latitude})')`;
    };
}

module.exports = {
    Geo,
};
