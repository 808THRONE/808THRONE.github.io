import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const posts = await getCollection('blog');
  return rss({
    title: 'Iheb Brahmi (808THRONE) | THEREDREBEL Blog',
    description: 'Technical articles on Edge AI, Systems, Cybersecurity, and Linux infrastructure.',
    site: context.site || 'https://808throne.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id.replace(/\.md$/, '')}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
