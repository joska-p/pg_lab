import './styles.css';
import { initArtPage } from '../page';
import fragment from './shader/fragment.glsl?raw';

initArtPage({ fragment });
