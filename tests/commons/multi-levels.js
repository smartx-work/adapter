module.exports = {
    run ({ transform }, { now }) {
        describe('\n=== 多层对象处理 ===', () => {
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
                        price: { $default: '未知', $value: (value) => `${value.toFixed(2)}元` },
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
    },
}
