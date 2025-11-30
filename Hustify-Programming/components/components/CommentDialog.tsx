import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  currentUser: {
    name: string;
    image: string;
  };
  postAuthor: {
    name: string;
  };
}

export function CommentDialog({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  postAuthor,
}: CommentDialogProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment);
      setComment('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[512px]">
        <DialogHeader>
          <DialogTitle>Reply to {postAuthor.name}'s post</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <Avatar>
            <AvatarImage src={currentUser.image} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">{currentUser.name}</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!comment.trim()}>
            Post Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 