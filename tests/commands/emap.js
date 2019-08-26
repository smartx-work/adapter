module.exports = {
    run ({ transform }) {
        describe('\n=== 映射类型转化指令：$emap ===', () => {
            const testData = { status1: 'hasReady', status2: 'hasDestory' }

            test('对象型配置；基础映射类型转化', () => {
                const newData = transform({ status1: { $emap: { hasReady: '已就绪', hasDestory: '已销毁' } } }, testData)
                expect(newData.status1).toBe('已就绪')
            })

            test('字符串型配置；基础映射类型转化', () => {
                const newData = transform({ status2: 'emap:hadReady:已就绪,hasDestory:已销毁' }, testData)
                expect(newData.status2).toBe('已销毁')
            })
        })
    },
}
