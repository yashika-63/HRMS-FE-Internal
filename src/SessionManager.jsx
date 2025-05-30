// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const SessionManager = () => {
//     const navigate = useNavigate();
//     const [showWarning, setShowWarning] = useState(false);
//     const [reminderCount, setReminderCount] = useState(0);
//     const maxReminders = 2; // Two reminders for testing within the 1-minute period

//     useEffect(() => {
//         const loginTime = localStorage.getItem('loginTime');
//         if (!loginTime) return;

//         const sessionDuration = 1 * 60 * 1000; // 1 minute (for testing)
//         const warningTime = 1 * 60 * 1000; // 1 minute (for testing)
//         const now = Date.now();
//         const timeSinceLogin = now - loginTime;

//         const timeToWarning = Math.max(warningTime - timeSinceLogin, 0);
//         const timeToLogout = Math.max(sessionDuration - timeSinceLogin, 0);

//         // Show warning after 1 minute
//         const warningTimer = setTimeout(() => {
//             setShowWarning(true);
//         }, timeToWarning);

//         // Show reminders every 30 seconds (for testing)
//         const reminderInterval = setInterval(() => {
//             if (reminderCount < maxReminders) {
//                 setReminderCount((prev) => prev + 1);
//                 alert("⏰ Reminder: Your session will expire soon. Please save your work.");
//             }
//         }, 30 * 1000); // every 30 seconds (for testing)

//         // Auto logout after 1 minute
//         const logoutTimer = setTimeout(() => {
//             alert("🛑 Session expired. You will be logged out.");
//             localStorage.clear();
//             navigate('/login');
//         }, timeToLogout);

//         return () => {
//             clearTimeout(warningTimer);
//             clearTimeout(logoutTimer);
//             clearInterval(reminderInterval);
//         };
//     }, []);

//     return (
//         <>
//             {showWarning && (
//                 <div style={{
//                     position: 'fixed',
//                     top: '80px',
//                     right: '20px',
//                     background: 'orange',
//                     padding: '15px',
//                     borderRadius: '10px',
//                     color: 'white',
//                     zIndex: 9999
//                 }}>
//                     ⏳ Your session will expire in 15 minutes.
//                 </div>
//             )}
//         </>
//     );
// };

// export default SessionManager;




import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import { showToast } from './Api.jsx';

