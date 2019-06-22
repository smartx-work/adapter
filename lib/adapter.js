module.exports = adapter

const defaultSetting = adapter.setting = {
    strict: true,
    flat: false,
    immutable: true,
}

function adapter () {

}

adapter({
    $strict: true,
    $default: Object,
    page: { $type: [String, null], $desc: '分页当前页' },
    status: [
        'copy',
        'copy:statusText enmu:中国,美国,英国',
    ],
    orderStatus: 'copy:isRefund type:Boolean',
    orderStatus2: { $copy: 'isRefund', $type: Boolean },
    orderType: { $default: 8, $emap: { aaa: '1', bbb: '2', ccc: '3' }, $type: Number, $value: (value) => value },
    user: {
        $reduce: true,
    },
    $increase: ['baseInfo', {
        name: true, // string 用户名
        title: 'subTitle', // string 副标题
    }],
})

// 模式控制
// $strict 声明严格模式，所有字段必须显式声明，默认true
// $plat 声明扁平化模式，可以使用key1.key2...keyN的模式配置多层级字段，默认false
// $immutable 声明保留原数据，假如为false，则会改变原始数据，默认true

// 指令集
// $copy:newKey 拷贝一个新的字段，假如缺省newKey，则以同名字段拷贝
// $type:[Number,Boolean,Date,String,Array] 对数据进行类型转换，规则符合JS内置类型转换
// $default:[data,function] 设置null或undefined类型数据的默认值，假如是函数，则使用函数返回值
// $enum:[array] 枚举类型转换
// $emap:[object] 映射转换
// $format:'dateDefault' 数据格式化
// $value:返回值最终处理

/**
 * @data{
 *     @key1[
 *         rule1, rule2, ..., ruleN
 *     ]
 *     @key2[
 *         ...
 *     ]
 *     ...
 *     @keyN[
 *         ...
 *     ]
 * }
 */

/**
 * @rule{
 *     @$command1
 *     @$command2
 *     ...
 *     @$command2
 *     @key1
 *     @key2
 *     ...
 *     @keyN
 * }
 */

adapter.transform({
    'user.name': { default: 66, enmu: [1, 2], emap: {}, type: Number, format: 'dateDefault', value: () => {} },
    'user.name2': 'default:2 enmu:1,2,3 type:Boolean nnum:,,http://126.com,http://333.com,,',
}, {})

//   ['copy', 'copy:lll ']
