// constants
const { FILES_GROUPS, DOCUMENTS } = require('constants/files');
const { SQL_TABLES } = require('constants/tables');

const colsFiles = SQL_TABLES.FILES.COLUMNS;

const validateVisasDates = (labelsArr, body) => {
    const visasLabels = labelsArr.filter(labels => (
        labels.includes(FILES_GROUPS.BASIC) && labels.includes(DOCUMENTS.VISA) && labels.length === 3
    ));

    const bodyKeysSet = new Set(Object.keys(body));
    return visasLabels.reduce((acc, labels) => {
        const visaName = labels.pop();

        const keyDateFrom = `visa.${visaName}.${colsFiles.VALID_DATE_FROM}`;
        const keyDateTo = `visa.${visaName}.${colsFiles.VALID_DATE_TO}`;

        if (!bodyKeysSet.has(keyDateFrom)) {
            acc.push('');
        }
        if (!bodyKeysSet.has(keyDateTo)) {
            acc.push('');
        }

        const dateFrom = new Date(body[keyDateFrom]);
        const dateTo = new Date(body[keyDateTo]);

        if (dateFrom >= dateTo) {
            acc.push('');
        }

        return acc;
    }, []);
};

module.exports = {
    validateVisasDates,
};
