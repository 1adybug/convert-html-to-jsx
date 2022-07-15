import React, { ReactNode } from "react";
export interface HTML2JSXProps {
    innerHTML: string;
    convert?: Convert;
    enableScript?: boolean;
}
export declare function getPropName(str: string): string;
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
export declare function getPropsFromStartTag(startTag: string): {
    HTMLProps: HTMLProps;
    eventProps: EventProps;
};
export interface Style {
    [PropName: string]: string;
}
export declare function getStylePropName(str: string): string | undefined;
export declare function getStyle(string: string): Style;
export default function HTML2JSX({ innerHTML, convert, enableScript, }: HTML2JSXProps): React.FunctionComponentElement<{
    children?: React.ReactNode;
}>;
