import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import store from './redux/store';
import router from './routes';
import { requestForToken, onMessageListener } from './utils/pushNotifications';

function App() {
  useEffect(() => {
    // Request push notification token when the app loads
    requestForToken();

    // Listen for foreground messages
    onMessageListener().then(payload => {
      toast.success(`${payload?.notification?.title}: ${payload?.notification?.body}`, {
        duration: 6000,
        position: 'top-right'
      });
    }).catch(err => console.log('failed: ', err));
  }, []);

  return (
    <Provider store={store}>
      <HelmetProvider>
        <RouterProvider router={router} />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'Poppins', sans-serif",
            },
          }}
        />
      </HelmetProvider>
    </Provider>
  );
}

export default App;
