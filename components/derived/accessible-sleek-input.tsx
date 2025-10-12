import { forwardRef, ElementType, HTMLAttributes, InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input'; // Assuming shadcn Input
import { Button } from '@/components/ui/button'; // Assuming shadcn Button
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Assuming shadcn Popover
import { FieldValues, FieldPath, ControllerRenderProps } from 'react-hook-form';

interface AdornedInputFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  /** The field object provided by the react-hook-form Controller. */
  field: ControllerRenderProps<TFieldValues, TName>;
  /** The Icon component to display inside the field. */
  Icon: ElementType;
  /** The text content for the help tooltip popover. */
  popoverContent: React.ReactNode;
  /** The label for the popover button (Accessibility). */
  popoverLabel: string;
  /** Standard input placeholder text. */
  placeholder?: string;
  /** Optional props to spread onto the internal Input component. */
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>;
}

export const AdornedInputField = forwardRef<HTMLInputElement, AdornedInputFieldProps<any, any>>(
  (
    { field, Icon, popoverContent, popoverLabel, placeholder = '', inputProps = {} },
    ref
  ) => {
    return (
      <div className='relative'>
        <Input
          // @ts-expect-error It works men
          ref={ref}
          {...field}
          {...inputProps}
          value={field.value ?? ''}
          placeholder={placeholder}
          className="ps-9"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              className='absolute top-1/2 -translate-y-1/2 start-1'
              aria-label={popoverLabel}
              size={'md-icon'}
              variant={'ghost'}
            >
              <Icon size={16} aria-hidden="true" className='text-muted-foreground' />
            </Button>
          </PopoverTrigger>
          <PopoverContent side='right' className='px-3 py-1.5 text-xs text-balance w-max'>
            {popoverContent}
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

AdornedInputField.displayName = 'AdornedInputField';