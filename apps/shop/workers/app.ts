import {createRequestHandler} from 'react-router';

const handle = createRequestHandler(() => import('virtual:react-router/server-build'), import.meta.env.MODE);

export default {
  fetch(request: Request) {
    return handle(request);
  },
};
