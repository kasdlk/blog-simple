'use client';

import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import Link from 'next/link';
import { extractPlainText } from '@/lib/markdown';
import Markdown from '@/components/Markdown';
import ThemeToggle from '@/components/ThemeToggle';
import { getTranslations, type Language } from '@/lib/i18n';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import AdminSearchBox from '@/components/AdminSearchBox';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';

// 动态导入MDEditor以避免SSR问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface Settings {
  blogTitle: string;
  blogSubtitle: string;
  authorName: string;
  authorBio: string;
  authorEmail: string;
  authorAvatar: string;
  language: string;
  enableComments: string;
  enableLikes: string;
  enableViews: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Remove antialiased class from body for admin page
  // 使用 subpixel-antialiased 来保持与前台相似的字体渲染效果
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Force remove antialiased immediately
      const body = document.body;
      const applyAdminSmoothing = () => {
        body.classList.remove('antialiased');
        // 使用 subpixel-antialiased 而不是 auto，这样字体渲染会更接近前台
        body.style.setProperty('-webkit-font-smoothing', 'subpixel-antialiased', 'important');
        body.style.setProperty('-moz-osx-font-smoothing', 'auto', 'important');
      };

      applyAdminSmoothing();

      // 监听 class 变化即可，避免 100ms setInterval 常驻轮询造成 CPU/卡顿
      const observer = new MutationObserver(() => {
        if (body.classList.contains('antialiased')) {
          applyAdminSmoothing();
        }
      });
      observer.observe(body, { attributes: true, attributeFilter: ['class'] });
      
      return () => {
        observer.disconnect();
        // Restore on unmount if needed
        body.classList.add('antialiased');
        body.style.removeProperty('-webkit-font-smoothing');
        body.style.removeProperty('-moz-osx-font-smoothing');
      };
    }
  }, []);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [formData, setFormData] = useState({ title: '', content: '', category: '' });
  const [settings, setSettings] = useState<Settings>({
    blogTitle: '',
    blogSubtitle: '',
    authorName: '',
    authorBio: '',
    authorEmail: '',
    authorAvatar: '',
    language: 'en',
    enableComments: 'true',
    enableLikes: 'true',
    enableViews: 'true',
  });
  const [modal, setModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; postId: string | null }>({
    isOpen: false,
    postId: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const lang = (settings.language || 'en') as Language;
  const t = getTranslations(lang);

  // 检测暗色模式
  useEffect(() => {
    const checkDarkMode = () => {
      const html = document.documentElement;
      setIsDarkMode(html.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);
  
  const showAlert = (message: string) => {
    setModal({ isOpen: true, message });
  };

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        setFilteredPosts(data);
      } else {
        console.error('Failed to fetch posts:', res.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      showAlert('Failed to load posts. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchPosts();
      fetchSettings();
      fetchAdminCredentials();
    }
  }, [authenticated, fetchPosts]);

  // 进入“新建/编辑”表单时，确保滚动到页面顶部。
  // 用 useLayoutEffect + 非 smooth，避免出现“从底部滑到顶部”的视觉滚动过程。
  useLayoutEffect(() => {
    if (!showForm) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [showForm]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setAuthenticated(data.authenticated || false);
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthenticated(false);
    }
  };

  const fetchAdminCredentials = async () => {
    try {
      const res = await fetch('/api/admin/credentials');
      if (res.ok) {
        const data = await res.json();
        setNewUsername(data.username || '');
      }
    } catch (error) {
      console.error('Failed to fetch admin credentials:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthenticated(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!newUsername.trim()) {
      showAlert('Username is required');
      return;
    }

    // If password fields are shown, password is required
    if (showPasswordFields) {
      if (!newPassword.trim()) {
        showAlert('Password is required');
        return;
      }

      if (newPassword !== confirmPassword) {
        showAlert('Passwords do not match');
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: newUsername, 
          password: showPasswordFields ? newPassword : undefined 
        }),
      });

      if (res.ok) {
        if (showPasswordFields) {
          showAlert('Credentials updated successfully. Please login again.');
          setTimeout(() => {
            handleLogout();
          }, 2000);
        } else {
          showAlert('Username updated successfully.');
          setNewPassword('');
          setConfirmPassword('');
          fetchAdminCredentials();
        }
      } else {
        const error = await res.json();
        showAlert(error.error || 'Failed to update credentials');
      }
    } catch (error) {
      console.error('Failed to update credentials:', error);
      showAlert('Failed to update credentials');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPosts(posts);
      return;
    }
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setFilteredPosts(data.posts || []);
      } else {
        setFilteredPosts([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setFilteredPosts([]);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
    }
  }, [posts, searchQuery]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        console.error('Failed to fetch settings:', res.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      showAlert('Please fill in all fields');
      return;
    }

    try {
      const url = editingPost 
        ? `/api/posts/${editingPost.id}`
        : '/api/posts';
      
      const method = editingPost ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ title: '', content: '', category: '' });
        setEditingPost(null);
        setShowForm(false);
        fetchPosts();
      } else {
        showAlert('Failed to save post');
      }
    } catch (error) {
      console.error('Failed to save post:', error);
      showAlert('Failed to save post');
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        showAlert('Settings saved successfully');
        setShowSettings(false);
      } else {
        showAlert('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showAlert('Failed to save settings');
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({ title: post.title, content: post.content, category: post.category || '' });
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, postId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.postId) return;

    try {
      const res = await fetch(`/api/posts/${deleteModal.postId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPosts();
        setDeleteModal({ isOpen: false, postId: null });
      } else {
        const error = await res.json();
        showAlert(error.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      showAlert('Failed to delete post');
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', content: '', category: '' });
    setEditingPost(null);
    setShowForm(false);
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-gray-700 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
      return null;
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black admin-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <header className="mb-10">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl sm:text-4xl lg:text-5xl font-light text-black dark:text-white hover:opacity-70 transition-opacity tracking-tight inline-block">
              {settings.blogTitle || 'Blog'}
            </Link>
            {settings.blogSubtitle && (
              <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 mt-2 font-light">
                {settings.blogSubtitle}
              </p>
            )}
          </div>
          <div className="flex justify-between items-center gap-3 pb-5 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {settings.authorAvatar && (
                <Image
                  src={settings.authorAvatar}
                  alt={settings.authorName || 'Author'}
                  width={48}
                  height={48}
                  className="rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-800 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                {settings.authorName && (
                  <p className="text-base font-light text-black dark:text-white mb-1">
                    {settings.authorName}
                  </p>
                )}
                {settings.authorBio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-light line-clamp-1">
                    {settings.authorBio}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {!showSettings && (
                <div className="flex-1 min-w-0 max-w-xs">
                  <AdminSearchBox language={lang} onSearch={handleSearch} />
                </div>
              )}
              {!showSettings && <ThemeToggle language={lang} />}
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowForm(false);
                }}
                className="px-4 py-2 text-sm font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 rounded-md active:scale-95"
              >
                {showSettings ? t.exitSettings : t.settings}
              </button>
            </div>
          </div>
        </header>

        {showSettings ? (
          <form id="settings-form" onSubmit={handleSettingsSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                {t.blogTitle}
              </label>
              <input
                type="text"
                value={settings.blogTitle}
                onChange={(e) => setSettings({ ...settings, blogTitle: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md font-light"
                placeholder={t.blogTitle}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                {t.blogSubtitle}
              </label>
              <input
                type="text"
                value={settings.blogSubtitle}
                onChange={(e) => setSettings({ ...settings, blogSubtitle: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md font-light"
                placeholder={t.blogSubtitle}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                {t.authorName}
              </label>
              <input
                type="text"
                value={settings.authorName}
                onChange={(e) => setSettings({ ...settings, authorName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md font-light"
                placeholder={t.authorName}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                {t.authorBio}
              </label>
              <textarea
                value={settings.authorBio}
                onChange={(e) => setSettings({ ...settings, authorBio: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 min-h-[100px] resize-y rounded-md font-light"
                placeholder={t.authorBio}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                {t.email}
              </label>
              <input
                type="email"
                value={settings.authorEmail}
                onChange={(e) => setSettings({ ...settings, authorEmail: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md font-light"
                placeholder={t.email}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                {t.avatar}
              </label>
              <input
                type="url"
                value={settings.authorAvatar}
                onChange={(e) => setSettings({ ...settings, authorAvatar: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md font-light"
                placeholder={t.avatar}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                Language / 语言
              </label>
              <select
                value={settings.language || 'en'}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md font-light"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-800 dark:text-gray-200">
                  {t.enableComments}
                </label>
                <input
                  type="checkbox"
                  checked={settings.enableComments === 'true'}
                  onChange={(e) => setSettings({ ...settings, enableComments: e.target.checked ? 'true' : 'false' })}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-800 dark:text-gray-200">
                  {t.enableLikes}
                </label>
                <input
                  type="checkbox"
                  checked={settings.enableLikes === 'true'}
                  onChange={(e) => setSettings({ ...settings, enableLikes: e.target.checked ? 'true' : 'false' })}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-800 dark:text-gray-200">
                  {t.enableViews}
                </label>
                <input
                  type="checkbox"
                  checked={settings.enableViews === 'true'}
                  onChange={(e) => setSettings({ ...settings, enableViews: e.target.checked ? 'true' : 'false' })}
                  className="w-4 h-4"
                />
              </div>
            </div>
            <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-light text-black dark:text-white">
                  {t.updateCredentials}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="px-4 py-2.5 text-sm font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 rounded-md active:scale-95"
                >
                  {showPasswordFields ? t.cancel || 'Cancel' : t.updateCredentials}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                    {t.adminUsername}
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md font-light"
                    minLength={3}
                    maxLength={50}
                  />
                </div>
                {showPasswordFields && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                        {t.adminPassword}
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md font-light"
                        minLength={6}
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                        Confirm Password / 确认密码
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md font-light"
                        minLength={6}
                        maxLength={100}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUpdateCredentials}
                      className="px-6 py-2.5 text-sm font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 rounded-md active:scale-95"
                    >
                      {t.updateCredentials}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="submit"
                form="settings-form"
                className="px-6 py-2.5 text-sm font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 rounded-md active:scale-95"
              >
                {t.saveSettings}
              </button>
            </div>
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 mt-6">
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 text-sm font-light border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 transition-all duration-300 rounded-md active:scale-95"
              >
                {t.logout}
              </button>
            </div>
          </form>
        ) : !showForm ? (
          <div>
            <button
              onClick={() => setShowForm(true)}
              className="mb-8 px-6 py-2.5 text-sm font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 rounded-md active:scale-95"
            >
              + {t.newPost}
            </button>

            {loading ? (
              <div className="text-gray-700 dark:text-gray-300">Loading...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-gray-700 dark:text-gray-300">
                <p>{searchQuery.trim() ? t.noResults : t.noPosts}</p>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group border-t border-gray-200 dark:border-gray-800 pt-6 sm:pt-8 pb-6 sm:pb-8 first:border-t-0 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl sm:text-2xl font-light text-black dark:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-80">
                        {post.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-4 line-clamp-2 leading-relaxed">
                      {extractPlainText(post.content, 100)}
                    </p>
                    {post.category && (
                      <div className="mb-3">
                        <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                          {post.category}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-4 text-xs items-center">
                      <time className="text-gray-700 dark:text-gray-300 font-light">
                        {new Date(post.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                      </time>
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300 font-light"
                      >
                        {t.edit}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(post.id)}
                        className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 font-light"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2.5 text-sm font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 rounded-md active:scale-95"
              >
                {showPreview ? t.hidePreview : t.showPreview}
              </button>
            </div>
            <form onSubmit={handleSubmit} className={showPreview ? 'grid grid-cols-2 gap-6' : ''}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                    {t.title}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md font-light"
                    placeholder={t.title}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                    {t.category}
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md font-light"
                    placeholder={t.category}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">
                    {t.content} <span className="text-xs text-gray-700 dark:text-gray-300">(Markdown supported)</span>
                  </label>
                  <div data-color-mode={isDarkMode ? 'dark' : 'light'} className="mt-2">
                    <MDEditor
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value || '' })}
                      preview="edit"
                      hideToolbar={false}
                      visibleDragbar={false}
                      height={500}
                      data-color-mode={isDarkMode ? 'dark' : 'light'}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 rounded-md active:scale-95"
                  >
                    {editingPost ? t.update : t.create}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
              {showPreview && (
                <div className="border-l border-gray-200 dark:border-gray-800 pl-6">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wide">
                    {t.preview}
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <h1 className="text-3xl font-light text-black dark:text-white mb-4">
                      {formData.title || t.untitled}
                    </h1>
                    <div className="text-gray-700 dark:text-gray-300">
                      <Markdown content={formData.content || `*${t.startTyping}*`} />
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
      
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, message: '' })}
        title=""
      >
        <p className="text-sm">{modal.message}</p>
      </Modal>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, postId: null })}
        onConfirm={handleDeleteConfirm}
        title={t.confirmDelete}
        message={t.deleteConfirmMessage}
        confirmText={t.confirm}
        cancelText={t.cancel}
      />
    </div>
  );
}
