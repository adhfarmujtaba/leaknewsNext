import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import InfiniteScroll from 'react-infinite-scroll-component';
import '../app/styles/home.css';

const CategoryPage = () => {
  const router = useRouter();
  const { category_slug } = router.query;

  const [categoryPosts, setCategoryPosts] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [pageNum, setPageNum] = useState(1);
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    // Reset state when category_slug changes
    setCategoryPosts([]);
    setIsEmpty(true);
    setLoading(true);
    setHasMore(true);
    setPageNum(1);
    setUserScrolled(false); // Reset userScrolled when category changes
  }, [category_slug]);

  useEffect(() => {
    if (category_slug) {
      const fetchCategoryPosts = async () => {
        try {
          const response = await axios.get(`https://blog.tourismofkashmir.com/apis?category_slug=${category_slug}&page=${pageNum}`);
          const newPosts = response.data;
          if (newPosts.length === 0) {
            setHasMore(false);
            if (!userScrolled) setIsEmpty(true); // Set isEmpty only if user hasn't scrolled
          }
          setCategoryPosts(prevPosts => [...prevPosts, ...newPosts]);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching category posts:', error);
        }
      };

      fetchCategoryPosts();
    }
  }, [category_slug, pageNum, userScrolled]);

  const loadMorePosts = () => {
    setPageNum(prevPageNum => prevPageNum + 1);
    setUserScrolled(true); // Set userScrolled to true when loading more posts
  };

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

  return (
    <div className="category-list">
      <Head>
        <title>{category_slug ? `${category_slug} ` : 'Loading...'} </title>
        <meta name="description" content={`Browse posts in the ${category_slug} category.`} />
      </Head>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          {categoryPosts.length === 0 && isEmpty ? (
            <p className="empty-message">No posts found in this category. Check out other categories.</p>
          ) : (
            <InfiniteScroll
              dataLength={categoryPosts.length}
              next={loadMorePosts}
              hasMore={hasMore}
              loader={<div className="loader"><img src="https://blog.tourismofkashmir.com/kOnzy.gif" alt="Loading..." /></div>}
              endMessage={isEmpty && userScrolled ? <p className="end-message">There are no more posts in this category.</p> : null}
            >
              {categoryPosts.map((post) => (
                <div key={post.id} className="card" onContextMenu={(e) => e.preventDefault()}>
                  <Link href={`/${post.category_slug}/${post.slug}/`} legacyBehavior>
                    <div className="news-item-link">
                      <div className="image-container" style={{ position: "relative" }}>
                        <img src={post.image} alt={post.title} className="news-item-image" style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                        <div style={{ position: "absolute", bottom: "10px", right: "10px", backgroundColor: "rgba(0, 0, 0, 0.5)", color: "white", padding: "5px", borderRadius: "5px", fontSize: "0.8rem" }}>
                          {post.read_time} min read
                        </div>
                      </div>
                      <div className='card-content'>
                        <h2>{post.title}</h2>
                        <p>{post.meta_description}</p>
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
                    <span className='views'>. {formatViews(post.views)} views</span>
                    <span className='date'>{formatDate(post.created_at)}</span>
                  </div>
                </div>
              ))}
            </InfiniteScroll>
          )}
        </>
      )}
    </div>
  );
};

export default CategoryPage;
