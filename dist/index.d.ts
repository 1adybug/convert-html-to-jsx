import React, { ReactNode } from "react";
interface HTML2JSXProps {
    innerHTML: string;
    convert?: Convert;
    enableScript?: boolean;
}
interface HTMLProps {
    [PropName: string]: string | boolean | Style;
}
interface EventProps {
    [PropName: string]: string;
}
interface ConvertProps {
    tagName: string;
    HTMLProps: HTMLProps;
    eventProps: EventProps;
    originalElement: JSX.Element;
    children?: ReactNode;
}
declare type Convert = (props: ConvertProps) => JSX.Element;
interface Style {
    [PropName: string]: string;
}
export default function HTML2JSX({ innerHTML, convert, enableScript }: HTML2JSXProps): React.FunctionComponentElement<{
    children?: React.ReactNode;
}>;
export {};
