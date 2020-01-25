const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.SKILLS.COLUMNS;

const formatSkillsToSave = (id, userId, body) => ({
    id,
    [cols.USER_ID]: userId,

    [cols.SMALL_GUN]: body[cols.SMALL_GUN],
    [cols.BIG_GUN]: body[cols.BIG_GUN],
    [cols.ENERGY_WEAPON]: body[cols.ENERGY_WEAPON],
    [cols.UNARMED]: body[cols.UNARMED],
    [cols.MELEE_WEAPON]: body[cols.MELEE_WEAPON],
    [cols.THROWING]: body[cols.THROWING],
    [cols.DOCTOR]: body[cols.DOCTOR],
    [cols.SCIENCE]: body[cols.SCIENCE],
});

const formatSkillsForResponse = (skills) => ({
    id: skills.id,

    [cols.SMALL_GUN]: skills[cols.SMALL_GUN],
    [cols.BIG_GUN]: skills[cols.BIG_GUN],
    [cols.ENERGY_WEAPON]: skills[cols.ENERGY_WEAPON],
    [cols.UNARMED]: skills[cols.UNARMED],
    [cols.MELEE_WEAPON]: skills[cols.MELEE_WEAPON],
    [cols.THROWING]: skills[cols.THROWING],
    [cols.DOCTOR]: skills[cols.DOCTOR],
    [cols.SCIENCE]: skills[cols.SCIENCE],
});

const formatSkillsToUpdate = (skills) => ({
    [cols.SMALL_GUN]: skills[cols.SMALL_GUN],
    [cols.BIG_GUN]: skills[cols.BIG_GUN],
    [cols.ENERGY_WEAPON]: skills[cols.ENERGY_WEAPON],
    [cols.UNARMED]: skills[cols.UNARMED],
    [cols.MELEE_WEAPON]: skills[cols.MELEE_WEAPON],
    [cols.THROWING]: skills[cols.THROWING],
    [cols.DOCTOR]: skills[cols.DOCTOR],
    [cols.SCIENCE]: skills[cols.SCIENCE],
});

module.exports = {
    formatSkillsToSave,
    formatSkillsForResponse,
    formatSkillsToUpdate,
};
