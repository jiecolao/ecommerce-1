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

export default function CreateProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Game');
  const [developer, setDeveloper] = useState('');
  const [publisher, setPublisher] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Variant fields
  const [variantName, setVariantName] = useState('Standard Edition');
  const [price, setPrice] = useState('59.99');
  const [storeId, setStoreId] = useState('1'); // Steam
  const [typeId, setTypeId] = useState('1'); // Key
  const [region, setRegion] = useState('1'); // Global

  const createMutation = useMutation({
    mutationFn: async (dto: CreateProductDto) => {
      const res = await axios.post(`${API_URL}/seller/products`, dto, {
        headers: { 'x-actor-id': '22222222-2222-2222-2222-222222222222' }
      });
      
      if (imageFile && res.data.id) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
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
      type,
      description,
      developer,
      publisher,
      variants: [{
        name: variantName,
        price: Math.round(parseFloat(price) * 100), // convert to cents
        storeId: parseInt(storeId, 10),
        typeId: parseInt(typeId, 10),
        region: parseInt(region, 10),
        languageSupport: ['English']
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
              <Label htmlFor="type">Type (e.g. Game, Software)</Label>
              <Input id="type" value={type} onChange={e => setType(e.target.value)} required />
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
