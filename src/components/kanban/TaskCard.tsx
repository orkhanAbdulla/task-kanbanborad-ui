import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, STATUS_COLORS } from '@/types/kanban';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Clock, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-task-bg border-task-border hover:border-task-hover cursor-grab active:cursor-grabbing',
        'shadow-task hover:shadow-task-hover transition-all duration-200',
        'transform hover:scale-[1.02]',
        isDragging && 'opacity-50 shadow-task-hover scale-105'
      )}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-foreground line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs border-current',
                `text-${STATUS_COLORS[task.status]}`
              )}
            >
              {task.status.replace('-', ' ')}
            </Badge>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 mt-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-accent"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      {task.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {task.description}
          </p>
        </CardContent>
      )}
      
      <CardContent className="pt-0 pb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{task.createdAt.toLocaleDateString()}</span>
          </div>
          <div className="text-xs">
            ID: {task.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}