import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import "./taskfeed.css";


function Taskfeed() {
  const [tasks, setTasks] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
        let url = `http://localhost:5050/data?year=${year}&month=${month}`;
        if (startDate && endDate) {
          url += `&start=${startDate.toISOString().substring(0, 10)}&end=${endDate.toISOString().substring(0, 10)}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        setTasks(data);
      }
          fetchData();
  }, [year, month, startDate, endDate]);

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const newTasks = [...tasks];
    const [reorderedTask] = newTasks.splice(result.source.index, 1);
    newTasks.splice(result.destination.index, 0, reorderedTask);
    setTasks(newTasks);
  };

  const getStatusClass = (status) => {
    return status === 1 ? 'strikethrough' : '';
  };
  return (
    <div style={{marginTop:'30px'}}>
      <h2>Dashboard</h2>
      <center><hr style={{width:'250px', marginBottom:'30px 0'}}></hr></center>
      <div className='dateTime'>
        <div className='years'>
          <div>
              <label>Year:</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value={new Date().getFullYear()}>2023</option>
              <option value={new Date().getFullYear() - 1}>2022</option>
              <option value={new Date().getFullYear() - 2}>2021</option>
            </select>
            </div>
            <div>
              <label>Month:</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
              </select>
            </div>
        </div>
        <div className='dateRange'>
            <div className='strtDate'>
                <label>Start Date:</label>
                <input type="date" onChange={(e) => setStartDate(new Date(e.target.value))} />
            </div>
            <div className='endDate'>
                <label>End Date:</label>
                <input type="date" onChange={(e) => setEndDate(new Date(e.target.value))} />
            </div>
        </div>
    </div>
    <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div className='main-taskfeed'>
              <ul {...provided.droppableProps} ref={provided.innerRef}>
                {tasks.map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided) => (
                      <li className={`task-data ${getStatusClass(task.status)}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        draggable={true}
                      >
                        <div className={`${getStatusClass(task.status) !== 'strikethrough' ? '' : 'hide-delete'}`}>
                          <h4>{task.title}</h4>
                          <a href={task.link}>{task.link}</a>
                          <p>{task.details}</p>
                        </div>
                        <div className='right-keys'>
                          <input
                            type="checkbox"
                            defaultChecked={task.status !== 0}
                            onClick={() => {
                            const newTasks = [...tasks];
                            newTasks[index].status = newTasks[index].status === 0 ? 1 : 0;
                            setTasks(newTasks);
                            fetch(`http://localhost:5050/update/${task._id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newTasks[index].status })
                            })
                              .then(response => response.json())
                              .then(data => console.log(data))
                              .catch(error => console.error(error))
                          }}
                        />
                        <div>
                            <button style={{background:'red'}}
                              onClick={() => {
                                const newTasks = [...tasks];
                                fetch(`http://localhost:5050/delete/${task._id}`,{
                                  method:'DELETE'
                                })
                                .then(response => {
                                  if (response.ok) {
                                    setSuccess(task);
                                    // Remove the deleted task from the state
                                    setTasks(newTasks.filter(t => t._id !== task._id));
                                  } else {
                                    throw new Error('Failed to delete task');
                                  }
                                })
                                .catch(error => console.error(error))
                              }}
                            >
                              Delete
                            </button>
                        </div>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          </div>
        )}
      </Droppable>
    </DragDropContext>
    </div>
  );
}

export default Taskfeed;
