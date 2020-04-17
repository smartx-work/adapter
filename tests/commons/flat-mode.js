module.exports = {
    run ({ transform }) {
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
    },
}
