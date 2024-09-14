import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchPostBySlug } from '../../app/services/api';
import Link from 'next/link';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCalendarAlt, faClock, faShare, faHeart, faBookmark, faClipboard } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart, faBookmark as farBookmark, faCommentDots as farCommentDots } from '@fortawesome/free-regular-svg-icons';
import { faFacebookF, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import Head from 'next/head';
import '../../app/styles/posts.css';
import CommentsModal from './CommentsModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PostPage = () => {
  const [post, setPost] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [topViewedPosts, setTopViewedPosts] = useState([]);

  const router = useRouter();
  const { post_slug } = router.query;

  useEffect(() => {
    const fetchData = async () => {
      if (!post_slug) return;

      try {
        const postData = await fetchPostBySlug(post_slug);
        setPost(postData);

        if (postData) {
          const [likesResponse, bookmarkResponse, relatedPostsResponse, topViewedPostsResponse, commentCountResponse] = await Promise.all([
            axios.get(`https://blog.tourismofkashmir.com/api_likes?action=getLikeCount&post_id=${postData.id}`),
            axios.get(`https://blog.tourismofkashmir.com/api_bookmark.php?action=check&user_id=${userId}&post_id=${postData.id}`),
            axios.get(`https://blog.tourismofkashmir.com/related_api.php?related_posts=${postData.category_name}&exclude_post_id=${postData.id}`),
            axios.get(`https://blog.tourismofkashmir.com/related_api.php?topviewpost=true&exclude_post_id=${postData.id}`),
            axios.get(`https://blog.tourismofkashmir.com/api_comment_count.php?post_id=${postData.id}`)
          ]);

          setLikeCount(likesResponse.data.like_count);
          setIsBookmarked(bookmarkResponse.data.includes("Post is bookmarked"));
          setRelatedPosts(relatedPostsResponse.data);
          setTopViewedPosts(topViewedPostsResponse.data);
          setCommentCount(commentCountResponse.data.comment_count);

          // Update views
          await axios.get(`https://blog.tourismofkashmir.com/apis.php?update_views=true&post_id=${postData.id}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [post_slug]);

  const toggleLike = async () => {
    try {
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) {
        toast.error("Please log in to like the post");
        return;
      }

      const foundUser = JSON.parse(loggedInUser);
      const userId = foundUser.id;

      await axios.post(`https://blog.tourismofkashmir.com/api_likes?toggle-like`, { post_id: post.id, user_id: userId });

      setIsLikedByUser(!isLikedByUser);
      setLikeCount(prevCount => isLikedByUser ? prevCount - 1 : prevCount + 1);
      document.getElementById('like-btn').classList.add('heartBeatAnimation');

      setTimeout(() => {
        document.getElementById('like-btn').classList.remove('heartBeatAnimation');
      }, 500);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleBookmarkClick = async () => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      toast.error("Please log in to manage bookmarks");
      return;
    }

    const foundUser = JSON.parse(loggedInUser);
    const userId = foundUser.id;
    const action = isBookmarked ? 'delete' : 'add';

    try {
      await axios.get(`https://blog.tourismofkashmir.com/api_bookmark.php?action=${action}&user_id=${userId}&post_id=${post.id}`);
      setIsBookmarked(!isBookmarked);
      toast.success(`${action === 'add' ? 'Bookmark added' : 'Bookmark removed'} successfully`);
    } catch (error) {
      console.error(`Error ${action}ing bookmark:`, error);
      toast.error(`Error ${action}ing bookmark: ${error.message}`);
    }
  };

  const toggleShareOptions = () => {
    setShowShareOptions(!showShareOptions);
  };

  const shareOnSocialMedia = (platform) => {
    const url = window.location.href;
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${url}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch((err) => console.error("Could not copy link: ", err));
  };

  if (!post) {
    return (
      <div className="news-detail-skeleton-wrapper">
        <div className="news-detail-skeleton-image"></div>
        <div className="news-detail-skeleton-title"></div>
        <div className="news-detail-skeleton-meta"></div>
        <div className="news-detail-skeleton-content"></div>
      </div>
    );
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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

  const toggleCommentsModal = () => {
    setShowComments(prevState => !prevState);
  };

  const truncateTitle = (title, maxLength = 50) => {
    if (title.length > maxLength) {
      return `${title.substring(0, maxLength)}...`;
    }
    return title;
  };

  const getCurrentDomain = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://yourwebsite.com'; // Fallback for server-side rendering
  };

  const currentDomain = getCurrentDomain();
  const postUrl = post ? `${currentDomain}/posts/${post.slug}` : '';
  const defaultImage = `${currentDomain}/default-image.jpg`;
  const imageUrl = post && post.image ? post.image : defaultImage;

  return (
    <>
      <Head>
        <title>{post ? post.title : 'Post Not Found'}</title>
        <meta name="description" content={post ? post.meta_description : 'Post not found'} />
        <meta property="og:title" content={post ? post.title : 'Post Not Found'} />
        <meta property="og:description" content={post ? post.meta_description : 'Post not found'} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Your Website Name" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post ? post.title : 'Post Not Found'} />
        <meta name="twitter:description" content={post ? post.meta_description : 'Post not found'} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:url" content={postUrl} />
      </Head>

      <div className="news-detail">
        <div className="news-detail-image">
          <img src={imageUrl} alt={post.title} />
        </div>
        <div className="news-detail-content">
          <h1>{post.title}</h1>
          <div className="news-detail-meta">
            <span><FontAwesomeIcon icon={faCalendarAlt} /> {formattedDate}</span>
            <span><FontAwesomeIcon icon={faClock} /> {post.reading_time} min read</span>
            <span><FontAwesomeIcon icon={faEye} /> {formatViews(post.views)}</span>
          </div>
          <div className="news-detail-body">
            <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
          </div>
          <div className="news-detail-actions">
            <button id="like-btn" onClick={toggleLike}>
              <FontAwesomeIcon icon={isLikedByUser ? faHeart : farHeart} />
              {likeCount}
            </button>
            <button onClick={handleBookmarkClick}>
              <FontAwesomeIcon icon={isBookmarked ? faBookmark : farBookmark} />
            </button>
            <button onClick={toggleShareOptions}>
              <FontAwesomeIcon icon={faShare} />
            </button>
            <button onClick={copyLinkToClipboard}>
              <FontAwesomeIcon icon={faClipboard} />
            </button>
            {showShareOptions && (
              <div className="share-options">
                <button onClick={() => shareOnSocialMedia('facebook')}>
                  <FontAwesomeIcon icon={faFacebookF} />
                </button>
                <button onClick={() => shareOnSocialMedia('twitter')}>
                  <FontAwesomeIcon icon={faTwitter} />
                </button>
                <button onClick={() => shareOnSocialMedia('whatsapp')}>
                  <FontAwesomeIcon icon={faWhatsapp} />
                </button>
              </div>
            )}
          </div>
          <button onClick={toggleCommentsModal}>
            <FontAwesomeIcon icon={farCommentDots} /> {commentCount} Comments
          </button>
          {showComments && <CommentsModal postId={post.id} />}
          <div className="related-posts">
            <h2>Related Posts</h2>
            <ul>
              {relatedPosts.map(rp => (
                <li key={rp.id}>
                  <Link href={`/posts/${rp.slug}`}>
                    <a>{truncateTitle(rp.title)}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="top-viewed-posts">
            <h2>Top Viewed Posts</h2>
            <ul>
              {topViewedPosts.map(tp => (
                <li key={tp.id}>
                  <Link href={`/posts/${tp.slug}`}>
                    <a>{truncateTitle(tp.title)}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostPage;
