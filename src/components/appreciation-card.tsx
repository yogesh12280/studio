'use client'

import { useState, useEffect } from 'react'
import { Heart, ArrowRight } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Appreciation } from '@/lib/types'
import { useUser } from '@/contexts/user-context'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface AppreciationCardProps {
  appreciation: Appreciation
  onLikeToggle: (appreciationId: string) => void
}

export function AppreciationCard({ appreciation, onLikeToggle }: AppreciationCardProps) {
  const { currentUser } = useUser()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isLiked = appreciation.likedBy.includes(currentUser.id)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-12 w-12 mb-2">
              <AvatarImage
                src={appreciation.fromUser.avatarUrl}
                alt={appreciation.fromUser.name}
              />
              <AvatarFallback>{appreciation.fromUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold text-sm">{appreciation.fromUser.name}</p>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground shrink-0" />
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-12 w-12 mb-2">
              <AvatarImage
                src={appreciation.toUser.avatarUrl}
                alt={appreciation.toUser.name}
              />
              <AvatarFallback>{appreciation.toUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold text-sm">{appreciation.toUser.name}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="bg-muted p-4 rounded-lg text-center">
             <p className="text-foreground/90 whitespace-pre-wrap">
                &ldquo;{appreciation.message}&rdquo;
            </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {isClient ? (
            <time dateTime={new Date(appreciation.createdAt).toISOString()}>
              {formatDistanceToNow(new Date(appreciation.createdAt), { addSuffix: true })}
            </time>
          ) : (
            <span>&nbsp;</span>
          )}
        </p>
         <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onLikeToggle(appreciation.id)}
            className="gap-1"
        >
            <Heart className={cn('h-4 w-4', isLiked && 'fill-red-500 text-red-500')} />
            <span>{appreciation.likes}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
