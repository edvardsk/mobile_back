const SQL_TABLES = {
    USERS: {
        NAME: 'users',
        COLUMNS: {
            NAME: 'name',
            PASSWORD: 'password',
            KEY: 'key',
            SKILLS_ID: 'skills_id',
            STATS_ID: 'stats_id',
            CREATED_AT: 'created_at',
        },
    },

    SKILLS: {
        NAME: 'skills',
        COLUMNS: {
            SMALL_GUN: 'small_gun',
            BIG_GUN: 'big_gun',
            ENERGY_WEAPON: 'energy_weapon',
            UNARMED: 'unarmed',
            MELEE_WEAPON: 'melee_weapon',
            THROWING: 'throwing',
            DOCTOR: 'doctor',
            SCIENCE: 'science',
            USER_ID: 'user_id',
        },
    },

    STATS: {
        NAME: 'stats',
        COLUMNS: {
            STRENGTH: 'strength',
            PERCEPTION: 'perception',
            ENDURANCE: 'endurance',
            INTELLIGENCE: 'intelligence',
            AGILITY: 'agility',
            LUCK: 'luck',
            USER_ID: 'user_id',
        },
    },
};

module.exports = {
    SQL_TABLES,
};
