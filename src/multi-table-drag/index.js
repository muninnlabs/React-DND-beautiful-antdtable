import React, { PureComponent, useCallback, useEffect, useState } from "react";
import { Table, Row, Col, Card, Empty, Divider } from "antd";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import "./style.css";

import { attachments } from './mockInfo'


const colunId = "unPublished";

export const MultiTableDrag = () => {
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: 'name'
    }
    , {
      title: "Filename",
      dataIndex: "fileName",
      key: 'filname'
    }
    , {
      title: "Size",
      dataIndex: "fileSize",
      key: 'size'
    }
    , {
      title: "Type",
      dataIndex: "fileType",
      key: 'filetype'
    },
    , {
      title: "Last Modified By",
      dataIndex: "lastModifiedBy",
      key: 'lastModifiedBy'
    }

  ];

  const [publishedDocs, setPublishedDocs] = useState([])
  const [unPublishedDocs, setUnPublishedDocs] = useState([])
  const [allAttachments, setAllAttachments] = useState(attachments)

  useEffect(() => {
    setPublishedDocs(allAttachments.filter(a => a.visible))
    setUnPublishedDocs(allAttachments.filter(a => !a.visible))
  }, [allAttachments])

  const DroppableTableBody = ({ columnId, docs, ...props }) => {
    return (
      <Droppable
        droppableId={columnId}
      >
        {(provided, snapshot) => (
          <>
            <tbody
              key={columnId}
              ref={provided.innerRef}
              {...props}
              {...provided.droppableProps}
              className={`${props.className} ${snapshot.isDraggingOver && columnId === colunId
                ? "is-dragging-over"
                : ""
                }`}
            ></tbody>
            {provided.placeholder}
          </>
        )}
      </Droppable>
    );
  };

  const DraggableTableRow = ({ index, record, columnId, docs, ...props }) => {

    if (!docs.length) {
      return (
          <tr className="ant-table-placeholder row-item" {...props}>
            <td colSpan={tableColumns.length} className="ant-table-cell">
              <div className="ant-empty ant-empty-normal">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            </td>
          </tr>
      );
    }

    const isSelected = selectedTaskIds.some(
      (selectedTaskId) => selectedTaskId === record.id
    );
    const isGhosting =
      isSelected && Boolean(draggingTaskId) && draggingTaskId !== record.id;

    return (
      <Draggable
        key={props["data-row-key"]}
        draggableId={record.uid}
        index={index}
      >
        {(provided, snapshot) => {
          return (
            <tr
              key={index + record.uid}
              ref={provided.innerRef}
              {...props}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`row-item ${isSelected ? "row-selected" : ""} ${isGhosting ? "row-ghosting" : ""
                } ${snapshot.isDragging ? "row-dragging" : ""}`}
            ></tr>
          );
        }}
      </Draggable>
    );
  };

  const onBeforeCapture = (start) => {
    const draggableId = start.draggableId;
    const selected = selectedTaskIds.find((taskId) => taskId === draggableId);
    if (!selected) {
      setSelectedTaskIds([]);
    }
    setDraggingTaskId(draggableId);
  };

  const onDragEnd = (result) => {
    const destination = result.destination;
    const source = result.source;
    const selectedItemId = result.draggableId
    if (!destination || result.reason === "CANCEL") {
      setDraggingTaskId(null);
      return;
    }
    reorder(selectedItemId, source, destination)

  };

  const reorder = (selectedItemId, source, destination) => {
    const isPublishedDocsSource = source.droppableId === 'publishedDocs'
    const isPublishedDocsDestination = destination.droppableId === 'publishedDocs'
    if (source.droppableId === destination.droppableId) {
      const editedList = isPublishedDocsSource ? [...publishedDocs] : [...unPublishedDocs]
      const [removed] = editedList.splice(source.index, 1)
      editedList.splice(destination.index, 0, removed)
      isPublishedDocsSource ? setPublishedDocs(editedList) : setUnPublishedDocs(editedList)
    } else {
      const sourceList = isPublishedDocsSource ? [...publishedDocs] : [...unPublishedDocs]
      const destinationList = isPublishedDocsDestination ? [...publishedDocs] : [...unPublishedDocs]
      const [removed] = sourceList.splice(source.index, 1)
      destinationList.splice(destination.index, 0, removed)
      destinationList[destination.index].visible = !destinationList[destination.index].visible
      if (isPublishedDocsSource) {
        setPublishedDocs(sourceList)
        setUnPublishedDocs(destinationList)
      } else {
        setPublishedDocs(destinationList)
        setUnPublishedDocs(sourceList)
      }
    }
  }

  return (
    <>
      <Card
        className={`c-multi-drag-table ${draggingTaskId ? "is-dragging" : ""}`}
      >
        <DragDropContext
          onBeforeCapture={onBeforeCapture}
          onDragEnd={onDragEnd}
        >
          <h4>Published docs</h4>
          <Table
            dataSource={publishedDocs}
            columns={tableColumns}
            rowKey="id"
            pagination={false}
            components={{
              body: {
                wrapper: (val) =>
                  DroppableTableBody({
                    columnId: 'publishedDocs',
                    docs: publishedDocs,
                    ...val
                  }),
                row: (val) =>
                  DraggableTableRow({
                    docs: publishedDocs,
                    ...val
                  })
              }
            }}
            onRow={(record, index) => ({
              index,
              record,
            })}
          />

          <Divider />
          <h4>unPublished docs</h4>
          <Table
            dataSource={unPublishedDocs}
            columns={tableColumns}
            rowKey="id"
            pagination={false}
            components={{
              body: {
                wrapper: (val) =>
                  DroppableTableBody({
                    columnId: 'unPublishedDocs',
                    docs: unPublishedDocs,
                    ...val
                  }),
                row: (val) =>
                  DraggableTableRow({
                    docs: unPublishedDocs,
                    ...val
                  })
              }
            }}
            onRow={(record, index) => ({
              index,
              record,
            })}
          />
        </DragDropContext>
      </Card>
    </>
  );
};
