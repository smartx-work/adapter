module.exports = {
    run ({ transform }, { testData }) {
        describe('\n=== 数据类型转化指令：$type === ，采用JS内置的转化规则执行转化', () => {
            test('单值型配置；数字转字符串', () => {
                const newData = transform({ price: String }, testData)
                expect(newData.price).toBe('1.11')
            })
            test('对象型配置；数字转字符串', () => {
                const newData = transform({ price: { $type: String } }, testData)
                expect(newData.price).toBe('1.11')
            })
            test('字符串型配置；数字转字符', () => {
                const newData = transform({ price: 'type:String' }, testData)
                expect(newData.price).toBe('1.11')
            })
            test('单值型配置；数字转布尔值', () => {
                const newData = transform({ status: Boolean }, testData)
                expect(newData.status).toBe(true)
            })
            test('单值型配置；数字转布尔值', () => {
                const newData = transform({ type: Boolean }, testData)
                expect(newData.type).toBe(false)
            })
            test('单值型配置；字符串转布尔值', () => {
                const newData = transform({ emptyString: Boolean }, testData)
                expect(newData.emptyString).toBe(false)
            })
            test('单值型配置；字符串转布尔值', () => {
                const newData = transform({ name: Boolean }, testData)
                expect(newData.name).toBe(true)
            })
            test('单值型配置；时间戳转时间', () => {
                const newData = transform({ timestamp: Date }, testData)
                expect(newData.timestamp instanceof Date).toBe(true)
            })
            test('单值型配置；时间转时间戳', () => {
                const newData = transform({ time: Number }, testData)
                expect(newData.time).toBe(testData.timestamp)
            })
        })
    },
}
