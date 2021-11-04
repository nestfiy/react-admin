import * as React from 'react';
import {
    Children,
    cloneElement,
    isValidElement,
    ReactElement,
    ReactNode,
    useMemo,
} from 'react';
import { Typography } from '@mui/material';
import { Record } from 'ra-core';

import { FormInput } from '../../form/FormInput';
import { SimpleFormIteratorClasses } from './useSimpleFormIteratorStyles';
import { useSimpleFormIterator } from './useSimpleFormIterator';
import {
    SimpleFormIteratorItemContext,
    SimpleFormIteratorItemContextValue,
} from './SimpleFormIteratorItemContext';

export const SimpleFormIteratorItem = (props: SimpleFormIteratorItemProps) => {
    const {
        basePath,
        children,
        disabled,
        disableReordering,
        disableRemove,
        getItemLabel,
        index,
        margin,
        member,
        record,
        removeButton,
        reOrderButtons,
        resource,
        variant,
    } = props;

    const { total, reOrder, remove } = useSimpleFormIterator();
    // Returns a boolean to indicate whether to disable the remove button for certain fields.
    // If disableRemove is a function, then call the function with the current record to
    // determining if the button should be disabled. Otherwise, use a boolean property that
    // enables or disables the button for all of the fields.
    const disableRemoveField = (record: Record) => {
        if (typeof disableRemove === 'boolean') {
            return disableRemove;
        }
        return disableRemove && disableRemove(record);
    };

    const context = useMemo<SimpleFormIteratorItemContextValue>(
        () => ({
            index,
            total,
            reOrder: newIndex => reOrder(index, newIndex),
            remove: () => remove(index),
        }),
        [index, total, reOrder, remove]
    );

    return (
        <SimpleFormIteratorItemContext.Provider value={context}>
            <li className={SimpleFormIteratorClasses.line}>
                <div>
                    <div className={SimpleFormIteratorClasses.indexContainer}>
                        <Typography
                            variant="body1"
                            className={SimpleFormIteratorClasses.index}
                        >
                            {getItemLabel(index)}
                        </Typography>
                        {!disabled && !disableReordering && reOrderButtons}
                    </div>
                </div>
                <section className={SimpleFormIteratorClasses.form}>
                    {Children.map(children, (input: ReactElement, index2) => {
                        if (!isValidElement<any>(input)) {
                            return null;
                        }
                        const { source, ...inputProps } = input.props;
                        return (
                            <FormInput
                                basePath={input.props.basePath || basePath}
                                input={cloneElement(input, {
                                    source: source
                                        ? `${member}.${source}`
                                        : member,
                                    index: source ? undefined : index2,
                                    label:
                                        typeof input.props.label === 'undefined'
                                            ? source
                                                ? `resources.${resource}.fields.${source}`
                                                : undefined
                                            : input.props.label,
                                    disabled,
                                    ...inputProps,
                                })}
                                record={record}
                                resource={resource}
                                variant={variant}
                                margin={margin}
                            />
                        );
                    })}
                </section>
                {!disabled && !disableRemoveField(record) && (
                    <span className={SimpleFormIteratorClasses.action}>
                        {removeButton}
                    </span>
                )}
            </li>
        </SimpleFormIteratorItemContext.Provider>
    );
};

export type DisableRemoveFunction = (record: Record) => boolean;

export type SimpleFormIteratorItemProps = {
    basePath: string;
    children?: ReactNode;
    disabled?: boolean;
    disableRemove?: boolean | DisableRemoveFunction;
    disableReordering?: boolean;
    getItemLabel?: (index: number) => string;
    index: number;
    margin?: 'none' | 'normal' | 'dense';
    member: string;
    onRemoveField: (index: number) => void;
    onReorder: (origin: number, destination: number) => void;
    record: Record;
    removeButton?: ReactElement;
    reOrderButtons?: ReactElement;
    resource: string;
    source: string;
    variant?: 'standard' | 'outlined' | 'filled';
};
