module.exports = adapter

const defaultSetting = adapter.setting = {
    strict: true,
}

const formats = {} // 预设format，可以通过扩展自定义规则
const typeMap = { 'Boolean': Boolean, 'Number': Number, 'String': String, 'Date': Date }

adapter.transform = transform
adapter.addFormater = addFormater

function adapter (setting) {
    const adapters = {}
    const isStrict = setting.$strict === false ? false : defaultSetting.strict

    createAdapters(setting, [])

    // console.info(adapters)

    return {
        input (data) {
            const dataParent = { data }
            walkDatas(data, [], undefined, dataParent)
            return dataParent.data
        },
    }

    function createAdapters (setting, keys, unset) {
        const defaultKey = keys[keys.length - 1]
        const rules = (Array.isArray(setting) ? setting : [setting]).map(setting => {
            if (setting === true) {
                return {
                    exec (data, dataParent) {
                        dataParent[defaultKey] = data
                    },
                }
            }

            if (isType(setting)) {
                const $type = setting
                return {
                    exec (data, dataParent) {
                        dataParent[defaultKey] = $type === Date ? new Date(data) : $type(data)
                    },
                }
            }

            if (typeof setting === 'function') {
                const $value = setting
                return {
                    exec (data, dataParent) {
                        dataParent[defaultKey] = $value(data)
                    },
                }
            }

            if (typeof setting === 'string') {
                return createAdapterFromString(setting, keys)
            }

            if (!setting || typeof setting !== 'object') {
                return null
            }

            const { $name = defaultKey, $default, $emap, $enum, $type, $value, $increase, $reduce } = setting
            let { $format } = setting

            if ($format) {
                if (typeof $format === 'string') {
                    $format = createFormaterFormString($format)
                } else if ($format instanceof Array) {
                    $format = { name: $format.shift(), args: $format }
                }

                if (!$format.args) {
                    $format.args = []
                }
            }

            if (!$value) {
                for (const key in setting) {
                    if (key.startsWith('$')) {
                        continue
                    }
                    createAdapters(setting[key], keys.concat(key))
                }
            }
            return {
                exec (data, dataParent, index) {
                    // console.info('exec', { data, dataParent, index, keys, setting })

                    if (data == null) {
                        if ($default !== null) {
                            let defaultValue
                            if ($default === Object) {
                                defaultValue = {}
                            } else if ($default === Array) {
                                defaultValue = []
                            } else if (typeof $default === 'function') {
                                defaultValue = $default()
                            } else {
                                defaultValue = $default
                            }
                            dataParent[$name] = defaultValue
                        }
                        return
                    }
                    let newValue = data
                    if (typeof newValue === 'object') {
                        if (newValue instanceof Date) {
                            if ($format) {
                                newValue = formats[$format.name](newValue, ...$format.args)
                            }
                            if ($value) {
                                newValue = $value(newValue)
                            }
                        } else {
                            if ($value) {
                                newValue = $value(newValue)
                            } else {
                                if (Array.isArray(newValue)) {
                                    const newArray = []
                                    newValue.forEach((data, i) => {
                                        walkDatas(data, keys, i, newArray)
                                    })
                                    newValue = newArray
                                } else {
                                    const newObject = {}
                                    for (const key in newValue) {
                                        if (key.startsWith('$')) {
                                            continue
                                        }
                                        walkDatas(newValue[key], keys.concat([key]), undefined, newObject)
                                    }
                                    newValue = newObject
                                }
                            }
                        }
                    } else { // 直接量
                        if (isType($type)) {
                            newValue = $type(newValue)
                        }
                        switch (false) {
                            case !$emap: newValue = $emap[newValue]; break
                            case !$enum: newValue = $enum[newValue]; break
                            case !$format: newValue = formats[$format.name](newValue, ...$format.args); break
                        }
                        if ($value) {
                            newValue = $value(newValue)
                        }
                    }

                    if (Array.isArray(dataParent)) {
                        dataParent.push(newValue)
                    } else {
                        dataParent[$name == null ? 'data' : $name] = newValue
                    }

                    // console.info($name, newValue)
                },
            }
        })

        if (unset) {
            return rules[0]
        }
        adapters[keys] = rules
    }

    function walkDatas (data, dataKeys, dataIndex, dataParent) {
        const adapter = adapters[dataKeys]
        if (adapter) {
            adapter.forEach(rule => rule.exec(data, dataParent, dataIndex))
        } else {
            if (isStrict) {
                return
            }
            const dataKey = dataKeys[dataKeys.length - 1]
            dataParent[dataKey] = data
        }
    }

    function createAdapterFromString (string, keys) {
        const setting = {}

        if (/^\w+$/.test(string)) { // 快速重命名
            setting.$name = string
        } else {
            string.split(' ').forEach(text => {
                text = text.split(':')
                const command = text.shift()
                const args = text.join(':')

                switch (command) {
                    case 'name': setting.$name = args || undefined; break
                    case 'format': setting.$format = createFormaterFormString(args); break
                    case 'enum': setting.$enum = args.split(','); break // enum:,1,2,3,,
                    case 'emap': setting.$emap = args.split(',').reduce((emap, item) => {
                        const [key, value] = item.split(':')
                        emap[key] = value
                        return emap
                    }, {}); break // emap:s1:1,s2:2,s3:3
                    case 'type': setting.$type = typeMap[args]; break
                }
                if (command === 'default') {
                    setting.$default = args
                }
            })
        }

        return createAdapters(setting, keys, true)
    }

    function createFormaterFormString (string) {
        string = string.split(':')
        const name = string.shift()
        const args = string.length > 0 ? string.join(':').split(',') : []
        return { name, args }
    }

    function isType (type) {
        return type === Boolean || type === Number || type === String || type === Date
    }
}

function transform (setting, data) {
    return adapter(setting).input(data)
}

function addFormater (formaterName, formaterRule) {
    if (typeof formaterName === 'object') {
        const formaters = formaterName
        for (const formaterName in formaters) {
            addFormater(formaterName, formaters[formaterName])
        }
        return
    }
    formats[formaterName] = formaterRule
}

// 模式控制
// $strict 声明严格模式，所有字段必须显式声明，默认true

// 指令集
// $name:newKey 拷贝一个新的字段，假如缺省newKey，则以同名字段拷贝
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
/*
adapter.transform({
    'user.name': { default: 66, enmu: [1, 2], emap: {}, type: Number, format: 'dateDefault', value: () => {} },
    'user.name2': 'default:2 enmu:1,2,3 type:Boolean nnum:,,http://126.com,http://333.com,,',
}, {})
*/
//   ['name', 'name:lll ']
