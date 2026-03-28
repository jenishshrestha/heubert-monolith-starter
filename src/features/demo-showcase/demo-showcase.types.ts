export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: "male" | "female";
  phone: string;
  birthDate: string;
  image: string;
  university: string;
}

export interface PlatziProduct {
  id: number;
  title: string;
  slug: string;
  price: number;
  description: string;
  category: {
    id: number;
    name: string;
    slug: string;
    image: string;
  };
  images: string[];
}

export interface PlatziCategory {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface Recipe {
  id: number;
  name: string;
  cuisine: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  rating: number;
  image: string;
}

export interface Country {
  flags: { png: string; svg: string; alt: string };
  name: { common: string; official: string };
  capital: string[];
  region: string;
  population: number;
  languages: Record<string, string>;
}
