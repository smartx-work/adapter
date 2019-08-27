module.exports = {
    run ({ transform }, { now }) {
        describe('\n=== 赋值指令：$value', () => {
            test('根级$value指令', () => {
                const testData = {
                    name: '张三',
                }
                const newData = transform({
                    $value (value) {
                        return '姓名：张三'
                    },
                }, testData)
                expect(newData).toBe('姓名：张三')
            })

            test('$increase.$value指令', () => {
                const testData = {
                    books: [
                        { name: '水浒传' },
                        { name: '西游记' },
                    ],
                }
                const newData = transform({
                    $increase: {
                        name: {
                            $value () {
                                return '张三'
                            },
                        },
                        age: 12,
                        sex: 'man',
                        letters: () => ['A', 'B'],
                        date: now,
                        regexp: /aaa/g,
                    },
                    books: true,
                }, testData)

                expect(newData).toEqual({
                    name: '张三',
                    age: 12,
                    sex: 'man',
                    letters: ['A', 'B'],
                    date: now,
                    regexp: /aaa/g,
                    books: testData.books,
                })
            })

            test('$reduce.$value指令', () => {
                const testData = {
                    level1: {
                        books: [
                            { info: { name: '水浒传' } },
                            { info: { name: '西游记' } },
                        ],
                    },
                }
                const newData = transform({
                    $reduce: {
                        level1: {
                            books: {
                                $reduce: {
                                    info: {
                                        name: (value) => '书名：' + value,
                                    },
                                },
                            },
                        },
                    },
                }, testData)

                expect(newData).toEqual({
                    books: [
                        { name: '书名：水浒传' },
                        { name: '书名：西游记' },
                    ],
                })
            })
        })
    },
}
