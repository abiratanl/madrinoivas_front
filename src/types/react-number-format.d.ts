declare module 'react-number-format' {
  import React from 'react';
  
  export interface NumericFormatProps {
    thousandSeparator?: string;
    decimalSeparator?: string;
    decimalScale?: number;
    fixedDecimalScale?: boolean;
    value?: number | string;
    onValueChange?: (values: { floatValue?: number; formattedValue?: string; value?: string }) => void;
    customInput?: (props: React.InputHTMLAttributes<HTMLInputElement> & { 
      inputRef: React.Ref<HTMLInputElement>; 
      onChange: React.ChangeEventHandler<HTMLInputElement>; 
      onFocus: React.FocusEventHandler<HTMLInputElement>; 
      onBlur: React.FocusEventHandler<HTMLInputElement>; 
    }) => React.ReactElement;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export function NumericFormat(props: NumericFormatProps): React.ReactElement;
  export default NumericFormat;
}
