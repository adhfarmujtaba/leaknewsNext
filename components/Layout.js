// components/Layout.js
import Header from './Header';
import CategoryTags from './CategoryTags';

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <CategoryTags />
      <main>{children}</main>
      {/* You can include footer here if needed */}
    </div>
  );
};

export default Layout;
