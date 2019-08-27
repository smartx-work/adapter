module.exports = {
    run ({ transform }) {
        describe('\n=== 清除键指令：$clears', () => {
            const testData = {
                key1: null,
                key2: false,
                key3: 111,
                key4: 555,
                key5: undefined,
                key6: '',
            }

            test('预设清除指令', () => {
                const newData = transform({
                    $clears: true,
                    $strict: false,
                }, testData)

                expect(newData).toEqual({
                    key2: false,
                    key3: 111,
                    key4: 555,
                })
            })

            test('自定义清除指令', () => {
                const newData = transform({
                    $clears: [false, null, 111, (value, runtime) => true],
                    $strict: false,
                }, testData)

                expect(newData).toEqual({
                    key4: 555,
                    key5: undefined,
                    key6: '',
                })
            })
        })
    },
}
