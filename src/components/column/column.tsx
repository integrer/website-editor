import classNames from "classnames";
import { FC, FocusEventHandler } from "react";
import { SelectableContainer } from "../selectable-container";

export interface ColumnProps {
  children?: React.ReactNode;
  selected?: boolean;
  onSelect?: FocusEventHandler<HTMLDivElement>;
}

export const Column: FC<ColumnProps> = ({ selected, ...props }) => (
  <SelectableContainer className={classNames("column", { selected })} {...props} />
);
