import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Manuscript, BlogPost, GuestbookEntry, Comment as CommentType, AdminSection, GroundingChunk } from './types';
import { manuscriptService, blogService, guestbookService, geminiService } from './services';
import { 
    Card, Button, Pagination, LoadingSpinner, InputField, TextAreaField, SelectField, Modal, Alert, PageTitle, 
    IconExternalLink, IconUpload, IconEdit, IconTrash, IconPlusCircle, IconGift, IconChevronLeft,
    IconTag, IconTranslate, IconPencilLine, IconCalendarDays, IconUserCircle, IconDocumentDuplicate,
    IconArchiveBox, IconHashtag, IconDroplet, IconArrowsPointingOut, IconShieldCheck, IconEye,
    IconBookOpen, IconFeather, IconSparkles
} from './components';
import { useAuth } from './authContext';

// Helper untuk memformat tanggal
const formatDate = (isoString: string): string => {
  if (!isoString) return 'Tanggal tidak valid';
  return new Date(isoString).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// --- Halaman Login ---
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await auth.login(email, password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Email atau password salah. Silakan coba lagi.');
    }
  };
  
  if (auth.isLoading) {
    return <LoadingSpinner />;
  }
  
  // Jika sudah terotentikasi, alihkan.
  if (auth.isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-250px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <PageTitle title="Login Admin" subtitle="Masukkan kredensial Anda untuk mengakses panel admin."/>
        </div>
        <Card className="p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            <InputField 
              label="Email" 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@contoh.com"
            />
            <InputField 
              label="Password" 
              id="password" 
              name="password" 
              type="password" 
              autoComplete="current-password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
            <div>
              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={auth.isLoading}>
                {auth.isLoading ? <LoadingSpinner size="sm" /> : 'Masuk'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};


// --- Halaman Beranda ---
export const HomePage: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
  const [latestManuscripts, setLatestManuscripts] = useState<Manuscript[]>([]);
  const [latestBlogPosts, setLatestBlogPosts] = useState<BlogPost[]>([]);
  const [latestGuestbookEntries, setLatestGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [msData, blogData, guestbookData] = await Promise.all([
          manuscriptService.fetchManuscripts(1, 3, searchTerm),
          blogService.fetchBlogPosts(1, 3, searchTerm),
          guestbookService.fetchEntries(1, 3)
        ]);
        setLatestManuscripts(msData.data);
        setLatestBlogPosts(blogData.data);
        setLatestGuestbookEntries(guestbookData.data);
      } catch (error) {
        console.error("Gagal mengambil data beranda:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-12">
      {/* Bagian Hero */}
      <section className="text-center py-12 bg-gradient-to-r from-secondary-light to-accent-light dark:from-secondary-dark dark:to-accent-dark rounded-xl shadow-lg">
        <PageTitle 
          title="Selamat Datang di Galeri Manuskrip Sampurnan"
          subtitle="Menjelajahi Khazanah Naskah Kuno Nusantara"
        />
        <p className="mt-4 text-lg text-text-DEFAULT dark:text-text-dark max-w-2xl mx-auto">
          Temukan koleksi manuskrip berharga, baca artikel menarik, dan tinggalkan jejak Anda di buku tamu kami.
        </p>
        <div className="mt-8">
          <Button size="lg" variant="primary" onClick={() => navigate('/katalog')}>
            Jelajahi Katalog
          </Button>
        </div>
      </section>

      {/* Manuskrip Terbaru */}
      <section>
        <h2 className="text-3xl font-semibold mb-6 text-primary-dark dark:text-primary-light text-center">Manuskrip Terbaru</h2>
        {latestManuscripts.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {latestManuscripts.map(ms => <ManuscriptCard key={ms.id} manuscript={ms} />)}
          </div>
        ) : <p className="text-center text-gray-500 dark:text-gray-400">Tidak ada manuskrip terbaru untuk ditampilkan.</p>}
        <div className="text-center mt-6">
          <Link to="/katalog" className="text-primary-DEFAULT hover:underline dark:text-primary-light">Lihat Semua Manuskrip &rarr;</Link>
        </div>
      </section>

      {/* Artikel Blog Terkini */}
      <section>
        <h2 className="text-3xl font-semibold mb-6 text-primary-dark dark:text-primary-light text-center">Artikel Blog Terkini</h2>
         {latestBlogPosts.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {latestBlogPosts.map(post => <BlogPostCard key={post.id} post={post} />)}
          </div>
        ) : <p className="text-center text-gray-500 dark:text-gray-400">Tidak ada artikel blog terbaru.</p>}
        <div className="text-center mt-6">
          <Link to="/blog" className="text-primary-DEFAULT hover:underline dark:text-primary-light">Baca Semua Artikel &rarr;</Link>
        </div>
      </section>

      {/* Entri Buku Tamu Terbaru */}
      <section>
        <h2 className="text-3xl font-semibold mb-6 text-primary-dark dark:text-primary-light text-center">Pesan dari Pengunjung</h2>
        {latestGuestbookEntries.length > 0 ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            {latestGuestbookEntries.map(entry => (
              <Card key={entry.id} className="p-4 bg-background-light dark:bg-gray-700">
                <p className="italic">"{entry.message}"</p>
                <p className="text-sm text-right mt-2 font-medium text-accent-DEFAULT dark:text-accent-light">- {entry.name}</p>
              </Card>
            ))}
          </div>
        ) : <p className="text-center text-gray-500 dark:text-gray-400">Belum ada pesan di buku tamu.</p>}
        <div className="text-center mt-6">
          <Link to="/bukutamu" className="text-primary-DEFAULT hover:underline dark:text-primary-light">Lihat Buku Tamu &rarr;</Link>
        </div>
      </section>

       {/* Profil Singkat */}
      <section className="py-10 bg-secondary-light dark:bg-secondary-dark rounded-lg shadow">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-4 text-primary-dark dark:text-primary-light">Tentang Galeri Manuskrip Sampurnan</h2>
          <p className="text-lg text-text-DEFAULT dark:text-text-dark max-w-3xl mx-auto mb-6">
            Galeri Manuskrip Sampurnan adalah sebuah inisiatif untuk melestarikan, mendigitalisasi, dan mempromosikan kekayaan naskah kuno Nusantara. Kami berkomitmen untuk menyediakan akses terbuka bagi peneliti, akademisi, dan masyarakat umum.
          </p>
          <Button variant="secondary" onClick={() => navigate('/profil')}>
            Pelajari Lebih Lanjut
          </Button>
        </div>
      </section>
    </div>
  );
};


