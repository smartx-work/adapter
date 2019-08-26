const adapter = require('../lib/adapter')

const tests = [
    require('./commons/immutable'),
    require('./commands/type'),
    require('./commands/enum'),
    require('./commands/emap'),
    require('./commands/default'),
    require('./commands/format'),
    require('./commands/increase'),
    require('./commands/reduce'),
    require('./commands/strict'),
    require('./commons/multi-levels'),
    require('./commons/multi-rules'),
    require('./commons/flat-mode'),
    require('./commons/runtime'),
    require('./examples/normal'),
] // .slice(12, 13)

const now = new Date()
tests.forEach(test => test.run(adapter, {
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
}))
