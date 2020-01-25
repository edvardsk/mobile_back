const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.USERS.COLUMNS;

const formatUserForSaving = (id, body, password, key) => ({
    id,
    [cols.PASSWORD]: password,
    [cols.KEY]: key,
    [cols.NAME]: body[cols.NAME],
});

const formatUserForResponse = user => ({
    id: user.id,
    [cols.NAME]: user[cols.NAME],
    [cols.CREATED_AT]: user[cols.CREATED_AT],
    [cols.SKILLS_ID]: user[cols.SKILLS_ID],
    [cols.STATS_ID]: user[cols.STATS_ID],
});

const formatPasswordDataToUpdate = data => ({
    [cols.PASSWORD]: data.hash,
    [cols.KEY]: data.key,
});

const formatUserToUpdate = data => ({
    [cols.NAME]: data[cols.NAME],
});

const formatLinksToUpdate = (statsId, skillsId) => ({
    [cols.SKILLS_ID]: skillsId,
    [cols.STATS_ID]: statsId,
});

module.exports = {
    formatUserForSaving,
    formatUserForResponse,
    formatPasswordDataToUpdate,
    formatUserToUpdate,
    formatLinksToUpdate,
};
