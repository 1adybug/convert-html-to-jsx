# Convert-HTML-To-JSX

<a href="https://github.com/1adybug/convert-html-to-jsx/blob/master/README.md">English</a> | 简体中文

## 介绍

将文本格式的 `HTML` 代码转换为 `React` 可以识别的 `JSX` 代码

支持自定义转换成第三方组件库或者 `React Native`

由于使用了正则的 `RegExpMatchArray.groups`，`JavaScript`的目标版本为 `es2018`

## 安装

```shell
yarn add convert-html-to-jsx
# 或者
npm i convert-html-to-jsx
```

## 使用

传入 `innerHTML` 即可

```typescript
import HTML2JSX from "convert-html-to-jsx"

const innerHTML = `
    <p style="font-weight: bold;">Hello, world!</p>
    <img src="http://xxx.xxx.xxx" />
    <button disabled>Click</button>
`

export default () => {
    return (
        <div>
            <HTML2JSX innerHTML={innerHTML} />
        </div>
    )
}
```

注意，`<script>` 标签及其内部文本将被忽略，如果你并不想这么做，请传入 `enableScript={true}`

`on` 开头的事件将会被忽略，如果想处理，请使用[转换](#转换)

## 转换

如果你对默认的转换效果不满意，或者使用的是 `React Native`，可以使用 `covert` 功能实现自定义组件

```typescript
interface HTMLProps {
    [PropName: string]: string | boolean | Style
}

interface EventProps {
    [PropName: string]: string
}

interface ConvertProps {
    tagName: string,
    HTMLProps: HTMLProps,
    eventProps: EventProps,
    originalElement: JSX.Element,
    children?: ReactNode,
}

type Convert = (props: ConvertProps) => JSX.Element
```

`covert` 将会接收以下参数：

1. `tagName`

    标签名，比如 `p` 或者 `div`，纯文本的标签名为空字符串`""`

2. `HTMLProps`

    标签的 HTML 属性对象，比如 `src: "https://xxx"` 或者 `type: "text"`，没有指定值的属性，将被传入 `true`，比如 `<input disabled />` 中的属性将会被转换为 `{ disabled: true }`

3. `eventProps`

    标签的事件对象，比如 `{ onClick: "clickMe" }`，如有需要自行处理

4. `originalElement`

    在没有传入 `covert` 组件时，将会转换成的组件

5. `children`

   这个标签的后代

### 示例

1. 把所有的 `button` 标签都禁用

    ```typescript
    const convert = (props: TransformProps) => {
        const { tagName, HTMLProps, eventProps, originalElement, children } = props
        if (tagName === "button") {

            const newHTMLProps = {...HTMLProps, disabled: true}
            // 你可以使用 createElement
            return React.createElement("button", newHTMLProps, children )
            // 或者 jsx
            return (
                <button {...newHTMLProps} >
                    {children}
                </button>
            )
        }

        // 对于那些不符合条件的标签，直接返回处理好的组件即可
        return originalElement
    }

    <HTML2JSX innerHTML={innerHTML} convert={convert} >
    ```

2. 把 `id` 为 `abc` 的标签，字体进行加粗

    ```typescript
    const convert = (props: TransformProps) => {
        const { tagName, HTMLProps, eventProps, originalElement, children } = props
        if (HTMLProps.id === "abc") {
            if (HTMLProps.style) {
                HTMLProps.style.fontWeight = "bold"
            } else {
                HTMLProps.style = { fontWeight: "bold" }
            }
            return React.createElement(tagName, HTMLProps, children )
        }

        // 对于那些不符合条件的标签，直接返回处理好的组件即可
        return originalElement
    }

    <HTML2JSX innerHTML={innerHTML} convert={convert} >
    ```

3. 将标签替换成其他组件，这在使用其他的组件库时很有用

    ```typescript
    import { Image } from "antd"

    const convert = (props: TransformProps) => {

        const { tagName, HTMLProps, eventProps, originalElement, children } = props

        if (tagName === "img") {

            // 你可以在这里将 HTMLProps 处理成目标组件的 props
            // 这里 action 只表示一个过程
            const newHTMLProps = action(HTMLProps)

            return React.createElement(Image, newHTMLProps, children )
        }

        // 对于那些不符合条件的标签，直接返回处理好的组件即可
        return originalElement
    }
    ```

4. 在 `React Native` 中使用

   `HTML2JSX` 并没有提供任何除了浏览器环境下以外的任何转换，不过可以提供一些思路。比如在 `React Native` 中纯文本必须放在 `Text` 组件中，你可以这么写：

    ```typescript
    import { Text } from "react-native"

    const convert = (props: TransformProps) => {

        const { tagName, HTMLProps, eventProps, originalElement, children } = props

        if (tagName === "") {

            const newHTMLProps = action(HTMLProps)

            return React.createElement(Text, newHTMLProps, children )
        }
        
        if (tagName === "div") {

            // ...
        }
    }
    ```
