const Supercluster = require('supercluster');

// constants
const { HOMELESS_COLUMNS } = require('constants/tables');

const clusterizeCargos = (cargos, query) => {
    const index = new Supercluster({
        radius: 200,
        maxZoom: 16,
        extent: 256,
    });
    const goeCargo = cargos.map(cargo => ({
        type: 'Feature',
        properties: {
            id: cargo['id'],
        },
        geometry: {
            id: cargo['id'],
            type: 'Point',
            coordinates: [cargo['uploading_points'][0][HOMELESS_COLUMNS.LONGITUDE], cargo['uploading_points'][0][HOMELESS_COLUMNS.LATITUDE]],
        },
    }));

    index.load(goeCargo);

    const clusterSW = query[HOMELESS_COLUMNS.CLUSTER_SW];
    const clusterNE = query[HOMELESS_COLUMNS.CLUSTER_NE];
    const clusterZoom = query[HOMELESS_COLUMNS.ZOOM];

    const clusters = index.getClusters([
        parseFloat(clusterSW[HOMELESS_COLUMNS.LONGITUDE]),
        parseFloat(clusterSW[HOMELESS_COLUMNS.LATITUDE]),
        parseFloat(clusterNE[HOMELESS_COLUMNS.LONGITUDE]),
        parseFloat(clusterNE[HOMELESS_COLUMNS.LATITUDE])
    ], clusterZoom);

    clusters.forEach((cluster, i) => {
        if (cluster.id) {
            const deepData = index.getLeaves(cluster.id);
            clusters[i]['properties']['ids'] = deepData.map(data => data['properties']['id']);
        }
    });
    return clusters;
};

module.exports = {
    clusterizeCargos,
};