// --- Halaman Katalog ---
const ManuscriptCard: React.FC<{ manuscript: Manuscript }> = ({ manuscript }) => (
  <Card className="hover:scale-105 transform transition-transform duration-300">
    <Link to={`/katalog/${manuscript.id}`}>
      <img src={manuscript.coverImageUrl} alt={manuscript.title} className="w-full h-64 object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2 text-primary-dark dark:text-primary-light truncate" title={manuscript.title}>{manuscript.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pengarang: {manuscript.author}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Kategori: {manuscript.category}</p>
        <span className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${
          manuscript.status === 'Tersedia' ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200' :
          manuscript.status === 'Dipinjam' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200' :
          'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200'
        }`}>{manuscript.status}</span>
      </div>
    </Link>
  </Card>
);

export const CatalogPage: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 12; 

  useEffect(() => {
    const loadManuscripts = async () => {
      setLoading(true);
      try {
        const { data, total } = await manuscriptService.fetchManuscripts(currentPage, itemsPerPage, searchTerm);
        setManuscripts(data);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } catch (error) {
        console.error("Gagal mengambil manuskrip:", error);
      } finally {
        setLoading(false);
      }
    };
    loadManuscripts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]); 

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <PageTitle title="Katalog Manuskrip" subtitle="Jelajahi koleksi naskah kuno kami yang berharga."/>
      {loading ? <LoadingSpinner /> : (
        manuscripts.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {manuscripts.map(ms => <ManuscriptCard key={ms.id} manuscript={ms} />)}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        ) : (
          <p className="text-center text-xl text-gray-500 dark:text-gray-400 py-10">
            {searchTerm ? `Tidak ada manuskrip yang cocok dengan pencarian "${searchTerm}".` : "Tidak ada manuskrip untuk ditampilkan."}
          </p>
        )
      )}
    </div>
  );
};

// --- Halaman Detail Manuskrip ---
export const ManuscriptDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [loading, setLoading] = useState(true);
  const routerNavigate = useNavigate();

  useEffect(() => {
    const fetchManuscript = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await manuscriptService.getManuscriptById(id);
        if (data) {
          setManuscript(data);
        } else {
          console.error("Manuskrip tidak ditemukan");
        }
      } catch (error) {
        console.error("Gagal mengambil detail manuskrip:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchManuscript();
  }, [id]);

  const getStatusColorClass = (status: Manuscript['status']) => {
    switch (status) {
      case 'Tersedia': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200';
      case 'Dipinjam': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200';
      case 'Rusak': return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const quickInfoItem = (IconComponent: React.FC<React.SVGProps<SVGSVGElement>> | undefined, label: string, value?: string | number) => {
    if (!value && typeof value !== 'number') return null; // Izinkan 0 untuk ditampilkan
    return (
      <div className="flex items-start space-x-2">
        {IconComponent && <IconComponent className="h-5 w-5 text-primary-DEFAULT dark:text-primary-light mt-0.5 flex-shrink-0" aria-hidden="true" />}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-sm font-medium text-text-DEFAULT dark:text-text-dark">{String(value)}</p>
        </div>
      </div>
    );
  };

  interface DetailItemConfig {
    label: string;
    value?: string | number;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  }

  const renderDetailSection = (title: string, items: DetailItemConfig[]) => {
    const visibleItems = items.filter(item => item.value || typeof item.value === 'number');
    if (visibleItems.length === 0) return null;

    return (
      <div className="pt-4">
        <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-light mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">{title}</h3>
        <dl className="space-y-3">
          {visibleItems.map((item, index) => (
            <div key={index} className="flex items-start">
              {item.icon && <item.icon className="h-5 w-5 text-accent-DEFAULT dark:text-accent-light mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />}
               <div className="flex-grow">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</dt>
                <dd className="text-base text-text-DEFAULT dark:text-text-dark">{String(item.value)}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (!manuscript) return (
    <div className="text-center py-10">
        <PageTitle title="Manuskrip Tidak Ditemukan" subtitle="Manuskrip yang Anda cari tidak ada dalam koleksi kami." />
        <Button onClick={() => routerNavigate('/katalog')} variant="primary">Kembali ke Katalog</Button>
    </div>
  );
  
  const statusColorClass = getStatusColorClass(manuscript.status);

  return (
    <div className="container mx-auto p-2 md:p-4">
      <Button onClick={() => routerNavigate(-1)} variant="ghost" leftIcon={<IconChevronLeft className="w-5 h-5"/>} className="mb-4 text-primary-DEFAULT dark:text-primary-light hover:bg-primary-light/10 dark:hover:bg-primary-dark/20">
        Kembali ke Katalog
      </Button>

      <Card className="overflow-hidden shadow-2xl">
        <div className="md:flex">
          {/* Kolom Kiri: Gambar */}
          <div className="md:w-2/5 md:flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <img 
                className="h-auto w-full object-contain md:max-h-[calc(100vh-200px)] max-h-[400px] p-4" 
                src={manuscript.coverImageUrl} 
                alt={`Sampul ${manuscript.title}`} 
            />
          </div>

          {/* Kolom Kanan: Detail */}
          <div className="p-6 md:p-8 md:w-3/5 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light mb-1 leading-tight">{manuscript.title}</h1>
              <p className="text-lg text-accent-DEFAULT dark:text-accent-light mb-3">
                Oleh: <span className="font-medium">{manuscript.author}</span>
              </p>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColorClass}`}>
                {manuscript.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5 p-4 bg-secondary-light dark:bg-gray-700/50 rounded-lg shadow-inner">
              {quickInfoItem(IconTag, 'Kategori', manuscript.category)}
              {quickInfoItem(IconTranslate, 'Bahasa', manuscript.language)}
              {quickInfoItem(IconPencilLine, 'Aksara', manuscript.script)}
              {quickInfoItem(IconCalendarDays, 'Tahun Salin', manuscript.copyYear)}
              {quickInfoItem(IconDocumentDuplicate, 'Jml. Halaman', manuscript.pageCount)}
              {quickInfoItem(IconUserCircle, 'Penyalin', manuscript.copyist)}
            </div>
            
            <div className="space-y-4">
              {renderDetailSection("Identitas & Kode", [
                { label: 'Kode Inventaris', value: manuscript.inventoryCode, icon: IconArchiveBox },
                { label: 'Kode Digital', value: manuscript.digitalCode, icon: IconHashtag },
              ])}
              
              {renderDetailSection("Atribut Fisik", [
                { label: 'Tinta', value: manuscript.ink, icon: IconDroplet },
                { label: 'Ukuran', value: manuscript.size, icon: IconArrowsPointingOut },
                { label: 'Kondisi Naskah', value: manuscript.condition, icon: IconShieldCheck },
                { label: 'Keterbacaan', value: manuscript.readability, icon: IconEye },
              ])}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-gray-200 dark:border-gray-700 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-3 flex items-center">
              <IconBookOpen className="w-6 h-6 mr-2 text-accent-DEFAULT dark:text-accent-light" />
              Deskripsi
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-justify">{manuscript.description}</p>
          </div>

          {manuscript.colophon && (
            <div>
              <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-3 flex items-center">
                <IconFeather className="w-6 h-6 mr-2 text-accent-DEFAULT dark:text-accent-light" />
                Kolofon
              </h2>
              <p className="text-gray-700 dark:text-gray-300 italic whitespace-pre-line leading-relaxed text-justify">{manuscript.colophon}</p>
            </div>
          )}

          {manuscript.googleDriveFolderUrl && (
            <div className="bg-secondary-light dark:bg-gray-700/50 p-6 rounded-lg shadow-inner">
              <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-4 flex items-center">
                 <IconExternalLink className="w-6 h-6 mr-2 text-accent-DEFAULT dark:text-accent-light" />
                Pratinjau Digital
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Lihat pratinjau konten digital manuskrip ini. Klik gambar untuk melihat lebih besar atau tombol untuk membuka di Google Drive.
              </p>
              <a href={manuscript.googleDriveFolderUrl} target="_blank" rel="noopener noreferrer" className="block mb-4 group focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT rounded-lg">
                <img 
                  src={manuscript.googleDriveFolderUrl} // Menggunakan URL yang sama untuk gambar pratinjau
                  alt="Pratinjau Folder Google Drive" 
                  className="w-full h-auto max-h-96 object-contain border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-md group-hover:border-primary-DEFAULT dark:group-hover:border-primary-light transition-all duration-300 ease-in-out group-hover:shadow-xl"
                />
              </a>
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.open(manuscript.googleDriveFolderUrl, '_blank')}
                className="w-full sm:w-auto"
                rightIcon={<IconExternalLink className="w-5 h-5"/>}
              >
                Buka di Google Drive
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};


// --- Halaman Blog ---
const BlogPostCard: React.FC<{ post: BlogPost }> = ({ post }) => (
  <Card className="flex flex-col h-full">
    <Link to={`/blog/${post.id}`} className="block h-full flex flex-col">
      {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2 text-primary-dark dark:text-primary-light flex-grow" title={post.title}>{post.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Oleh: {post.author}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">{formatDate(post.date)}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">{post.summary}</p>
        <div className="mt-auto">
            <span className="text-primary-DEFAULT hover:underline dark:text-primary-light">Baca Selengkapnya &rarr;</span>
        </div>
      </div>
    </Link>
  </Card>
);

export const BlogPage: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 9;

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const { data, total } = await blogService.fetchBlogPosts(currentPage, itemsPerPage, searchTerm);
        setPosts(data);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } catch (error) {
        console.error("Gagal mengambil postingan blog:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <PageTitle title="Blog Manuskrip" subtitle="Artikel, wawasan, dan cerita dari dunia naskah kuno." />
      {loading ? <LoadingSpinner /> : (
        posts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => <BlogPostCard key={post.id} post={post} />)}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        ) : (
           <p className="text-center text-xl text-gray-500 dark:text-gray-400 py-10">
            {searchTerm ? `Tidak ada artikel blog yang cocok dengan pencarian "${searchTerm}".` : "Tidak ada artikel blog untuk ditampilkan."}
          </p>
        )
      )}
    </div>
  );
};

