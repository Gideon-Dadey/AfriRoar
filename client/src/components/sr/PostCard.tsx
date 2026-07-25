import { Link } from 'react-router-dom';
import type { SrPost } from '@/data/srContent';

type Props = {
  post: SrPost;
  compact?: boolean;
};

export default function PostCard({ post, compact = false }: Props) {
  return (
    <article className="sr-post-card">
      <Link to={`/post/${post.slug}`} className="block">
        <img src={post.image} alt={post.title} loading="lazy" />
        <div className={compact ? 'p-3' : 'p-4'}>
          <h3 className={compact ? '!text-[18px] !leading-[24px]' : undefined}>{post.title}</h3>
          <p className="sr-date">{post.date}</p>
        </div>
      </Link>
    </article>
  );
}
