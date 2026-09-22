// @ts-nocheck
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { CreateProductDto } from 'shared';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { API_URL } from '../../lib/api';

export default function CreateProductPageOriginal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('19.99');
  const [inventory, setInventory] = useState('100');

  const createMutation = useMutation({
    mutationFn: async (dto: CreateProductDto) => {
      await axios.post(`${API_URL}/seller/products`, dto, {
        headers: { 'x-actor-id': 'demo-seller' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      navigate('/test/seller/products');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      description,
      priceCents: Math.round(parseFloat(price) * 100),
      inventoryCount: parseInt(inventory, 10),
      status: 'PUBLISHED',
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Game Key</CardTitle>
          <CardDescription>Upload a new game to your catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Game Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inventory">Number of Keys (Inventory)</Label>
                <Input
                  id="inventory"
                  type="number"
                  min="1"
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  required
                />
              </div>
            </div>

            <CardFooter className="px-0 pt-6 flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => navigate('/test/seller/products')}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Publishing...' : 'Publish Game'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

