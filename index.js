/**
 * Basic settings
 */

// The API key visible on your Prerender dashboard.
const API_KEY = 'xxx';

// The domains that you want to be prerendered.
const PRERENDERED_DOMAINS = [
  'example.com'
];

/**
 * Advanced settings
 */

 // These are the user agents that the worker will look for to
 // initiate prerendering of the site.
const BOT_AGENTS = [
  'googlebot',
  'yahoo! slurp',
  'bingbot',
  'yandex',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest/0.',
  'developers.google.com/+/web/snippet',
  'slackbot',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'applebot',
  'whatsapp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'skypeuripreview',
  'nuzzel',
  'discordbot',
  'google page speed',
  'qwantify',
  'pinterestbot',
  'bitrix link preview',
  'xing-contenttabreceiver',
  'chrome-lighthouse',
  'telegrambot',
  'google-inspectiontool'
];

// These are the extensions that the worker will skip prerendering
// even if any other conditions pass.
const IGNORE_EXTENSIONS = [
  '.js',
  '.css',
  '.xml',
  '.less',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.pdf',
  '.doc',
  '.txt',
  '.ico',
  '.rss',
  '.zip',
  '.mp3',
  '.rar',
  '.exe',
  '.wmv',
  '.doc',
  '.avi',
  '.ppt',
  '.mpg',
  '.mpeg',
  '.tif',
  '.wav',
  '.mov',
  '.psd',
  '.ai',
  '.xls',
  '.mp4',
  '.m4a',
  '.swf',
  '.dat',
  '.dmg',
  '.iso',
  '.flv',
  '.m4v',
  '.torrent',
  '.woff',
  '.ttf',
  '.svg',
  '.webmanifest'
];

/**
 * This attaches the event listener that gets invoked when CloudFlare receives
 * a request.
 */
addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  const { hostname } = url;
  const requestUserAgent = (request.headers.get('User-Agent') || '').toLowerCase();
  const xPrerender = request.headers.get('X-Prerender');
  const pathName = url.pathname.toLowerCase();
  const ext = pathName.substring(pathName.lastIndexOf('.') || pathName.length);

  if (
    !xPrerender
    && containsOneOfThem(BOT_AGENTS, requestUserAgent)
    && !isOneOfThem(IGNORE_EXTENSIONS, ext)
    && isOneOfThem(PRERENDERED_DOMAINS, hostname)
  ) {
    event.respondWith(prerenderRequest(request))
  }
})

/**
 * Helper function to check if an array contains an exact match for an element or not.
 *
 * @param {string[]} array - The array to check.
 * @param {string} element - The element to check if the array contains.
 * @returns {boolean}
 */
function isOneOfThem(array, element) {
  return array.some(e => e === element);
}

/**
 * Helper function to check if an array contains an element or not.
 *
 * @param {string[]} array - The array to check.
 * @param {string} element - The element to check if the array contains.
 * @returns {boolean}
 */
function containsOneOfThem(array, element) {
  return array.some(e => element.indexOf(e) !== -1);
}

/**
 * Function to request the prerendered version of a request.
 *
 * @param {Request} request - The request received by CloudFlare
 * @returns {Promise<Response>}
 */
function prerenderRequest(request) {
  const { url, headers } = request;
  const prerenderUrl = `https://service.prerender.io/${url}`;
  const headersToSend = new Headers(headers);

  headersToSend.set('X-Prerender-Token', API_KEY);

  const prerenderRequest = new Request(prerenderUrl, {
    headers: headersToSend,
    redirect: 'manual',
  });

  return fetch(prerenderRequest);
}
