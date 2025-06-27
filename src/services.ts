import { Manuscript, BlogPost, Comment, GuestbookEntry, GroundingChunk } from './types';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { supabase } from './supabaseClient';

// Layanan Manuskrip
export const manuscriptService = {
  fetchManuscripts: async (page: number = 1, limit: number = 20, searchTerm: string = ""): Promise<{ data: Manuscript[], total: number }> => {
    console.log(`Mengambil manuskrip dari Supabase: halaman ${page}, batas ${limit}, cari: "${searchTerm}"`);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('manuscripts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (searchTerm) {
      // Menggunakan `or` untuk mencari di beberapa kolom
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching manuscripts:', error);
      throw error;
    }
    
    return { data: data || [], total: count || 0 };
  },

  getManuscriptById: async (id: string): Promise<Manuscript | null> => {
    console.log(`Mengambil manuskrip berdasarkan ID dari Supabase: ${id}`);
    const { data, error } = await supabase.from('manuscripts').select('*').eq('id', id).single();
    if (error) {
      console.error(`Error fetching manuscript ${id}:`, error);
      throw error;
    }
    return data;
  },

  addManuscript: async (manuscript: Omit<Manuscript, 'id'>): Promise<Manuscript> => {
    console.log("Menambahkan manuskrip ke Supabase:", manuscript);
    // Hapus properti yang tidak ada di tipe Insert
    const { id, ...insertData } = manuscript as Manuscript;
    const { data, error } = await supabase.from('manuscripts').insert(insertData).select().single();
    if (error) {
      console.error('Error adding manuscript:', error);
      throw error;
    }
    return data;
  },

  updateManuscript: async (id: string, updates: Partial<Manuscript>): Promise<Manuscript> => {
    console.log(`Memperbarui manuskrip ${id} di Supabase dengan:`, updates);
    const { data, error } = await supabase.from('manuscripts').update(updates).eq('id', id).select().single();
    if (error) {
      console.error(`Error updating manuscript ${id}:`, error);
      throw error;
    }
    return data;
  },

  deleteManuscript: async (id: string): Promise<boolean> => {
    console.log(`Menghapus manuskrip dari Supabase: ${id}`);
    const { error } = await supabase.from('manuscripts').delete().eq('id', id);
    if (error) {
      console.error(`Error deleting manuscript ${id}:`, error);
      throw error;
    }
    return !error;
  },
};

