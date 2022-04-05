# Picket React SDK

The Picket React SDK, `picket-react`, is a JavaScript library for integrating Picket into React apps. It gives access to a Picket context provider and custom hook for securing your app.

## Installation

```shell
npm install "@picketapi/picket-react"
```

## Usage

The `PicketProvider` creates a Picket context, which makes user authentication information available throughout your app! It takes a publishable API key as a prop.

```tsx
import { PicketProvider } from "@picketapi/picket-react"

function MyApp({ children }) {
  return (
    <PicketProvider apiKey="pk_demo">
      {children}
    </PicketProvider>
  );
}
```

We’ve placed a random API key in this example. Replace it with your [actual api keys](https://picketapi.com/dashboard).

```tsx
import { usePicket } from "@picketapi/picket-react"

const MySecurePage = () => {
  const { 
          isAuthenticating, 
          isAuthenticated, 
          authState, 
          logout,
          login
          } = usePicket();
  
  // user is logging in
  if (isAuthenticating) return "Loading";

  // user is not logged in
  if (!isAuthenticated) {
      return (
        <div>
            <p>You are not logged in!</p>
            <button onClick={() => login()}>Login with Wallet</button>
        </div>
      )
  }

  // user is logged in 🎉
  const { user } = authState;
  const { walletAddress } = user;
  
  return (
    <div>
       <p>You are logged in as {walletAddress} </p>
       <button onClick={() => logout()}>Logout</button>
    </div>
  )
}
```

The `usePicket` hook provides your components information about the user's authentication state. You can use it to require authentication on specific routes, get user information, or get the login and logout functions.
