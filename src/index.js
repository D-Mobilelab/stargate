require('babel-polyfill');
var Logger = require('./modules/Logger');
var extend = require('./modules/Utils').extend;
var dequeryfy = require('./modules/Utils').dequeryfy;
var queryfy = require('./modules/Utils').queryfy;

var requireCondition = require('./modules/Decorators').requireCondition;
var Facebook = require('./modules/Facebook');
var version = require('./info').version;
var build = require('./info').build;

var fileModule = require('./modules/File');
var Game = require('./modules/Game');
var Connection = require('./modules/Connection');

var cookies = require('cookies-js');
var DEFAULT_CONFIGURATION = require('./stargate.conf.js');
// import bus from './modules/EventBus';

var stargateModules = {
    file: fileModule,
    game: new Game()
};
var LOG = new Logger('all', '[Stargate]');
var initialized = false;
var isStargateOpen = false;
var CUSTOM_CONF = {};
var STARGATE_MANIFEST = {};
const MESSAGE_INITIALIZED = 'Call after Stargate.initialize() please';

var initPromise;
var modulesLoaded;

/**
 * Stargate.initialize waits the cordova deviceready if runs in hybrid env
 * @param {Object} [configuration={DEVICE_READY_TIMEOUT: 5000, modules: [['file', {}]]}] - the object configuration
 * @param {Number} configuration.DEVICE_READY_TIMEOUT how much to wait the deviceready event in ms
 * @param {Function} [callback=function(){}] - callback called when deviceready arrives
 * @returns {Promise<Object|Timeout>}
 */
function initialize(configuration = {}, callback = function(){}){
    if (initPromise){ 
        LOG.w('Initialized already called');
        return initPromise; 
    }
    
    CUSTOM_CONF = extend(DEFAULT_CONFIGURATION, configuration);
    
    // if isHybrid wait deviceready otherwise just call init 
    if (isHybrid()) {
        LOG.i('Hybrid init');
        initPromise = new Promise((resolve, reject) => {
            document.addEventListener('deviceready', function onready(e){
                resolve(e);
                // document.removeEventListener('deviceready', onready);
            });

            // Reject the promise after 5s
            setTimeout(() => { 
                isStargateOpen = false;
                initialized = false;
                reject(['deviceready timeout', CUSTOM_CONF.DEVICE_READY_TIMEOUT].join(' ')); 
            }, CUSTOM_CONF.DEVICE_READY_TIMEOUT);

        }).then((readyEvent) => {
            LOG.i('ReadyEvent', readyEvent);           
            
            modulesLoaded = CUSTOM_CONF.modules.map(moduleInitializer);
            // Put getManifest at the beginning of the array
            modulesLoaded.unshift(getManifest());
            Connection.initialize();
                      
            return Promise.all(modulesLoaded);          
        }).then((results) => {
            
            // get the manifest and return the results without it
            STARGATE_MANIFEST = results.shift();// here we have the manifest            
            callback(results);            
            return results;            
        });
        
    } else {
        LOG.i('No hybrid init');
        modulesLoaded = CUSTOM_CONF.modules.map(moduleInitializer);
        Connection.initialize();
        initPromise = Promise.all(modulesLoaded);
    }
    
    return initPromise.then((results) => {
        initialized = true;
        isStargateOpen = true;
        return results;
    });    
}

function moduleInitializer(moduleAndConf){
    var name = moduleAndConf[0];
    var conf = moduleAndConf[1];
    if (stargateModules[name]){
        if (stargateModules[name].initialize){
            return stargateModules[name].initialize(conf);    
        } else {
            return Promise.resolve([name, true]);
        }                       
    } else { 
        LOG.w([name, 'unsupported'].join(' '));
        return Promise.reject([name, 'unsupported'].join(' '));
    }
}

/**
 * 
 * initModule waits the main initialization 
 * @param {Array<String|Object>} moduleAndConf - modulename and configuration object 
 */
function initModule(moduleAndConf){
    if (!initPromise) { return Promise.reject('Stargate.initialize needs to be called first'); }

    return initPromise.then(() => moduleInitializer(moduleAndConf));
}

/**
 * Get the semantic version of stargate library
 * @static
 * @returns {String}
 */
function getVersion() {
    return [version, build];
}

/**
 * Returns true if the deviceready event has arrived
 * @static
 * @returns {Boolean}
 */
function isInitialized(){
    return initialized;
}

/**
 * Check if stargate is running in hybrid environment: 
 * in order:check the protocol, check cookie if any, localStorage if any
 * @param {Object} ctx - only for testing purporse
 * @static
 * @returns {Boolean}
 */
function isHybrid(ctx){
    
    // Check url for hybrid query param
    
    var location = window.document.location;
    if (ctx) { 
        location = ctx.document.location;
    }
    var uri = location.href;
    var queryStringObject = dequeryfy(uri);
    var protocol = location.protocol;

    if (queryStringObject.hasOwnProperty('stargateVersion')) {
        window.localStorage.setItem('stargateVersion', queryStringObject.stargateVersion);
        cookies.set('stargateVersion', queryStringObject.stargateVersion, { expires: Infinity });
    }

    if (queryStringObject.hasOwnProperty('hybrid')) {
        window.localStorage.setItem('hybrid', 1);
        cookies.set('hybrid', '1', { expires: Infinity });
    }

    if ((protocol === 'file:' || protocol === 'cdvfile:')) {
        return true;
    }

    if (window.localStorage.getItem('hybrid')) {
        return true;
    }

    if (cookies.get('hybrid')) {
        return true;
    }
    return false;
}

