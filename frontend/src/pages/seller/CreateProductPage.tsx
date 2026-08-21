import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [developer, setDeveloper] = useState('');
  const [publisher, setPublisher] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Variant fields
  const [variantName, setVariantName] = useState('Standard Edition');
  const [price, setPrice] = useState('59.99');
  const [storeId, setStoreId] = useState('1'); // Steam
  const [typeId, setTypeId] = useState('1'); // Key
  const [region, setRegion] = useState('1'); // Global
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
      const res = await axios.post(`${API_URL}/seller/products`, dto, {
        headers: { 'x-actor-id': '22222222-2222-2222-2222-222222222222' }
      });
      
      if (imageFile && res.data.id) {
        const compressedBlob = await compressImage(imageFile);
        const formData = new FormData();
        // Append as a File object with original name, but compressed payload
        formData.append('file', compressedBlob, imageFile.name);
        
        await axios.post(`${API_URL}/seller/products/${res.data.id}/image`, formData, {
          headers: { 
            'x-actor-id': '22222222-2222-2222-2222-222222222222'
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      navigate('/seller/products');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      description,
      developer,
      publisher,
      variants: [{
        name: variantName,
        price: Math.round(parseFloat(price) * 100), // convert to cents
        storeId: parseInt(storeId, 10),
        typeId: parseInt(typeId, 10),
        region: parseInt(region, 10),
        languageSupport: ['English'],
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
                    <option value="1">Steam</option>
                    <option value="2">Epic Games</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typeId">Product Type</Label>
                  <select id="typeId" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={typeId} onChange={e => setTypeId(e.target.value)} required>
                    <option value="1">Key</option>
                    <option value="2">Account</option>
                    <option value="3">Gift</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <select id="region" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={region} onChange={e => setRegion(e.target.value)} required>
                    <option value="1">Global</option>
                    <option value="2">North America</option>
                    <option value="3">Europe</option>
                  </select>
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
              <Button variant="outline" type="button" onClick={() => navigate('/seller/products')}>Cancel</Button>
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
