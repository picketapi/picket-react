# Picket React SDK

The Picket React SDK, `picket-react`, is a JavaScript library for integrating Picket into React apps. It gives access to a Picket context provider and custom hook for securing your app.

## Installation

`picket-react` is an [npm package](https://www.npmjs.com/package/@picketapi/picket-react).
```shell
npm install "@picketapi/picket-react"
```

## Usage

The `PicketProvider` creates a Picket context, which makes user authentication information available throughout your app! It takes a publishable API key as a prop.

```tsx
import { PicketProvider } from "@picketapi/picket-react"

function MyApp({ children }) {
  return (
    <PicketProvider apiKey="YOUR_PUBLISHABLE_KEY_HERE">
      {children}
    </PicketProvider>
  );
}
```

We’ve placed a placeholder publishable API key in this example. Replace it with your [actual publishable API key](https://picketapi.com/dashboard). After instantiating the PicketProvider, you can use the `usePicket` hook to get user authentication information within your app. Below is an example of a component that renders different information based on the user's authentication state.

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

## Documentation

For more information, checkout the [docs](https://docs.picketapi.com/picket-docs/reference/libraries-and-sdks/react-sdk-picket-react)