// --- Halaman Konten Blog (Postingan Individual) ---
const CommentSection: React.FC<{ comments: CommentType[], postId: string, onCommentAdded: (newComment: CommentType) => void }> = ({ comments, postId, onCommentAdded }) => {
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !author.trim()) {
      setError("Nama dan komentar tidak boleh kosong.");
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const addedComment = await blogService.addComment(postId, { author, text: newComment });
      if (addedComment) {
        onCommentAdded(addedComment);
        setNewComment('');
        setAuthor('');
      } else {
        setError("Gagal menambahkan komentar.");
      }
    } catch (err) {
      console.error("Gagal mengirimkan komentar:", err);
      setError("Terjadi kesalahan saat mengirim komentar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-semibold mb-6 text-primary-dark dark:text-primary-light">Komentar ({comments.length})</h3>
      {comments.length > 0 && (
        <div className="space-y-6 mb-8">
          {comments.map(comment => (
            <Card key={comment.id} className="p-5 bg-background-light dark:bg-gray-700">
              <p className="font-semibold text-text-DEFAULT dark:text-text-dark">{comment.author}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{formatDate(comment.date)}</p>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{comment.text}</p>
            </Card>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmitComment} className="space-y-4 p-6 bg-secondary-light dark:bg-secondary-dark rounded-lg shadow">
        <h4 className="text-xl font-medium text-primary-dark dark:text-primary-light">Tinggalkan Komentar</h4>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <InputField 
          label="Nama Anda" 
          id="commentAuthor" 
          value={author} 
          onChange={e => setAuthor(e.target.value)} 
          required 
        />
        <TextAreaField 
          label="Komentar Anda" 
          id="commentText" 
          value={newComment} 
          onChange={e => setNewComment(e.target.value)} 
          required 
        />
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? <LoadingSpinner size="sm"/> : 'Kirim Komentar'}
        </Button>
      </form>
    </div>
  );
};


export const BlogPostContentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const routerNavigate = useNavigate();

  const fetchPostContent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await blogService.getBlogPostById(id);
      if (data) {
        setPost(data);
      } else {
        console.error("Postingan blog tidak ditemukan");
      }
    } catch (error) {
      console.error("Gagal mengambil postingan blog:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPostContent();
  }, [fetchPostContent]);
  
  const handleCommentAdded = (newComment: CommentType) => {
    setPost(prevPost => prevPost ? ({ ...prevPost, comments: [...prevPost.comments, newComment] }) : null);
  };

  if (loading) return <LoadingSpinner />;
  if (!post) return <PageTitle title="Artikel Tidak Ditemukan" subtitle="Artikel yang Anda cari tidak ada." />;

  // Markdown sederhana ke HTML (untuk \n\n menjadi <p> dan ### menjadi <h3>) - sangat disederhanakan
  const renderContent = (content: string) => {
    if (!content) return '';
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('### ')) {
          return `<h3 key=${index} class="text-xl font-semibold my-4 text-primary-dark dark:text-primary-light">${paragraph.substring(4)}</h3>`;
        }
        return `<p key=${index} class="my-4 leading-relaxed">${paragraph}</p>`;
      })
      .join('');
  };

  return (
    <article className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-10">
      <header className="mb-8 text-center border-b border-gray-200 dark:border-gray-700 pb-8">
        <h1 className="text-4xl font-extrabold text-primary-dark dark:text-primary-light tracking-tight leading-tight mb-3">{post.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Oleh <span className="font-medium text-accent-DEFAULT dark:text-accent-light">{post.author}</span> | Dipublikasikan pada {formatDate(post.date)}
        </p>
      </header>
      {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8 shadow-md" />}
      
      <div className="prose dark:prose-invert max-w-none text-text-DEFAULT dark:text-text-dark" dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />
      
      <CommentSection comments={post.comments || []} postId={post.id} onCommentAdded={handleCommentAdded} />

      <div className="mt-12 text-center">
        <Button onClick={() => routerNavigate('/blog')} variant="secondary">Kembali ke Blog</Button>
      </div>
    </article>
  );
};


// --- Halaman Buku Tamu ---
export const GuestbookPage: React.FC = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 5;

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchEntries = useCallback(async (pageToFetch: number) => {
    setLoading(true);
    try {
      const { data, total } = await guestbookService.fetchEntries(pageToFetch, itemsPerPage);
      setEntries(data);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error) {
      console.error("Gagal mengambil entri buku tamu:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchEntries(currentPage);
  }, [currentPage, fetchEntries]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setFormError("Nama dan pesan tidak boleh kosong.");
      return;
    }
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      await guestbookService.addEntry({ name, message });
      setFormSuccess("Pesan Anda telah berhasil dikirim!");
      setName('');
      setMessage('');
      // Jika di halaman pertama, segarkan data untuk melihat entri baru
      if (currentPage === 1) {
          fetchEntries(1); 
      } else {
          // Jika tidak, kembali ke halaman pertama
          setCurrentPage(1);
      }
    } catch (err) {
      console.error("Gagal mengirimkan entri buku tamu:", err);
      setFormError("Terjadi kesalahan saat mengirim pesan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageTitle title="Buku Tamu" subtitle="Tinggalkan jejak dan kesan Anda tentang Galeri Manuskrip Sampurnan." />
      
      <Card className="p-6 md:p-8 mb-12 max-w-2xl mx-auto shadow-2xl">
        <h3 className="text-2xl font-semibold mb-6 text-primary-dark dark:text-primary-light">Tulis Pesan Anda</h3>
        {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}
        {formSuccess && <Alert type="success" message={formSuccess} onClose={() => setFormSuccess('')} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Nama Anda" id="guestName" value={name} onChange={e => setName(e.target.value)} required />
          <TextAreaField label="Pesan Anda" id="guestMessage" value={message} onChange={e => setMessage(e.target.value)} required />
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? <LoadingSpinner size="sm"/> : 'Kirim Pesan'}
          </Button>
        </form>
      </Card>

      <h3 className="text-2xl font-semibold mb-6 text-primary-dark dark:text-primary-light text-center">Pesan dari Pengunjung Lain</h3>
      {loading ? <LoadingSpinner /> : (
        entries.length > 0 ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {entries.map(entry => (
              <Card key={entry.id} className="p-5 bg-background-light dark:bg-gray-700">
                <p className="text-lg text-gray-700 dark:text-gray-300 italic">"{entry.message}"</p>
                <div className="mt-3 text-right">
                  <p className="font-semibold text-accent-DEFAULT dark:text-accent-light">- {entry.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(entry.date)}</p>
                </div>
              </Card>
            ))}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">Belum ada pesan di buku tamu.</p>
        )
      )}
    </div>
  );
};

// --- Halaman Profil ---
export const ProfilePage: React.FC = () => (
  <div>
    <PageTitle title="Profil Galeri Manuskrip Sampurnan" />
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 md:p-12 space-y-8">
      <section>
        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-4">Visi Kami</h2>
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Menjadi pusat rujukan digital terkemuka untuk studi dan apresiasi manuskrip Nusantara, melestarikan warisan budaya tak ternilai untuk generasi kini dan mendatang.
        </p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-4">Misi Kami</h2>
        <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Mengumpulkan, merawat, dan mendigitalisasi manuskrip-manuskrip kuno dari berbagai daerah di Nusantara.</li>
          <li>Menyediakan akses terbuka dan mudah terhadap koleksi digital bagi peneliti, akademisi, dan masyarakat umum.</li>
          <li>Melakukan penelitian dan publikasi untuk menggali nilai-nilai historis, sastra, dan budaya yang terkandung dalam manuskrip.</li>
          <li>Menyelenggarakan kegiatan edukasi dan apresiasi untuk meningkatkan kesadaran masyarakat akan pentingnya warisan manuskrip.</li>
          <li>Berkolaborasi dengan institusi dan komunitas terkait untuk memperkuat jaringan pelestarian manuskrip.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-4">Sejarah Singkat</h2>
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Galeri Manuskrip Sampurnan didirikan pada tahun [Tahun Pendirian - misal 2020] oleh sekelompok pegiat budaya dan akademisi yang memiliki kepedulian mendalam terhadap nasib naskah-naskah kuno Indonesia. Berawal dari koleksi pribadi dan upaya digitalisasi mandiri, galeri ini terus berkembang berkat dukungan berbagai pihak dan semangat untuk menyelamatkan kearifan masa lalu. Nama "Sampurnan" diambil dari filosofi kesempurnaan ilmu pengetahuan dan kearifan yang terkandung dalam manuskrip.
        </p>
      </section>
      <section className="text-center">
        <img src="https://picsum.photos/seed/profile/800/400" alt="Tim Galeri Manuskrip Sampurnan" className="rounded-lg shadow-md mx-auto mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Tim kami berdedikasi untuk melestarikan warisan budaya.</p>
      </section>
    </div>
  </div>
);

// --- Halaman Kontak ---
export const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitStatus(null);
        // Simulasi panggilan API
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Formulir dikirim (mock):", formData);
        setSubmitStatus({ type: 'success', message: 'Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.' });
        setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
        setSubmitting(false);
    };


  return (
    <div>
      <PageTitle title="Hubungi Kami" subtitle="Kami senang mendengar dari Anda. Sampaikan pertanyaan, saran, atau kolaborasi." />
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 md:p-12">
        <section>
          <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-6">Informasi Kontak</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p><strong>Alamat:</strong> Jl. Kebudayaan No. 123, Kota Sampurnan, Nusantara</p>
            <p><strong>Telepon:</strong> (021) 123-4567</p>
            <p><strong>Email:</strong> info@galerimanuskrip.org</p>
            <p><strong>Jam Operasional:</strong> Senin - Jumat, 09:00 - 17:00 WIB</p>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-primary-dark dark:text-primary-light mb-3">Lokasi Kami</h3>
            {/* Placeholder untuk peta. Bisa berupa iframe atau gambar statis */}
            <img src="https://picsum.photos/seed/map/600/300" alt="Peta Lokasi Galeri" className="w-full h-64 object-cover rounded-lg shadow-md" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ini adalah gambar peta pengganti.</p>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-6">Kirim Pesan</h2>
           {submitStatus && <Alert type={submitStatus.type} message={submitStatus.message} onClose={() => setSubmitStatus(null)} />}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField label="Nama Lengkap" id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
            <InputField label="Alamat Email" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <InputField label="Subjek Pesan" id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} required />
            <TextAreaField label="Isi Pesan Anda" id="message" name="message" value={formData.message} onChange={handleChange} rows={5} required />
            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
              {submitting ? <LoadingSpinner size="sm"/> : 'Kirim Pesan'}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
};

