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

describe('\n=== 数据转化不影响原始数据 ===', () => {
    const testData = {
        data: {
            value1: 1,
            value2: 2,
        },
    }
    const newData = transform({
        data: {
            $key: 'data2',
            value1: String,
            value2: Boolean,
        },
    }, testData)

    test('数据转化不影响原始数据', () => {
        expect(newData).toEqual({
            data2: {
                value1: '1',
                value2: true,
            },
        })
        expect(testData).toEqual({
            data: {
                value1: 1,
                value2: 2,
            },
        })
    })
})

describe('\n=== 数据类型转化 $type指令 === ，采用JS内置的转化规则执行转化', () => {
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

describe('\n=== 枚举类型转化 $enum指令 ===', () => {
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

describe('\n=== 映射类型转化 $emap指令 ===', () => {
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

describe('\n=== 默认值 $default指令 ===', () => {
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

describe('\n=== 添加格式化指令 $format指令  ===', () => {
    adapter.addFormater('dateFormat', (value) => String(new Date(value)))

    test('对象型配置；调用格式化指令', () => {
        const newData = transform({
            timestamp: { $format: 'dateFormat' },
        }, baseData)

        expect(newData.timestamp).toBe(String(now))
    })

    test('字符型配置；调用格式化指令', () => {
        const newData = transform({
            timestamp: 'format:dateFormat',
        }, baseData)

        expect(newData.timestamp).toBe(String(now))
    })

    test('添加多条格化指令', () => {
        adapter.addFormater({
            prependYuan: (value) => '￥' + value,
            appendTx: (value) => value + '同学',
        })

        const newData = transform({
            price: 'format:prependYuan',
            name: { $format: 'appendTx' },
        }, baseData)

        expect(newData).toEqual({
            price: '￥' + baseData.price,
            name: baseData.name + '同学',
        })
    })

    test('添加带多个字符串参数的格式化指令', () => {
        adapter.addFormater({
            appendUnit: (value, unit, desc) => value + unit + desc,
        })
        const newData = transform({
            name: { $format: 'appendUnit:同学,很厉害' },
            price: 'format:appendUnit:元,很贵',
        }, baseData)
        expect(newData.name).toEqual(baseData.name + '同学很厉害')
        expect(newData.price).toEqual(baseData.price + '元很贵')
    })

    test('添加带任意类型参数的格式化指令', () => {
        adapter.addFormater('addChildren', (value, children) => {
            return value + ':' + children.join(',')
        })
    })

    test('调用任意类型参数的格式化指令', () => {
        const testData = { proince: '浙江', china: '中国' }
        const newData = transform({
            proince: {
                $format: {
                    name: 'addChildren',
                    args: [['杭州', '丽水', '温州']],
                },
            },
            china: {
                $format: ['addChildren', ['浙江', '北京', '上海']],
            },
        }, testData)

        expect(newData.proince).toBe('浙江:' + ['杭州', '丽水', '温州'])
        expect(newData.china).toBe('中国:' + ['浙江', '北京', '上海'])
    })
})

describe('\n=== 多层对象处理  ===', () => {
    test('多层常规对象数据适配处理', () => {
        const testData = {
            data1: {
                data2: {
                    data3: {
                        value1: 1,
                        value2: 'yes',
                        value3: now,
                    },
                },
            },
            value1: '999',
        }
        const newData = transform({
            data1: {
                $key: 'data1Copy',
                data2: {
                    data3: {
                        value1: 'enum:中国,美国,日本',
                        value2: { $emap: { yes: '是', no: '否' } },
                        value3: (value) => String(value),
                    },
                },
            },
            value1: Number,
        }, testData)

        expect(newData).toEqual({
            data1Copy: {
                data2: {
                    data3: {
                        value1: '美国',
                        value2: '是',
                        value3: String(now),
                    },
                },
            },
            value1: 999,
        })
    })

    test('多层数组对象数据适配处理', () => {
        const testData = [
            {
                name: '张三',
                books: [
                    {
                        name: '水浒传',
                        price: 1.12,
                        contents: [
                            '武松喝醉酒',
                            '路过景阳岗',
                            '打死了大虫',
                        ],
                    },
                    {
                        name: '西游记',
                        price: 9.9,
                        contents: [
                            '天蚕石猴',
                            '一阵巨响',
                            '捅破上苍',
                        ],
                    },
                ],
            },
            {
                name: '李四',
                books: [
                    {
                        name: '红楼梦',
                        price: null,
                        contents: [
                            '不明所以',
                        ],
                    },
                    {
                        name: '三国演义',
                        price: 6.66,
                        contents: [
                            '桃园三结义',
                            '温酒斩华雄',
                            '火烧大赤壁',
                        ],
                    },
                ],
            },
        ]
        const newData = transform({
            name: 'key:userName',
            books: {
                name: 'bookName',
                price: { $default: '未知', $value: (value) => value.toFixed(2) + '元' },
                contents: (value) => value.join(','),
            },
        }, testData)

        expect(newData).toEqual([
            {
                userName: '张三',
                books: [
                    {
                        bookName: '水浒传',
                        price: '1.12元',
                        contents: [
                            '武松喝醉酒',
                            '路过景阳岗',
                            '打死了大虫',
                        ].join(),
                    },
                    {
                        bookName: '西游记',
                        price: '9.90元',
                        contents: [
                            '天蚕石猴',
                            '一阵巨响',
                            '捅破上苍',
                        ].join(),
                    },
                ],
            },
            {
                userName: '李四',
                books: [
                    {
                        bookName: '红楼梦',
                        price: '未知',
                        contents: [
                            '不明所以',
                        ].join(),
                    },
                    {
                        bookName: '三国演义',
                        price: '6.66元',
                        contents: [
                            '桃园三结义',
                            '温酒斩华雄',
                            '火烧大赤壁',
                        ].join(),
                    },
                ],
            },
        ])
    })
})

describe('\n=== 多规则处理  ===', () => {
    test('多规则适配', () => {
        const testData = {
            status: 1,
            name: '张三',
        }
        const newData = transform({
            status: [
                true,
                { $key: 'statusText', $enum: ['已下架', '已上架'] },
                { $key: 'statusText2', $emap: { '0': '否', '1': '是' } },
                { $key: 'isOK', $type: Boolean },
                { $key: 'fixedValue', $value: (value) => value.toFixed(2) },
                { $key: 'name', $value: (value) => value.toFixed(2) },
            ],
        }, testData)

        expect(newData).toEqual({
            status: 1,
            statusText: '已上架',
            statusText2: '是',
            isOK: true,
            fixedValue: '1.00',
            name: '1.00',
        })
    })
})

describe('\n=== strict模式 ===', () => {
    const testData = {
        data1: {
            data: {
                c: [
                    { a: 1 },
                    { a: 1 },
                ],
                b: '1.00',
            },
            value: now,
        },
        data2: {
            value1: 1,
            value2: 2,
        },
        value: 3,
    }
    test('默认strict模式适配', () => {
        const newData = transform({
            data1: {
                data: {
                    c: {
                        a: 'xxx',
                    },
                },
            },
        }, testData)
        expect(newData).toEqual({
            data1: {
                data: {
                    c: [
                        { xxx: 1 },
                        { xxx: 1 },
                    ],
                },
            },
        })
    })
    test('关闭stricr模式适配', () => {
        const newData = transform({
            $strict: false,
            data1: {
                data: {
                    c: {
                        a: 'xxx',
                    },

                },
            },
        }, testData)
        expect(newData).toEqual({
            data1: {
                data: {
                    c: [
                        { xxx: 1 },
                        { xxx: 1 },
                    ],
                    b: '1.00',
                },
                value: now,
            },
            data2: {
                value1: 1,
                value2: 2,
            },
            value: 3,
        })
    })
})

describe('\n=== 层级增加 $increase指令 ', () => {
    const testData = {
        name: '张三',
        age: 12,
        books: [
            { name: '水浒传', price: 12 },
            { name: '西游记', price: 12 },
        ],
    }

    test('单层层级增加', () => {
        const newData = transform({
            $increase: ['data1', {
                name: true,
                age: String,
                books: (value) => value.map(item => item.name).join(','),
            }],
        }, testData)

        expect(newData).toEqual({
            data1: {
                name: '张三',
                age: '12',
                books: ['水浒传', '西游记'].join(','),
            },
        })
    })
    test('多层层级增加', () => {
        const newData = transform({
            $increase: ['data1', {
                name: true,
                $increase: ['data2', {
                    name: true,
                    $increase: ['data3', {
                        name: true,
                        age: String,
                        books: (value) => value.map(item => item.name).join(','),
                    }],
                }],
            }],
        }, testData)

        expect(newData).toEqual({
            data1: {
                name: '张三',
                data2: {
                    name: '张三',
                    data3: {
                        name: '张三',
                        age: '12',
                        books: ['水浒传', '西游记'].join(','),
                    },
                },
            },
        })
    })
    test('多个层级增加', () => {
        const newData = transform({
            $increase: {
                data1: {
                    $strict: false,
                    age: String,
                },
                data2: {
                    $strict: false,
                },
            },
        }, testData)

        expect(newData).toEqual({
            data1: {
                name: '张三',
                age: '12',
                books: testData.books,
            },
            data2: {
                name: '张三',
                age: 12,
                books: testData.books,
            },
        })
    })
})

describe('\n=== 层级减少 $reduce指令  === ', () => {
    const testData = {
        data1: {
            data2: {
                data3: {
                    name: '张三',
                    age: 1,
                },
            },
        },
    }

    test('单层层级减少', () => {
        const newData = transform({
            data1: {
                $reduce: ['data2', {
                    data3: {
                        name: true,
                        age: Boolean,
                    },
                }],
            },
        }, testData)
        expect(newData).toEqual({
            data1: {
                data3: {
                    name: '张三',
                    age: true,
                },
            },
        })
    })

    test('多层层级减少', () => {
        const newData = transform({
            $reduce: ['data1', {
                $reduce: ['data2', {
                    $reduce: ['data3', {
                        name: true,
                        age: Boolean,
                    }],
                }],
            }],
        }, testData)

        expect(newData).toEqual({
            name: '张三',
            age: true,
        })
    })

    test('多个层级减少', () => {
        const testData = {
            data1: {
                data11: {
                    data111: [
                        { name: '张三', age: 1 },
                    ],
                },
            },
            data2: {
                data22: {
                    data222: [
                        { name: '李四', age: 2 },
                    ],
                },
            },
        }
        const newData = transform({
            $reduce: {
                data1: {
                    $reduce: ['data11', {
                        data111: {
                            $key: 'data1',
                            name: true,
                            age: true,
                        },
                    }],
                },
                data2: {
                    $reduce: ['data22', {
                        data222: {
                            $key: 'data2',
                            name: true,
                            age: true,
                        },
                    }],
                },
            },
        }, testData)
        expect(newData).toEqual({
            data1: [{
                name: '张三',
                age: 1,
            }],
            data2: [{
                name: '李四',
                age: 2,
            }],
        })
    })
})

describe('\n=== 非严格模式开启扁平化适配器 ===', () => {
    const testData = {
        user: {
            name: '张三',
            book: {
                name: '水浒传',
                price: 999,
            },
        },
    }

    test('扁平化适配器', () => {
        const newData = transform({
            $strict: false,
            user_book_name: (value) => `《${value}》`,
            user_book_price: String,
        }, testData)
        expect(newData).toEqual({
            user: {
                name: '张三',
                book: {
                    name: '《水浒传》',
                    price: '999',
                },
            },
        })
    })

    test('扁平化，层级混搭', () => {
        const newData = transform({
            $strict: false,
            user: {
                book: {
                    name: Boolean,
                },
            },
            user_book_name: (value) => `《${value}》`,
            user_book_price: String,
        }, testData)
        expect(newData).toEqual({
            user: {
                name: '张三',
                book: {
                    name: true,
                    price: '999',
                },
            },
        })
    })
})
