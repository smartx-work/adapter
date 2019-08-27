## 简介

adapter是一个简单，高效以声明的方式批量适配处理数据的一个工具，它能帮你对数据进行各种常见的适配转换，使得转换后的数据结构或者数据格式符合业务要求

adapter可以进行高度灵活的自定义扩展，来满足具体的业务需要，通过扩展生成各种速写指令来达到数据的快速处理，并保持数据处理的一致性和准确性

## 安装使用

```shell
yarn add @smartx/adapter
```

## 简单示例

```js
const originData = {
    user: '张三',
    sex: 0,
    age: '18',
    books: [
        { name: '水浒传', type: 'm1', price: 50 },
        { name: '西游记', type: 'm2', price: 60 },
        { name: '三国演义', type: 'm3', price: null },
    ],
    address: ['浙江省', '杭州市', '江干区', '火车东站旁'],
}
const newData = adapter.transform({
    user: 'name',
    sex: { $enum: ['先生', '女士', '保密'] },
    age: Number,
    books: {
        name: true,
        type: { $emap: { m1: '武侠小说', m2: '神话小说', m3: '历史小说' } },
        price: { $default: '未知', $value: (value) => '￥' + value.toFixed(2) },
    },
    address: (value) => value.join(''),
}, originData)

// 输出新数据
{
    name: '张三',
    sex: '先生',
    age: 18,
    books: [
        { name: '水浒传', type: '武侠小说', price: '￥50.00' },
        { name: '西游记', type: '神话小说', price: '￥60.00' },
        { name: '三国演义', type: '历史小说', price: '未知' },
    ],
    address: '浙江省杭州市江干区火车东站旁',
}
```

## API指令集

### 模式指令

+ `$strict` 适配器严格模式，默认`true` 
+ `$clears` 清除模式，默认false

#### `$strict` 指令示例

##### 严格模式

严格模式会对字段和适配器进行一一对应，适配器中未声明的字段将自动过滤

```js
const testData = { key1:1, key2:1, key3:1 }
const newData = adapter.transform({
    key1: true
}, testData)

// 输出 newData === { key1:1 }
```

##### 非严格模式

非严格模式会拷贝所有未在适配器中定义的原始字段

```js
const testData = { key1:1, key2:1, key3:1 }
const newData = adapter.transform({
    $strict: false,
    key1: () => 666
}, testData)

// 输出 newData === { key1:666, key2:1, key3:1 }
```

#### `$clears` 指令示例

`$clears`指令可以控制过滤符合条件的字段，比如值为`null`，`undefined`，空字符串等字段

当`$clears`设置为`true`时，则默认采用`[null, undefined, '']`规则进行过滤

```js
const testData = { key1:'', key2:undefined, key3:null, key4:false, key5:555, key6:666}

const newData1 = adapter.transform({
    $strict: false,
    $clears: true
}, testData)
// 输出 newData1 === { key4:false, key4:false, key5:555, key6:666 }

const newData2 = adapter.transform({
    $strict: false,
    $clears: ['null', 555]
}) 
// 输出 newData2 === {key1:'', key2:undefined, key4:false, key6:666}
```

### 转换指令

+ `$key` 字段键名转换，默认不转换
+ `$type` 数据类型转换，使用JS内置转换规则
+ `$enum` 数据枚举类型转换
+ `$emap` 数据映射类型转换
+ `$format` 数据格式化转换
+ `$value` 数据值转换
+ `$default` 数据默认值设置

### 高级指令

+ `$increase` 数据添加层级
+ `$reduce` 数据缩减层级

### 字段衍生

可以将一个字段衍生出多个不同的字段，只要使用数组方式传递，例如：`[ { $key:'value1', type:Boolean, }, { $key:'value2', type:Number } ]` 将会使用原字段生成2个字段，分别是`value1`, `value2`，转换规则调用类型转换

### 运行上下

所有`function`类型的适配规则，都有一个上下文环境变量`runtime`，比如`$value(value, runtime)`，`$default(runtime)`

```js
const testData = {
    type: 3,
    data: {
        books: [
            {name:'水浒传'},
            {name:'西游记'}
        ]
    }
}

const newData = adapter.transform({
    data:{
        books: {
            name: (value, { row, index, root }){
                // row 返回 项{name:'...'}
                // index 返回 项的下标
                // root 返回 根数据testData
                return `${index}.${value}`
            }
        }
    }
})

// 输出 newData === { data:{ books: [ {name:'1.水浒传'}, {name:'2.西游记'} ] } }
```