// --- Halaman Donasi ---
export const DonationPage: React.FC = () => (
  <div>
    <PageTitle title="Dukung Kami" subtitle="Bantuan Anda sangat berarti untuk pelestarian manuskrip Nusantara." />
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 md:p-12 space-y-8">
      <section className="text-center">
        <IconGift className="w-24 h-24 text-primary-DEFAULT dark:text-primary-light mx-auto mb-4" />
        <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300">
          Galeri Manuskrip Sampurnan adalah organisasi nirlaba yang didedikasikan untuk menyelamatkan, merawat, dan membagikan kekayaan naskah kuno bangsa. Setiap kontribusi Anda, besar maupun kecil, akan sangat membantu upaya kami.
        </p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-4">Mengapa Donasi Anda Penting?</h2>
        <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Membantu proses akuisisi dan konservasi manuskrip langka.</li>
          <li>Mendukung digitalisasi naskah agar dapat diakses lebih luas.</li>
          <li>Membiayai penelitian dan publikasi terkait isi manuskrip.</li>
          <li>Memfasilitasi program edukasi dan workshop untuk masyarakat.</li>
          <li>Menjaga operasional galeri dan infrastruktur digital kami.</li>
        </ul>
      </section>
      <section className="bg-secondary-light dark:bg-secondary-dark p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-4">Cara Berdonasi</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
          Anda dapat memberikan donasi melalui transfer bank ke rekening berikut:
        </p>
        <div className="bg-background-light dark:bg-gray-700 p-4 rounded shadow-inner">
          <p className="font-mono text-lg"><strong>Bank Nusantara Sejahtera (BNS)</strong></p>
          <p className="font-mono text-lg">Nomor Rekening: <strong className="text-primary-DEFAULT dark:text-primary-light">123-456-7890</strong></p>
          <p className="font-mono text-lg">Atas Nama: <strong className="text-primary-DEFAULT dark:text-primary-light">Yayasan Galeri Manuskrip Sampurnan</strong></p>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Setelah melakukan transfer, mohon konfirmasi donasi Anda melalui email ke <strong className="text-primary-DEFAULT dark:text-primary-light">donasi@galerimanuskrip.org</strong> agar kami dapat mencatat dan mengirimkan ucapan terima kasih.
        </p>
      </section>
      <p className="text-center text-lg text-gray-700 dark:text-gray-300">
        Terima kasih atas kemurahan hati dan dukungan Anda dalam melestarikan warisan budaya kita!
      </p>
    </div>
  </div>
);


