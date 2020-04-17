module.exports = {
    run ({ transform }) {
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
    },
}
