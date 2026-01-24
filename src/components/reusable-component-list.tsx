'use client'

import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Eye, Rocket } from 'lucide-react'
import type { ReusableComponent } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface ReusableComponentListProps {
  components: ReusableComponent[]
  onSelectComponent: (component: ReusableComponent) => void
}

export function ReusableComponentList({ components, onSelectComponent }: ReusableComponentListProps) {

  return (
    <div className="space-y-3">
      {components.map((component) => (
        <div 
          key={component.id} 
          onClick={() => onSelectComponent(component)} 
          className="cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors flex flex-col"
        >
          <div className="flex-1 mb-3">
            <div className="flex justify-between items-start gap-2 mb-1">
              <span className="font-medium text-base">{component.name}</span>
              <Badge variant={
                component.technology === 'Web' ? 'default' 
                : (component.technology === 'AI' || component.technology === 'QC') ? 'secondary' 
                : 'outline'
              }>
                {component.technology}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{component.description}</p>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4"/>
                  <span>{component.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4"/>
                  <span>{component.comments.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Rocket className="h-4 w-4"/>
                  <span>{component.utilizationByProjects.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4"/>
                  <span>{component.viewers}</span>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">
              By {component.registeredBy.name} &middot; {formatDistanceToNow(new Date(component.registeredDate), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
