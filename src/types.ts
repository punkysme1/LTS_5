
export interface Manuscript {
  id: string;
  title: string;
  author: string;
  inventoryCode: string;
  digitalCode: string;
  status: 'Tersedia' | 'Dipinjam' | 'Rusak';
  copyist?: string;
  copyYear?: number;
  pageCount: number;
  ink?: string;
  category: string;
  language: string;
  script: string;
  size: string; // contoh: "20cm x 30cm"
  description: string;
  condition: string;
  readability: string;
  colophon?: string;
  coverImageUrl: string; // URL ke gambar
  googleDriveFolderUrl?: string; // Placeholder untuk tautan Drive
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string; // string ISO
  summary: string;
  content: string; // Konten lengkap, bisa berupa Markdown atau string HTML
  imageUrl?: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  date: string; // string ISO
  text: string;
}

export interface GuestbookEntry {
  id:string;
  name: string;
  message: string;
  date: string; // string ISO
}

export enum AdminSection {
  Manuscripts = 'Manuskrip',
  Blog = 'Blog',
  Guestbook = 'Buku Tamu',
}

export interface NavItem {
  name: string;
  path: string;
  icon?: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
}

// Untuk Gemini API
export interface GroundingChunk {
  web?: {
    uri?: string; 
    title?: string; 
  };
  retrievedContext?: {
    uri?: string; // Dibuat opsional agar sesuai dengan SDK
    title?: string; // Dibuat opsional agar sesuai dengan SDK
  };
}

// Untuk Otentikasi
export interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password_param: string) => Promise<boolean>; // Mengganti nama password untuk menghindari konflik
  logout: () => void;
  isLoading: boolean;
}

// Menambahkan definisi tipe untuk import.meta.env agar sesuai dengan Vite
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
