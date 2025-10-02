import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification } from 'firebase/auth';

function Popup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [user, setUser] = useState(null); // To store logged in user
  const [view, setView] = useState('login'); // 'login', 'signup', 'profile', 'codeforces'
  const [error, setError] = useState('');
  const [codeforcesUsername, setCodeforcesUsername] = useState('');
  const [codeforcesData, setCodeforcesData] = useState(null);
  const [loadingCodeforces, setLoadingCodeforces] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser as any);
      if (currentUser) {
        setView('profile');
      } else {
        setView('login');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (isSignUp: boolean) => {
    setError('');
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setView('verify-email');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCodeforcesData = async () => {
    if (!codeforcesUsername) {
      setError('Please enter a Codeforces username.');
      return;
    }
    setLoadingCodeforces(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3000/codeforces/${codeforcesUsername}`);
      const data = await response.json();
      if (response.ok) {
        setCodeforcesData(data);
        setView('codeforces'); // Switch to Codeforces data view
      } else {
        setError(data.message || 'Failed to fetch Codeforces data.');
        setCodeforcesData(null);
      }
    } catch (err) {
      setError('Network error or server not reachable.');
      console.error('Error fetching Codeforces data:', err);
      setCodeforcesData(null);
    } finally {
      setLoadingCodeforces(false);
    }
  };

  return (
    <div className="popup-container">
      {error && <p className="error-message">{error}</p>}

      {user ? (
        // Profile View (after login)
        <div className="profile-display">
          <h2>Welcome, {user.email}!</h2>
          <p>You are logged in.</p>
          <button onClick={handleSignOut}>Sign Out</button>
          <h3>Linked Coding Platforms</h3>
          <p>No platforms linked yet.</p>
          <button onClick={() => setView('codeforcesInput')}>
            Link Codeforces Account
          </button>
        </div>
      ) : view === 'login' || view === 'signup' ? (
        // Auth View (Login/Signup)
        <div>
          <h2>{view === 'login' ? 'Sign In' : 'Sign Up'}</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {view === 'login' ? (
            <>
              <button onClick={() => handleAuth(false)}>Sign In</button>
              <button onClick={() => setView('signup')} className="secondary">Go to Sign Up</button>
            </>
          ) : (
            <>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button onClick={() => handleAuth(true)}>Sign Up</button>
              <button onClick={() => setView('login')} className="secondary">Go to Sign In</button>
            </>
          )}
        </div>
      ) : view === 'verify-email' ? (
        <div>
          <h2>Verify Your Email</h2>
          <p>A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete the sign up.</p>
          <button onClick={() => setView('login')} className="secondary">Go to Sign In</button>
        </div>
      ) : view === 'codeforcesInput' ? (
        // Codeforces Input View
        <div>
          <h2>Link Codeforces Account</h2>
          <input
            type="text"
            placeholder="Codeforces Username"
            value={codeforcesUsername}
            onChange={(e) => setCodeforcesUsername(e.target.value)}
          />
          <button onClick={fetchCodeforcesData} disabled={loadingCodeforces}>
            {loadingCodeforces ? 'Fetching...' : 'Fetch Codeforces Data'}
          </button>
          <button onClick={() => setView('profile')} className="secondary">Back to Profile</button>
        </div>
      ) : view === 'codeforces' && codeforcesData ? (
        // Codeforces Profile Display View
        <div className="profile-display">
          <h2>Codeforces Profile: {codeforcesData.handle}</h2>
          {codeforcesData.avatar && (
            <img src={`https:${codeforcesData.avatar}`} alt="Avatar" />
          )}
          <p>Rating: <strong>{codeforcesData.rating || 'N/A'}</strong></p>
          <p>Rank: <strong>{codeforcesData.rank || 'N/A'}</strong></p>
          <p>Max Rating: <strong>{codeforcesData.maxRating || 'N/A'}</strong></p>
          <p>Max Rank: <strong>{codeforcesData.maxRank || 'N/A'}</strong></p>
          <a href={`https://codeforces.com/profile/${codeforcesData.handle}`} target="_blank" rel="noopener noreferrer">
            View Profile on Codeforces
          </a>
          <button onClick={() => setView('profile')} className="secondary">Back to Profile</button>
        </div>
      ) : (
        // Fallback or initial view if user is not logged in and not in auth view
        <div>
          <p>Please sign in or sign up.</p>
          <button onClick={() => setView('login')}>Go to Sign In</button>
        </div>
      )}
    </div>
  );
}

export default Popup;