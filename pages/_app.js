import { CustomProvider } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {

  return <CustomProvider theme='dark'><Component {...pageProps} /></CustomProvider>
}
