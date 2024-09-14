import { useEffect, useState } from 'react';
import Head from 'next/head'; // Import the Head component
import Link from 'next/link';
import { fetchPosts, fetchSiteInfo } from '../app/services/api';
import '../app/styles/home.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Utility Functions
const truncateText = (text, wordLimit) => {
  const words = text.split(' ');
  return words.length > wordLimit ? `${words.slice(0, wordLimit).join(' ')}...` : text;
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const SkeletonLoader = () => (
  <div className='skeleton-container'>
    {Array.from({ length: 10 }).map((_, index) => (
      <div key={index} className='card skeleton-card'>
        <div className='skeleton-image'></div>
        <div className='card-content'>
          <div className='skeleton-title'></div>
          <div className='skeleton-content'></div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className='skeleton-avatar'></div>
            <div className='skeleton-username'></div>
            <div className='skeleton-date'></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [siteInfo, setSiteInfo] = useState(null); // Added state for site info
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPostsAndSiteInfo = async () => {
      try {
        const [postsData, siteInfoData] = await Promise.all([fetchPosts(), fetchSiteInfo()]);
        setPosts(postsData);
        setSiteInfo(siteInfoData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    getPostsAndSiteInfo();
  }, []);

  const formatViews = (views) => {
    if (views >= 10000000) {
      return Math.floor(views / 10000000) + 'cr';
    } else if (views >= 1000000) {
      return Math.floor(views / 1000000) + 'M';
    } else if (views >= 100000) {
      return Math.floor(views / 100000) + 'L';
    } else if (views >= 1000) {
      return Math.floor(views / 1000) + 'k';
    } else {
      return views.toString();
    }
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      {siteInfo && (
        <Head>
          <title>{siteInfo.site_title}</title>
          <meta name="description" content={siteInfo.meta_description} />
          <meta name="keywords" content={siteInfo.meta_keywords} />
          <meta property="og:title" content={siteInfo.site_title} />
          <meta property="og:description" content={siteInfo.meta_description} />
          <meta property="og:image" content={siteInfo.logo_url} />
          <link rel="icon" href={siteInfo.logo_url} type="image/x-icon" />
        </Head>
      )}
      <div className="news-list">
        {posts.map(post => (
          <div key={post.id} className="card" onContextMenu={(e) => e.preventDefault()}>
            <Link href={`/${post.category_slug}/${post.slug}/`} legacyBehavior>
              <div className="news-item-link">
                <div className="image-container" style={{ position: 'relative' }}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="news-item-image"
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      padding: '5px',
                      borderRadius: '5px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {post.read_time} min read
                  </div>
                </div>
                <div className="card-content">
                  <h2>{truncateText(post.title, 10)}</h2>
                  <p>{truncateText(post.meta_description, 20)}</p>
                </div>
              </div>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <img
                  src={`https://blog.tourismofkashmir.com/${post.avatar}`}
                  alt="Avatar"
                  className="avatar"
                  style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '5px' }}
                />
                <span className="username">{post.username}</span>
              </div>
              <span className="views">. {formatViews(post.views)} views</span>
              <span className="date">{formatDate(post.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