// --- Halaman Admin ---
const AdminManuscripts: React.FC = () => {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingManuscript, setEditingManuscript] = useState<Partial<Manuscript> | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;
  
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [generatingAiDesc, setGeneratingAiDesc] = useState(false);

  const fetchAdminManuscripts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, total } = await manuscriptService.fetchManuscripts(currentPage, itemsPerPage, searchTerm);
      setManuscripts(data);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (err) {
      setError("Gagal memuat data manuskrip.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchAdminManuscripts();
  }, [fetchAdminManuscripts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (editingManuscript) {
      const { name, value } = e.target;
      setEditingManuscript({ ...editingManuscript, [name]: name === 'pageCount' || name === 'copyYear' ? parseInt(value) || 0 : value });
    }
  };

  const handleAutofill = async () => {
    if (!editingManuscript || !('title' in editingManuscript) || !editingManuscript.title) {
        setError("Silakan masukkan judul manuskrip terlebih dahulu.");
        return;
    }
    if (!geminiService.isAvailable()) {
        setError("Layanan AI tidak tersedia (API Key belum diatur).");
        return;
    }

    setIsAutofilling(true);
    setError('');
    try {
        const aiData = await geminiService.autofillManuscriptData(editingManuscript.title!);
        setEditingManuscript(prev => ({ ...prev, ...aiData }));
        setSuccess("Data berhasil diisi oleh AI. Silakan periksa kembali.");
    } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengisi data dari AI.");
    } finally {
        setIsAutofilling(false);
    }
  };


  const handleGenerateAiDescription = async () => {
    if (!editingManuscript || !('title' in editingManuscript) || !editingManuscript.title) {
      setError("Judul manuskrip diperlukan untuk menghasilkan deskripsi AI.");
      return;
    }
    if (!geminiService.isAvailable()) {
        setError("Layanan AI tidak tersedia (API Key belum diatur).");
        return;
    }
    setGeneratingAiDesc(true);
    setError('');
    try {
      const description = await geminiService.generateManuscriptDescription(editingManuscript.title, ('category' in editingManuscript ? editingManuscript.category : undefined));
      setEditingManuscript({...editingManuscript, description: description });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghasilkan deskripsi AI.");
    } finally {
      setGeneratingAiDesc(false);
    }
  };

  const handleSave = async () => {
    if (!editingManuscript) return;
    setError(''); setSuccess('');
    try {
      if (editingManuscript.id) {
        await manuscriptService.updateManuscript(editingManuscript.id, editingManuscript as Manuscript);
        setSuccess("Manuskrip berhasil diperbarui.");
      } else {
        await manuscriptService.addManuscript(editingManuscript as Omit<Manuscript, 'id'>);
        setSuccess("Manuskrip berhasil ditambahkan.");
      }
      setShowModal(false);
      setEditingManuscript(null);
      fetchAdminManuscripts(); // Segarkan
    } catch (err) {
      setError("Gagal menyimpan manuskrip.");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus manuskrip ini?")) {
      setError(''); setSuccess('');
      try {
        await manuscriptService.deleteManuscript(id);
        setSuccess("Manuskrip berhasil dihapus.");
        fetchAdminManuscripts(); // Segarkan
      } catch (err) {
        setError("Gagal menghapus manuskrip.");
      }
    }
  };

  const handleXlsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`File "${file.name}" telah dipilih. Fitur unggah XLS sedang dalam pengembangan.\nData akan diproses menggunakan pustaka seperti 'xlsx'.`);
    }
  };


  const openAddModal = () => {
    setEditingManuscript({ title: '', author: '', inventoryCode: '', digitalCode: '', status: 'Tersedia', pageCount: 0, category: '', language: '', script: '', size: '', description: '', condition: '', readability: '', coverImageUrl: 'https://picsum.photos/seed/newMs/400/600' });
    setShowModal(true);
  };

  const openEditModal = (ms: Manuscript) => {
    setEditingManuscript({ ...ms });
    setShowModal(true);
  };
  
  const manuscriptStatusOptions = [
    { value: 'Tersedia', label: 'Tersedia' },
    { value: 'Dipinjam', label: 'Dipinjam' },
    { value: 'Rusak', label: 'Rusak' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Kelola Manuskrip</h3>
        <div className="flex items-center space-x-2">
           <label htmlFor="xlsUpload" className="cursor-pointer">
              <Button variant="secondary" leftIcon={<IconUpload className="w-4 h-4"/>} onClick={() => document.getElementById('xlsUpload')?.click()}>
                Unggah XLS
              </Button>
           </label>
           <input type="file" id="xlsUpload" accept=".xls,.xlsx" onChange={handleXlsUpload} className="hidden" />
          <Button onClick={openAddModal} variant="primary" leftIcon={<IconPlusCircle className="w-5 h-5"/>}>
            Tambah Manuskrip
          </Button>
        </div>
      </div>
       <input 
          type="text" 
          placeholder="Cari manuskrip..." 
          value={searchTerm} 
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1);}}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 dark:bg-gray-700"
        />
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {loading && !showModal ? <LoadingSpinner /> : (
        manuscripts.length === 0 && !loading ? <p>Tidak ada manuskrip.</p> :
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Judul</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pengarang</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {manuscripts.map(ms => (
                <tr key={ms.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{ms.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ms.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ms.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(ms)} leftIcon={<IconEdit className="w-4 h-4"/>}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(ms.id)} leftIcon={<IconTrash className="w-4 h-4"/>}>Hapus</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      {showModal && editingManuscript && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingManuscript.id ? "Edit Manuskrip" : "Tambah Manuskrip Baru"}>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            <div className='relative'>
              <InputField label="Judul" name="title" value={editingManuscript.title || ''} onChange={handleInputChange} />
              <Button 
                  onClick={handleAutofill}
                  variant='ghost'
                  size='sm'
                  className='absolute top-6 right-0'
                  disabled={isAutofilling || !geminiService.isAvailable()}
                  title="Isi otomatis dengan AI"
              >
                  {isAutofilling ? <LoadingSpinner size="sm"/> : <IconSparkles className="w-5 h-5 text-yellow-500"/>}
              </Button>
            </div>
            <InputField label="Pengarang" name="author" value={editingManuscript.author || ''} onChange={handleInputChange} />
            <div className="flex space-x-2">
              <InputField className="flex-1" label="Kode Inventaris" name="inventoryCode" value={editingManuscript.inventoryCode || ''} onChange={handleInputChange} />
              <InputField className="flex-1" label="Kode Digital" name="digitalCode" value={editingManuscript.digitalCode || ''} onChange={handleInputChange} />
            </div>
            <SelectField label="Status" name="status" value={editingManuscript.status} options={manuscriptStatusOptions} onChange={handleInputChange} />
            <InputField label="Penyalin (Opsional)" name="copyist" value={editingManuscript.copyist || ''} onChange={handleInputChange} />
            <div className="flex space-x-2">
              <InputField className="flex-1" label="Tahun Penyalinan (Opsional)" name="copyYear" type="number" value={editingManuscript.copyYear || ''} onChange={handleInputChange} />
              <InputField className="flex-1" label="Jumlah Halaman" name="pageCount" type="number" value={editingManuscript.pageCount || 0} onChange={handleInputChange} />
            </div>
            <InputField label="Tinta (Opsional)" name="ink" value={editingManuscript.ink || ''} onChange={handleInputChange} />
            <InputField label="Kategori" name="category" value={editingManuscript.category || ''} onChange={handleInputChange} />
            <div className="flex space-x-2">
              <InputField className="flex-1" label="Bahasa" name="language" value={editingManuscript.language || ''} onChange={handleInputChange} />
              <InputField className="flex-1" label="Aksara" name="script" value={editingManuscript.script || ''} onChange={handleInputChange} />
            </div>
            <InputField label="Ukuran (mis. 20cm x 30cm)" name="size" value={editingManuscript.size || ''} onChange={handleInputChange} />
            
            <TextAreaField label="Deskripsi" name="description" value={editingManuscript.description || ''} onChange={handleInputChange} rows={3} />
            <Button onClick={handleGenerateAiDescription} variant="secondary" size="sm" disabled={generatingAiDesc || !geminiService.isAvailable()} className="my-1">
              {generatingAiDesc ? <LoadingSpinner size="sm"/> : 'Buat Deskripsi dengan AI'}
            </Button>
            {!geminiService.isAvailable() && <p className="text-xs text-yellow-600 dark:text-yellow-400">Layanan AI tidak tersedia (API Key belum diatur).</p>}
            
            <InputField label="Kondisi Naskah" name="condition" value={editingManuscript.condition || ''} onChange={handleInputChange} />
            <InputField label="Keterbacaan" name="readability" value={editingManuscript.readability || ''} onChange={handleInputChange} />
            <TextAreaField label="Kolofon (Opsional)" name="colophon" value={editingManuscript.colophon || ''} onChange={handleInputChange} rows={2} />
            <InputField label="URL Gambar Sampul" name="coverImageUrl" value={editingManuscript.coverImageUrl || ''} onChange={handleInputChange} />
            <InputField label="URL Folder Google Drive (Opsional)" name="googleDriveFolderUrl" value={editingManuscript.googleDriveFolderUrl || ''} onChange={handleInputChange} />

            <div className="flex justify-end space-x-2 pt-3">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Batal</Button>
              <Button variant="primary" onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  const [aiBlogIdeas, setAiBlogIdeas] = useState<string[]>([]);
  const [generatingAiIdeas, setGeneratingAiIdeas] = useState(false);

  const fetchAdminPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, total } = await blogService.fetchBlogPosts(currentPage, itemsPerPage, searchTerm);
      setPosts(data);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (err) {
      setError("Gagal memuat data blog.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchAdminPosts();
  }, [fetchAdminPosts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingPost) {
      setEditingPost({ ...editingPost, [e.target.name]: e.target.value });
    }
  };

  const handleGenerateAiBlogIdeas = async () => {
    if (!geminiService.isAvailable()) {
        setError("Layanan AI tidak tersedia (API Key belum diatur).");
        return;
    }
    setGeneratingAiIdeas(true); setError('');
    try {
      const ideas = await geminiService.generateBlogPostIdeas(editingPost?.title); 
      setAiBlogIdeas(ideas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghasilkan ide blog dari AI.");
      setAiBlogIdeas([]);
    } finally {
      setGeneratingAiIdeas(false);
    }
  };

  const handleSave = async () => {
    if (!editingPost || !editingPost.title || !editingPost.author || !editingPost.summary || !editingPost.content) {
      setError("Semua kolom wajib diisi kecuali URL gambar.");
      return;
    }
    setError(''); setSuccess('');
    try {
      if (editingPost.id) {
        await blogService.updateBlogPost(editingPost.id, editingPost as BlogPost);
        setSuccess("Artikel blog berhasil diperbarui.");
      } else {
        await blogService.addBlogPost(editingPost as Omit<BlogPost, 'id' | 'comments' | 'date'>);
        setSuccess("Artikel blog berhasil ditambahkan.");
      }
      setShowModal(false);
      setEditingPost(null);
      fetchAdminPosts();
    } catch (err) {
      setError("Gagal menyimpan artikel blog.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus artikel blog ini?")) {
      setError(''); setSuccess('');
      try {
        await blogService.deleteBlogPost(id);
        setSuccess("Artikel blog berhasil dihapus.");
        fetchAdminPosts();
      } catch (err) {
        setError("Gagal menghapus artikel blog.");
      }
    }
  };
  
  const openAddModal = () => {
    setEditingPost({ title: '', author: '', summary: '', content: '', imageUrl: `https://picsum.photos/seed/newBlog/800/400` });
    setAiBlogIdeas([]);
    setShowModal(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost({ ...post });
    setAiBlogIdeas([]);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Kelola Blog</h3>
        <Button onClick={openAddModal} variant="primary" leftIcon={<IconPlusCircle className="w-5 h-5"/>}>Tambah Artikel</Button>
      </div>
      <input 
          type="text" 
          placeholder="Cari artikel blog..." 
          value={searchTerm} 
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1);}}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 dark:bg-gray-700"
        />
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {loading && !showModal ? <LoadingSpinner /> : (
        posts.length === 0 && !loading ? <p>Tidak ada artikel blog.</p> :
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Judul</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Penulis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map(post => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{post.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{post.author}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(post.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => openEditModal(post)} leftIcon={<IconEdit className="w-4 h-4"/>}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(post.id)} leftIcon={<IconTrash className="w-4 h-4"/>}>Hapus</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      {showModal && editingPost && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPost.id ? "Edit Artikel Blog" : "Tambah Artikel Baru"}>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            <InputField label="Judul Artikel" name="title" value={editingPost.title || ''} onChange={handleInputChange} />
            <Button onClick={handleGenerateAiBlogIdeas} variant="secondary" size="sm" disabled={generatingAiIdeas || !geminiService.isAvailable()} className="my-1">
              {generatingAiIdeas ? <LoadingSpinner size="sm"/> : 'Dapatkan Ide Judul dengan AI'}
            </Button>
            {!geminiService.isAvailable() && <p className="text-xs text-yellow-600 dark:text-yellow-400">Layanan AI tidak tersedia (API Key belum diatur).</p>}
            {aiBlogIdeas.length > 0 && (
              <div className="my-2 p-2 border rounded border-gray-300 dark:border-gray-600">
                <p className="text-sm font-medium mb-1">Saran Judul dari AI:</p>
                <ul className="list-disc list-inside text-xs">
                  {aiBlogIdeas.map((idea, idx) => (
                    <li key={idx} className="cursor-pointer hover:text-primary-DEFAULT" onClick={() => setEditingPost({...editingPost, title: idea})}>{idea}</li>
                  ))}
                </ul>
              </div>
            )}
            <InputField label="Penulis" name="author" value={editingPost.author || ''} onChange={handleInputChange} />
            <TextAreaField label="Ringkasan" name="summary" value={editingPost.summary || ''} onChange={handleInputChange} rows={3} />
            <TextAreaField label="Konten Lengkap (mendukung Markdown sederhana)" name="content" value={editingPost.content || ''} onChange={handleInputChange} rows={6} />
            <InputField label="URL Gambar (Opsional)" name="imageUrl" value={editingPost.imageUrl || ''} onChange={handleInputChange} />
            <div className="flex justify-end space-x-2 pt-3">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Batal</Button>
              <Button variant="primary" onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


const AdminGuestbook: React.FC = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  const fetchAdminEntries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, total } = await guestbookService.fetchEntries(currentPage, itemsPerPage);
      setEntries(data);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (err) {
      setError("Gagal memuat data buku tamu.");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchAdminEntries();
  }, [fetchAdminEntries]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus entri buku tamu ini?")) {
      setError(''); setSuccess('');
      try {
        await guestbookService.deleteEntry(id);
        setSuccess("Entri buku tamu berhasil dihapus.");
        fetchAdminEntries();
      } catch (err) {
        setError("Gagal menghapus entri buku tamu.");
      }
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Kelola Buku Tamu</h3>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {loading ? <LoadingSpinner /> : (
        entries.length === 0 ? <p>Tidak ada entri buku tamu.</p> :
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pesan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{entry.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-sm truncate" title={entry.message}>{entry.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(entry.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button size="sm" variant="danger" onClick={() => handleDelete(entry.id)} leftIcon={<IconTrash className="w-4 h-4"/>}>Hapus</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export const AdminPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>(AdminSection.Manuscripts);
  
  const renderSection = () => {
    switch (activeSection) {
      case AdminSection.Manuscripts:
        return <AdminManuscripts />;
      case AdminSection.Blog:
        return <AdminBlog />;
      case AdminSection.Guestbook:
        return <AdminGuestbook />;
      default:
        return null;
    }
  };

  return (
    <div>
      <PageTitle title="Halaman Admin" subtitle="Kelola konten Galeri Manuskrip Sampurnan." />
      <div className="flex border-b border-gray-300 dark:border-gray-600 mb-6">
        {Object.values(AdminSection).map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`py-3 px-6 text-sm font-medium focus:outline-none transition-colors
              ${activeSection === section 
                ? 'border-b-2 border-primary-DEFAULT text-primary-DEFAULT dark:border-primary-light dark:text-primary-light' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            {section}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        {renderSection()}
      </div>
    </div>
  );
};