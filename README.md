# Convert-HTML-To-JSX

English | <a href="https://github.com/1adybug/convert-html-to-jsx/blob/master/README.zh-CN.md">简体中文</a>

## Introduction

Convert `HTML` in plain text to `JSX` that `React` can understand.

It supports custom conversions such as other third party components or `React Native` components.

Due to the use of `RegExpMatchArray.groups`, the target version of `JavaScript` is `es2018`.

## Installation

```shell
yarn add convert-html-to-jsx
# or
npm i convert-html-to-jsx
```

## Usage

Pass in `innerHTML` and you're done!

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

Note that the `<script>` tag and its internal text will be ignored, so if you don't want to do that, pass in `enableScript={true}`

Events starting with `on` will be ignored, if you want to handle them, please use the [Conversion](#Conversion)

## Conversion

If you are not satisfied with the default conversion, or if you are using `React Native`, you can use the `convert` function to implement custom component.

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

`convert` will take the following parameters:

1. `tagName`

    Tag names, such as `p` or `div`. `tagName` of Plain text is the empty string `""`

2. `HTMLProps`

    HTML attribute object of the tag, such as `src: "https://xxx"` or `type: "text"`. For those properties that do not specify a value, `true` will be passed. For example, the attribute in `<input disabled />` will be converted to `{ disabled: true }`

3. `eventProps`

    tag event objects, such as `{ onClick: "clickMe" }`, and handle them yourself if needed

4. `originalElement`

    The component that will be converted to if no `convert` is passed in

5. `children`

   children of this tag

### Examples

1. Disable all `button` tags

    ```typescript
    const tranform = (props: TransformProps) => {
        const { tagName, HTMLProps, eventProps, originalElement, children } = props
        if (tagName === "button") {

            const newHTMLProps = {...HTMLProps, disabled: true}

            // You can use createElement
            return React.createElement("button", newHTMLProps, children )

            // or jsx
            return (
                <button {...newHTMLProps} >
                    {children}
                </button>
            )
        }

        // For those tags that don't meet the conditions, just return the processed component directly
        return originalElement
    }

    <HTML2JSX innerHTML={innerHTML} tranform={tranform} >
    ```

2. Bold the tag with `id` as `abc`

    ```typescript
    const tranform = (props: TransformProps) => {
        const { tagName, HTMLProps, eventProps, originalElement, children } = props
        if (HTMLProps.id === "abc") {
            if (HTMLProps.style) {
                HTMLProps.style.fontWeight = "bold"
            } else {
                HTMLProps.style = { fontWeight: "bold" }
            }
            return React.createElement(tagName, HTMLProps, children )
        }

        // For those tags that don't meet the conditions, just return the processed component directly
        return originalElement
    }

    <HTML2JSX innerHTML={innerHTML} tranform={tranform} >
    ```

3. Replace tags with other components, which is useful when using other component libraries

    ```typescript
    import { Image } from "antd"

    const tranform = (props: TransformProps) => {

        const { tagName, HTMLProps, eventProps, originalElement, children } = props

        if (tagName === "img") {

            // You can process HTMLProps here as props of the target component.
            // action only represents a procedure here
            const newHTMLProps = action(HTMLProps)

            return React.createElement(Image, newHTMLProps, children )
        }

        // For those tags that don't meet the conditions, just return the processed component directly
        return originalElement
    }
    ```

4. use in `React Native`

   `HTML2JSX` does not provide any conversions other than in a browser environment, but it can provide some ideas. For example, in `React Native`, plain text must be placed in the `Text` component, you could write it like this.

    ```typescript
    import { Text } from "react-native"

    const tranform = (props: TransformProps) => {

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
