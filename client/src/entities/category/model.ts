export interface ICategory {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  imageUrl: string | null;
  position: number;
}

export const CategoryPlaceholderImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop';
