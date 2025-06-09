export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "user";
  createdAt: Date;
  avatar?: string;
  bio?: string;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  createdBy: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  categoryName: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  imageUrl?: string;
  tags: string[];
}
