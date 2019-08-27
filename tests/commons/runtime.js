module.exports = {
    run ({ transform, addFormater }) {
        describe('\n=== 运行环境变量测试 ===', () => {
            const testData = {
                type: 1,
                list: [
                    {
                        name: '张三',
                        books: [
                            { name: '水浒传' },
                            { name: '西游记' },
                        ],
                    },
                    {
                        name: '李四',
                        books: [
                            { name: '三国演义' },
                            { name: '红楼梦' },

                        ],
                    },
                ],
            }

            test('读取环境变量：$value指令', () => {
                const newData = transform({
                    list: {
                        name: (value, { row, index, root }) => {
                            return {
                                value,
                                row,
                                index,
                                root,
                            }
                        },
                    },
                }, testData)
                expect(newData).toEqual({
                    list: [
                        {
                            name: {
                                value: '张三',
                                row: testData.list[0],
                                index: 0,
                                root: testData,
                            },
                        },
                        {
                            name: {
                                value: '李四',
                                row: testData.list[1],
                                index: 1,
                                root: testData,
                            },
                        },

                    ],
                })
            })

            test('读取环境变量：$default指令', () => {
                const testData = {
                    type: 1,
                    list: [
                        { name: null, books: ['水浒传', '西游记'] },
                    ],
                }
                const newData = transform({
                    list: {
                        name: {
                            $default ({ root, index, row }) {
                                return {
                                    type: root.type,
                                    index: index,
                                    books: row.books,
                                }
                            },
                        },
                    },
                }, testData)

                expect(newData).toEqual({
                    list: [
                        {
                            name: {
                                type: testData.type,
                                index: 0,
                                books: testData.list[0].books,
                            },
                        },
                    ],
                })
            })

            test('读取环境变量：$format指令 - 匿名', () => {
                const newData = transform({
                    list: {
                        name: {
                            $format (value, runtime) {
                                return {
                                    value,
                                    ...runtime,
                                }
                            },
                        },
                    },
                }, testData)
                expect(newData).toEqual({
                    list: [
                        { name: {
                            value: testData.list[0].name,
                            row: testData.list[0],
                            index: 0,
                            root: testData,
                        } },
                        { name: {
                            value: testData.list[1].name,
                            row: testData.list[1],
                            index: 1,
                            root: testData,
                        } },
                    ],
                })
            })

            test('读取环境变量：$format指令 - 具名', () => {
                addFormater('testForRuntime', (value, arg1, arg2, runtime) => {
                    return {
                        value,
                        ...runtime,
                        arg1,
                        arg2,
                    }
                })
                const newData = transform({
                    list: {
                        name: {
                            $format: [{ name: 'testForRuntime', args: [1, 2] }],
                        },
                    },
                }, testData)
                expect(newData).toEqual({
                    list: [
                        { name: {
                            value: testData.list[0].name,
                            row: testData.list[0],
                            index: 0,
                            root: testData,
                            arg1: 1,
                            arg2: 2,
                        } },
                        { name: {
                            value: testData.list[1].name,
                            row: testData.list[1],
                            index: 1,
                            root: testData,
                            arg1: 1,
                            arg2: 2,
                        } },
                    ],
                })
            })

            test('读取环境变量：$increase.$value指令', () => {
                const newData = transform({
                    list: {
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
                    },
                }, testData)

                expect(newData).toEqual({
                    list: [{
                        books: [
                            {
                                level1: {
                                    value: testData.list[0].books[0],
                                    runtime: {
                                        row: testData.list[0].books,
                                        index: 0,
                                        root: testData,
                                    },
                                },
                            },
                            {
                                level1: {
                                    value: testData.list[0].books[1],
                                    runtime: {
                                        row: testData.list[0].books,
                                        index: 1,
                                        root: testData,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        books: [
                            {
                                level1: {
                                    value: testData.list[1].books[0],
                                    runtime: {
                                        row: testData.list[1].books,
                                        index: 0,
                                        root: testData,
                                    },
                                },

                            },
                            {
                                level1: {
                                    value: testData.list[1].books[1],
                                    runtime: {
                                        row: testData.list[1].books,
                                        index: 1,
                                        root: testData,
                                    },
                                },
                            },
                        ],

                    }],
                })
            })

            test('读取环境变量：$reduce内部$value指令', () => {
                const testData = {
                    level1: {
                        books: [
                            { info: { name: '西游记' } },
                            { info: { name: '水浒传' } },
                        ],
                    },
                }
                const newData = transform({
                    $reduce: {
                        level1: {
                            books: {
                                $reduce: {
                                    info: {
                                        name: true,
                                    },
                                },
                            },

                        },
                    },
                }, testData)

                expect(newData).toEqual({
                    books: [{ name: '西游记' }, { name: '水浒传' }],
                })
            })
        })
    },
}
