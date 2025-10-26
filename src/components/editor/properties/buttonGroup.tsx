import { createContext, PropsWithChildren, ReactNode, useCallback, useContext, useMemo } from "react";
import classNames from "classnames";

const ButtonGroupContext = createContext<{ value: unknown; onChange?: (v: any) => void } | null>(null);

export const ButtonGroup = <T,>({
  value,
  onChange,
  children,
}: PropsWithChildren<{ value: T; onChange?: (v: T) => void }>) => {
  const groupValue = useMemo(() => ({ value, onChange }), [onChange, value]);
  return (
    <ButtonGroupContext.Provider value={groupValue}>
      <div className="button-group">{children}</div>
    </ButtonGroupContext.Provider>
  );
};

interface SelectButtonProps<T> {
  value: T;
  children?: ReactNode;
  onChange?: (value: T) => void;
}

export const SelectButton = <T,>({ value, children, onChange }: SelectButtonProps<T>) => {
  const groupCtx = useContext(ButtonGroupContext);
  const handleClick = useCallback(() => {
    onChange?.(value);
    groupCtx?.onChange?.(value);
  }, [groupCtx, onChange, value]);
  const selected = !!groupCtx && groupCtx.value === value;
  return (
    <button className={classNames({ selected })} onClick={!selected ? handleClick : undefined} type="button">
      {children}
    </button>
  );
};
