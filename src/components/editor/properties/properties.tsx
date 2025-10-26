import { FC, PropsWithChildren, ReactNode, useCallback } from "react";
import {
  getSelected,
  RootDispatch,
  select,
  SelectedData,
  useAddColumnMutation,
  useAddContentMutation,
  useAddRowMutation,
  useGetColumnByIdQuery,
  useGetContentByColumnIdQuery,
  useGetFirstStageQuery,
  usePutContentMutation,
} from "../../../config";
import { useDispatch, useSelector } from "react-redux";
import { Icons } from "../../icons";
import { ContentProperties } from "./contentProperties";
import { skipToken } from "@reduxjs/toolkit/query";
import { ButtonGroup, SelectButton } from "./buttonGroup";

const Section: FC<PropsWithChildren<{ header: ReactNode }>> = ({ header, children }) => (
  <div className="section">
    <div className="section-header">{header}</div>
    {children}
  </div>
);

const ActionsSection: FC<PropsWithChildren<{ header: ReactNode }>> = ({ header, children }) => (
  <Section header={header}>
    <div className="actions">{children}</div>
  </Section>
);

const PageProperties = ({ onAddRow }: { onAddRow?: () => void }) => (
  <ActionsSection header="Page">
    <button className="action" type="button" onClick={onAddRow}>
      Add row
    </button>
  </ActionsSection>
);

const RowProperties = ({ onAddColumn }: { onAddColumn?: () => void }) => (
  <ActionsSection header="Row">
    <button className="action" type="button" onClick={onAddColumn}>
      Add column
    </button>
  </ActionsSection>
);

const ColumnProperties = ({
  kind,
  onChangeKind,
}: {
  kind: "image" | "text" | undefined;
  onChangeKind?: (kind: "image" | "text") => void;
}) => {
  const handleChange = useCallback(
    (kind: "image" | "text" | undefined) => kind && onChangeKind?.(kind),
    [onChangeKind]
  );

  return (
    <Section header="Column">
      <div className="button-group-field">
        <label>Contents</label>

        <ButtonGroup value={kind} onChange={handleChange}>
          <SelectButton value="text">
            <Icons.Text />
          </SelectButton>
          <SelectButton value="image">
            <Icons.Image />
          </SelectButton>
        </ButtonGroup>
      </div>
    </Section>
  );
};

const getIdByType = (selected: SelectedData, kind: Extract<SelectedData, { id: string }>["kind"]) =>
  selected.kind === kind ? selected.id : null;

export const Properties: FC = () => {
  const { data: stage } = useGetFirstStageQuery();
  const [addRow] = useAddRowMutation();
  const [addColumn] = useAddColumnMutation();
  const [addContent] = useAddContentMutation();
  const [putContent] = usePutContentMutation();
  const selected = useSelector(getSelected);
  const selectedColumnId = getIdByType(selected, "column");
  const { currentData: selectedColumn } = useGetColumnByIdQuery(selectedColumnId ?? skipToken);
  const { currentData: selectedContent } = useGetContentByColumnIdQuery(selectedColumnId ?? skipToken);

  const dispatch = useDispatch<RootDispatch>();

  const stageId = stage?.id;
  const handleAddRow = useCallback(async () => {
    if (stageId == null) return;
    const newRow = await addRow({ stageId }).unwrap();
    dispatch(select({ kind: "row", id: newRow.id }));
  }, [addRow, dispatch, stageId]);

  const selectedRowId = getIdByType(selected, "row") ?? selectedColumn?.rowId;
  const handleAddColumn = useCallback(async () => {
    if (selectedRowId == null) return;
    const newCol = await addColumn({ rowId: selectedRowId }).unwrap();
    dispatch(select({ kind: "column", id: newCol.id }));
  }, [addColumn, dispatch, selectedRowId]);

  const handleChangeContentKind = useCallback(
    (kind: "image" | "text") => selectedColumnId != null && addContent({ kind, columnId: selectedColumnId }).unwrap(),
    [addContent, selectedColumnId]
  );

  return (
    <div className="properties">
      {stage && (
        <>
          <PageProperties onAddRow={handleAddRow} />

          {selectedRowId != null && (
            <>
              <RowProperties key={selectedRowId} onAddColumn={handleAddColumn} />

              {selectedColumn && (
                <>
                  <ColumnProperties
                    key={selectedColumnId}
                    kind={selectedContent?.kind}
                    onChangeKind={handleChangeContentKind}
                  />

                  {selectedContent && (
                    <ContentProperties key={selectedContent.id} content={selectedContent} onChange={putContent} />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
