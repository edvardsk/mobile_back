const uuid = require('uuid/v4');
const { success } = require('api/response');

// services
const TablesService = require('services/tables');
const SkillsService = require('services/tables/skills');
const StatsService = require('services/tables/stats');
const UserService = require('services/tables/users');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');

// formatters
const SkillsFormatters = require('formatters/skills');
const StatsFormatters = require('formatters/stats');
const UsersFormatters = require('formatters/users');

const createCharacteristics = async (req, res, next) => {
    try {
        const { body } = req;
        const { user } = res.locals;

        const { skills, stats } = body;

        const skillsId = uuid();
        const statsId = uuid();

        const transactionsList = [];

        const id = user.id;

        const skillsData = SkillsFormatters.formatSkillsToSave(skillsId, id, skills);
        const statsData = StatsFormatters.formatStatsToSave(statsId, id, stats);
        const userData = UsersFormatters.formatLinksToUpdate(statsId, skillsId);

        transactionsList.push(
            SkillsService.addRecordsAsTransaction(skillsData)
        );
        transactionsList.push(
            StatsService.addRecordsAsTransaction(statsData)
        );
        transactionsList.push(
            UserService.updateUserAsTransaction(id, userData)
        );

        await TablesService.runTransaction(transactionsList);

        return success(res, {
            skillsId,
            statsId,
        }, SUCCESS_CODES.CREATED);

    } catch (error) {
        next(error);
    }
};

module.exports = createCharacteristics;
