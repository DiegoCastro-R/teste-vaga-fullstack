import { AppProps } from 'next/app';
import '@radix-ui/themes/styles.css';


function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}

export default MyApp;
