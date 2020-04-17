module.exports = {
    run ({ transform }) {
        describe('\n=== 层级增加指令：$increase', () => {
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
                    $increase: [ 'data1', {
                        name: true,
                        age: String,
                        books: (value) => value.map(item => item.name).join(','),
                    } ],
                }, testData)

                expect(newData).toEqual({
                    data1: {
                        name: '张三',
                        age: '12',
                        books: [ '水浒传', '西游记' ].join(','),
                    },
                })
            })

            test('多层层级增加', () => {
                const newData = transform({
                    $increase: [ 'data1', {
                        name: true,
                        $increase: [ 'data2', {
                            name: true,
                            $increase: [ 'data3', {
                                name: true,
                                age: String,
                                books: (value) => value.map(item => item.name).join(','),
                            } ],
                        } ],
                    } ],
                }, testData)

                expect(newData).toEqual({
                    data1: {
                        name: '张三',
                        data2: {
                            name: '张三',
                            data3: {
                                name: '张三',
                                age: '12',
                                books: [ '水浒传', '西游记' ].join(','),
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

            test('根下$value指令', () => {
                const newData = transform({
                    books: {
                        $increase: {
                            level1: {
                                $value (value, runtime) {
                                    return {
                                        value, runtime,
                                    }
                                },
                            },
                        },
                    },

                }, testData)

                expect(newData).toEqual({
                    books: [
                        {
                            level1: {
                                value: testData.books[0],
                                runtime: {
                                    row: testData.books,
                                    index: 0,
                                    root: testData,
                                },
                            },
                        },
                        {
                            level1: {
                                value: testData.books[1],
                                runtime: {
                                    row: testData.books,
                                    index: 1,
                                    root: testData,
                                },
                            },
                        },
                    ],

                })
            })
        })
    },
}
