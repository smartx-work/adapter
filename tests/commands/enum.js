module.exports = {
    run ({ transform }) {
        describe('\n=== 枚举类型转化指令：$enum ===', () => {
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
    },
}
