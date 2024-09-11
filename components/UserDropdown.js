import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdPerson, MdSettings, MdExitToApp, MdLogin } from 'react-icons/md'; // Import icons from react-icons/md
import './UserDropdown.css';

const UserDropdown = ({ onClose }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    return (
        <div className="user-dropdown">
            <ul>
                {user ? (
                    <>
                        {/* Use template literal to dynamically set the profile link */}
                        <li><Link href={`/profile/${user.username}`} onClick={onClose}><MdPerson /> Profile</Link></li>
                        <li><Link href="/settings" onClick={onClose}><MdSettings /> Settings</Link></li>
                        <li>
                            <Link href="/login" onClick={() => {
                                localStorage.removeItem('user');
                                setUser(null);
                                onClose();
                            }}><MdExitToApp /> Logout</Link>
                        </li>
                    </>
                ) : (
                    <li><Link href="/login" onClick={onClose}><MdLogin /> Login</Link></li>
                )}
            </ul>
        </div>
    );
};

export default UserDropdown;
