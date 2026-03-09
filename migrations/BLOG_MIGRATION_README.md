# Blog System Migration Guide

## Latest `blog_posts` Schema (Current)

Use this SQL as the latest reference for the `blog_posts` table:

```sql
-- Create blog_posts table for content marketing
CREATE TABLE IF NOT EXISTS blog_posts (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	slug TEXT UNIQUE NOT NULL,
	title TEXT NOT NULL,
	excerpt TEXT NOT NULL,
	content TEXT NOT NULL,
	category TEXT NOT NULL CHECK (category IN ('grammar', 'writing', 'mistakes', 'vocabulary', 'guides')),
	author TEXT DEFAULT 'Wrytt Team',
	reading_time INT DEFAULT 5,
	is_published BOOLEAN DEFAULT false,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published);
```

## How to Apply the Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `migrations/create_blog_posts.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Verify the table was created in **Table Editor**

### Option 2: Via Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

## Verify Migration Success

After running the migration, check:

1. **Table exists**: `blog_posts` should appear in your database
2. **Indexes created**: `idx_blog_posts_category`, `idx_blog_posts_slug`, `idx_blog_posts_published`
3. **Posts status**: if using sample seed data, posts are typically inserted with `is_published = true`
4. **Categories working**: Visit `/blog` to see the blog listing page

## Sample Blog Posts (Optional Seed Data)

The current `migrations/create_blog_posts.sql` includes seed inserts for 5 SEO-optimized posts:

1. **Grammar**: Master Subject-Verb Agreement: A Complete Guide
2. **Mistakes**: 10 Common Grammar Mistakes ESL Learners Make  
3. **Writing**: How to Improve Your Academic Writing Style
4. **Grammar**: The Complete Guide to English Articles (a, an, the)
5. **Vocabulary**: How to Expand Your Academic Vocabulary Naturally

## Blog System Routes

After migration, these routes will be available:

- `/blog` - Main blog listing page
- `/blog/grammar` - Grammar category page
- `/blog/writing` - Writing tips category
- `/blog/mistakes` - Common mistakes category
- `/blog/vocabulary` - Vocabulary guides
- `/blog/guides` - Study guides (empty initially)
- `/blog/{category}/{slug}` - Individual blog posts

## Admin Management

Access the blog admin panel at:

```
/admin/blog
```

Features:
- Create new blog posts
- Edit existing posts
- Delete posts
- Toggle publish/draft status
- Full markdown support for content

## SEO Features

The blog system includes:

- ✅ Dynamic sitemap generation
- ✅ Structured data (Schema.org BlogPosting)
- ✅ Open Graph metadata
- ✅ Twitter Card metadata
- ✅ Optimized meta descriptions
- ✅ Category-based organization
- ✅ Related posts suggestions
- ✅ Reading time estimation

## Content Strategy

Recommended categories:

- **Grammar Rules**: Deep dives into specific grammar concepts
- **Writing Tips**: Essay structure, style, academic writing
- **Common Mistakes**: Error patterns ESL learners make
- **Vocabulary**: Word choice, collocations, academic vocabulary
- **Study Guides**: Learning strategies, practice methods

## Next Steps

1. Run the migration
2. Visit `/blog` to verify published posts are listed
3. Customize sample posts in admin panel
4. Start writing new posts for SEO
5. Internal link from blog posts to `/analyze` and `/rules`

## Troubleshooting

**Error: relation "blog_posts" already exists**
- The table is already created. You can skip the migration.

**Error: permission denied**
- Make sure you're running the SQL as a database owner
- Check your Supabase role permissions

**Sample posts not showing**
- Check if `is_published` is `true` for the posts
- Verify posts exist: `SELECT * FROM blog_posts;`
- If needed, run only schema first, then manually insert posts from `migrations/create_blog_posts.sql`

## Future Enhancements

Consider adding:
- [ ] Comment system (via third-party like Disqus)
- [ ] Search functionality
- [ ] Tag system (in addition to categories)
- [ ] Author profiles (if multiple authors)
- [ ] View count tracking
- [ ] Social share buttons
