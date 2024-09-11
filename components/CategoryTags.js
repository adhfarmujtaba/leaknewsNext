import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import '../app/styles/category-tags.css';

const CategoryTags = ({ initialCategories }) => {
  const [categories, setCategories] = useState(initialCategories || []);
  const [isLoading, setIsLoading] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [tagsVisible, setTagsVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://blog.tourismofkashmir.com/apis?categories&order_index=asc&header_menu_is_included=TRUE');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setTagsVisible(false);
      } else {
        setTagsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    // Check if the current path matches any category slug during initial render
    const activeCategory = categories.find(category => router.pathname === `/${category.slug}`);
    if (activeCategory) {
      // Apply active class to the matching category
      const categoryTags = document.querySelectorAll('.category-tag');
      categoryTags.forEach(tag => {
        if (tag.textContent === activeCategory.name) {
          tag.classList.add('active');
        } else {
          tag.classList.remove('active');
        }
      });
    }
  }, [categories, router.pathname]);

  if (isLoading) {
    return (
      <div className="category-tags-loading">
        {/* Skeleton loading states */}
        <div className="loading-tag" style={{ width: '50px', height: '35px' }}></div>
        <div className="loading-tag" style={{ width: '120px', height: '35px' }}></div>
        <div className="loading-tag" style={{ width: '90px', height: '35px' }}></div>
        <div className="loading-tag" style={{ width: '110px', height: '35px' }}></div>
      </div>
    );
  }

  return (
    <div className="category-head" style={{
      position: tagsVisible && typeof window !== 'undefined' && window.scrollY > 80 ? 'fixed' : 'relative',
      top: tagsVisible ? '0' : '-100%', // Adjust as per your category tags' height
      transition: 'top 0.5s'
    }}>
      <div className="category-tags">
        <Link href="/" passHref>
          <div className={`category-tag ${router.pathname === '/' ? 'active' : ''}`}>All</div>
        </Link>
        {categories.map((category) => (
          <Link key={category.id} href={`/${category.slug}`} passHref>
            <div className={`category-tag`}>
              {category.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryTags;
