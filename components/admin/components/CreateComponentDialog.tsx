'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, X, PlusCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface PropertySchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'color' | 'enum';
  label: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  options?: string[];
  properties?: PropertySchema[];
}

interface CreateComponentDialogProps {
  onSuccess?: () => void;
}

export function CreateComponentDialog({ onSuccess }: CreateComponentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'layout' as 'layout' | 'input' | 'display' | 'navigation' | 'form' | 'media',
    version: '1.0.0',
    visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE' | 'BETA',
  });

  const [propsSchema, setPropsSchema] = useState<PropertySchema[]>([]);
  const [defaultProps, setDefaultProps] = useState<Record<string, unknown>>({});

  const [editingProp, setEditingProp] = useState<PropertySchema | null>(null);
  const [propFormData, setPropFormData] = useState<Partial<PropertySchema>>({
    name: '',
    type: 'string',
    label: '',
    description: '',
    required: false,
    default: '',
  });

  function handleAddProperty() {
    if (!propFormData.name || !propFormData.label) {
      toast({
        title: 'Validation Error',
        description: 'Property name and label are required',
        variant: 'destructive',
      });
      return;
    }

    const newProp: PropertySchema = {
      name: propFormData.name,
      type: propFormData.type as PropertySchema['type'],
      label: propFormData.label,
      description: propFormData.description,
      required: propFormData.required || false,
      default: propFormData.default,
      options: propFormData.type === 'enum' ? propFormData.options : undefined,
    };

    setPropsSchema([...propsSchema, newProp]);
    
    // Set default value
    if (propFormData.type === 'boolean') {
      setDefaultProps({
        ...defaultProps,
        [newProp.name]: propFormData.default || false,
      });
    } else if (propFormData.default !== undefined && propFormData.default !== '') {
      setDefaultProps({
        ...defaultProps,
        [newProp.name]: propFormData.default,
      });
    }

    // Reset form
    setPropFormData({
      name: '',
      type: 'string',
      label: '',
      description: '',
      required: false,
      default: '',
    });
  }

  function handleRemoveProperty(index: number) {
    const prop = propsSchema[index];
    const newProps = propsSchema.filter((_, i) => i !== index);
    setPropsSchema(newProps);
    
    // Remove from defaultProps
    const newDefaults = { ...defaultProps };
    delete newDefaults[prop.name];
    setDefaultProps(newDefaults);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Component name is required',
        variant: 'destructive',
      });
      return;
    }

    if (propsSchema.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one property is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest<{ component: any }>('/admin/components', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category,
          version: formData.version,
          visibility: formData.visibility,
          propsSchema,
          defaultProps,
        }),
      });

      if (!response.success) {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create component',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Component created successfully',
      });

      // Reset form
      setFormData({
        name: '',
        category: 'layout',
        version: '1.0.0',
        visibility: 'PUBLIC',
      });
      setPropsSchema([]);
      setDefaultProps({});
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create component:', error);
      toast({
        title: 'Error',
        description: 'Failed to create component',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Component
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Component</DialogTitle>
          <DialogDescription>
            Add a new platform component with custom properties and styling options
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Component Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Carousel, AppBar"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="layout">Layout</SelectItem>
                    <SelectItem value="input">Input</SelectItem>
                    <SelectItem value="display">Display</SelectItem>
                    <SelectItem value="navigation">Navigation</SelectItem>
                    <SelectItem value="form">Form</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="BETA">Beta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Properties Schema */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Properties Schema</h3>
            </div>

            {/* Add Property Form */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3 border border-border">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="prop-name">Property Name *</Label>
                  <Input
                    id="prop-name"
                    value={propFormData.name || ''}
                    onChange={(e) => setPropFormData({ ...propFormData, name: e.target.value })}
                    placeholder="e.g., title, height"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prop-label">Label *</Label>
                  <Input
                    id="prop-label"
                    value={propFormData.label || ''}
                    onChange={(e) => setPropFormData({ ...propFormData, label: e.target.value })}
                    placeholder="e.g., Title, Height"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prop-type">Type *</Label>
                  <Select
                    value={propFormData.type || 'string'}
                    onValueChange={(value: any) => setPropFormData({ ...propFormData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="enum">Enum</SelectItem>
                      <SelectItem value="array">Array</SelectItem>
                      <SelectItem value="object">Object</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prop-description">Description</Label>
                <Textarea
                  id="prop-description"
                  value={propFormData.description || ''}
                  onChange={(e) => setPropFormData({ ...propFormData, description: e.target.value })}
                  placeholder="Property description"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prop-required"
                    checked={propFormData.required || false}
                    onChange={(e) => setPropFormData({ ...propFormData, required: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="prop-required" className="cursor-pointer">
                    Required
                  </Label>
                </div>

                {propFormData.type === 'boolean' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="prop-default-bool"
                      checked={propFormData.default === true}
                      onChange={(e) => setPropFormData({ ...propFormData, default: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="prop-default-bool" className="cursor-pointer">
                      Default: {propFormData.default ? 'true' : 'false'}
                    </Label>
                  </div>
                )}

                {propFormData.type !== 'boolean' && propFormData.type !== 'object' && propFormData.type !== 'array' && (
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="prop-default">Default Value</Label>
                    {propFormData.type === 'color' ? (
                      <div className="flex gap-2">
                        <Input
                          id="prop-default"
                          value={String(propFormData.default || '#000000')}
                          onChange={(e) => setPropFormData({ ...propFormData, default: e.target.value })}
                          placeholder="#000000"
                          type="color"
                          className="w-20 h-9"
                        />
                        <Input
                          value={String(propFormData.default || '#000000')}
                          onChange={(e) => setPropFormData({ ...propFormData, default: e.target.value })}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    ) : (
                      <Input
                        id="prop-default"
                        value={String(propFormData.default || '')}
                        onChange={(e) => {
                          let value: unknown = e.target.value;
                          if (propFormData.type === 'number') {
                            value = parseFloat(e.target.value) || 0;
                          }
                          setPropFormData({ ...propFormData, default: value });
                        }}
                        placeholder="Default value"
                        type={propFormData.type === 'number' ? 'number' : 'text'}
                      />
                    )}
                  </div>
                )}

                {propFormData.type === 'enum' && (
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="prop-options">Options (comma-separated)</Label>
                    <Input
                      id="prop-options"
                      value={propFormData.options?.join(', ') || ''}
                      onChange={(e) => {
                        const options = e.target.value.split(',').map((o) => o.trim()).filter(Boolean);
                        setPropFormData({ ...propFormData, options });
                      }}
                      placeholder="option1, option2, option3"
                    />
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleAddProperty}
                  className="mt-6"
                  size="sm"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </div>
            </div>

            {/* Properties List */}
            {propsSchema.length > 0 && (
              <div className="space-y-2">
                <Label>Added Properties ({propsSchema.length})</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {propsSchema.map((prop, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-card border border-border rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{prop.label}</span>
                          <span className="text-xs text-muted-foreground">({prop.name})</span>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">{prop.type}</span>
                          {prop.required && (
                            <span className="text-xs text-red-500">*</span>
                          )}
                        </div>
                        {prop.description && (
                          <p className="text-xs text-muted-foreground mt-1">{prop.description}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProperty(index)}
                        className="h-8 w-8 text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Component
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
