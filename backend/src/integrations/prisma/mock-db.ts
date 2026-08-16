export const MockDB = {
  products: [
    {
      id: 'mock-prod-1',
      sellerId: 'demo-seller',
      title: 'Cosmic Adventure: Game Key',
      description: 'An epic space exploration game.',
      priceCents: 2999,
      inventoryCount: 50,
      isFeatured: true,
      status: 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date(),
      images: []
    },
    {
      id: 'mock-prod-2',
      sellerId: 'demo-seller',
      title: 'Medieval Fantasy RPG',
      description: 'Explore dungeons and fight dragons.',
      priceCents: 4999,
      inventoryCount: 15,
      isFeatured: true,
      status: 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date(),
      images: []
    }
  ] as any[],
  
  orders: [] as any[],
  
  invoices: [] as any[],
};
