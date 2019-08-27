module.exports = {
    run ({ transform, addFormater }, { testData, now }) {
        describe('\n=== 格式化指令：$format ===', () => {
            addFormater('dateFormat', (value) => String(new Date(value)))

            test('对象型配置；调用格式化指令', () => {
                const newData = transform({
                    timestamp: { $format: 'dateFormat' },
                }, testData)

                expect(newData.timestamp).toBe(String(now))
            })

            test('字符型配置；调用格式化指令', () => {
                const newData = transform({
                    timestamp: 'format:dateFormat',
                }, testData)

                expect(newData.timestamp).toBe(String(now))
            })

            test('字符型配置简化模式；调用格式化指令', () => {
                const newData = transform({
                    timestamp: '#dateFormat',
                }, testData)

                expect(newData.timestamp).toBe(String(now))
            })

            test('添加多条格化指令', () => {
                addFormater({
                    prependYuan: (value) => '￥' + value,
                    appendTx: (value) => value + '同学',
                })

                const newData = transform({
                    price: 'format:prependYuan',
                    name: { $format: 'appendTx' },
                }, testData)

                expect(newData).toEqual({
                    price: '￥' + testData.price,
                    name: testData.name + '同学',
                })
            })

            test('添加带多个字符串参数的格式化指令', () => {
                addFormater({
                    appendUnit: (value, unit, desc) => value + unit + desc,
                })
                const newData = transform({
                    name: { $format: 'appendUnit:同学,很厉害' },
                    price: '#appendUnit:元,很贵',
                }, testData)
                expect(newData.name).toEqual(testData.name + '同学很厉害')
                expect(newData.price).toEqual(testData.price + '元很贵')
            })

            test('添加带任意类型参数的格式化指令', () => {
                addFormater('addChildren', (value, children) => {
                    return value + ':' + children.join(',')
                })
            })

            test('调用任意类型参数的格式化指令', () => {
                const testData = { proince: '浙江', china: '中国' }
                const newData = transform({
                    proince: {
                        $format: {
                            name: 'addChildren',
                            args: [['杭州', '丽水', '温州']],
                        },
                    },
                    china: {
                        $format: { name: 'addChildren', args: [['浙江', '北京', '上海']] },
                    },
                }, testData)

                expect(newData.proince).toBe('浙江:' + ['杭州', '丽水', '温州'])
                expect(newData.china).toBe('中国:' + ['浙江', '北京', '上海'])
            })

            test('多次调用指令', () => {
                addFormater('increase', (value, num = 1) => { // 一个累加器，可以给一个值进行累加操作
                    return value + Number(num)
                })
                addFormater('toArray', (value, token = ',') => { // 转换数组
                    return value.split(token)
                })

                const testData = { value: 1 }
                const newData = transform({ // 传递多条指令，就像管道函数一样，前面的结果作为后面的输入
                    value: {
                        $format: ['increase:1', 'increase:-2', 'increase:1234', (value) => String(value), 'toArray:'],
                    },
                }, testData)

                expect(newData).toEqual({
                    value: ['1', '2', '3', '4'],
                })
            })
        })
    },
}
