const adapter = require('../lib/adapter')

const tests = {
    value: require('./commands/value'),
    type: require('./commands/type'),
    enum: require('./commands/enum'),
    emap: require('./commands/emap'),
    default: require('./commands/default'),
    format: require('./commands/format'),
    increase: require('./commands/increase'),
    reduce: require('./commands/reduce'),
    strict: require('./commands/strict'),
    clears: require('./commands/clears'),
    immutable: require('./commons/immutable'),
    multiLevels: require('./commons/multi-levels'),
    multiRules: require('./commons/multi-rules'),
    flatMode: require('./commons/flat-mode'),
    runtime: require('./commons/runtime'),
    normal: require('./examples/normal'),
}

const now = new Date()
const nowTest = tests.all
if (nowTest) {
    runTest(nowTest)
} else {
    for (const key in tests) {
        runTest(tests[key])
    }
}

function runTest (test) {
    test.run(adapter, {
        now,
        timestamp: +now,
        testData: {
            price: 1.11,
            status: 2,
            type: 0,
            time: now,
            timestamp: +now,
            emptyString: '',
            name: '张三',
            nullKey: null,
            falseKey: false,
        },
    })
}