// Layanan Blog
export const blogService = {
    fetchBlogPosts: async (page: number = 1, limit: number = 10, searchTerm: string = ""): Promise<{ data: BlogPost[], total: number }> => {
        console.log(`Mengambil postingan blog dari Supabase: halaman ${page}, batas ${limit}, cari: "${searchTerm}"`);
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('blog_posts')
            .select(`*, comments(*, blog_posts(*))`, { count: 'exact' }) // Memuat komentar terkait
            .order('created_at', { ascending: false })
            .range(from, to);
            
        if (searchTerm) {
            query = query.or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching blog posts:', error);
            throw error;
        }

        return { data: (data as any) || [], total: count || 0 };
    },

    getBlogPostById: async (id: string): Promise<BlogPost | null> => {
        console.log(`Mengambil postingan blog berdasarkan ID dari Supabase: ${id}`);
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`*, comments(*, blog_posts(*))`)
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching blog post ${id}:`, error);
            throw error;
        }
        return data as any;
    },

    addBlogPost: async (post: Omit<BlogPost, 'id' | 'comments' | 'date'>): Promise<BlogPost> => {
        console.log("Menambahkan postingan blog ke Supabase:", post);
        const { data, error } = await supabase.from('blog_posts').insert(post as any).select().single();
        if (error) {
            console.error('Error adding blog post:', error);
            throw error;
        }
        return data as any;
    },

    updateBlogPost: async (id: string, updates: Partial<BlogPost>): Promise<BlogPost> => {
        console.log(`Memperbarui postingan blog ${id} di Supabase dengan:`, updates);
        const { comments, ...updateData } = updates;
        const { data, error } = await supabase.from('blog_posts').update(updateData).eq('id', id).select().single();
        if (error) {
            console.error(`Error updating blog post ${id}:`, error);
            throw error;
        }
        return data as any;
    },

    deleteBlogPost: async (id: string): Promise<boolean> => {
        console.log(`Menghapus postingan blog dari Supabase: ${id}`);
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) {
            console.error(`Error deleting blog post ${id}:`, error);
            throw error;
        }
        return !error;
    },

    addComment: async (postId: string, comment: Omit<Comment, 'id' | 'postId' | 'date'>): Promise<Comment> => {
        console.log(`Menambahkan komentar ke postingan ${postId} di Supabase:`, comment);
        const commentData = { ...comment, post_id: postId };
        const { data, error } = await supabase.from('comments').insert(commentData as any).select().single();
        if (error) {
            console.error(`Error adding comment to post ${postId}:`, error);
            throw error;
        }
        return data as any;
    }
};

// Layanan Buku Tamu
export const guestbookService = {
    fetchEntries: async (page: number = 1, limit: number = 10): Promise<{ data: GuestbookEntry[], total: number }> => {
        console.log(`Mengambil entri buku tamu dari Supabase: halaman ${page}, batas ${limit}`);
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const { data, error, count } = await supabase
            .from('guestbook_entries')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching guestbook entries:', error);
            throw error;
        }
        return { data: data || [], total: count || 0 };
    },

    addEntry: async (entry: Omit<GuestbookEntry, 'id' | 'date'>): Promise<GuestbookEntry> => {
        console.log("Menambahkan entri buku tamu ke Supabase:", entry);
        const { data, error } = await supabase.from('guestbook_entries').insert(entry as any).select().single();
        if (error) {
            console.error('Error adding guestbook entry:', error);
            throw error;
        }
        return data;
    },

    deleteEntry: async (id: string): Promise<boolean> => {
        console.log(`Menghapus entri buku tamu dari Supabase: ${id}`);
        const { error } = await supabase.from('guestbook_entries').delete().eq('id', id);
        if (error) {
            console.error(`Error deleting guestbook entry ${id}:`, error);
            throw error;
        }
        return !error;
    }
};

// Layanan Gemini API (Tidak berubah, hanya pastikan API_KEY diset di environment)
let geminiAI: GoogleGenAI | null = null;
const apiKey = import.meta.env.VITE_API_KEY;

try {
  if (apiKey) {
    geminiAI = new GoogleGenAI({ apiKey: apiKey });
  } else {
    console.warn("Variabel lingkungan VITE_API_KEY tidak diatur. Fitur Gemini API akan dinonaktifkan.");
  }
} catch (error) {
  console.error("Gagal menginisialisasi GoogleGenAI:", error);
  geminiAI = null;
}

export const geminiService = {
  isAvailable: (): boolean => !!geminiAI,
  
  autofillManuscriptData: async (title: string): Promise<Partial<Manuscript>> => {
    if (!geminiAI) throw new Error("Layanan AI tidak tersedia.");
    
    const prompt = `Berdasarkan judul manuskrip kuno Nusantara "${title}", tolong isi data berikut dalam format JSON. Berikan tebakan terbaikmu jika tidak yakin.
    - author: (Pengarang atau penyalin yang mungkin terkait)
    - description: (Deskripsi singkat 2-3 kalimat tentang kemungkinan isi manuskrip)
    - category: (Contoh: Babad, Sejarah, Sastra, Keagamaan, Primbon)
    - language: (Contoh: Jawa Kuno, Sansekerta, Melayu Kuno)
    - script: (Contoh: Kawi, Pallawa, Arab-Melayu, Hanacaraka)
    - condition: (Contoh: Baik, Rapuh, Ada bagian yang hilang)
    - readability: (Contoh: Jelas, Sulit dibaca, Memudar)
    
    Hanya kembalikan objek JSON, tanpa teks atau markdown tambahan.`;

    try {
      const response = await geminiAI.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        }
      });

      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      return JSON.parse(jsonStr);

    } catch (error) {
      console.error("Gagal mengisi data manuskrip dengan Gemini:", error);
      throw new Error(`Gagal mengisi data dari AI: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  generateManuscriptDescription: async (title: string, keywords?: string): Promise<string> => {
    if (!geminiAI) return "Layanan AI tidak tersedia (API Key belum diatur). Deskripsi default.";
    
    const prompt = `Buatkan deskripsi singkat dan menarik untuk sebuah manuskrip kuno berjudul "${title}". ${keywords ? `Manuskrip ini berkaitan dengan kata kunci: ${keywords}.` : ''} Deskripsi harus dalam bahasa Indonesia, sekitar 50-100 kata, dan menonjolkan keunikan atau nilai penting manuskrip tersebut.`;

    try {
      const response: GenerateContentResponse = await geminiAI.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { temperature: 0.7 }
      });
      return response.text;
    } catch (error) {
      console.error("Gagal membuat deskripsi manuskrip dengan Gemini:", error);
      throw new Error(`Gagal menghasilkan deskripsi dari AI: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  generateBlogPostIdeas: async (topic?: string): Promise<string[]> => {
    if (!geminiAI) return ["Layanan AI tidak tersedia (API Key belum diatur). Tidak ada ide yang dihasilkan."];

    const prompt = `Berikan 5 ide judul artikel blog yang menarik dan relevan untuk Galeri Manuskrip Sampurnan. ${topic ? `Fokus pada topik: "${topic}".` : 'Topik bisa beragam, mulai dari sejarah manuskrip, proses konservasi, hingga cerita menarik di balik koleksi.'} Hasilnya harus berupa daftar judul dalam bahasa Indonesia. Format output sebagai JSON array string. Contoh: ["Ide Judul 1", "Ide Judul 2"]`;
    
    try {
      const response: GenerateContentResponse = await geminiAI.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          temperature: 0.8 
        }
      });
      
      let jsonStr = response.text.trim();
      const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }

      const ideas = JSON.parse(jsonStr);
      if (Array.isArray(ideas) && ideas.every(item => typeof item === 'string')) {
        return ideas;
      }
      throw new Error("Format JSON tidak sesuai harapan.");

    } catch (error) {
      console.error("Gagal membuat ide artikel blog dengan Gemini:", error);
      throw new Error(`Gagal menghasilkan ide blog dari AI: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  summarizeText: async (textToSummarize: string): Promise<string> => {
    if (!geminiAI) return "Layanan AI tidak tersedia (API Key belum diatur). Tidak dapat meringkas.";
    
    const prompt = `Ringkas teks berikut dalam 2-3 kalimat dalam bahasa Indonesia:\n\n"${textToSummarize}"`;
    try {
      const response: GenerateContentResponse = await geminiAI.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { temperature: 0.5 }
      });
      return response.text;
    } catch (error) {
      console.error("Gagal meringkas teks dengan Gemini:", error);
      throw new Error(`Gagal meringkas teks dari AI: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  searchWithGrounding: async (query: string): Promise<{text: string, sources: GroundingChunk[]}> => {
    if (!geminiAI) {
      return {
        text: "Layanan AI tidak tersedia (API Key belum diatur). Pencarian tidak dapat dilakukan.",
        sources: []
      };
    }

    const prompt = `Jawab pertanyaan berikut berdasarkan informasi terbaru dari Google Search: "${query}". Sertakan sumber jika memungkinkan. Jawaban dalam Bahasa Indonesia.`;
    try {
      const response: GenerateContentResponse = await geminiAI.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}], 
        }
      });
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return { text: response.text, sources };
    } catch (error) {
      console.error("Error dengan pencarian terverifikasi Gemini:", error);
       throw new Error(`Gagal melakukan pencarian terverifikasi dengan AI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};