/**
 * @deprecated
 */
function isOpen (){
    return isStargateOpen;
}

/**
 * Register a listener for a series of events. Callable after initialize
 * @param {String} type - connectionchange for example
 * @param {Function} fn - the function to call when the event occurs
 */
function addListener(type, fn){
    if (type === 'connectionchange'){
        Connection.addListener(type, fn);        
    }
}

/**
 * Remove a listener for a series of events
 * @param {String} type - connectionchange for example
 * @param {Function} fn - the function to call when the event occurs
 */
function removeListener(type, fn){
    if (type === 'connectionchange'){
        Connection.removeListener(type, fn);
    }
}

/**
 * get Manifest in the hybrid app
 * 
 * @returns {promise} - in success case fullfilled with Object
 */
function getManifest() {
    
    var MANIFEST_PATH = '';
    if (window.cordova.file) {
        MANIFEST_PATH = [window.cordova.file.applicationStorageDirectory, 'www/manifest.json'].join('');
        LOG.i('getManifest', MANIFEST_PATH);
        return fileModule.readFileAsJSON(MANIFEST_PATH);
    }
    
    if (window.hostedwebapp) {
        LOG.i('getManifest from hostedwebapp');
        return new Promise((resolve, reject) => {
            window.hostedwebapp.getManifest(resolve, reject);
        });
    }
    return Promise.resolve({});
}

/**
 * getWebappStartUrl
 * return the online service ready to be launched(with hybrid and stargate version in querystring) 
 * or empty string before initialization
 * @returns {string}
 */
function getWebappStartUrl(){
    if (typeof STARGATE_MANIFEST.stargateConf.webapp_start_url !== 'undefined') {
        return queryfy(STARGATE_MANIFEST.stargateConf.webapp_start_url, 
                       { hybrid: 1,
                         stargateVersion: STARGATE_MANIFEST.stargateConf.stargate_version_to_load });
    } else {
        return '';
    }
}


/**
 * getWebappOrigin
 * return the online service domain string or empty string before initialization
 * 
 * @returns {string}
 */
function getWebappOrigin() {
    var re = /http:\/\/[\w]{3,4}\..*\.[\w]{2,}/;
    if (typeof STARGATE_MANIFEST.stargateConf.webapp_start_url !== 'undefined'){
        return re.exec(STARGATE_MANIFEST.stargateConf.webapp_start_url)[0];
    } else {
        return '';
    }
}


/**
 * loadUrl
 * 
 * @param {string} url - an http url to load in the webview
 */
function loadUrl(url){

    if (window.device.platform.toLowerCase() === 'android'){
        window.navigator.app.loadUrl(url);
    } else if (window.device.platform.toLowerCase() === 'ios' && (url.indexOf('file:///') !== -1)){
        // ios and url is a file:// protocol
        var _url = url.split('?')[0];
        window.resolveLocalFileSystemURL(_url, (entry) => {
            var internalUrl = `${entry.toInternalURL()}?hybrid=1`;
            LOG.d('Redirect to', internalUrl);
            window.location.href = internalUrl;
        }, LOG.e);
    } else {
        window.location.href = url;
    }
}

/**
 * goToLocalIndex
 * redirect the webview to the local index.html
 * */
function goToLocalIndex(){
    if (window.cordova.file.applicationDirectory !== 'undefined'){
        var qs = { hybrid: 1 };
        var LOCAL_INDEX = `${window.cordova.file.applicationDirectory}www/index.html`;
        loadUrl(queryfy(LOCAL_INDEX, qs));
    } else {
        LOG.w('Missing cordova-plugin-file. Install it with: cordova plugin add cordova-plugin-file');
    }
}

/**
 * goToWebIndex
 * redirect the webview to the online webapp
 * */
function goToWebIndex(){
    var webUrl = getWebappStartUrl();
    loadUrl(webUrl);
}

/**
 * just for testing purpose deinitialize stargate
 */
function __deinit__(){
    initPromise = null; 
    initialized = false; 
    isStargateOpen = false;
    localStorage.removeItem('hybrid');
    localStorage.removeItem('stargateVersion');
    cookies.expire('hybrid');
    cookies.expire('stargateVersion');
}

module.exports = {
    initialize,
    getVersion,    
    facebookShare: Facebook.facebookShare,
    facebookLogin: Facebook.facebookLogin,
    addListener: requireCondition(isInitialized, 
                                    addListener, 
                                    null, 
                                    MESSAGE_INITIALIZED, 
                                    'warn'),
    removeListener: requireCondition(isInitialized, 
                                    removeListener, 
                                    null, 
                                    MESSAGE_INITIALIZED, 
                                    'warn'),
    checkConnection: requireCondition(isInitialized, 
                                    Connection.checkConnection, 
                                    null, 
                                    MESSAGE_INITIALIZED, 
                                    'warn'),
    file: stargateModules.file,
    game: stargateModules.game,
    initModule,
    isInitialized,
    isHybrid,
    isOpen,
    getWebappStartUrl: requireCondition(isInitialized, getWebappStartUrl, null, MESSAGE_INITIALIZED, 'warn'),
    getWebappOrigin: requireCondition(isInitialized, getWebappOrigin, null, MESSAGE_INITIALIZED, 'warn'),
    goToLocalIndex: requireCondition(isInitialized, goToLocalIndex, null, MESSAGE_INITIALIZED, 'warn'),
    goToWebIndex: requireCondition(isInitialized, goToWebIndex, null, MESSAGE_INITIALIZED, 'warn'),
    __deinit__
};