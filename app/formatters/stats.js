const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.STATS.COLUMNS;

const formatStatsToSave = (id, userId, body) => ({
    id,
    [cols.USER_ID]: userId,

    [cols.STRENGTH]: body[cols.STRENGTH],
    [cols.PERCEPTION]: body[cols.PERCEPTION],
    [cols.ENDURANCE]: body[cols.ENDURANCE],
    [cols.INTELLIGENCE]: body[cols.INTELLIGENCE],
    [cols.AGILITY]: body[cols.AGILITY],
    [cols.LUCK]: body[cols.LUCK],
});

const formatStatsForResponse = (stats) => ({
    id: stats.id,

    [cols.STRENGTH]: stats[cols.STRENGTH],
    [cols.PERCEPTION]: stats[cols.PERCEPTION],
    [cols.ENDURANCE]: stats[cols.ENDURANCE],
    [cols.INTELLIGENCE]: stats[cols.INTELLIGENCE],
    [cols.AGILITY]: stats[cols.AGILITY],
    [cols.LUCK]: stats[cols.LUCK],

});

const formatStatsToUpdate = (stats) => ({
    [cols.STRENGTH]: stats[cols.STRENGTH],
    [cols.PERCEPTION]: stats[cols.PERCEPTION],
    [cols.ENDURANCE]: stats[cols.ENDURANCE],
    [cols.INTELLIGENCE]: stats[cols.INTELLIGENCE],
    [cols.AGILITY]: stats[cols.AGILITY],
    [cols.LUCK]: stats[cols.LUCK],
});

module.exports = {
    formatStatsToSave,
    formatStatsForResponse,
    formatStatsToUpdate,
};


