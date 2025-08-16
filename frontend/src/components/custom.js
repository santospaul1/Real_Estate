import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

// Initial available fields
const AVAILABLE_FIELDS = [
  { id: 'total_sales', label: 'Total Sales' },
  { id: 'deals_closed', label: 'Deals Closed' },
  { id: 'conversion_rate', label: 'Conversion Rate' },
  { id: 'month', label: 'Month' },
  { id: 'agent', label: 'Agent' },
];

export default function CustomReportBuilder() {
  const [fields, setFields] = useState(AVAILABLE_FIELDS);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [selectedGroupBy, setSelectedGroupBy] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  function onDragEnd(result) {
    const { source, destination } = result;
    if (!destination) return;

    // Move field between lists
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (source.droppableId === 'fields' && destination.droppableId === 'metrics') {
      // Add to metrics
      const moved = fields[source.index];
      setFields(fields.filter((_, i) => i !== source.index));
      setSelectedMetrics([...selectedMetrics, moved]);
    } else if (source.droppableId === 'fields' && destination.droppableId === 'groupBy') {
      // Add to groupBy
      const moved = fields[source.index];
      setFields(fields.filter((_, i) => i !== source.index));
      setSelectedGroupBy([...selectedGroupBy, moved]);
    } else if (source.droppableId === 'metrics' && destination.droppableId === 'fields') {
      // Remove from metrics back to fields
      const moved = selectedMetrics[source.index];
      setSelectedMetrics(selectedMetrics.filter((_, i) => i !== source.index));
      setFields([...fields, moved]);
    } else if (source.droppableId === 'groupBy' && destination.droppableId === 'fields') {
      // Remove from groupBy back to fields
      const moved = selectedGroupBy[source.index];
      setSelectedGroupBy(selectedGroupBy.filter((_, i) => i !== source.index));
      setFields([...fields, moved]);
    }
  }

  async function fetchReport() {
    setLoading(true);
    try {
      const metrics = selectedMetrics.map(f => f.id);
      const group_by = selectedGroupBy.map(f => f.id);
      const res = await axios.post('/api/reports/custom-report/', { metrics, group_by });
      setReportData(res.data);
    } catch (e) {
      alert('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Available Fields */}
        <Droppable droppableId="fields">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ border: '1px solid #ccc', padding: 10, width: 200, minHeight: 200 }}
            >
              <h4>Available Fields</h4>
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        padding: 8,
                        marginBottom: 4,
                        backgroundColor: '#eee',
                        ...provided.draggableProps.style,
                      }}
                    >
                      {field.label}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Metrics */}
        <Droppable droppableId="metrics">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ border: '1px solid #4caf50', padding: 10, width: 200, minHeight: 200 }}
            >
              <h4>Metrics</h4>
              {selectedMetrics.map((field, index) => (
                <Draggable key={field.id} draggableId={`metric-${field.id}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        padding: 8,
                        marginBottom: 4,
                        backgroundColor: '#c8e6c9',
                        ...provided.draggableProps.style,
                      }}
                    >
                      {field.label}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Group By */}
        <Droppable droppableId="groupBy">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ border: '1px solid #2196f3', padding: 10, width: 200, minHeight: 200 }}
            >
              <h4>Group By</h4>
              {selectedGroupBy.map((field, index) => (
                <Draggable key={field.id} draggableId={`groupby-${field.id}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        padding: 8,
                        marginBottom: 4,
                        backgroundColor: '#bbdefb',
                        ...provided.draggableProps.style,
                      }}
                    >
                      {field.label}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div style={{ flex: 1 }}>
        <button onClick={fetchReport} disabled={loading || selectedMetrics.length === 0}>
          {loading ? 'Loading...' : 'Run Report'}
        </button>

        <pre style={{ marginTop: 20, background: '#f4f4f4', padding: 10, maxHeight: 400, overflow: 'auto' }}>
          {JSON.stringify(reportData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
