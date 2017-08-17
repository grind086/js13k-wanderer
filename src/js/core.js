/**
 * THIS MUST BE THE FIRST FILE CONCATENATED INTO `game.js`
 */
(global => {
    // Store our definitions and resulting modules
    const definitions = {};
    const modules = {};
    
    // Load the main module when the page is ready
    global.addEventListener('load', () => require('main'));
    
    /**
     * A *very* simple module definition function. Note that there are no protections against circular
     * dependencies, and duplicate module definitions will clobber one another. The "main" module must
     * exist, and will be executed on page load.
     * @param {string} name - The name of the module. It must be referenced by this name.
     * @param {string[]} deps - An array of dependencies.
     * @param {function} fn - A function that accepts imports as arguments in the same order as `deps`
     *      and returns a promise resolving to the module's exports.
     */
    global.define = (name, deps, fn) => {
        definitions[name] = { deps, fn };
    }

    /**
     * Recursively loads a module. If there are circular dependencies this will blow the call stack.
     * @param {string} name - The module to load.
     */
    global.require = async name => {
        if (modules[name]) return modules[name];
        
        const deps = [];

        for (let dep of definitions[name].deps) {
            deps.push(await require(dep));
        }

        return modules[name] = await definitions[name].fn(...deps);
    }
})(window);
