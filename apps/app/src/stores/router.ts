import { Router } from '@lib/router/Router.js';
import { config } from './config.js';
import { title } from '@lib/router/middlewares/title.js';
import { layout } from '@lib/router/middlewares/layout.js';
import { splash } from '@lib/router/middlewares/splash.js';
import { lazy } from '@lib/router/routes/lazy.js';
import { auth } from './auth.js';
import { authenticate } from '@lib/auth/authenticate.js';

export const router = new Router({
  base: config.baseUrl,
});

router.use(splash());
router.use(title());
router.use(layout());
router.use(
  authenticate(auth, {
    ignore: (path) => {
      if (path === '/') return true;
      if (path === '/login') return true;
      if (path === '/chgpwd') return true;
      if (path.startsWith('/pub/')) return true;
      return false;
    },
  }),
);

router.route(
  '/',
  lazy(() => import('../features/vms/Register.js')),
);

router.route(
  '/login',
  lazy(() => import('../features/auth/Login.js')),
);

router.route(
  '/chgpwd',
  lazy(() => import('../features/auth/ChangePassword.js')),
);

router.route(
  '/admin',
  lazy(() => import('../features/common/Home.js')),
);

router.route(
  '/admin/registration',
  lazy(() => import('../features/vms/RegistrationList.js')),
);
