module.exports = adapter

const defaultSetting = adapter.setting = {
    strict: true,
    clears: ['', undefined, null],
}

const formats = {} // 预设format，可以通过扩展自定义规则
const enums = {} // 预设的枚举仓库
const emaps = {} // 预设的映射仓库
const types = { 'Boolean': Boolean, 'Number': Number, 'String': String, 'Date': Date }

adapter.transform = transform
adapter.addFormater = addExtend(formats)
adapter.addEnum = addExtend(enums)
adapter.addEmap = addExtend(emaps)

function adapter (setting) {
    const adapters = {}
    const isStrict = setting.$strict === false ? false : defaultSetting.strict

    // 对clear指令中的值进行过滤
    const $clears = setting.$clears === true ? defaultSetting.clears : Array.isArray(setting.$clears) ? setting.$clears : false
    const filterClears = $clears ? (parentData, key, value) => {
        if ($clears.include(value)) {
            return
        }
        parentData[key] = value
    } : (parentData, key, value) => { parentData[key] = value }

    if (!isStrict) {
        // 获取符合多层级的键，比如`a_b`
        for (const keys in setting) {
            if (keys.indexOf('_') > 0) {
                createAdapters(setting[keys], keys.split('_'))
                delete setting[keys]
            }
        }
    }

    createAdapters(setting, [])

    // console.info(adapters)

    let runtimeRootData = null // 当前运行环境中的适配原始数据

    return {
        input (data) {
            const dataParent = { data }
            runtimeRootData = data
            walkDatas(data, [], undefined, dataParent)
            runtimeRootData = null
            return dataParent.data
        },
    }

    function createAdapters (setting, keys, unset) {
        const defaultKey = keys[keys.length - 1]
        const rules = (Array.isArray(setting) ? setting : [setting]).map((setting, index) => {
            if (setting === true) {
                return {
                    exec (data, dataParent) {
                        filterClears(dataParent, defaultKey, data)
                    },
                }
            }

            if (isType(setting)) {
                const $type = setting
                return {
                    exec (data, dataParent) {
                        filterClears(dataParent, defaultKey, $type === Date ? new Date(data) : $type(data))
                    },
                }
            }

            if (typeof setting === 'function') {
                const $value = setting
                return {
                    exec (data, dataParent, index, row) {
                        filterClears(dataParent, defaultKey, $value(data, { row, index, root: runtimeRootData }))
                    },
                }
            }

            if (typeof setting === 'string') {
                return createAdapterFromString(setting, keys)
            }

            if (!setting || typeof setting !== 'object') {
                return null
            }

            const { $key = defaultKey, $default, $emap, $enum, $type, $value } = setting
            let { $format, $increase, $reduce } = setting

            if ($format) {
                let newFormats = []
                if (typeof $format === 'string') {
                    newFormats = [createFormaterFormString($format)]
                } else if ($format instanceof Array) {
                    $format.forEach(format => {
                        if (typeof format === 'string') {
                            newFormats.push(createFormaterFormString(format))
                        } else if (typeof format === 'function') {
                            newFormats.push({
                                name: null,
                                formater: format,
                            })
                        } else {
                            newFormats.push(format)
                        }
                    })
                } else {
                    if (typeof $format === 'function') {
                        newFormats.push({
                            name: null,
                            formater: $format,
                        })
                    } else {
                        newFormats.push($format)
                    }
                }

                newFormats.forEach(format => {
                    if (!format.args && format.name !== null) {
                        format.args = []
                    }
                })

                $format = newFormats
            }

            if ($increase) {
                let adapters = []
                if ($increase instanceof Array) {
                    adapters = [{
                        key: $increase[0],
                        adapter: adapter($increase[1]),
                    }]
                } else if (typeof $increase === 'object') {
                    for (const key in $increase) {
                        adapters.push({
                            key,
                            adapter: adapter($increase[key]),
                        })
                    }
                }
                $increase = adapters
            }

            if ($reduce) {
                let adapters = []
                if ($reduce instanceof Array) {
                    adapters = [{
                        key: $reduce[0],
                        adapter: adapter($reduce[1]),
                    }]
                } else if (typeof $reduce === 'object') {
                    for (const key in $reduce) {
                        adapters.push({
                            key,
                            adapter: adapter($reduce[key]),
                        })
                    }
                }
                $reduce = adapters
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
                exec (data, dataParent, index, row) {
                    // console.info('exec', { data, dataParent, index, keys, setting })

                    if (data == null) {
                        if ($default !== null) {
                            let defaultValue
                            if ($default === Object) {
                                defaultValue = {}
                            } else if ($default === Array) {
                                defaultValue = []
                            } else if (typeof $default === 'function') {
                                defaultValue = $default({ row, index, root: runtimeRootData })
                            } else {
                                defaultValue = $default
                            }
                            filterClears(dataParent, $key, defaultValue)
                        }
                        return
                    }
                    let newValue = data
                    if (typeof newValue === 'object') {
                        if (newValue instanceof Date) {
                            if ($format) {
                                newValue = executeFormat($format, newValue, { row, index, root: runtimeRootData })
                            }
                            if ($value) {
                                newValue = $value(newValue, { row, index, root: runtimeRootData })
                            }
                        } else {
                            if ($value) {
                                newValue = $value(newValue, { row, index, root: runtimeRootData })
                            } else {
                                if (Array.isArray(newValue)) {
                                    const newArray = []
                                    newValue.forEach((data, i) => {
                                        walkDatas(data, keys, i, newArray, newValue)
                                    })
                                    newValue = newArray
                                } else {
                                    const newObject = {}
                                    for (const key in newValue) {
                                        if (key.startsWith('$')) {
                                            continue
                                        }
                                        walkDatas(newValue[key], keys.concat([key]), index, newObject, newValue)
                                    }

                                    if ($increase) {
                                        $increase.forEach(item => {
                                            const { key, adapter } = item
                                            newObject[key] = adapter.input(newValue)
                                        })
                                    }

                                    if ($reduce) {
                                        $reduce.forEach(item => {
                                            const { key, adapter } = item
                                            Object.assign(newObject, adapter.input(newValue[key]))
                                        })
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
                        }

                        if ($format) {
                            newValue = executeFormat($format, newValue, { row, index, root: runtimeRootData })
                        }

                        if ($value) {
                            newValue = $value(newValue, { row, index, root: runtimeRootData })
                        }
                    }

                    if (Array.isArray(dataParent)) {
                        dataParent.push(newValue)
                    } else {
                        filterClears(dataParent, $key == null ? 'data' : $key, newValue)
                    }

                    // console.info($key, newValue)
                },
            }
        })

        if (unset) {
            return rules[0]
        }
        adapters[keys] = rules
    }

    function walkDatas (data, dataKeys, dataIndex, dataParent, row) {
        const adapter = adapters[dataKeys]
        if (adapter) {
            adapter.forEach(rule => rule.exec(data, dataParent, dataIndex, row))
        } else {
            if (isStrict) {
                return
            }

            // 深度遍历，多层级使用对应的适配器
            let newValue
            // 直接量，直接设置
            if (!data || typeof data !== 'object' || data instanceof Date) {
                newValue = data
            } else if (data instanceof Array) {
                const newArray = []
                data.forEach((item, i) => {
                    walkDatas(data[i], dataKeys, i, newArray, data)
                })
                newValue = newArray
            } else {
                const newObject = {}
                for (const key in data) {
                    walkDatas(data[key], dataKeys.concat(key), dataIndex, newObject, data)
                }
                newValue = newObject
            }

            if (Array.isArray(dataParent)) {
                dataParent.push(newValue)
            } else {
                const dataKey = dataKeys[dataKeys.length - 1]
                filterClears(dataParent, dataKey == null ? 'data' : dataKey, newValue)
            }
        }
    }

    function createAdapterFromString (string, keys) {
        const setting = {}

        if (/^\w+$/.test(string)) { // 快速重命名
            setting.$key = string
        } else {
            const formats = []
            string.split(/\s+/).forEach(text => {
                const hasArgs = /\:/.test(text)
                text = text.split(':')
                let command = text.shift()
                let args = text.join(':')

                if (/^#\w+/.test(command)) { // 快速指令调用 '#dateDefault', '#dateFormat:YYYY年'
                    args = command.substr(1) + (args ? ':' + args : hasArgs ? ':' : '')
                    command = 'format'
                }

                switch (command) {
                    case 'key': setting.$key = args || undefined; break
                    case 'format': formats.push(createFormaterFormString(args)); break
                    case 'enum': setting.$enum = args.split(','); break // enum:,1,2,3,,
                    case 'emap': setting.$emap = args.split(',').reduce((emap, item) => {
                        const [key, value] = item.split(':')
                        emap[key] = value
                        return emap
                    }, {}); break // emap:s1:1,s2:2,s3:3
                    case 'type': setting.$type = types[args]; break
                }
                if (command === 'default') {
                    setting.$default = args
                }
            })
            if (formats.length > 0) {
                setting.$format = formats
            }
        }

        return createAdapters(setting, keys, true)
    }

    function createFormaterFormString (string) {
        string = string.split(':')
        const name = string.shift()
        const args = string.length > 0 ? string.join(':').split(',') : []
        return { name, args }
    }

    function executeFormat ($format, value, runtime) {
        return $format.reduce((value, { name, args, formater }) => {
            if (name === null) {
                return formater(value, runtime)
            } else {
                return formats[name](value, ...args, runtime)
            }
        }, value)
    }

    function isType (type) {
        return type === Boolean || type === Number || type === String || type === Date
    }
}

function transform (setting, data) {
    return adapter(setting).input(data)
}

function addExtend (type) {
    return addExtend

    function addExtend (name, value) {
        if (typeof name === 'object') {
            const options = name
            for (const name in options) {
                addExtend(name, options[name])
            }
            return
        }
        type[name] = value
    }
}

// 模式控制
// $strict 声明严格模式，所有字段必须显式声明，默认true

// 指令集
// $key:newKey 拷贝一个新的字段，假如缺省newKey，则以同名字段拷贝
// $type:[Number,Boolean,Date,String,Array] 对数据进行类型转换，规则符合JS内置类型转换
// $default:[data,function] 设置null或undefined类型数据的默认值，假如是函数，则使用函数返回值
// $enum:[array] 枚举类型转换
// $emap:[object] 映射转换
// $format:'dateDefault' 数据格式化
// $value:返回值最终处理
// $increase:增加层级
// $reduce:减少层级

// adapter.transform(setting, data) // 快速转化数据
// adapter.addFormater(formaterName, formaterCalculator) // 添加预设格式化
// adapter.addFormater({formaterName: formaterCalculator}) // 批量添加预设格式化
// adapter.addEnmu(enumName, enumOption) // 添加预设枚举
// adapter.addEnmu({enumName: enumOption}) // 批量添加预设枚举
// adapter.addEmap(emapName, emapOption) // 添加预设映射
// adapter.addEmap({emapName: emapOption}) // 批量添加预设映射
