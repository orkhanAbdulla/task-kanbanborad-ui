import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Task, STATUS_COLORS } from '@/types/kanban';
import { TaskCard } from './TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: Column;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanColumn({ column, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <Card className="flex flex-col h-full bg-kanban-column-bg border-kanban-column-border shadow-kanban">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-foreground font-semibold">
            {column.title}
          </span>
          <Badge 
            variant="secondary" 
            className={cn(
              'text-xs font-medium',
              `bg-${STATUS_COLORS[column.id]}/10 text-${STATUS_COLORS[column.id]} border-${STATUS_COLORS[column.id]}/20`
            )}
          >
            {column.tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-3">
        <div
          ref={setNodeRef}
          className={cn(
            'min-h-[200px] h-full transition-colors duration-200 rounded-lg border-2 border-dashed p-2',
            isOver 
              ? 'border-primary bg-primary/5' 
              : 'border-transparent'
          )}
        >
          <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {column.tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}
              {column.tasks.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p className="text-sm">No tasks yet</p>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  );
}