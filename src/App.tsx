
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { HomePage, CatalogPage, ManuscriptDetailPage, BlogPage, BlogPostContentPage, GuestbookPage, ProfilePage, ContactPage, DonationPage, AdminPage, LoginPage } from './pages';
import { ThemeToggle, Footer, SearchBar, IconHome, IconBookOpen, IconFeather, IconUsers, IconUserCircle, IconMail, IconGift, IconSettings, IconSun, IconMoon, IconSearch, IconLogout } from './components';
import { NavItem } from './types';
import { ThemeContext, ThemeContextType } from './themeContext';
import { AuthProvider, useAuth } from './authContext';

const AppContent: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const auth = useAuth(); // Dapatkan konteks otentikasi
  const navigate = useNavigate(); // Untuk navigasi saat keluar

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const navItems: NavItem[] = [
    { name: 'Beranda', path: '/', icon: (props) => <IconHome {...props} /> },
    { name: 'Katalog', path: '/katalog', icon: (props) => <IconBookOpen {...props} /> },
    { name: 'Blog', path: '/blog', icon: (props) => <IconFeather {...props} /> },
    { name: 'Buku Tamu', path: '/bukutamu', icon: (props) => <IconUsers {...props} /> },
    { name: 'Profil', path: '/profil', icon: (props) => <IconUserCircle {...props} /> },
    { name: 'Kontak', path: '/kontak', icon: (props) => <IconMail {...props} /> },
    { name: 'Donasi', path: '/donasi', icon: (props) => <IconGift {...props} /> },
    { name: 'Admin', path: '/admin', icon: (props) => <IconSettings {...props} /> },
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    console.log("Mencari:", term);
  };
  
  const NavLinksComponent: React.FC<{isMobile?: boolean}> = ({ isMobile = false}) => (
    navItems.map((item) => (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
          ${isActive 
            ? 'bg-primary-dark text-white dark:bg-primary-light dark:text-background-dark' 
            : 'text-text-DEFAULT dark:text-text-dark hover:bg-secondary-light dark:hover:bg-secondary-dark hover:text-primary-dark dark:hover:text-primary-light'
          }
          ${isMobile ? 'text-lg w-full block' : ''}`
        }
      >
        {item.icon && <item.icon className={`h-5 w-5 mr-2 ${isMobile ? 'h-6 w-6' : ''}`} />}
        {item.name}
      </NavLink>
    ))
  );

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
    setIsMobileMenuOpen(false); // Tutup menu mobile saat keluar
  };

  const themeContextValue: ThemeContextType = { theme, toggleTheme };

  const ProtectedAdminRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const location = useLocation();
    if (auth.isLoading) {
        return ( // Opsional: tampilkan spinner loading global atau halaman kosong saat otentikasi sedang dimuat
            <div className="flex justify-center items-center h-screen">
                {/* Spinner bisa ditambahkan di sini */}
            </div>
        ); 
    }
    if (!auth.isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-DEFAULT dark:text-text-dark">
          <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center">
                  <Link to="/" className="flex-shrink-0">
                    <img className="h-12 w-auto" src="https://picsum.photos/seed/logo/100/100" alt="Logo Galeri Manuskrip Sampurnan" />
                  </Link>
                  <Link to="/" className="ml-3 text-2xl font-bold text-primary-dark dark:text-primary-light hover:text-primary-DEFAULT dark:hover:text-secondary-light transition-colors">
                    Galeri Manuskrip Sampurnan
                  </Link>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <NavLinksComponent />
                  <ThemeToggle />
                  {auth.isAuthenticated && (
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-text-DEFAULT dark:text-text-dark hover:bg-secondary-light dark:hover:bg-secondary-dark hover:text-primary-dark dark:hover:text-primary-light transition-colors duration-150 ease-in-out"
                      aria-label="Keluar"
                    >
                      <IconLogout className="h-5 w-5 mr-1" />
                      Keluar
                    </button>
                  )}
                </div>
                <div className="md:hidden flex items-center">
                  <ThemeToggle />
                  {auth.isAuthenticated && (
                     <button
                      onClick={handleLogout}
                      className="p-2 rounded-md text-gray-400 dark:text-gray-200 hover:text-white dark:hover:text-black hover:bg-gray-700 dark:hover:bg-gray-300 focus:outline-none"
                      aria-label="Keluar"
                    >
                      <IconLogout className="h-6 w-6" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-200 hover:text-white dark:hover:text-black hover:bg-gray-700 dark:hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:focus:ring-black"
                    aria-expanded={isMobileMenuOpen}
                  >
                    <span className="sr-only">Buka menu utama</span>
                    {isMobileMenuOpen ? (
                      <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {/* Menu mobile */}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-20 inset-x-0 p-2 transition transform origin-top-right z-40 bg-white dark:bg-gray-800 shadow-lg">
                <div className="rounded-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                  <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <NavLinksComponent isMobile={true}/>
                    {/* Tombol keluar untuk menu mobile jika terotentikasi */}
                    {auth.isAuthenticated && (
                       <button
                        onClick={handleLogout}
                        className="flex items-center px-3 py-2 rounded-md text-lg w-full font-medium text-text-DEFAULT dark:text-text-dark hover:bg-secondary-light dark:hover:bg-secondary-dark hover:text-primary-dark dark:hover:text-primary-light transition-colors duration-150 ease-in-out"
                      >
                        <IconLogout className="h-6 w-6 mr-2" />
                        Keluar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </nav>

          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="mb-6 mx-auto max-w-lg">
               <SearchBar onSearch={handleSearch} placeholder="Cari manuskrip, blog..."/>
            </div>
            <Routes>
              <Route path="/" element={<HomePage searchTerm={searchTerm} />} />
              <Route path="/katalog" element={<CatalogPage searchTerm={searchTerm} />} />
              <Route path="/katalog/:id" element={<ManuscriptDetailPage />} />
              <Route path="/blog" element={<BlogPage searchTerm={searchTerm} />} />
              <Route path="/blog/:id" element={<BlogPostContentPage />} />
              <Route path="/bukutamu" element={<GuestbookPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/kontak" element={<ContactPage />} />
              <Route path="/donasi" element={<DonationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedAdminRoute>
                    <AdminPage />
                  </ProtectedAdminRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
    </ThemeContext.Provider>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <HashRouter>
      <AppContent />
    </HashRouter>
  </AuthProvider>
);

export default App;