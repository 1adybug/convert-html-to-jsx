"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
function getPropName(str) {
    str = str.trim();
    if (str === "class") {
        return "className";
    }
    if (/^[a-zA-Z]+$/.test(str) || /^data-[\w]+$/i.test(str)) {
        if (str.startsWith("on")) {
            return `on${str[2].toUpperCase()}${str.slice(3)}`;
        }
        return str;
    }
    return undefined;
}
function getPropsFromStartTag(startTag) {
    const match = startTag.match(/<(?<tagName>[a-zA-Z]+?)[\s]{1}(?<attr>.*?)[\/]?>/);
    const HTMLProps = {};
    const eventProps = {};
    if (match && match.groups && match.groups.attr) {
        let attr = match.groups.attr;
        for (;;) {
            const matchAttr1 = attr.match(/=[\s]*?"(?<property>.*?)"/);
            const matchAttr2 = attr.match(/=[\s]*?'(?<property>.*?)'/);
            if (matchAttr1 || matchAttr2) {
                const match = ((matchAttr1 && matchAttr2) ? (matchAttr1.index < matchAttr2.index ? matchAttr1 : matchAttr2) : (matchAttr1 || matchAttr2));
                const leftString = attr.slice(0, match.index);
                const arr = leftString.split(/[\s]+/).filter(item => item);
                if (!arr.length) {
                    throw new Error(`"${match[0]}" has no attribute name in ${startTag}`);
                }
                arr.slice(0, -1).forEach(item => {
                    const propName = getPropName(item);
                    if (!propName) {
                        throw new Error(`"${item}" is an illegal attribute name in ${startTag}`);
                    }
                    if (!propName.startsWith("on")) {
                        HTMLProps[propName] = true;
                    }
                });
                const op = arr.slice(-1)[0];
                const propName = getPropName(op);
                if (!propName) {
                    throw new Error(`"${op}" is an illegal attribute name in ${startTag}`);
                }
                if (!propName.startsWith("on")) {
                    HTMLProps[propName] = match.groups.property;
                }
                else {
                    eventProps[propName] = match.groups.property;
                }
                attr = attr.slice(match.index + match[0].length);
                continue;
            }
            attr.split(/[\s]+/).filter(item => item).forEach(item => {
                const propName = getPropName(item);
                if (!propName) {
                    throw new Error(`"${item}" is an illegal attribute name in ${startTag}`);
                }
                if (!propName.startsWith("on")) {
                    HTMLProps[propName] = true;
                }
            });
            break;
        }
    }
    if (HTMLProps.style) {
        HTMLProps.style = getStyle(HTMLProps.style);
    }
    return { HTMLProps, eventProps };
}
function getStylePropName(str) {
    str = str.trim();
    if (/[^-a-zA-Z]/.test(str) || /^-/.test(str) || /-$/.test(str)) {
        return undefined;
    }
    return `${str[0].toLowerCase()}${str.split("-").map(item => `${item[0].toUpperCase()}${item.slice(1).toLowerCase()}`).join("").slice(1)}`;
}
function getStyle(string) {
    const style = {};
    string.split(";").forEach(item => {
        if (!item.trim())
            return;
        const index = item.indexOf(":");
        if (index < 0) {
            throw new Error(`"${item}" is an illegal CSS property in ${string}`);
        }
        const op = item.slice(0, index);
        const prop = getStylePropName(op);
        if (!prop) {
            throw new Error(`"${op}" is an illegal style property name in ${string}`);
        }
        style[prop] = item.slice(index + 1).trim();
    });
    return style;
}
function HTML2JSX({ innerHTML, convert, enableScript }) {
    let str = innerHTML;
    const JSXList = [];
    for (;;) {
        const matchTag1 = str.match(/<(?<tagName>[a-zA-Z]+?)[\/]?>/);
        const matchTag2 = str.match(/<(?<tagName>[a-zA-Z]+?)[\s]{1}(?<attr>.*?)[\/]?>/);
        if (matchTag1 || matchTag2) {
            const matchTag = ((matchTag1 && matchTag2) ? (matchTag1.index < matchTag2.index ? matchTag1 : matchTag2) : (matchTag1 || matchTag2));
            const startTag = matchTag[0];
            const tagName = matchTag.groups.tagName;
            const { HTMLProps, eventProps } = getPropsFromStartTag(startTag);
            const index = matchTag.index;
            const originalTextElement = react_1.default.createElement(react_1.default.Fragment, null, str.slice(0, index));
            if (convert) {
                JSXList.push((0, react_1.createElement)(convert, { HTMLProps, eventProps, tagName: "", originalElement: originalTextElement }, str.slice(0, index)));
            }
            else {
                JSXList.push(originalTextElement);
            }
            if (!startTag.endsWith("/>")) {
                const endIndex = str.indexOf(`</${tagName}>`);
                if (endIndex >= index + startTag.length) {
                    if (tagName.toLowerCase() !== "script" || enableScript) {
                        const originalTagElement = (0, react_1.createElement)(tagName, HTMLProps, react_1.default.createElement(HTML2JSX, { innerHTML: str.slice(index + startTag.length, endIndex) }));
                        if (convert) {
                            JSXList.push((0, react_1.createElement)(convert, { HTMLProps, eventProps, tagName, originalElement: originalTagElement }, react_1.default.createElement(HTML2JSX, { innerHTML: str.slice(index + startTag.length, endIndex) })));
                        }
                        else {
                            JSXList.push(originalTagElement);
                        }
                    }
                    str = str.slice(endIndex + (`</${tagName}>`).length);
                    continue;
                }
            }
            if (tagName.toLowerCase() !== "script" || enableScript) {
                const originalTagElement = (0, react_1.createElement)(tagName, HTMLProps);
                if (convert) {
                    JSXList.push((0, react_1.createElement)(convert, { HTMLProps, eventProps, tagName: tagName, originalElement: originalTagElement }));
                }
                else {
                    JSXList.push(originalTagElement);
                }
            }
            str = str.slice(index + startTag.length);
            continue;
        }
        JSXList.push(react_1.default.createElement(react_1.default.Fragment, null, str));
        break;
    }
    return ((0, react_1.createElement)(react_1.Fragment, {}, ...JSXList));
}
exports.default = HTML2JSX;
//# sourceMappingURL=index.js.map