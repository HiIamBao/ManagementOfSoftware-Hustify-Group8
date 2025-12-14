import { useState, ChangeEvent, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Link, MapPin, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn, processUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { createPost } from '@/lib/actions/blog.action';
import type { BlogPost } from '@/types/blog';

interface CreatePostProps {
  user: {
    id: string;
    name: string;
    image: string;
  };
  onOptimisticPost: (post: BlogPost) => void;
  onPostError: (tempId: string) => void;
  onPostSuccess: (tempId: string, serverPost: BlogPost) => void;
}

// Sample locations - Should match with BlogFeed locations
const LOCATIONS = [
  'Hanoi',
  'Ho Chi Minh City',
  'Da Nang',
  'Hai Phong',
  'Can Tho',
  'Nha Trang',
  'Other'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function CreatePost({ user, onOptimisticPost, onPostError, onPostSuccess }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [url, setUrl] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size should not exceed 5MB');
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF and WebP images are allowed');
      return;
    }

    setPhoto(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    // Create temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;

    try {
      setIsSubmitting(true);

      // Create optimistic post
      const optimisticPost: BlogPost = {
        id: tempId,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
          title: 'User'
        },
        content: content.trim(),
        timestamp: new Date().toISOString(),
        location,
        likes: [],
        comments: [],
        reposts: [],
        ...(url ? { url: processUrl(url) } : {}),
        ...(photoPreview ? { photo: photoPreview } : {})
      };

      // Show optimistic update
      onOptimisticPost(optimisticPost);

      // Create FormData for actual request
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('userName', user.name);
      formData.append('userImage', user.image);
      formData.append('content', content.trim());
      formData.append('location', location);
      if (url) formData.append('url', url);
      if (photo) formData.append('photo', photo);

      // Make API call
      const serverPost = await createPost(formData);

      // Update with server response
      onPostSuccess(tempId, serverPost);

      // Reset form
      setContent('');
      setUrl('');
      handleRemovePhoto();
      setIsExpanded(false);
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
      onPostError(tempId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Simple Input Bar */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Textarea
                placeholder="What do you want to share?"
                value={content}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setContent(e.target.value);
                  if (!isExpanded && e.target.value) {
                    setIsExpanded(true);
                  }
                }}
                onFocus={() => setIsExpanded(true)}
                className="min-h-[40px] max-h-[40px] resize-none text-base bg-background/50 focus:bg-background transition-colors rounded-lg px-4 py-2 overflow-hidden"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex items-center justify-start px-2">
            <div className="flex items-center space-x-6 pl-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4 hover:bg-muted"
                onClick={() => setIsExpanded(true)}
              >
                <MapPin className="h-5 w-5 text-[#B10000] mr-2" />
                <span className="text-sm font-medium">Location</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4 hover:bg-muted"
                onClick={() => setIsExpanded(true)}
              >
                <Link className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium">URL</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4 hover:bg-muted"
                onClick={() => {
                  setIsExpanded(true);
                  fileInputRef.current?.click();
                }}
              >
                <Image className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium">Photo</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handlePhotoChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isSubmitting}
      />

      {/* Post Creation Popup */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-4 shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-start space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <Textarea
                  placeholder="What do you want to share?"
                  value={content}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none text-lg bg-background/50 focus:bg-background transition-colors"
                  disabled={isSubmitting}
                />

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <Select value={location} onValueChange={setLocation} disabled={isSubmitting}>
                      <SelectTrigger className="w-full h-10 bg-background/50 hover:bg-background transition-colors">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#B10000]" />
                          <SelectValue placeholder="Select location" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-4">
                    <div className="flex items-center gap-2 px-3 h-10 bg-background/50 hover:bg-background transition-colors border border-input rounded-md">
                      <Link className="h-4 w-4 text-yellow-500 shrink-0" />
                      <input
                        type="text"
                        placeholder="URL (optional)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="col-span-4">
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 h-10 bg-background/50 hover:bg-background transition-colors border border-input rounded-md",
                        !isSubmitting && "cursor-pointer"
                      )}
                      onClick={() => !isSubmitting && fileInputRef.current?.click()}
                    >
                      <Image className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">
                        {photo ? 'Change photo' : 'Add photo'}
                      </span>
                    </div>
                  </div>
                </div>

                {photoPreview && (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-auto max-h-[300px] object-contain rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemovePhoto}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsExpanded(false);
                      setContent('');
                      setUrl('');
                      handleRemovePhoto();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isSubmitting}
                    className="px-8 bg-[#B10000] hover:bg-[#B10000]/90"
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 