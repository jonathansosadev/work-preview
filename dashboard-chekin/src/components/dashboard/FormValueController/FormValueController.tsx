import {Control, useFormContext, useWatch} from 'react-hook-form';

type FormValueControllerProps = {
  name: string;
  children: (isEmpty: boolean) => JSX.Element;
  control?: Control<any>;
};

function FormValueController({control, name, children}: FormValueControllerProps) {
  const context = useFormContext();
  const hasValue = Boolean(
    useWatch({
      control: control || context.control,
      name: name || '',
    }),
  );

  return children(!hasValue);
}

export {FormValueController};
