import classNames from "classnames";
import { FC, FocusEventHandler } from "react";
import { SelectableContainer } from "../selectable-container";

export interface RowProps {
  children?: React.ReactNode;
  selected?: boolean;
  onSelect?: FocusEventHandler<HTMLDivElement>;
}

export const Row: FC<RowProps> = ({ selected, ...props }) => (
  <SelectableContainer className={classNames("row", { selected })} {...props} />
);
