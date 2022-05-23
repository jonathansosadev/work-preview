import React from 'react';

import { Props } from 'react-select/creatable';
import { SelectOption } from '../../../utils/types';
import { components, ActionMeta } from 'react-select';
import removeIcon from '../../../assets/remove.svg';

import {
    Control,
    DropdownIndicator,
    LoadingIndicator,
    Input,
} from '../Select';
import { ClearIndicatorContainer, RemoveIcon } from './styled';
import { CreatableReactMultiSelect } from '../Select/styled';

export type CreatableMultiSelectProps = Props<SelectOption, any> & {
    label?: string;
    invalid?: boolean;
    disabled?: boolean;
    name?: string;
    error?: any;
    className?: string;
    loading?: boolean;
    tooltip?: string | JSX.Element | React.ReactNode;
    value?: Array<any>;
    onChange?: <Option extends SelectOption>(
        option: Option[],
        info: ActionMeta<Option>,
    ) => void;

};

const defaultProps: CreatableMultiSelectProps = {
    label: '',
    loading: false,
};


const MultiValueRemove = (props: any) => {
    return (
        <components.MultiValueRemove {...props}>
            <RemoveIcon src={removeIcon} alt="Remove" />
        </components.MultiValueRemove>
    );
};

const ClearIndicator = (props: any) => {
    return (
        <ClearIndicatorContainer {...props}>
            <RemoveIcon src={removeIcon} alt="Clear" />
        </ClearIndicatorContainer>
    );
};




function CreatableMultiSelect({
    onChange,
    disabled,
    placeholder,
    className,
    onMenuOpen,
    onMenuClose,
    components,
    ...props
}: CreatableMultiSelectProps) {

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const onChangeHandler = disabled ? undefined : onChange;
    const isEmpty = Boolean(props.empty || !props.value?.length);
    const handleMenuOpen = React.useCallback(() => {
        setIsMenuOpen(true);

        if (onMenuOpen) {
            onMenuOpen();
        }
    }, [onMenuOpen]);

    const handleMenuClose = React.useCallback(() => {
        setIsMenuOpen(false);

        if (onMenuClose) {
            onMenuClose();
        }
    }, [onMenuClose]);

    return (
        <CreatableReactMultiSelect
            width="471px;"
            isMulti
            onMenuOpen={handleMenuOpen}
            onMenuClose={handleMenuClose}
            onChange={onChangeHandler}
            options={props?.options}
            className={`${className} select`}
            classNamePrefix="select"
            isMenuOpen={isMenuOpen}
            components={{
                Control,
                IndicatorSeparator: null,
                DropdownIndicator,
                LoadingIndicator,
                MultiValueRemove,
                ClearIndicator,
                Input,
                ...components,
            }}
            placeholder={placeholder}
            {...props}
            empty={isEmpty}
        />
    );
}

CreatableMultiSelect.defaultProps = defaultProps;
export { CreatableMultiSelect };