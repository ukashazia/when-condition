const get = (obj, path, defaultValue = undefined) => (
    String.prototype.split.call(path, /[,[\].]+?/)
        .filter(Boolean)
        .reduce((a, c) => (a && Object.hasOwnProperty.call(a, c)) ? a[c] : defaultValue, obj)
);

const logicalOperators = ['and', 'or'];

var rules = {
    is: function(key, value, data) {
        return get(data, key) === value;
    },
    isNot: function(key, value, data) {
        return get(data, key) != value;
    },
    isOfType: function(key, value, data) {
        return typeof get(data, key) === value;
    },
    isNotOfType: function(key, value, data) {
        return typeof get(data, key) !== value;
    },
    allOf: function(key, values, data) {
        if(!Array.isArray(values)) {
            throw Error('"allOf" condition requires an array as #3 argument');
        }

        var dataValues = get(data, key);
        return values.every((currentValue) => dataValues.includes(currentValue))
    },
    anyOf: function(key, values, data) {
        if(!Array.isArray(values)) {
            throw Error('"anyOf" condition requires an array as #3 argument');
        }

        let dataValue = get(data, key);
        return values.includes(dataValue);
    },
    noneOf: function(key, values, data) {
        if(!Array.isArray(values)) {
            throw Error('"noneOf" condition requires an array as #3 argument');
        }

        let dataValue = get(data, key);
        return !values.includes(dataValue);
    },
    gt: function(key, value, data) {
        return get(data, key) > value;
    },
    gte: function(key, value, data) {
        return get(data, key) >= value
    },
    lt: function(key, value, data) {
        return get(data, key) < value;
    },
    lte: function(key, value, data) {
        return get(data, key) <= value
    },
}

const isValidCondition = (conditions) => {
    if(Array.isArray(conditions)
        && Array.isArray(conditions[1])
        && logicalOperators.includes(conditions[0])
    ) {
        return true;
    }

    return false;
}

const processRule = ([condition, key, value], data) => {
    if(typeof condition !== 'string' || rules[condition] === undefined) {
        throw Error('Invalid comparison rule ' + condition + '.');
    }

    return rules[condition](key, value, data);
}

const processCondition = (condition, data) => {
    if(condition.toLowerCase() === 'or') {
        return data.includes(true);
    }

    return !data.includes(false);
}

const when = (conditions, data) => {
    if (typeof conditions === 'function') {
        return conditions(data);
    }

    if(!isValidCondition(conditions)) {
        return processRule(conditions, data);
    }

    var logicalRule = conditions.slice(0, 1)[0];
    var comparisonRules = conditions.slice(1);
    var result = comparisonRules.map((condition, index) => {
        if (isValidCondition(condition)) {
            return when(condition, data)
        }

        return processRule(condition, data);
    })

    return processCondition(logicalRule, result)
}

export default when;
