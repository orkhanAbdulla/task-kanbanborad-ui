import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Task, Column, TaskStatus, INITIAL_COLUMNS } from "@/types/kanban";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { EditTaskModal } from "./EditTaskModal";
import { useToast } from "@/hooks/use-toast";
import { fetchTasks, createTask, updateTaskStatus } from "@/api/tasks";
import { previousDay } from "date-fns";
import { log } from "console";
import { title } from "process";

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  // Fetch tasks from API on mount
  useEffect(() => {
    fetchTasks()
      .then((tasks: Task[]) => {
        // Distribute tasks into columns by status
        setColumns(
          INITIAL_COLUMNS.map((col) => ({
            ...col,
            tasks: tasks.filter((task) => task.status === col.id),
          }))
        );
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to load tasks from server",
        });
      });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    //backend
    const newTask = await createTask({
      title: taskData.title,
      description: taskData.description,
    });

    setColumns((prev) =>
      prev.map((column) =>
        column.id === taskData.status
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      )
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;
    // TODO: Implement drag over functionality
    const activeTask = findTaskById(overId);
    const activeColum = findColumnByTaskId(activeId);
    const overColum = findColumnByTaskId(activeId) || findTaskById(overId);
    if (!activeTask || activeColum || overColum) return;

    if (overColum.id !== active.id) {
      setColumns((prev) =>
        prev.map((column) => ({
          ...column,
          tasks:
            column.id === activeColum.id
              ? column.tasks.filter((task) => task.id === activeId)
              : column.id === overColum.id
              ? [
                  ...column.tasks,
                  { ...activeTask, status: overColum.id as TaskStatus },
                ]
              : column.tasks,
        }))
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = findTaskById(activeId);
    const activeColumn = findColumnByTaskId(activeId);
    const overTask = findTaskById(overId);
    const overColumn = findColumnByTaskId(overId) || findColumnById(overId);

    if (!activeTask || !activeColumn || !overColumn) return;
    if (overColumn.id !== activeColumn.id) {
      const updatedTask = await updateTaskStatus(activeId, overColumn.id);

      setColumns((prev) =>
        prev.map((column) => ({
          ...column,
          tasks:
            column.id === activeColumn.id
              ? column.tasks.filter((task) => task.id !== activeId)
              : column.id === overColumn.id
              ? [
                  ...column.tasks,
                  { ...activeTask, status: overColumn.id as TaskStatus },
                ]
              : column.tasks,
        }))
      );
    }
    const oldIndex = activeColumn.tasks.findIndex(
      (task) => task.id === activeId
    );
    const newIndex = activeColumn.tasks.findIndex((task) => task.id == overId);

    if (oldIndex !== newIndex) {
      setColumns((prev) =>
        prev.map((column) =>
          column.id === activeColumn.id
            ? {
                ...column,
                tasks: arrayMove(column.tasks, oldIndex, newIndex),
              }
            : column
        )
      );
    }

    // TODO: Implement drag end functionality
  };
  const findTaskById = (id: string): Task | null => {
    for (const column of columns) {
      const task = column.tasks.find((task) => task.id === id);
      if (task) return task;
    }
    return null;
  };

  const findColumnById = (id: string): Column | null => {
    return columns.find((column) => column.id === id) || null;
  };

  const findColumnByTaskId = (taskId: string): Column | null => {
    return (
      columns.find((column) =>
        column.tasks.some((task) => task.id === taskId)
      ) || null
    );
  };

  const handleEditTask = (
    taskId: string,
    updatedTask: { title: string; description?: string; status: TaskStatus }
  ) => {
    // TODO: Implement edit task functionality
  };

  const handleDeleteTask = (taskId: string) => {
    const task = findTaskById(taskId);
    if (!task) return;

    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }))
    );

    toast({
      title: "Task Deleted",
      description: `"${task.title}" has been deleted`,
    });
  };

  return (
    <div className="h-full bg-kanban-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Kanban Board
          </h1>
          <p className="text-muted-foreground">
            Drag and drop tasks between columns to update their status
          </p>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onEditTask={setEditingTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="rotate-5 opacity-90">
                <TaskCard task={activeTask} />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        <EditTaskModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEditTask}
        />
      </div>
    </div>
  );
}
