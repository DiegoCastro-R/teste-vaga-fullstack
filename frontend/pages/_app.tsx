import { AppProps } from 'next/app';
import '@radix-ui/themes/styles.css';
import '../app/globals.css'; // Your own global styles if any

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}

export default MyApp;
