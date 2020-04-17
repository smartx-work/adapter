module.exports = {
    run ({ transform, addFormater }) {
        describe('\n=== 示例测试 ===', () => {
            test('=== 基础示例', () => {
                const originData = {
                    user: '张三',
                    sex: 0,
                    age: '18',
                    books: [
                        { name: '水浒传', type: 'm1', price: 50 },
                        { name: '西游记', type: 'm2', price: 60 },
                        { name: '三国演义', type: 'm3', price: null },
                    ],
                    address: [ '浙江省', '杭州市', '江干区', '火车东站旁' ],
                }
                const newData = transform({
                    user: 'name',
                    sex: { $enum: [ '先生', '女士', '保密' ] },
                    age: Number,
                    books: {
                        name: true,
                        type: { $emap: { m1: '武侠小说', m2: '神话小说', m3: '历史小说' } },
                        price: { $default: '未知', $value: (value) => `￥${value.toFixed(2)}` },
                    },
                    address: (value) => value.join(''),
                }, originData)

                expect(newData).toEqual({
                    name: '张三',
                    sex: '先生',
                    age: 18,
                    books: [
                        { name: '水浒传', type: '武侠小说', price: '￥50.00' },
                        { name: '西游记', type: '神话小说', price: '￥60.00' },
                        { name: '三国演义', type: '历史小说', price: '未知' },
                    ],
                    address: '浙江省杭州市江干区火车东站旁',
                })
            })

            test('=== 常规示例 ===', () => {
                addFormater('dateDefault', (value, format) => { // 添加预设的格式化规则，后期可以快速调用
                    value = new Date(value)
                    if (format === 'YYYY') {
                        return value.getFullYear()
                    }
                    return `${value.getFullYear()}/${value.getMonth() + 1}/${value.getDate()}`
                })

                const originData = {
                    data1: [
                        {
                            goodsCode: 'SP10001',
                            goodsTitle: '一件神奇的衣服',
                            price: 1.2,
                            goodsType: 'normal',
                            goodsStatus: 1,
                            goodsSkuList: [
                                {
                                    id: 1000,
                                    attrs: [ '红色', 'XXL' ],
                                },
                                {
                                    id: 1001,
                                    attrs: [ '黑色', 'XXL' ],
                                },
                            ],
                            isSale: 1,
                            createTime: 1561750763712,
                            modifyTime: null,
                        },
                        {
                            goodsCode: 'SP10002',
                            goodsTitle: '一条神奇的裤子',
                            price: 2.2,
                            goodsType: 'virtual',
                            goodsStatus: 2,
                            goodsSkuList: [
                                {
                                    id: 1000,
                                    attrs: [ '红色', 'XXL' ],
                                },
                                {
                                    id: 1001,
                                    attrs: [ '黑色', 'XXL' ],
                                },
                            ],
                            isSale: 0,
                            createTime: 1561750773712,
                            modifyTime: 1561750773712,
                        },
                    ],
                    discardField1: null,
                    discardField2: null,
                    provinces: '中国,美国,日本',
                }

                const newData = transform({
                    data1: {
                        $key: 'list', // 重命名data1 => list
                        goodsCode: 'code', // 重命名goodsCode => code
                        goodsTitle: {
                            $key: 'title',
                            $value: (value) => `标题：${value}`, // 进行重命名和数据格式化，可以通过扩展来生成速写指令`key:title #prepend:标题：`
                        },
                        price: (value) => `￥${value.toFixed(2)}`, // 进行数据格式
                        goodsType: { $emap: { normal: '常规商品', virtual: '虚拟商品' } }, // 进行映射转化，速写指令`emap:normal:常规商品,virtual:虚拟商品`
                        goodsStatus: { $enum: [ null, '销售中', '已下架', '缺货' ] }, // 进行枚举转化，速写指令`enum:,销售中,已下架,缺货`
                        goodsSkuList: (value) => value.map(item => item.attrs.join('-')), // 对数组的值直接处理
                        isSale: Boolean, // 类型
                        createTime: '#dateDefault', // 无参数预设格式化处理
                        modifyTime: { $default: '无', $format: 'dateDefault:YYYY' }, // 速写指令`default:无 #dateDefault:YYYY`
                    },
                    provinces: (value) => value.split(','), // 转换成数组，可以通过扩展生成速写指令`#toArray`,`{$format:{name:toArray, args:[/,\s*/]}}`
                }, originData)

                expect(newData).toEqual({
                    list: [
                        {
                            code: 'SP10001',
                            title: '标题：一件神奇的衣服',
                            price: '￥1.20',
                            goodsType: '常规商品',
                            goodsStatus: '销售中',
                            goodsSkuList: [
                                '红色-XXL',
                                '黑色-XXL',
                            ],
                            isSale: true,
                            createTime: '2019/6/29',
                            modifyTime: '无',
                        },
                        {
                            code: 'SP10002',
                            title: '标题：一条神奇的裤子',
                            price: '￥2.20',
                            goodsType: '虚拟商品',
                            goodsStatus: '已下架',
                            goodsSkuList: [
                                '红色-XXL',
                                '黑色-XXL',
                            ],
                            isSale: false,
                            createTime: '2019/6/29',
                            modifyTime: 2019,
                        },
                    ],
                    provinces: [ '中国', '美国', '日本' ],
                })
            })
        })
    },
}
