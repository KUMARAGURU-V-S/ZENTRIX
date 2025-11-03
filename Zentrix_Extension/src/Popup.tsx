import { useState, useEffect } from 'react';
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
  const [platform, setPlatform] = useState('codeforces');
  const [codeforcesData, setCodeforcesData] = useState(null);
  const [lastCodeforcesData, setLastCodeforcesData] = useState(null);
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
    console.log('handleAuth called', { isSignUp, email, password, confirmPassword });
    setError('');
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      if (isSignUp) {
        console.log('Creating user...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created', userCredential.user);
        try {
          await sendEmailVerification(userCredential.user);
          console.log('Email verification sent');
        } catch (verifyErr) {
          console.error('Email verification failed:', verifyErr);
          // Continue anyway for development
        }
        setView('verify-email');
      } else {
        console.log('Signing in...');
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    if (!codeforcesUsername) {
      setError('Please enter a username.');
      return;
    }
    setLoadingCodeforces(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle: codeforcesUsername, platform }),
      });
      const data = await response.json();
      if (response.ok) {
        setCodeforcesData(data);
        setLastCodeforcesData(data);
        setView('codeforces'); // Switch to data view
      } else {
        setError(data.message || 'Failed to generate report.');
        setCodeforcesData(null);
      }
    } catch (err) {
      setError('Network error or server not reachable.');
      console.error('Error generating report:', err);
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
          <h2>Welcome, {(user as any).email}!</h2>
          <p>You are logged in.</p>
          <button onClick={handleSignOut}>Sign Out</button>
          <h3>Linked Coding Platforms</h3>
          <p>No platforms linked yet.</p>
          {lastCodeforcesData && (
            <div>
              <h4>Last Codeforces Stats</h4>
              <p>Rating: {(lastCodeforcesData as any).rating}</p>
              <p>Rank: {(lastCodeforcesData as any).rank}</p>
            </div>
          )}
          <button onClick={() => setView('codeforcesInput')}>
            Link Codeforces Account
          </button>
          <button onClick={() => window.open(import.meta.env.VITE_FRONTEND_URL, '_blank')}>
            Open Dashboard
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
          <button onClick={() => setView('profile')} className="secondary">Continue (Dev)</button>
          <button onClick={() => setView('login')} className="secondary">Go to Sign In</button>
        </div>
      ) : view === 'codeforcesInput' ? (
        // Codeforces Input View
        <div>
          <h2>Link Coding Account</h2>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="codeforces">Codeforces</option>
            <option value="leetcode">LeetCode</option>
          </select>
          <input
            type="text"
            placeholder="Enter Username"
            value={codeforcesUsername}
            onChange={(e) => setCodeforcesUsername(e.target.value)}
          />
          <button onClick={fetchData} disabled={loadingCodeforces}>
            {loadingCodeforces ? 'Generating...' : 'Generate Report'}
          </button>
          <button onClick={() => setView('profile')} className="secondary">Back to Profile</button>
        </div>
      ) : view === 'codeforces' && codeforcesData ? (
        // Codeforces Profile Display View
        <div className="profile-display">
          <h2>Codeforces Profile: {(codeforcesData as any).handle}</h2>
          {(codeforcesData as any).avatar && (
            <img src={`https:${(codeforcesData as any).avatar}`} alt="Avatar" />
          )}
          <p>Rating: <strong>{(codeforcesData as any).rating || 'N/A'}</strong></p>
          <p>Rank: <strong>{(codeforcesData as any).rank || 'N/A'}</strong></p>
          <p>Max Rating: <strong>{(codeforcesData as any).maxRating || 'N/A'}</strong></p>
          <p>Max Rank: <strong>{(codeforcesData as any).maxRank || 'N/A'}</strong></p>
          <a href={`https://codeforces.com/profile/${(codeforcesData as any).handle}`} target="_blank" rel="noopener noreferrer">
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