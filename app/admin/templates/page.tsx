'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Search } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string | null;
  published: boolean;
  createdAt: string;
  creator: {
    id: string;
    email: string;
    name: string | null;
  };
}

export default function TemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const response = await apiRequest<{ templates: Template[] }>('/admin/templates');
      if (!response.success) {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load templates',
          variant: 'destructive',
        });
        return;
      }
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground mt-1">Manage UI templates</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {templates.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">No templates found</p>
          </div>
        ) : (
          templates
            .filter((t) =>
              search
                ? t.name.toLowerCase().includes(search.toLowerCase()) ||
                  t.category.toLowerCase().includes(search.toLowerCase())
                : true
            )
            .map((template) => (
              <div
                key={template.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.category}
                    </p>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <span>Created by: {template.creator.name || template.creator.email}</span>
                      <span>
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                      {template.published && (
                        <span className="text-primary">Published</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
