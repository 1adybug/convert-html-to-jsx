import React, { ReactNode } from "react";
export interface HTML2JSXProps {
    innerHTML: string;
    convert?: Convert;
    enableScript?: boolean;
    propErrorHandler?: PropErrorHandler;
    styleErrorHandler?: StyleErrorHandler;
}
export declare function getPropName(str: string): string | undefined;
export interface HTMLProps {
    [PropName: string]: string | boolean | Style;
}
export interface EventProps {
    [PropName: string]: string;
}
export interface ConvertProps {
    tagName: string;
    HTMLProps: HTMLProps;
    eventProps: EventProps;
    originalElement: JSX.Element;
    children?: ReactNode;
}
export declare type Convert = (props: ConvertProps) => JSX.Element;
interface GetPropsFromStartTagParams {
    startTag: string;
    propErrorHandler?: PropErrorHandler;
    styleErrorHandler?: StyleErrorHandler;
}
export declare function getPropsFromStartTag({ startTag, propErrorHandler, styleErrorHandler, }: GetPropsFromStartTagParams): {
    HTMLProps: HTMLProps;
    eventProps: EventProps;
};
export interface Style {
    [PropName: string]: string;
}
interface GetStyleParams {
    string: string;
    styleErrorHandler?: StyleErrorHandler;
}
export declare function getStylePropName(str: string): string | undefined;
export declare function getStyle({ string, styleErrorHandler }: GetStyleParams): Style;
export declare type PropErrorHandler = (propName: string) => string | undefined;
export declare type StyleErrorHandler = (styleName: string) => string | undefined;
export default function HTML2JSX({ innerHTML, convert, enableScript, propErrorHandler, styleErrorHandler, }: HTML2JSXProps): React.FunctionComponentElement<{
    children?: React.ReactNode;
}>;
export {};
