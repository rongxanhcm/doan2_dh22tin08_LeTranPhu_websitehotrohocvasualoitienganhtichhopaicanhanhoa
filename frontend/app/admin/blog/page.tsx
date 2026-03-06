"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { FileText, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  reading_time: number;
  is_published: boolean;
  created_at: string;
}

const CATEGORIES = [
  { value: 'grammar', label: 'Grammar Rules' },
  { value: 'writing', label: 'Writing Tips' },
  { value: 'mistakes', label: 'Common Mistakes' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'guides', label: 'Study Guides' },
];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    category: 'grammar',
    author: 'Wrytt Team',
    reading_time: 5,
    is_published: false,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load posts');
      console.error(error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPost) {
      // Update existing post
      const { error } = await supabase
        .from('blog_posts')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', editingPost.id);

      if (error) {
        toast.error('Failed to update post');
        console.error(error);
      } else {
        toast.success('Post updated successfully');
        setShowModal(false);
        fetchPosts();
        resetForm();
      }
    } else {
      // Create new post
      const { error } = await supabase
        .from('blog_posts')
        .insert([formData]);

      if (error) {
        toast.error('Failed to create post');
        console.error(error);
      } else {
        toast.success('Post created successfully');
        setShowModal(false);
        fetchPosts();
        resetForm();
      }
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author: post.author,
      reading_time: post.reading_time,
      is_published: post.is_published,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete post');
      console.error(error);
    } else {
      toast.success('Post deleted');
      fetchPosts();
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ is_published: !post.is_published })
      .eq('id', post.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(post.is_published ? 'Post unpublished' : 'Post published');
      fetchPosts();
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      category: 'grammar',
      author: 'Wrytt Team',
      reading_time: 5,
      is_published: false,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Blog Posts</h1>
            <p className="text-slate-600">Manage your blog content</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={20} /> New Post
          </button>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No blog posts yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-teal-600 hover:underline font-medium"
            >
              Create your first post
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-bold text-slate-700">Title</th>
                  <th className="text-left p-4 font-bold text-slate-700">Category</th>
                  <th className="text-left p-4 font-bold text-slate-700">Status</th>
                  <th className="text-left p-4 font-bold text-slate-700">Created</th>
                  <th className="text-right p-4 font-bold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{post.title}</div>
                      <div className="text-sm text-slate-500 line-clamp-1">{post.excerpt}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded uppercase">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-4">
                      {post.is_published ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <Eye size={14} /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                          <EyeOff size={14} /> Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => togglePublish(post)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title={post.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {post.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6">
                {editingPost ? 'Edit Post' : 'New Post'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                      placeholder="master-subject-verb-agreement"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Content (long-form text article)</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
                    rows={20}
                    required
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Editorial note: Keep articles text-first and analytical. Use Markdown for headings/lists, and use pipe-table (`|`) or tab-separated rows for tables.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Reading Time (min)</label>
                    <input
                      type="number"
                      value={formData.reading_time}
                      onChange={(e) => setFormData({ ...formData, reading_time: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                    <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Published</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
