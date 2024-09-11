// pages/_app.js
import Layout from '../components/Layout';
import { ToastContainer } from 'react-toastify';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Check if the current route is '/login' or '/register'
  const excludeLayout = ['/login', '/register'].includes(router.pathname);

  return (
    <div>
      <ToastContainer autoClose={3000} />
      {/* Render layout only if the route is not '/login' or '/register' */}
      {!excludeLayout && (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
      {/* Render the component without layout for the '/login' and '/register' routes */}
      {excludeLayout && <Component {...pageProps} />}
    </div>
  );
}

export default MyApp;
