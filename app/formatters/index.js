const formatQueueByPriority = (values, currentProp, nextProp) => {
    const result = [];
    let nextRecord = null;
    while (result.length !== values.length) {
        const record = values.find(value => value[nextProp] === nextRecord);
        delete record[nextProp];
        result.unshift(record);
        nextRecord = record[currentProp];
    }
    return result;
};

module.exports = {
    formatQueueByPriority,
};
