const { success } = require('api/response');

const { SQL_TABLES } = require('constants/tables');

// services
const TablesService = require('services/tables');
const SkillsService = require('services/tables/skills');
const StatsService = require('services/tables/stats');
const UsersService = require('services/tables/users');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');

// formatters
const SkillsFormatters = require('formatters/skills');
const StatsFormatters = require('formatters/stats');

const table = SQL_TABLES.USERS;
const cols = table.COLUMNS;

const updateCharacteristics = async (req, res, next) => {
    try {
        const { user } = res.locals;

        const { body } = req;
        const { skills, stats } = body;

        const userData = await UsersService.getUser(user.id);

        const skillsId = userData[cols.SKILLS_ID];
        const statsId = userData[cols.STATS_ID];

        const transactionsList = [];

        const skillsData = SkillsFormatters.formatSkillsToUpdate(skills);
        const statsData = StatsFormatters.formatStatsToUpdate(stats);

        transactionsList.push(
            SkillsService.updateRecordsAsTransaction(skillsId, skillsData)
        );
        transactionsList.push(
            StatsService.updateRecordsAsTransaction(statsId, statsData)
        );

        await TablesService.runTransaction(transactionsList);

        return success(res, {
            skillsId: skillsId,
            statsId: statsId,
        }, SUCCESS_CODES.CREATED);

    } catch (error) {
        next(error);
    }
};

module.exports = updateCharacteristics;
