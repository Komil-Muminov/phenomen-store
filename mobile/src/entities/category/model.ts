export interface ICategory {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  imageUrl: string | null;
  position: number;
}

export const CategoryPlaceholderImage = 'https://placehold.co/300x300/f6f6f7/6b7280?text=%20';
