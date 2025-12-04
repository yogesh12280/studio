'use client'

import { useMemo, useState, Fragment, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { MoreHorizontal, Send, ChevronDown, ChevronUp, Smile } from 'lucide-react'
import { Grievance, GrievanceComment, User } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { useUser } from '@/contexts/user-context'
import { AddGrievanceCommentDialog } from './add-grievance-comment-dialog'
import { Separator } from './ui/separator'
import { Input } from './ui/input'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'


interface ReplyInputProps {
  grievanceId: string;
  commentId: string;
  onAddReply: (grievanceId: string, commentId: string, replyText: string) => void;
  currentUser: User;
}

function ReplyInput({ grievanceId, commentId, onAddReply, currentUser }: ReplyInputProps) {
  const [replyText, setReplyText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setReplyText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onAddReply(grievanceId, commentId, replyText.trim());
      setReplyText('');
    }
  };

  return (
    <form onSubmit={handleReplySubmit} className="flex items-center gap-2 mt-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <Input
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write a reply..."
        className="flex-1 h-9 bg-background"
      />
       <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-0">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </PopoverContent>
      </Popover>
      <Button type="submit" size="icon" className="h-9 w-9">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

interface CommentWithRepliesProps {
  comment: GrievanceComment;
  grievanceId: string;
  onAddReply: (grievanceId: string, commentId: string, replyText: string) => void;
  currentUser: User;
  isClient: boolean;
  getStatusVariant: (status: Grievance['status']) => 'default' | 'destructive' | 'secondary' | 'outline';
}

function CommentWithReplies({ comment, grievanceId, onAddReply, currentUser, isClient, getStatusVariant }: CommentWithRepliesProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);

  return (
    <div key={comment.id} className="flex items-start gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-background rounded-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm">{comment.author.name}</p>
            {comment.status && <Badge variant={getStatusVariant(comment.status)}>{comment.status}</Badge>}
          </div>
          <p className="text-sm text-foreground/90">{comment.text}</p>
        </div>
        <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground mt-1">
            {isClient ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ''}
            </p>
            <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={() => setShowReplyInput(!showReplyInput)}>
                Reply
            </Button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <div key={reply.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
                  <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg px-3 py-2 border">
                    <p className="font-semibold text-sm">{reply.author.name}</p>
                    <p className="text-sm text-foreground/90">{reply.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isClient ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {showReplyInput && (
          <ReplyInput
            grievanceId={grievanceId}
            commentId={comment.id}
            onAddReply={onAddReply}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
}


interface GrievanceManagementProps {
  searchQuery: string;
  grievances: Grievance[];
  onStatusChange: (grievanceId: string, newStatus: Grievance['status'], comment?: string) => void;
  onAddComment: (grievanceId: string, commentText: string) => void;
  onAddReply: (grievanceId: string, commentId: string, replyText: string) => void;
}

export function GrievanceManagement({ searchQuery, grievances, onStatusChange, onAddComment, onAddReply }: GrievanceManagementProps) {
  const { currentUser } = useUser()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null)
  const [targetStatus, setTargetStatus] = useState<Grievance['status'] | null>(null)
  const [newComment, setNewComment] = useState<{[key: string]: string}>({})
  const [openCollapsibles, setOpenCollapsibles] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!currentUser) return null;

  const toggleCollapsible = (id: string) => {
    setOpenCollapsibles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusVariant = (status: Grievance['status']) => {
    switch (status) {
      case 'Pending':
        return 'destructive'
      case 'In Progress':
        return 'secondary'
      case 'Resolved':
        return 'default'
      default:
        return 'outline'
    }
  }
  
  const handleStatusUpdate = (grievance: Grievance, status: Grievance['status']) => {
    if (status === 'In Progress' || status === 'Resolved') {
      setSelectedGrievance(grievance)
      setTargetStatus(status)
      setDialogOpen(true)
    } else {
      onStatusChange(grievance.id, status)
    }
  }
  
  const handleDialogSubmit = (comment: string) => {
    if (selectedGrievance && targetStatus) {
      onStatusChange(selectedGrievance.id, targetStatus, comment)
    }
  }
  
  const handleCommentSubmit = (e: React.FormEvent, grievanceId: string) => {
    e.preventDefault()
    const commentText = newComment[grievanceId]?.trim()
    if (commentText) {
      onAddComment(grievanceId, commentText)
      setNewComment(prev => ({...prev, [grievanceId]: ''}))
    }
  }
  
  const handleEmojiClick = (emojiData: EmojiClickData, grievanceId: string) => {
    setNewComment(prev => ({...prev, [grievanceId]: (prev[grievanceId] || '') + emojiData.emoji}));
    setShowEmojiPicker(prev => ({...prev, [grievanceId]: false}));
  }

  const filteredGrievances = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    if (!searchLower) {
      return grievances.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return grievances
      .filter(g => 
        g.employeeName.toLowerCase().includes(searchLower) ||
        g.subject.toLowerCase().includes(searchLower) ||
        g.status.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [grievances, searchQuery]);


  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold font-headline">Manage Grievances</h2>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrievances.map((grievance) => (
              <Fragment key={grievance.id}>
                <TableRow>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => toggleCollapsible(grievance.id)}>
                      {openCollapsibles.has(grievance.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <span className="sr-only">Toggle Comments</span>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={grievance.employeeAvatarUrl}
                          alt={grievance.employeeName}
                        />
                        <AvatarFallback>
                          {grievance.employeeName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{grievance.employeeName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{grievance.subject}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(grievance.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(grievance.status)}>
                      {grievance.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(grievance, 'Pending')}
                        >
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(grievance, 'In Progress')}
                        >
                          Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(grievance, 'Resolved')}
                        >
                          Mark as Resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {openCollapsibles.has(grievance.id) && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                       <div className="p-4 space-y-4 bg-muted/50">
                        <p className="font-medium text-sm">Conversation History</p>
                        <p className="text-sm text-muted-foreground">{grievance.description}</p>
                        <Separator/>
                        {grievance.comments && grievance.comments.filter(c => !c.parentId).map(comment => (
                           <CommentWithReplies
                            key={comment.id}
                            comment={comment}
                            grievanceId={grievance.id}
                            onAddReply={onAddReply}
                            currentUser={currentUser}
                            isClient={isClient}
                            getStatusVariant={getStatusVariant}
                          />
                        ))}
                         {(!grievance.comments || grievance.comments.length === 0) && (
                          <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
                         )}
                        <form onSubmit={(e) => handleCommentSubmit(e, grievance.id)} className="flex items-center gap-2 pt-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <Input
                            value={newComment[grievance.id] || ''}
                            onChange={(e) => setNewComment(prev => ({...prev, [grievance.id]: e.target.value}))}
                            placeholder="Add to the conversation..."
                            className="flex-1 h-9 bg-background"
                          />
                          <Popover open={showEmojiPicker[grievance.id]} onOpenChange={(isOpen) => setShowEmojiPicker(prev => ({...prev, [grievance.id]: isOpen}))}>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
                                <Smile className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-0">
                              <EmojiPicker onEmojiClick={(emoji) => handleEmojiClick(emoji, grievance.id)} />
                            </PopoverContent>
                          </Popover>
                          <Button type="submit" size="icon" className="h-9 w-9">
                            <Send className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
       <AddGrievanceCommentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        grievance={selectedGrievance}
        targetStatus={targetStatus}
        onSubmit={handleDialogSubmit}
      />
    </div>
  )
}

    