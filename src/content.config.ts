import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Iheb Brahmi'),
    image: z.string().optional(),
    video: z.string().optional(),
    tags: z.array(z.string()),
    category: z.string(),
    readingTime: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    video: z.string().optional(),
    github: z.string().optional(),
    live: z.string().optional(),
    featured: z.boolean().default(false),
    metrics: z.array(z.string()).optional(),
    order: z.number().default(99),
  }),
});

export const collections = {
  blog,
  projects,
};
