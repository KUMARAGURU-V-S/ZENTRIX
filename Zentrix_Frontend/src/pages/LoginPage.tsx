import React, { useState } from 'react';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';
import { FaBolt } from 'react-icons/fa';

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate an API call for a login request
    setTimeout(() => {
      console.log('Logging in with:', { username, password });
      setLoading(false);
      onLogin(); // Call the onLogin function passed from App.tsx
    }, 1500);
  };

  return (
    <div className="login-container">
      <Card className="login-card-hi-fi">
        <div className="login-header">
          <FaBolt className="login-logo-icon" />
          <h1 className="login-title">Zentrix</h1>
          <p className="login-subtitle">AI-powered analytics for developers.</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Button type="submit" loading={loading}>
            {loading ? 'Logging In...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default LoginPage;