module.exports = {
    run ({ transform }, { now }) {
        describe('\n=== 严格模式指令：$strict ===', () => {
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
    },
}
