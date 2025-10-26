import classNames from "classnames";
import { FC, FocusEventHandler } from "react";
import { SelectableContainer } from "../selectable-container";

export interface StageProps {
  children?: React.ReactNode;
  selected?: boolean;
  onSelect?: FocusEventHandler<HTMLDivElement>;
}

export const Stage: FC<StageProps> = ({ selected, ...props }) => (
  <SelectableContainer className={classNames("stage", { selected })} {...props} />
);
