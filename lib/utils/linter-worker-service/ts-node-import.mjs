import { register } from 'module';
import { pathToFileURL } from 'url';
register('ts-node/esm/transpile-only', pathToFileURL('./'));
