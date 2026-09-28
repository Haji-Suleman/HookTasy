import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from "@auth0/auth0-react";
createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-b2vq10qrektq2580.us.auth0.com"
    clientId="lzEKR1DVtOmHDbL7yfX60h6dPQWKoe5T"
    authorizationParams={{ redirect_uri: window.location.origin }}
  >
    <App />
  </Auth0Provider>
)