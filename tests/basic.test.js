/* eslint-disable no-undef */
const adapter = require('../lib/adapter')
const { transform } = adapter

const testData = require('./test-data')

const now = new Date()
const baseData = {
    price: 1.11,
    status: 2,
    type: 0,
    time: now,
    timestamp: +now,
    emptyString: '',
    name: '张三',
}

describe('\n=== 数据类型转化 === ，采用JS内置的转化规则执行转化', () => {
    test('单值型配置；数字转字符串', () => {
        const newData = transform({ price: String }, baseData)
        expect(newData.price).toBe('1.11')
    })
    test('对象型配置；数字转字符串', () => {
        const newData = transform({ price: { $type: String } }, baseData)
        expect(newData.price).toBe('1.11')
    })
    test('字符串型配置；数字转字符', () => {
        const newData = transform({ price: 'type:String' }, baseData)
        expect(newData.price).toBe('1.11')
    })
    test('单值型配置；数字转布尔值', () => {
        const newData = transform({ status: Boolean }, baseData)
        expect(newData.status).toBe(true)
    })
    test('单值型配置；数字转布尔值', () => {
        const newData = transform({ type: Boolean }, baseData)
        expect(newData.type).toBe(false)
    })
    test('单值型配置；字符串转布尔值', () => {
        const newData = transform({ emptyString: Boolean }, baseData)
        expect(newData.emptyString).toBe(false)
    })
    test('单值型配置；字符串转布尔值', () => {
        const newData = transform({ name: Boolean }, baseData)
        expect(newData.name).toBe(true)
    })
    test('单值型配置；时间戳转时间', () => {
        const newData = transform({ timestamp: Date }, baseData)
        expect(newData.timestamp instanceof Date).toBe(true)
    })
    test('单值型配置；时间转时间戳', () => {
        const newData = transform({ time: Number }, baseData)
        expect(newData.time).toBe(+now)
    })
})

describe('\n=== 枚举类型转化 ===', () => {
    const testData = { state: 1 }

    test('对象型配置；基础枚举转化', () => {
        const newData = transform({ state: { $enum: ['中国', '美国', '日本', '英国'] } }, testData)
        expect(newData.state).toBe('美国')
    })

    test('字符串型配置；基础枚举转化', () => {
        const newData = transform({ state: 'enum:中国,美国,日本,英国' }, testData)
        expect(newData.state).toBe('美国')
    })
})

describe('\n=== 映射类型转化 ===', () => {
    const testData = { status1: 'hasReady', status2: 'hasDestory' }

    test('对象型配置；基础映射类型转化', () => {
        const newData = transform({ status1: { $emap: { hasReady: '已就绪', hasDestory: '已销毁' } } }, testData)
        expect(newData.status1).toBe('已就绪')
    })

    test('字符串型配置；基础映射类型转化', () => {
        const newData = transform({ status2: 'emap:hadReady:已就绪,hasDestory:已销毁' }, testData)
        expect(newData.status2).toBe('已销毁')
    })
})

describe('\n=== 默认值 ===', () => {
    const testData = { userName: '张三', books: [ { name: '水浒传', price: null, contents: null }, { name: null, price: null, contents: ['这是一本天书', '无人能够练成'] } ] }

    test('字符串型配置；值模式默认值', () => {
        const newData = transform({
            books: {
                name: 'default:武林秘籍残本',
            },
        }, testData)

        expect(newData.books).toEqual([
            { name: '水浒传' },
            { name: '武林秘籍残本' },
        ])
    })

    test('对象型配置；函数模式默认值', () => {
        const newData = transform({
            books: {
                price: () => '100.00元',
            },
        }, testData)

        expect(newData.books).toEqual([
            { price: '100.00元' },
            { price: '100.00元' },
        ])
    })
    test('单值型配置；类型模式默认值', () => {
        const newData = transform({
            books: {
                contents: {
                    $default: Array,
                },
            },
        }, testData)

        expect(newData.books).toEqual([
            { contents: [] },
            { contents: ['这是一本天书', '无人能够练成'] },
        ])
    })
})

describe('\n=== 自定义格式化指令  ===', () => {
    adapter.addFormater('dateFormat', (value) => String(new Date(value)))

    const newData = transform({
        timestamp: 'format:dateFormat',
    }, baseData)

    console.info({ newData })
})

/*

test('数据类型转化', () => {
    const now = new Date()
    const originData = {
        price1: 1.11,
        price2: 2.22,
        status1: 1,
        status2: 0,
        timestamp: +new Date(),
        time: now,
    }
    const newData = adapter.transform({
        price1: String,
        price2: { $type: String },
        status1: Boolean,
        status2: Boolean,
        timestamp: Date,
        time: Number,
    }, originData)

    expect(newData.price1).toBe('1.11')
    expect(newData.price2).toBe('2.22')
    expect(newData.status1).toBe(true)
    expect(newData.status2).toBe(false)
    expect(newData.timestamp instanceof Date).toBe(true)
    expect(newData.time).toBe(+now)
})

test('枚举转化', () => {
    const originData = {
        status: 2,
        type: 0,
    }

    const newData = adapter.transform({
        status: 'enum:,已下单,已付款,已发货',
        type: { $enum: ['已下架', '已上架'] },
    }, originData)

    expect(newData.status).toBe('已付款')
    expect(newData.type).toBe('已下架')
})
*/
