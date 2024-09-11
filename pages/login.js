import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaSignInAlt, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import '../app/styles/LoginPage.css'; // Import the SASS file directly

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const formVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6 } },
        exit: { opacity: 0, y: -50, transition: { duration: 0.3 } }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            const response = await axios.post('https://blog.tourismofkashmir.com/apilogin.php', { username, password });
            
            if (response.data && response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                toast.success(`Login successful! Welcome ${response.data.user.name}!`, {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                
                setTimeout(() => router.push('/'), 2000);
            } else {
                toast.error('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            toast.error('An error occurred during login. Please try again later.');
        }
    
        setIsLoading(false);
    };

    return (
        <div className="login-page" style={{ backgroundImage: "url(https://blog.tourismofkashmir.com/login_png/login.png)" }}>
             <div onClick={() => router.back()}>
            <FaArrowLeft className="back-arrow"/>

            </div>
            <motion.form
                className="login-form"
                onSubmit={handleLogin}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <h2>Welcome Back</h2>
                <div className="input-wrapper">
                    <FaUser />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                <div className="input-wrapper">
                    <FaLock />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isLoading}
                    className="login-button"
                >
                    {isLoading ? <FaSignInAlt className="loading-icon" /> : 'Login'}
                </motion.button>
                <div className="login-help">
                    <p>Don't have an account? <Link href ="/register">Register</Link></p>
                    <p>Need help? <Link href="/forget_password">Get help</Link></p>
                </div>
            </motion.form>
        </div>
    );
};
export default LoginPage;
