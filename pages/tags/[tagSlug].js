import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import InfiniteScroll from 'react-infinite-scroll-component';
import './TagDetails.css';
// Skeleton loading component
const SkeletonLoading = () => {
    // Define the number of skeleton rows you want to render
    const numberOfSkeletonRows = 5;

    // Render skeleton rows
    return (
        <div className="skeleton-loading-container">
            {Array.from({ length: numberOfSkeletonRows }).map((_, index) => (
                <div className="skeleton-row" key={index}>
                    <div className="skeleton-image"></div>
                    <div className="skeleton-text">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-description"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// New Loader for Infinite Scroll
const InScrollLoader = () => (
    <img src="https://blog.tourismofkashmir.com/kOnzy.gif" alt="Loading..." className="infinite-scroller-loader" />
);

const trimTitle = (title, maxLength = 50) => {
    if (title.length <= maxLength) return title;
    return `${title.substring(0, maxLength)}...`;
};

const TagSlugPage = () => {
    const [posts, setPosts] = useState([]);
    const [tagName, setTagName] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false); // New state to track fetching status
    const router = useRouter();
    const { tagSlug } = router.query;

    useEffect(() => {
        const fetchTagDetails = async () => {
            try {
                setIsFetching(true); // Start fetching
                const response = await axios.get(`https://blog.tourismofkashmir.com/apis.php?tag_slug=${tagSlug}&page=${page}`);
                const { data } = response;
                if (data.length > 0) {
                    setPosts(prevPosts => [...prevPosts, ...data]);
                    setTagName(data[0].tag_name);
                } else {
                    setHasMore(false);
                }
            } catch (error) {
                console.error('Error fetching tag details:', error);
                setHasMore(false);
            } finally {
                setIsFetching(false); // End fetching
                setIsLoading(false); // Update loading state after initial fetch
            }
        };

        if (tagSlug) {
            fetchTagDetails();
        }
    }, [tagSlug, page]);

    const fetchMoreData = () => {
        setPage(prevPage => prevPage + 1);
    };

    if (isLoading) {
        return <SkeletonLoading />;
    }

    return (
        <div className="tag-details-container">
            <h2>Posts tagged with {tagName}</h2>
            <InfiniteScroll
                dataLength={posts.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={isFetching ? <InScrollLoader /> : null} // Conditionally render loader
                endMessage={
                    <p style={{ textAlign: 'center' }}>
                        <b>Yay! You have seen it all</b>
                    </p>
                }
            >
                <div className="tag-details-posts-container">
                    {posts.map((post, index) => (
                        <Link href={`/${post.category_slug}/${post.slug}`} key={index} passHref className='tag-details-post-link'>
                            <div className="tag-details-post-link">
                                <div className="tag-details-post-row">
                                    <div className="tag-details-image-container">
                                        <img src={post.image} alt={post.title} className="tag-details-post-image" />
                                        <div className="tag-details-read-time-overlay">{post.read_time} min read</div>
                                    </div>
                                    <h3 className="tag-details-post-title">{trimTitle(post.title)}</h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </InfiniteScroll>
        </div>
    );
};

export default TagSlugPage;
