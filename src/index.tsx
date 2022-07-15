import React, { createElement, Fragment, ReactNode } from "react"

export interface HTML2JSXProps {
    innerHTML: string
    convert?: Convert
    enableScript?: boolean
    propErrorHandler?: PropErrorHandler
    styleErrorHandler?: StyleErrorHandler
}

export function getPropName(str: string) {
    str = str.trim()
    if (str === "class") {
        return "className"
    }
    if (/^[a-zA-Z]+$/.test(str) || /^data-[\w]+$/i.test(str)) {
        if (str.startsWith("on")) {
            return `on${str[2].toUpperCase()}${str.slice(3)}`
        }
        return str
    }
    return undefined
}

export interface HTMLProps {
    [PropName: string]: string | boolean | Style
}

export interface EventProps {
    [PropName: string]: string
}

export interface ConvertProps {
    tagName: string
    HTMLProps: HTMLProps
    eventProps: EventProps
    originalElement: JSX.Element
    children?: ReactNode
}

export type Convert = (props: ConvertProps) => JSX.Element

interface GetPropsFromStartTagParams {
    startTag: string
    propErrorHandler?: PropErrorHandler
    styleErrorHandler?: StyleErrorHandler
}

export function getPropsFromStartTag({
    startTag,
    propErrorHandler,
    styleErrorHandler,
}: GetPropsFromStartTagParams) {
    const match = startTag.match(
        /<(?<tagName>[a-zA-Z]+?)[\s]{1}(?<attr>.*?)[\/]?>/
    )
    const HTMLProps: HTMLProps = {}
    const eventProps: EventProps = {}
    if (match && match.groups && match.groups.attr) {
        let attr = match.groups.attr
        while (true) {
            const matchAttr1 = attr.match(/=[\s]*?"(?<property>.*?)"/)
            const matchAttr2 = attr.match(/=[\s]*?'(?<property>.*?)'/)
            if (matchAttr1 || matchAttr2) {
                const match = (
                    matchAttr1 && matchAttr2
                        ? matchAttr1.index! < matchAttr2.index!
                            ? matchAttr1
                            : matchAttr2
                        : matchAttr1 || matchAttr2
                )!
                const leftString = attr.slice(0, match.index!)
                const arr = leftString.split(/[\s]+/).filter(item => item)
                if (!arr.length) {
                    throw new Error(
                        `"${match[0]}" has no attribute name in ${startTag}`
                    )
                }
                arr.slice(0, -1).forEach(item => {
                    let propName = getPropName(item)
                    if (!propName) {
                        if (propErrorHandler) {
                            propName = propErrorHandler(item.trim())
                        } else {
                            console.warn(
                                `"${item}" is an illegal attribute name in ${startTag}`
                            )
                        }
                    }
                    if (propName && !propName.startsWith("on")) {
                        HTMLProps[propName] = true
                    }
                })
                const op = arr.slice(-1)[0]
                let propName = getPropName(op)
                if (!propName) {
                    if (propErrorHandler) {
                        propName = propErrorHandler(op.trim())
                    } else {
                        console.warn(
                            `"${op}" is an illegal attribute name in ${startTag}`
                        )
                    }
                }
                if (propName) {
                    if (!propName.startsWith("on")) {
                        HTMLProps[propName] = match.groups!.property!
                    } else {
                        eventProps[propName] = match.groups!.property!
                    }
                }
                attr = attr.slice(match.index! + match[0].length)
                continue
            }
            attr.split(/[\s]+/)
                .filter(item => item)
                .forEach(item => {
                    let propName = getPropName(item)
                    if (!propName) {
                        if (propErrorHandler) {
                            propName = propErrorHandler(item.trim())
                        } else {
                            console.warn(
                                `"${item}" is an illegal attribute name in ${startTag}`
                            )
                        }
                    }
                    if (propName && !propName.startsWith("on")) {
                        HTMLProps[propName] = true
                    }
                })
            break
        }
    }
    if (HTMLProps.style) {
        HTMLProps.style = getStyle({
            string: HTMLProps.style as string,
            styleErrorHandler,
        })
    }
    return { HTMLProps, eventProps }
}

export interface Style {
    [PropName: string]: string
}

interface GetStyleParams {
    string: string
    styleErrorHandler?: StyleErrorHandler
}