const SessionManager = () => {
    const navigate = useNavigate();
    const [reminderCount, setReminderCount] = useState(0);
    const maxReminders = 3; // Max reminders during the session 

    useEffect(() => {
        const loginTime = localStorage.getItem('loginTime');
        if (!loginTime) return;

        const sessionDuration = 50 * 60 * 1000; // 50 minute 
        const firstReminderTime = 30 * 60 * 1000; // First reminder after 30 minutes
        const reminderIntervalTime = 15 * 60 * 1000; // Reminders every 15 minutes after first reminder

        const now = Date.now();
        const timeSinceLogin = now - loginTime;

        const timeToFirstReminder = Math.max(firstReminderTime - timeSinceLogin, 0);
        const timeToLogout = Math.max(sessionDuration - timeSinceLogin, 0);

        // Show first reminder after 30 seconds
        const firstReminderTimer = setTimeout(() => {
            toast.info("⏳ Your session will expire in 30 minutes.", {
                position: "top-right",
                autoClose: 5000, 
                theme: "dark", // Choose between 'light' or 'dark' themes
            });
        }, timeToFirstReminder);

        // Show periodic reminders every 15 minutes
        const reminderInterval = setInterval(() => {
            if (reminderCount < maxReminders) {
                setReminderCount((prev) => prev + 1);
                toast.warning("⏰ Reminder: Your session will expire soon. Please save your work.", {
                    position: "top-right",
                    autoClose: 5000,
                    theme: "dark",
                });
            }
        }, reminderIntervalTime);

        // Auto logout after 1 minute of session time
        const logoutTimer = setTimeout(() => {
            toast.error(
                "🛑 Session expired. You will be logged out.",
                {
                    position: "top-right",
                    autoClose: false, // Don't auto-close this one, we want the user to interact
                    theme: "dark",
                    closeButton: true,
                }
            );

            // Logout automatically after 30 seconds of showing the expired session toast
            setTimeout(() => {
                handleLogout(); // Automatically log out after 30 seconds
            }, 10000); // 10 seconds after the toast is shown
        }, timeToLogout);

        // Handle page visibility (detect user switching tabs or minimizing the app)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log("User switched tabs or minimized");
                // showToast("User switched tabs or minimized",'info');
            } else {
                const timeSinceLogin = Date.now() - loginTime;
                if (timeSinceLogin >= sessionDuration) {
                    toast.error("🛑 Your session has expired. Please log in again.");
                    localStorage.clear();
                    navigate('/login'); 
                    window.location.reload(); 
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearTimeout(firstReminderTimer);
            clearTimeout(logoutTimer);
            clearInterval(reminderInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [reminderCount, navigate]);

    // Handle logout logic
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login'); 
        window.location.reload(); 
    };

    return (
        <>
            {/* No need to include ToastContainer here since it's already in App.jsx */}
        </>
    );
};

export default SessionManager;




















// import React, { useEffect, useState } from 'react';

// // Custom Notification Component
// const CustomNotification = ({ message, type, onClose, onAction }) => {
//     return (
//         <div style={{
//             position: 'fixed',
//             top: '20px',
//             right: '20px',
//             padding: '10px 20px',
//             backgroundColor: type === 'info' ? '#3498db' : type === 'warning' ? '#f39c12' : '#e74c3c',
//             color: 'white',
//             borderRadius: '5px',
//             zIndex: 9999,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
//         }}>
//             <span>{message}</span>
//             <div>
//                 <button onClick={onAction} style={{
//                     background: 'none',
//                     border: 'none',
//                     color: 'white',
//                     fontWeight: 'bold',
//                     cursor: 'pointer',
//                     marginRight: '10px',
//                 }}>Logout</button>
//                 <button onClick={onClose} style={{
//                     background: 'none',
//                     border: 'none',
//                     color: 'white',
//                     fontWeight: 'bold',
//                     cursor: 'pointer',
//                 }}>Close</button>
//             </div>
//         </div>
//     );
// };

// // SessionManager Component
// const SessionManager = () => {
//     const [notifications, setNotifications] = useState([]);
//     const [sessionExpired, setSessionExpired] = useState(false); // Track if session is expired

//     useEffect(() => {
//         const loginTime = localStorage.getItem('loginTime');
//         if (!loginTime) return;

//         const sessionDuration = 1 * 60 * 1000; // 45 minutes (session expiry)
//         const firstReminderTime = 1 * 60 * 1000; // First reminder after 30 minutes
//         const reminderIntervalTime = 1 * 60 * 1000; // Reminders every 7 minutes

//         const now = Date.now();
//         const timeSinceLogin = now - loginTime;

//         const timeToFirstReminder = Math.max(firstReminderTime - timeSinceLogin, 0);
//         const timeToLogout = Math.max(sessionDuration - timeSinceLogin, 0);

//         // First reminder after 30 minutes
//         const firstReminderTimer = setTimeout(() => {
//             setNotifications((prev) => [
//                 ...prev,
//                 { id: Date.now(), message: '⏳ Your session will expire in 15 minutes.', type: 'info' }
//             ]);
//         }, timeToFirstReminder);

//         // Periodic reminders every 7 minutes
//         const reminderInterval = setInterval(() => {
//             setNotifications((prev) => [
//                 ...prev,
//                 { id: Date.now(), message: '⏰ Reminder: Your session will expire soon.', type: 'warning' }
//             ]);
//         }, reminderIntervalTime);

//         // Auto logout after 45 minutes
//         const logoutTimer = setTimeout(() => {
//             setNotifications((prev) => [
//                 ...prev,
//                 { id: Date.now(), message: '🛑 Session expired. You will be logged out.', type: 'error' }
//             ]);
//             setSessionExpired(true); // Mark session as expired
//         }, timeToLogout);

//         return () => {
//             clearTimeout(firstReminderTimer);
//             clearTimeout(logoutTimer);
//             clearInterval(reminderInterval);
//         };
//     }, []);

//     const handleLogout = () => {
//         localStorage.clear();
//         window.location.href = '/Login'; // Navigate to login page
//     };

//     const handleCloseNotification = (id) => {
//         setNotifications((prev) => prev.filter((n) => n.id !== id));
//     };

//     // If session expired, auto-logout after 30 seconds
//     useEffect(() => {
//         if (sessionExpired) {
//             const autoLogoutTimer = setTimeout(() => {
//                 handleLogout(); // Automatically log out after 30 seconds
//             }, 30000); // Wait for 30 seconds before auto-logout

//             return () => clearTimeout(autoLogoutTimer);
//         }
//     }, [sessionExpired]);

//     return (
//         <div>
//             {/* Session Management Notifications */}
//             {notifications.map((notification) => (
//                 <CustomNotification
//                     key={notification.id}
//                     message={notification.message}
//                     type={notification.type}
//                     onClose={() => handleCloseNotification(notification.id)}
//                     onAction={handleLogout}
//                 />
//             ))}
//         </div>
//     );
// };

// export default SessionManager;
