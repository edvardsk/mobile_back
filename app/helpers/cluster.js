const Supercluster = require('supercluster');

// constants
const { HOMELESS_COLUMNS } = require('constants/tables');

const clusterizeItems = (items, query) => {
    const index = new Supercluster({
        radius: 200,
        maxZoom: 16,
        extent: 256,
    });
    const geoItem = items.map(item => ({
        type: 'Feature',
        properties: {
            id: item['id'],
        },
        geometry: {
            id: item['id'],
            type: 'Point',
            coordinates: item['coords'],
        },
    }));

    index.load(geoItem);

    const clusterSW = query[HOMELESS_COLUMNS.CLUSTER_SW] || {
        [HOMELESS_COLUMNS.LONGITUDE]: -180,
        [HOMELESS_COLUMNS.LATITUDE]: -85,
    };
    const clusterNE = query[HOMELESS_COLUMNS.CLUSTER_NE] || {
        [HOMELESS_COLUMNS.LONGITUDE]: 180,
        [HOMELESS_COLUMNS.LATITUDE]: 85,
    };
    const clusterZoom = query[HOMELESS_COLUMNS.ZOOM] || 1;

    const clusters = index.getClusters([
        parseFloat(clusterSW[HOMELESS_COLUMNS.LONGITUDE]),
        parseFloat(clusterSW[HOMELESS_COLUMNS.LATITUDE]),
        parseFloat(clusterNE[HOMELESS_COLUMNS.LONGITUDE]),
        parseFloat(clusterNE[HOMELESS_COLUMNS.LATITUDE])
    ], clusterZoom);

    clusters.forEach((cluster, i) => {
        if (cluster.id) {
            const deepData = index.getLeaves(cluster.id, Infinity);
            clusters[i]['properties']['ids'] = deepData.map(data => data['properties']['id']);
        }
        if (!cluster.properties.cluster) {
            clusters[i]['geometry']['coordinates'] = cluster['geometry']['coordinates'].map(coordinate => parseFloat(coordinate));
        }
    });
    return clusters;
};

module.exports = {
    clusterizeItems,
};