## API方法

### 调用方法

+ `adapter(setting)` 初始化一个适配器对象，并返回`input`接口
+ `adapter~input(data)` 调用适配器转换数据返回新的数据
+ `adapter.transform(setting, data)` 快速生成并调用适配器处理数据

### 扩展指令

+ `adapter.addFormater(name, value)` 添加一个预设`format`指令，`name`可以在`$format`指令中直接使用
+ `adapter.addEnum(name, value)` 添加一个预设的`enum`，`name`可以在`$enum`指令中直接使用
+ `adapter.addEmap(name, value)` 添加一个预设的`emap`，`name`可以在`$emap`指令中直接使用

通过传入对象形式的参数来批量添加扩展指令，例如：`addEnum({ provinces:['浙江省', '江苏省'], citys: ['杭州', '宁波']   })`

## 使用示例

### 键名转换 `$key`

```js
const testData = { key1:1, key2:2 }
const newData = adapter.transform({
    key1: 'newKey1', // 使用速写指令进行转换
    key2: { $key: 'newKey2' } // 使用`$key`指令进行转换
}, testData)

// 输出
{ newKey1:1, newKey2:2 }

```

### 数据类型转换 `$type`

```js
const testData = { toBoolean: 1, toNumber: '12', toString: 12, toDate: 1561750773712, value: 1 }
const newData = adapter.transform({
    toBoolean: Boolean,
    toNumber: Number,
    toString: String, 
    toDate: Date,
    value1: 'type:Boolean',
    value: [ // 衍生字段
        'key:value2 type:Boolean', // 速写指令 
        { $key: 'value3', type:String }, // 对象型指令
    ]
})

// 输出，使用JS内置转换规则
{ toBoolean:true, toNumber:12, toString:'12', toDate: new Date(1561750773712), value1:true, value2:true, value3:'1' }
```

### 枚举转换 `$enum`

```js
const testData = { type:1 }
const newData = adapter.transform({
    type1: 'enmu:中国,美国'
    type: [
        'key:type2 enmu:中国,美国', // 速写指令
        { $key:'type3', $enmu:['中国', '美国'] }
    ],
    
}, testData)

// 输出
{ type1:'美国', type2:'美国', type3:'美国' }
```

### 扩展预设枚举转换 `adapter.addEnmu(...)` + `$enum`
```js
adapter.addEnum({ // 扩展的枚举，在指令中可以直接使用名字去索引，对于一些公用的枚举进行统一管理维护，使用速写方式快速的对数据进行转换
    country: ['中国', '美国'],
    province: ['北京市', '杭州市']
})

const testData = { country:0, province:1 }
const newData = adapter.transform({
    country: 'enum:country',
    province: {$enum:'province'}
}, testData)

// 输出
{country:'中国', province:'杭州市'}
```

### 映射转换 `$emap`

同枚举转换，区别在于一个是数字类型的参数来查询数组数据，一个是键的方式查询对象的值

### 扩展格式化指令 `adapter.addFormater(...)` + `$format`

格式化指令是一个很强大的设定，你可以定义任意的格式化指令，然后在需要使用的地方使用，一个适配规则可以使用任意多次，任意顺序的格式化指令

```js
 adapter.addFormater('increase', (value, num = 1) => { // 一个累加器，可以给一个值进行累加操作
    return value + Number(num)
})
adapter.addFormater('toArray', (value, token = ',') => { // 转换数组
    return value.split(token)
})
adapter.addFormater('toMap', (value, arr) => { // 转换数组为map
    const map = {}
    arr.forEach(key => {
        map[key] = key
    })
    return map
})

const testData = { value: 1, value2: 2 }
const newData = adapter.transform({
    value: {  // 传递多条指令，就像管道函数一样，前面的结果作为后面的输入
        $format: ['increase:1', 'increase:-2', 'increase:1234', (value) => String(value), 'toArray:'],
    },
    value2: [ // 传递任意多个，任意类型的参数
        { $key: 'nameMap', $format: { name: 'toMap', args:[ ['张三', '李四'] ] } },
        { $key: 'numMap', $format: { name: 'toMap', args:[ [1, 2] ] } },
    ]
}, testData)

// 输出
{ 
    value: ['1', '2', '3', '4'], 
    nameMap: {'张三':'张三', '李四':'李四'},
    numMap: {'1':'1', '2':'2'}
}
```

