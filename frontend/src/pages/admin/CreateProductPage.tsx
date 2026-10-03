import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { CreateProductDto } from 'shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { API_URL } from '../../lib/api';

const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function CreateProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: metadata } = useQuery({
    queryKey: ['admin-metadata'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/admin/metadata`);
      return res.data;
    }
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [developer, setDeveloper] = useState('');
  const [publisher, setPublisher] = useState('');
  const [systemRequirements, setSystemRequirements] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [rating, setRating] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Variant fields
  const [variantName, setVariantName] = useState('Standard Edition');
  const [price, setPrice] = useState('59.99');
  const [storeId, setStoreId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [region, setRegion] = useState('');
  const [activationGuide, setActivationGuide] = useState('');
  const [stagedKeys, setStagedKeys] = useState<string[]>([]);
  const [currentKey, setCurrentKey] = useState('');

  const handleAddKey = () => {
    if (currentKey.trim() && !stagedKeys.includes(currentKey.trim())) {
      setStagedKeys([...stagedKeys, currentKey.trim()]);
      setCurrentKey('');
    }
  };

  const handleRemoveKey = (keyToRemove: string) => {
    setStagedKeys(stagedKeys.filter(k => k !== keyToRemove));
  };

  const createMutation = useMutation({
    mutationFn: async (dto: CreateProductDto) => {
      const formData = new FormData();
      formData.append('data', JSON.stringify(dto));
      
      if (imageFile) {
        const compressedBlob = await compressImage(imageFile);
        formData.append('file', compressedBlob, imageFile.name);
      } else {
        throw new Error('Please select a product image.');
      }
      
      await axios.post(`${API_URL}/admin/products`, formData, {
        headers: { 
          'x-actor-id': '22222222-2222-2222-2222-222222222222'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      navigate('/admin/products');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      description,
      developer,
      publisher,
      systemRequirements,
      tags,
      status,
      rating,
      variants: [{
        name: variantName,
        price: Math.round(parseFloat(price) * 100), // convert to cents
        storeId: storeId ? parseInt(storeId, 10) : metadata?.stores?.[0]?.id,
        typeId: typeId ? parseInt(typeId, 10) : metadata?.types?.[0]?.id,
        region: region ? parseInt(region, 10) : metadata?.regions?.[0]?.id,
        languageSupport: ['English'],
        activationGuide,
        keys: stagedKeys
      }]
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>Upload a new product to your catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageFile">Product Image</Label>
              <Input id="imageFile" type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="developer">Developer</Label>
                <Input id="developer" value={developer} onChange={e => setDeveloper(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input id="publisher" value={publisher} onChange={e => setPublisher(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Publish Status</Label>
                <select id="status" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={status} onChange={e => setStatus(e.target.value)} required>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (e.g. 9/10)</Label>
                <Input id="rating" value={rating} onChange={e => setRating(e.target.value)} placeholder="e.g. 9/10, 85%" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. RPG, Action, Indie" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemRequirements">System Requirements</Label>
              <Input id="systemRequirements" value={systemRequirements} onChange={e => setSystemRequirements(e.target.value)} placeholder="Minimum & Recommended hardware specs" />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Initial Variant</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variantName">Variant Name</Label>
                  <Input id="variantName" value={variantName} onChange={e => setVariantName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeId">Platform</Label>
                  <select id="storeId" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={storeId} onChange={e => setStoreId(e.target.value)} required>
                    {metadata?.stores?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typeId">Product Type</Label>
                  <select id="typeId" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={typeId} onChange={e => setTypeId(e.target.value)} required>
                    {metadata?.types?.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <select id="region" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={region} onChange={e => setRegion(e.target.value)} required>
                    {metadata?.regions?.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="activationGuide">Activation Guide</Label>
                  <Input id="activationGuide" value={activationGuide} onChange={e => setActivationGuide(e.target.value)} placeholder="Instructions on how to activate key" />
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <Label>Product Keys</Label>
                <div className="flex space-x-2">
                  <Input 
                    value={currentKey} 
                    onChange={e => setCurrentKey(e.target.value)}
                    placeholder="Enter a product key..."
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKey();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddKey} variant="outline">Add</Button>
                </div>
                {stagedKeys.length > 0 && (
                  <div className="border border-slate-200 rounded-md p-4 bg-slate-50 space-y-2 max-h-48 overflow-y-auto">
                    {stagedKeys.map(k => (
                      <div key={k} className="flex justify-between items-center bg-white border border-slate-100 p-2 rounded shadow-sm text-sm">
                        <span className="font-mono">{k}</span>
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:bg-red-50" onClick={() => handleRemoveKey(k)}>✕</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <CardFooter className="px-0 pt-6 flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => navigate('/admin/products')}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Publishing...' : 'Publish Product'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
