const { success } = require('api/response');

// services
const SkillsService = require('services/tables/skills');
const StatsService = require('services/tables/stats');

// formatters
const { formatStatsForResponse } = require('formatters/stats');
const { formatSkillsForResponse } = require('formatters/skills');

const getCharacteristics = async (req, res, next) => {
    try {
        const { user } = res.locals;

        const [ skills, stats ] = await Promise.all([
            SkillsService.getSkillsByUserId(user.id),
            StatsService.getStatsByUserId(user.id)
        ]);

        return success(res, {
            stats: formatStatsForResponse(stats),
            skills: formatSkillsForResponse(skills),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = getCharacteristics;
