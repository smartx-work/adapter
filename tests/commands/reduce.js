module.exports = {
    run ({ transform }) {
        describe('\n=== 层级减少指令：$reduce ===', () => {
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
    },
}