export function getStylePropName(str: string) {
    str = str.trim()
    if (/[^-a-zA-Z]/.test(str) || /^-/.test(str) || /-$/.test(str)) {
        return undefined
    }
    return `${str[0].toLowerCase()}${str
        .split("-")
        .map(item => `${item[0].toUpperCase()}${item.slice(1).toLowerCase()}`)
        .join("")
        .slice(1)}`
}

export function getStyle({ string, styleErrorHandler }: GetStyleParams) {
    const style: Style = {}
    string.split(";").forEach(item => {
        if (!item.trim()) return
        const index = item.indexOf(":")
        if (index < 0) {
            throw new Error(`"${item}" is an illegal CSS property in ${string}`)
        }
        const op = item.slice(0, index)
        const prop = getStylePropName(op)
        const value = item.slice(index + 1).trim()
        if (!prop) {
            if (styleErrorHandler) {
                const _prop = styleErrorHandler(op.trim())
                if (_prop) {
                    style[_prop] = value
                }
            } else {
                console.warn(
                    `"${op}" is an illegal style property name in ${string}
                    u can use \`styleErrorHandler\` to handle it`
                )
            }
        } else {
            style[prop] = value
        }
    })
    return style
}

export type PropErrorHandler = (propName: string) => string | undefined

export type StyleErrorHandler = (styleName: string) => string | undefined

export default function HTML2JSX({
    innerHTML,
    convert,
    enableScript,
    propErrorHandler,
    styleErrorHandler,
}: HTML2JSXProps) {
    let str = innerHTML
    const JSXList: ReactNode[] = []
    while (true) {
        const matchTag1 = str.match(/<(?<tagName>[a-zA-Z]+?)[\/]?>/)
        const matchTag2 = str.match(
            /<(?<tagName>[a-zA-Z]+?)[\s]{1}(?<attr>.*?)[\/]?>/
        )
        if (matchTag1 || matchTag2) {
            const matchTag = (
                matchTag1 && matchTag2
                    ? matchTag1.index! < matchTag2.index!
                        ? matchTag1
                        : matchTag2
                    : matchTag1 || matchTag2
            )!
            const startTag = matchTag[0]
            const tagName = matchTag.groups!.tagName
            const { HTMLProps, eventProps } = getPropsFromStartTag({
                startTag,
                propErrorHandler,
                styleErrorHandler,
            })
            const index = matchTag.index!
            const originalTextElement = <>{str.slice(0, index)}</>
            if (convert) {
                JSXList.push(
                    createElement(
                        convert,
                        {
                            HTMLProps,
                            eventProps,
                            tagName: "",
                            originalElement: originalTextElement,
                        },
                        str.slice(0, index)
                    )
                )
            } else {
                JSXList.push(str.slice(0, index))
            }
            if (!startTag.endsWith("/>")) {
                const endIndex = str.indexOf(`</${tagName}>`)
                if (endIndex >= index + startTag.length) {
                    if (tagName.toLowerCase() !== "script" || enableScript) {
                        const originalTagElement = createElement(
                            tagName,
                            HTMLProps,
                            <HTML2JSX
                                innerHTML={str.slice(
                                    index + startTag.length,
                                    endIndex
                                )}
                            />
                        )
                        if (convert) {
                            JSXList.push(
                                createElement(
                                    convert,
                                    {
                                        HTMLProps,
                                        eventProps,
                                        tagName,
                                        originalElement: originalTagElement,
                                    },
                                    <HTML2JSX
                                        innerHTML={str.slice(
                                            index + startTag.length,
                                            endIndex
                                        )}
                                    />
                                )
                            )
                        } else {
                            JSXList.push(originalTagElement)
                        }
                    }
                    str = str.slice(endIndex + `</${tagName}>`.length)
                    continue
                }
            }
            if (tagName.toLowerCase() !== "script" || enableScript) {
                const originalTagElement = createElement(tagName, HTMLProps)
                if (convert) {
                    JSXList.push(
                        createElement(convert, {
                            HTMLProps,
                            eventProps,
                            tagName: tagName,
                            originalElement: originalTagElement,
                        })
                    )
                } else {
                    JSXList.push(originalTagElement)
                }
            }
            str = str.slice(index + startTag.length)
            continue
        }
        if (convert) {
            JSXList.push(
                createElement(
                    convert,
                    {
                        HTMLProps: {},
                        eventProps: {},
                        tagName: "",
                        originalElement: <>{str}</>,
                    },
                    str
                )
            )
        } else {
            JSXList.push(str)
        }
        break
    }
    return createElement(Fragment, {}, ...JSXList)
}
