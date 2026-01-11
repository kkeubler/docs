// Bootstrap pattern is required for Module Federation with shared dependencies.
// The dynamic import allows webpack to load shared React modules (singleton) before
// the application code executes, preventing multiple React instances across microfrontends.
import('./bootstrap');
