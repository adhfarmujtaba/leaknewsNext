import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import '../app/styles/RegisterPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, name, email, password, confirmPassword } = formData;

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post('/api/register', formData);

            if (response.data && response.data.message === "Username or email already exists.") {
                toast.error("Username or email already exists.");
            } else {
                toast.success("Registration successful", {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                router.push('/login');
            }
        } catch (error) {
            console.error("Registration error", error);
            toast.error("An error occurred during registration");
        }
    };

    return (
        <div className="register-page" style={{ backgroundImage: "url(https://blog.tourismofkashmir.com/register.png)" }}>
            {/* Back arrow */}
            <Link href="/"
                
                    ><FaArrowLeft className="back-arrow" />
                
            </Link>
            {/* End of back arrow */}

            <motion.form
                className="register-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2>Create Account</h2>
                <motion.div
                    className="input-wrapper"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <FaUser />
                    <input
                        type="text"
                        placeholder="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </motion.div>
                <motion.div
                    className="input-wrapper"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <FaUser />
                    <input
                        type="text"
                        placeholder="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </motion.div>
                <motion.div
                    className="input-wrapper"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <FaEnvelope />
                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </motion.div>
                <motion.div
                    className="input-wrapper"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <FaLock />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </motion.div>
                <motion.div
                    className="input-wrapper"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <FaLock />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </motion.div>
                <motion.button
    type="submit" id="register_btn"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6, duration: 0.5 }}
>
    Sign Up
</motion.button>

                <p style={{ textAlign: "center", marginTop: "15px" }}>
                    Already have an account?{' '}
                    <Link href="/login" className="link">
                        Login
                    </Link>
                </p>
            </motion.form>
        </div>
    );
};

export default RegisterPage;
