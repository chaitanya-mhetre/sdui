'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest<{ project: { id: string } }>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        }),
      });

      if (!response.success) {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Project created successfully',
      });

      // Redirect to editor
      router.push(`/dashboard/editor/${response.data.project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/projects"
        className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all mb-10 w-fit"
      >
        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-sm font-semibold">Back to Projects</span>
      </Link>
      
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Create New Project</h1>
        <p className="text-muted-foreground text-lg font-medium">Start building your UI with a new project</p>
      </div>

      <div className="premium-card p-10 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <Label htmlFor="name" className="text-sm font-bold mb-3 block text-foreground/70">Project Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. E-commerce Mobile UI"
            className="mt-2 bg-muted/30 border-border focus:ring-primary/20 rounded-xl transition-all h-12"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={loading}
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-bold mb-3 block text-foreground/70">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your project..."
            className="mt-2 bg-muted/30 border-border focus:ring-primary/20 rounded-xl transition-all"
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Project...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
          <Link href="/dashboard/projects">
            <Button type="button" variant="outline" className="rounded-xl h-12 px-8 font-bold border-border" disabled={loading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  </div>
  );
}
