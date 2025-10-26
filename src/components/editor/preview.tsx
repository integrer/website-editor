import { FC, FocusEvent, useCallback, useMemo } from "react";
import {
  ContentModel,
  select,
  getSelected,
  TextAlign,
  useGetColumnsByRowIdQuery,
  useGetContentByColumnIdQuery,
  useGetFirstStageQuery,
  useGetRowsByStageIdQuery,
} from "../../config";
import { useDispatch, useSelector } from "react-redux";
import { Column } from "../column";
import { Row } from "../row";
import { Stage } from "../stage";
import { Markdown } from "../markdown";
import { ImagePlaceholder } from "../image-placeholder";
import { skipToken } from "@reduxjs/toolkit/query";

const getAlignClassName = (align: TextAlign) => {
  switch (align) {
    case TextAlign.right:
      return "text-align-right";
    case TextAlign.center:
      return "text-align-center";
    case TextAlign.left:
      return "text-align-left";
  }
};

const renderContent = (content: ContentModel) => {
  if (content.kind === "text") {
    return <Markdown className={getAlignClassName(content.align)}>{content.text}</Markdown>;
  }
  return !content.url ? <ImagePlaceholder /> : <img src={content.url} alt={content.alt} />;
};

const useHandleSelect = () => {
  const dispatch = useDispatch();
  return useCallback(
    (ev: FocusEvent<HTMLDivElement>) => {
      const kind = ev.currentTarget.dataset.kind;
      switch (kind) {
        case "stage":
          return dispatch(select({ kind }));
        case "row":
        case "column": {
          const id = ev.currentTarget.dataset.id;
          if (id) return dispatch(select({ kind, id }));
        }
      }
    },
    [dispatch]
  );
};

const ColumnContainer: FC<{ id: string }> = ({ id }) => {
  const { data: content } = useGetContentByColumnIdQuery(id);
  const selected = useSelector(getSelected);
  const handleSelect = useHandleSelect();

  const isSelected = selected.kind === "column" && selected.id === id;

  return (
    <Column data-kind="column" data-id={id} selected={isSelected} onSelect={handleSelect}>
      {content && renderContent(content)}
    </Column>
  );
};

const RowContainer: FC<{ id: string }> = ({ id }) => {
  const { data: columns } = useGetColumnsByRowIdQuery(id);
  const selected = useSelector(getSelected);
  const handleSelect = useHandleSelect();

  const isSelected = useMemo(
    () =>
      (selected.kind === "row" && selected.id === id) ||
      (selected.kind === "column" && !!columns && columns.some(({ id }) => id === selected.id)),
    [columns, id, selected]
  );

  return (
    <Row data-kind="row" data-id={id} selected={isSelected} onSelect={handleSelect}>
      {columns?.map(({ id }) => (
        <ColumnContainer key={id} id={id} />
      ))}
    </Row>
  );
};

export const Preview: FC = () => {
  const { data: stage } = useGetFirstStageQuery();
  const { data: rows } = useGetRowsByStageIdQuery(stage?.id || skipToken);
  const handleSelect = useHandleSelect();

  if (!rows) return null;
  return (
    <Stage data-kind="stage" onSelect={handleSelect}>
      {rows.map(({ id }) => (
        <RowContainer key={id} id={id} />
      ))}
    </Stage>
  );
};
