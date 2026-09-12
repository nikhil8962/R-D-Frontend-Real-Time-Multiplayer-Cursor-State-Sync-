// sockjs-client (a CommonJS/Node-era library) expects Node's `global` object
// to exist. Angular's esbuild-based builder doesn't auto-polyfill this for
// the browser the way older webpack builds used to, so without this the
// whole app crashes silently at load time with "ReferenceError: global is
// not defined" -- which looks like a blank white page with no console
// output visible unless devtools is already open.
(window as any).global = window;