### 使用值进行转换 `$value`

```js
const testData = { value: 1, data: { name:'张三' } }
const newData = adapter.transform({
    value: (value, runtime) => value + 'K',
    data: (value,) => value.name
}, testData)

// 输出
{ value: '1K', data: '张三'}
```

### 使用默认值

```js
const testData = { 
    list: [
        { name: null, data: null, age: undefined },
        { name: '张三', data: ['中国', '美国'], age:12 }
    ]
}
const newData = adapter.transform({
    list: {
        name: 'default:保密',
        data: { $default:() => ['中国'] },
        age: { $default:16 }
    }
}, testData)

// 输出
{
    list: [
        { name:'保密', data:['中国'], age:16 },
        { name:'张三', data:['中国', '美国'], age:12 }
    ]
}
```

### 扩展层级 `$increase`

```js
const testData = { data:{ name:'张三' } }
const newData = adapter.transform({
    data: {
        $key: 'name',
        $value: (value) => value.name,
    }
    $increase: ['data1', { // 扩展了data1字段
        data: {
            $key: 'name1',
            $value: (value) => value.name
        }
        $increase: ['data2', { // 扩展了data2字段
            data: {
                 $key: 'name2',
                $value: (value) => value.name
            }
        }]
       
    }]
}, testData)

// 输出
{
    name: '张三',
    data1: {
        name1: '张三',
        data2: {
            name2: '张三'
        }
    }
}
```

扩展字段使用当前层级的数据进行扩展，一般用在数据进行模块化拆分的时候使用

### 缩减字段 `$reduce`

```js
const testData = {
    data1: {
        data2: {
            name2: '张三'
        }
    }
}
const newData = adapter.transform({
    $reduce: ['data1', { // 缩减data1
        $reduce: ['data2', { // 缩减data2
            $increase: ['data', { // 扩展data
                name2: 'name' // 重命名name2
            }]
        }]
    }]
}, testData)

// 输出 { data:{ name:'张三' } }
```
// 缩减层级，一般在去除模块化实现字段扁平化的时候使用，比如前端业务得到的数据是模块化的，提交给网关需要扁平化，则使用此指令方便数据处理






### 简单的使用示例

```js
import adapter from '@smartx/adapter'

adapter.addFormater('dateDefault', (value, format) => { // 添加预设的格式化规则，后期可以快速调用
    value = new Date(value)
    if (format === 'YYYY') {
        return value.getFullYear()
    }
    return value.getFullYear() + '/' + (value.getMonth() + 1) + '/' + value.getDate()
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
                    attrs: ['红色', 'XXL'],
                },
                {
                    id: 1001,
                    attrs: ['黑色', 'XXL'],
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
                    attrs: ['红色', 'XXL'],
                },
                {
                    id: 1001,
                    attrs: ['黑色', 'XXL'],
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

const newData = adapter.transform({
    data1: {
        $key: 'list', // 重命名data1 => list
        goodsCode: 'code', // 重命名goodsCode => code
        goodsTitle: {
            $key: 'title',
            $value: (value) => '标题：' + value, // 进行重命名和数据格式化，可以通过扩展来生成速写指令`key:title #prepend:标题：`
        },
        price: (value) => '￥' + value.toFixed(2), // 进行数据格式
        goodsType: { $emap: { normal: '常规商品', virtual: '虚拟商品' } }, // 进行映射转换，速写指令`emap:normal:常规商品,virtual:虚拟商品`
        goodsStatus: { $enum: [null, '销售中', '已下架', '缺货'] }, // 进行枚举转换，速写指令`enum:,销售中,已下架,缺货`
        goodsSkuList: (value) => value.map(item => item.attrs.join('-')), // 对数组的值直接处理
        isSale: Boolean, // 类型
        createTime: '#dateDefault', // 无参数预设格式化处理
        modifyTime: { $default: '无', $format: 'dateDefault:YYYY' }, // 速写指令`default:无 #dateDefault:YYYY`
    },
    provinces: (value) => value.split(','), // 转换成数组，可以通过扩展生成速写指令`#toArray`
}, originData)

// 输出数据
{
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
    provinces: ['中国', '美国', '日本'],
}

```

