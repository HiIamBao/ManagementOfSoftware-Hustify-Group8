"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pencil, CheckCircle2, XCircle, Users, MoreVertical, Trash2 } from 'lucide-react';
import { publishJob, closeJob, deleteJob } from '@/lib/actions/hr-jobs.action';
import Link from 'next/link';

interface JobActionsProps {
  job: { id: string; status: string };
}

export default function JobActions({ job }: JobActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: 'publish' | 'close' | 'delete') => {
    setIsSubmitting(true);
    try {
      let result;
      if (action === 'publish') {
        result = await publishJob(job.id);
      } else if (action === 'close') {
        result = await closeJob(job.id);
      } else {
        result = await deleteJob(job.id);
      }

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="outline" className="rounded-full">
        <Link href={`/hr/jobs/${job.id}/edit`}>
          <Pencil className="h-4 w-4 mr-1" /> Edit
        </Link>
      </Button>

      {job.status === 'draft' && (
        <Button onClick={() => handleAction('publish')} disabled={isSubmitting} size="sm" variant="outline" className="rounded-full border-green-200 text-green-700 hover:bg-green-50">
          <CheckCircle2 className="h-4 w-4 mr-1" /> Publish
        </Button>
      )}

      {job.status === 'published' && (
        <Button onClick={() => handleAction('close')} disabled={isSubmitting} size="sm" variant="outline" className="rounded-full border-orange-200 text-orange-700 hover:bg-orange-50">
          <XCircle className="h-4 w-4 mr-1" /> Close
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/hr/jobs/${job.id}/applicants`} className="flex items-center gap-2">
              <Users className="h-4 w-4" /> View applicants
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAction('delete')} disabled={isSubmitting} className="flex items-center gap-2 text-red-600 cursor-pointer">
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

