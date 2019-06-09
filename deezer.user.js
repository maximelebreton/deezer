/* jslint               bitwise: true, expr: true, esversion: 6 *//* JSHINT PARAMS (details: http://jshint.com/docs/option) */
/* globals              unsafeWindow, GM_xmlhttpRequest, GM_info, GM, postMessage, aesjs, hex_md5, ID3Writer, FLACMetadataEditor */
const openOnStart   = !true;
const DEBUG         = !true;
const SHOW_KEYS     = !true;    // Show pressed keys
const L10nDEBUG     = !true;    // Enable localization override?
const L10nOVERRIDE  = 'de';     // Override your browser language with selected (handy for translation testing)

const showMp3_32    = !true;
const showMp3_64    = !true;
const showMp3_128   = true;
const showMp3_320   = true;
const showFLAC      = true;

const showAzLyrics  = true;     // Show element asking you for parsing azLyrics
const forceAzLyrics = !true;    // If `true' — override parsing settings with \
const forceAzValue  = true;     // <- this value

const showListDownloader = true;

const coverSize     = 1200;
const coverQuality  = 80;
// ==UserScript==
// @name                Deezer Downloader
// @description         .flac / .mp3
// @version             1.1.7.1
// @author              Deki Haker, Kawashi666 & some others.
// @namespace           AA Script from Original 'Deezer:Download', revisited by some developers & contributors.
// @icon                https://e-cdns-files.dzcdn.net/images/common/favicon/favicon-96x96-v00400107.png
// @screenshot          https://e-cdns-files.dzcdn.net/cache/slash/images/common/logos/deezer.c0869f01203aa5800fe970cf4d7b4fa4.png
// @license             Beerware License; https://paste.debian.net/hidden/plainh/f360edb6/
// @supportURL          https://greasyfork.org/scripts/35724/feedback
// @grant               unsafeWindow
// @grant               GM_xmlhttpRequest
// @grant               GM.xmlHttpRequest
// @connect             azlyrics.com
// @connect             api.deezer.com
//
// @require             https://greasyfork.org/scripts/32982-pajhome-md5/code/PajHome%20MD5.js
//  license             BSD
//  attribution         Paul Johnston ( http://pajhome.org.uk/crypt/md5/ )
//
// @require             https://cdnjs.cloudflare.com/ajax/libs/aes-js/3.1.1/index.min.js
//  license             MIT
//  attribution         ricmoo ( https://github.com/ricmoo/aes-js )
//
// @match               https://www.deezer.com/*
//
// @name:de             Deezer:D➲wnloader [Revived] ... Dafür kann Musik die Limits überschreiten!
// @description:de      Laden Sie einfach das abgespielte Lied oder jedes andere Lied in der Liste in FLAC oder MP3 herunter. Unterstützt HQ auch ohne Premium-Abonnement♛
//
// @name:en             Deezer Downloader
// @description:en      .flac / .mp3
//
// @name:es             Deezer Downloader
// @description:es      .flac / .mp3
//
// @name:fr             Deezer:D➲wnloader [Revived] ... Pour que la musique puisse dépasser les limites!
// @description:fr      Téléchargez facilement la chanson en cours de lecture, ou n'importe quelle autre de la liste, en FLAC ou MP3. Supporte le HQ même sans abonnement Premium♛
//
// @name:it             Deezer:D➲wnloader [Revived] ... Per quella musica puoi superare i limiti!
// @description:it      Scarica facilmente il brano in riproduzione o qualsiasi altro brano nell'elenco, in formato FLAC o MP3. Supporta HQ anche senza abbonamento Premium♛
//
// @name:pt             Deezer:D➲wnloader [Revived] ... Para que a música possa ultrapassar os limites!
// @description:pt      Baixe facilmente a música que está sendo tocada, ou qualquer outra música da lista, em FLAC ou MP3. Suporta HQ mesmo sem ter assinatura Premium♛
// @description:pt-BR   Baixe facilmente a música que está sendo tocada, ou qualquer outra música da lista, em FLAC ou MP3. Suporta HQ mesmo sem ter assinatura Premium♛
//
// @name:ru             Deezer:D➲wnloader [Revived] ... чтоб музыка лилась без остановки!
// @description:ru      Легко загружайте воспроизводимую песню или любую другую песню в списке, в FLAC или MP3. Поддержка HQ даже без подписки на Premium♛
//
// @noframes
// @compatible          chrome,+ chromium + vivaldi     TamperMonkey || ViolentMonkey
// @compatible          opera,                          TamperMonkey || ViolentMonkey
// @compatible          firefox,+ seamonkey             TamperMonkey || ViolentMonkey || GreaseMonkey + GreaseMonkey Port
// @compatible          edge,                           TamperMonkey
//
// @nocompat            qupzilla,                       GreaseMonkey
// @nocompat            safari, (test on v5 only)       TamperMonkey
// ==/UserScript==

/* DEVELOPERS:
 *                      Jonathan Tavares    [ Revisions, fixes, proofreading, compatibility ]
 *                      K-mik@Z             [ Fixes, proofreading (code), style, translation, compatibility and 2 or 3 tricks ]
 *                      AHOHNMYC            [ Refactoring (code), fixes, translation ]
 *
 * EMBEDDED (because of worker has own scope) SCRIPTS:
 *                      javascript-blowfish by agorlov
 *                          License: MIT
 *                          https://github.com/agorlov/javascript-blowfish
 *                      Browser ID3 Writer v4.0.0 by egoroof
 *                          License: MIT
 *                          https://github.com/egoroof/browser-id3-writer
 *                      JS FLACMetadataEditor v0.0.2.1 by AHOHNMYC
 *                          License: GPL-3.0-or-later
 *                          https://greasyfork.org/scripts/40545
 *
 * ALL PERFORMED:       See log < https://paste.debian.net/hidden/plainh/c846afa5/ >
 *
 * TOOLS:               JSHint < http://jshint.com >,
 *                      UglifyJS 3 < https://skalman.github.io/UglifyJS-online/ >  => can minify without supress `;` by changing in options: output > `beautify` value  to false.
 *
 * NOTES:               `unsafeWindow' needed only for Firefox+GreaseMonkey
 *                      uses in executing `dzPlayer' methods, writing to `localStorage' ang getting `USER.USER_ID' value
 *                      `fetch()' also owerrides because it's easiest way to get track info
 *
 *                      GM_xmlhttpRequest used in azLyrics page getting
 *
 *                      code refactored to ES6 standards: consts, lets,
 *                      byte arrays, ``-strings with substitution and so on
 *
 * MORE ABOUT METADATA: https://violentmonkey.github.io/api/metadata-block.html
 *                      https://tampermonkey.net/documentation.php
 *
 *
 */

// < GLOBALS VARS > ( /!\ WARNING ) --------------------------------------------------------------------------------------------------
//[ °°° SECTION LANGUAGES MAP °°°
//  new line with `\n` and escaping special character with `\` (except for downloaderHotkey and fixmeGM).
const _getI18nMap = {  // Default lng is 'en'
    en: {
        downloading: 'Downloading',
        decrypting: 'Decrypting',
        waiting: 'Waiting',
        choose: 'Choose',
        fileNaming: 'file naming',
        title: 'Title',
        artist: 'Artist',
        refresh: 'Refresh the',
        album: 'Album',
        mb: 'МB',
        duration: 'Duration',
        coverDownloading: 'Downloading the cover',
        downloaderHotkey: 'Open "Deezer:D\➲wnloader" panel',
        tracklist: 'Track list',
        clickToOpen: 'Click to open\nor D key (keyboard shortcut)',
        downloadList: 'Download the list',
        lyricsDownloading: 'Downloading the lyrics',
        pleaseLogIn: 'Please, log in to use this script',
        gettingAlbumInfo: 'Getting album info'
    }, de: {
        downloading: 'Herunterladen',
        decrypting: 'Entschlüsselung',
        waiting: 'Warten',
        choose: 'Wählen',
        fileNaming: 'Sie die Dateibenennung',
        title: 'Titel',
        artist: 'Künstler',
        refresh: 'Aktualisiere die',
        album: 'Album',
        duration: 'Dauer',
        coverDownloading: 'Frontabdeckung Herunterladen',
        mb: 'МB',
        downloaderHotkey: 'Öffnen Sie das Panel "Deezer:D\➲wnloader"',
        tracklist: 'Liste der Tracks',
        clickToOpen: 'Klicken Sie auf Öffnen\noder D-Taste (Tastaturkürzel)',
        downloadList: 'Laden Sie die Liste herunter',
        lyricsDownloading: 'Herunterladen der Liedtexte',
        pleaseLogIn: 'Melden Sie sich an, um dieses Skript zu verwenden',
        gettingAlbumInfo: 'Informationen zum Album erhalten'
    }, es: {
        downloading: 'Descargan',
        decrypting: 'Descifrado',
        waiting: 'Esperando la descarga',
        choose: 'Elege',
        fileNaming: 'el nombre del archivo',
        title: 'Título',
        artist: 'Artista',
        refresh: 'actualizar la',
        album: 'Álbum',
        duration: 'Duración',
        coverDownloading: 'Descargando la portada',
        mb: 'МB',
        downloaderHotkey: 'Abra el panel "Deezer:D\➲wnloader"',
        tracklist: 'Lista de pistas',
        clickToOpen: 'Haga clic para abrir\no la tecla D (atajo de teclado)',
        downloadList: 'Descargue la lista',
        lyricsDownloading: 'Descargando la letra',
        pleaseLogIn: 'Por favor, inicie sesión para usar este script',
        gettingAlbumInfo: 'Obtener información del álbum'
    }, fr: {
        downloading: 'Téléchargement',
        decrypting: 'Décryptage',
        waiting: 'En attente',
        choose: 'choisir',
        fileNaming: 'le nom de fichier souhaité',
        title: 'Titre',
        artist: 'Artiste',
        refresh: 'Rafraîchir la',
        album: 'Album',
        duration: 'Durée',
        coverDownloading: 'Téléchargement de la couverture',
        mb: 'MB',
        downloaderHotkey: 'Ouvrir "Deezer:D\➲wnloader"',
        tracklist: 'Liste des pistes',
        clickToOpen: 'Cliquer pour ouvrir\nou touche D (raccourcis clavier)',
        downloadList: 'Télécharger la liste',
        lyricsDownloading: 'Télécharger les paroles',
        pleaseLogIn: 'Veuillez vous connecter pour utiliser ce script',
        gettingAlbumInfo: 'Obtenir des informations sur l\'album'
    }, it: {
        downloading: 'Scaricamento',
        decrypting: 'Decifrare',
        waiting: 'In attesa',
        choose: 'Scegli',
        fileNaming: 'la denominazione del file',
        title: 'Titolo',
        artist: 'Artista',
        refresh: 'Aggiorna la',
        album: 'Album',
        duration: 'Durata',
        coverDownloading: 'Scaricamento della copertina',
        mb: 'МB',
        downloaderHotkey: 'Aprire il pannello "Deezer:D\➲wnloader"',
        tracklist: 'Lista delle tracce',
        clickToOpen: 'Fai clic per aprire\no il tasto D (scorciatoia da tastiera)',
        downloadList: 'Scarica la lista',
        lyricsDownloading: 'Download dei testi',
        pleaseLogIn: 'Per favore, accedi per usare questo script',
        gettingAlbumInfo: 'Ottenere informazioni sugli album'
    }, pt: {
        downloading: 'Baixar',
        decrypting: 'Descriptografar',
        waiting: 'Carregando',
        choose: 'Escolha',
        fileNaming: 'o nome do arquivo',
        title: 'Título',
        artist: 'Artista',
        refresh: 'Atualize a',
        album: 'Álbum',
        duration: 'Duração',
        coverDownloading: 'Baixando capa',
        mb: 'МB',
        downloaderHotkey: 'Abra o painel "Deezer\:D\➲wnloader"',
        tracklist: 'Lista de faixas',
        clickToOpen: 'Clique para abrir\nou tecla D (atalho do teclado)',
        downloadList: 'Baixe a lista',
        lyricsDownloading: 'Download das letras',
        pleaseLogIn: 'Por favor, faça o login para usar este script',
        gettingAlbumInfo: 'Obtendo informações sobre o álbum'
    }, 'pt-BR': {
        downloading: 'Baixar',
        decrypting: 'Descriptografar',
        waiting: 'Carregando',
        choose: 'Escolha',
        fileNaming: 'o nome do arquivo',
        title: 'Título',
        artist: 'Artista',
        refresh: 'Atualize a',
        album: 'Álbum',
        duration: 'Duração',
        coverDownloading: 'Baixando capa',
        mb: 'МB',
        downloaderHotkey: 'Abra o painel "Deezer:D\➲wnloader"',
        tracklist: 'Lista de faixas',
        clickToOpen: 'Clique para abrir\nou tecla D (atalho do teclado)',
        downloadList: 'Baixe a lista',
        lyricsDownloading: 'Download das letras',
        pleaseLogIn: 'Por favor, faça o login para usar este script',
        gettingAlbumInfo: 'Obtendo informações sobre o álbum'
    }, ru: {
        downloading: 'Загрузка',
        decrypting: 'Расшифровка',
        waiting: 'Ожидание загрузки',
        choose: 'Выбор',
        fileNaming: 'имени файла',
        title: 'Название',
        artist: 'Исполнитель',
        refresh: 'Обновить',
        album: 'Альбом',
        duration: 'Длительность',
        coverDownloading: 'Загрузка обложки',
        mb: 'МБ',
        downloaderHotkey: 'Открыть панель "Deezer:D\➲wnloader"',
        tracklist: 'Список треков',
        clickToOpen: 'Клик здесь или нажатие клавиши D\nоткроют панель',
        downloadList: 'Загрузить список',
        lyricsDownloading: 'Загрузка текста',
        pleaseLogIn: 'Пожалуйста, залогиньтесь для нормальной работы скрипта',
        gettingAlbumInfo: 'Получение информации об альбоме'
    }
};

//[ °°° SECTION GUI LANGUAGE °°° ]
let L10n = L10nDEBUG ? L10nOVERRIDE : navigator.language;
if (!_getI18nMap[L10n]) L10n = L10n.substring(0, 2);
if (!_getI18nMap[L10n]) L10n = 'en';

const translate = _getI18nMap[L10n];    // Now, use translate.whatYouWant ( better than translate[whatYouWant] ).

/* Replaces `10 ^mb' to `10 MB' */
function translateCircumstring(data) {
    return data.replace(/\^(\w+)/g, (full, part) => translate[part] ? translate[part] : full);
}

// FETCH SUBSTITUTE
if (GM_info.scriptHandler === 'Greasemonkey') {
    if (!localStorage.gmFetchWarningShown) {
        unsafeWindow.localStorage.gmFetchWarningShown = 'true';
        alert('We cannot safely replace `fetch()\' in GreaseMonkey. If troubles starts, replace GreaseMonkey with ViolentMonkey or TamperMonkey. This message will not be shown anymore');
    }
} else {
    const orig_fetch = unsafeWindow.fetch;
    unsafeWindow.fetch = (input, init = {}) => {
        if (DEBUG) console.info('fetch() to:', input);
        if (input.startsWith('https://www.deezer.com/ajax/gw-light.php?method=log.listen'))
            return;

        if (input.startsWith('https://www.deezer.com/ajax/gw-light.php')) {
            orig_fetch(input, init)
                .then(response=>response.json())
                .then(trackRecurseLookup);
        }

        return orig_fetch(input, init);
    };
}

function trackRecurseLookup(key){
    if (key !== null && typeof key === 'object') {
        if (key.SNG_ID)
            trackDB[key.SNG_ID] = key;

        else if (key.forEach)
            key.forEach(trackRecurseLookup);
        else
            Object.keys(key).forEach(subKey=>trackRecurseLookup(key[subKey]));
    }
}


// config:  url, responseType, onProgress, onSuccess, anyway
function niceXhr(config) {
    const data = {
        responseType: config.responseType,
        method: 'GET',
        url: config.url,
        onload: e=>{
            if (200 === e.status)
                config.onSuccess(e.response);
            else
                console.warn('Error with getting data from', e.finalUrl);
            config.anyway();
        },
        onerror: config.anyway,
        onabort: config.anyway,
        onprogress: config.onProgress,
    };

    // Greasemonkey with their 4.0 API became a monster ~
    if (typeof GM !== 'undefined' && typeof GM.xmlHttpRequest !== 'undefined')
        GM.xmlHttpRequest(data);
    else
        GM_xmlhttpRequest(data);
}



// WORKER
function createWorker(code) {
    const blobURL = URL.createObjectURL(new Blob(
        ['(', code.toString(), ')()'],
        {type: 'text/javascript'}
    ));
    const worker = new Worker(blobURL);
    URL.revokeObjectURL(blobURL);
    return worker;
}

const mainWk = createWorker(function() {
    // BLOWFISH LIBRARY, adapted from https://github.com/agorlov/javascript-blowfish (MIT-licensed)
    // Modified to work with byte arrays, and also supports encryption / decryption in-place for buffers.
    // Now it works ONLY with byte arrays and can ONLY decrypt data ONLY in CBC mode.
    // Cannot be @require-d, as it is part of worker code. Workers share NO data so everything must be embedded.
    const Blowfish = function(key) {
        this.key = key;
        this.sBox0 = new Uint32Array([0xd1310ba6, 0x98dfb5ac, 0x2ffd72db, 0xd01adfb7, 0xb8e1afed, 0x6a267e96, 0xba7c9045, 0xf12c7f99, 0x24a19947, 0xb3916cf7, 0x0801f2e2, 0x858efc16, 0x636920d8, 0x71574e69, 0xa458fea3, 0xf4933d7e, 0x0d95748f, 0x728eb658, 0x718bcd58, 0x82154aee, 0x7b54a41d, 0xc25a59b5, 0x9c30d539, 0x2af26013, 0xc5d1b023, 0x286085f0, 0xca417918, 0xb8db38ef, 0x8e79dcb0, 0x603a180e, 0x6c9e0e8b, 0xb01e8a3e, 0xd71577c1, 0xbd314b27, 0x78af2fda, 0x55605c60, 0xe65525f3, 0xaa55ab94, 0x57489862, 0x63e81440, 0x55ca396a, 0x2aab10b6, 0xb4cc5c34, 0x1141e8ce, 0xa15486af, 0x7c72e993, 0xb3ee1411, 0x636fbc2a, 0x2ba9c55d, 0x741831f6, 0xce5c3e16, 0x9b87931e, 0xafd6ba33, 0x6c24cf5c, 0x7a325381, 0x28958677, 0x3b8f4898, 0x6b4bb9af, 0xc4bfe81b, 0x66282193, 0x61d809cc, 0xfb21a991, 0x487cac60, 0x5dec8032, 0xef845d5d, 0xe98575b1, 0xdc262302, 0xeb651b88, 0x23893e81, 0xd396acc5, 0x0f6d6ff3, 0x83f44239, 0x2e0b4482, 0xa4842004, 0x69c8f04a, 0x9e1f9b5e, 0x21c66842, 0xf6e96c9a, 0x670c9c61, 0xabd388f0, 0x6a51a0d2, 0xd8542f68, 0x960fa728, 0xab5133a3, 0x6eef0b6c, 0x137a3be4, 0xba3bf050, 0x7efb2a98, 0xa1f1651d, 0x39af0176, 0x66ca593e, 0x82430e88, 0x8cee8619, 0x456f9fb4, 0x7d84a5c3, 0x3b8b5ebe, 0xe06f75d8, 0x85c12073, 0x401a449f, 0x56c16aa6, 0x4ed3aa62, 0x363f7706, 0x1bfedf72, 0x429b023d, 0x37d0d724, 0xd00a1248, 0xdb0fead3, 0x49f1c09b, 0x075372c9, 0x80991b7b, 0x25d479d8, 0xf6e8def7, 0xe3fe501a, 0xb6794c3b, 0x976ce0bd, 0x04c006ba, 0xc1a94fb6, 0x409f60c4, 0x5e5c9ec2, 0x196a2463, 0x68fb6faf, 0x3e6c53b5, 0x1339b2eb, 0x3b52ec6f, 0x6dfc511f, 0x9b30952c, 0xcc814544, 0xaf5ebd09, 0xbee3d004, 0xde334afd, 0x660f2807, 0x192e4bb3, 0xc0cba857, 0x45c8740f, 0xd20b5f39, 0xb9d3fbdb, 0x5579c0bd, 0x1a60320a, 0xd6a100c6, 0x402c7279, 0x679f25fe, 0xfb1fa3cc, 0x8ea5e9f8, 0xdb3222f8, 0x3c7516df, 0xfd616b15, 0x2f501ec8, 0xad0552ab, 0x323db5fa, 0xfd238760, 0x53317b48, 0x3e00df82, 0x9e5c57bb, 0xca6f8ca0, 0x1a87562e, 0xdf1769db, 0xd542a8f6, 0x287effc3, 0xac6732c6, 0x8c4f5573, 0x695b27b0, 0xbbca58c8, 0xe1ffa35d, 0xb8f011a0, 0x10fa3d98, 0xfd2183b8, 0x4afcb56c, 0x2dd1d35b, 0x9a53e479, 0xb6f84565, 0xd28e49bc, 0x4bfb9790, 0xe1ddf2da, 0xa4cb7e33, 0x62fb1341, 0xcee4c6e8, 0xef20cada, 0x36774c01, 0xd07e9efe, 0x2bf11fb4, 0x95dbda4d, 0xae909198, 0xeaad8e71, 0x6b93d5a0, 0xd08ed1d0, 0xafc725e0, 0x8e3c5b2f, 0x8e7594b7, 0x8ff6e2fb, 0xf2122b64, 0x8888b812, 0x900df01c, 0x4fad5ea0, 0x688fc31c, 0xd1cff191, 0xb3a8c1ad, 0x2f2f2218, 0xbe0e1777, 0xea752dfe, 0x8b021fa1, 0xe5a0cc0f, 0xb56f74e8, 0x18acf3d6, 0xce89e299, 0xb4a84fe0, 0xfd13e0b7, 0x7cc43b81, 0xd2ada8d9, 0x165fa266, 0x80957705, 0x93cc7314, 0x211a1477, 0xe6ad2065, 0x77b5fa86, 0xc75442f5, 0xfb9d35cf, 0xebcdaf0c, 0x7b3e89a0, 0xd6411bd3, 0xae1e7e49, 0x00250e2d, 0x2071b35e, 0x226800bb, 0x57b8e0af, 0x2464369b, 0xf009b91e, 0x5563911d, 0x59dfa6aa, 0x78c14389, 0xd95a537f, 0x207d5ba2, 0x02e5b9c5, 0x83260376, 0x6295cfa9, 0x11c81968, 0x4e734a41, 0xb3472dca, 0x7b14a94a, 0x1b510052, 0x9a532915, 0xd60f573f, 0xbc9bc6e4, 0x2b60a476, 0x81e67400, 0x08ba6fb5, 0x571be91f, 0xf296ec6b, 0x2a0dd915, 0xb6636521, 0xe7b9f9b6, 0xff34052e, 0xc5855664, 0x53b02d5d, 0xa99f8fa1, 0x08ba4799, 0x6e85076a]);
        this.sBox1 = new Uint32Array([0x4b7a70e9, 0xb5b32944, 0xdb75092e, 0xc4192623, 0xad6ea6b0, 0x49a7df7d, 0x9cee60b8, 0x8fedb266, 0xecaa8c71, 0x699a17ff, 0x5664526c, 0xc2b19ee1, 0x193602a5, 0x75094c29, 0xa0591340, 0xe4183a3e, 0x3f54989a, 0x5b429d65, 0x6b8fe4d6, 0x99f73fd6, 0xa1d29c07, 0xefe830f5, 0x4d2d38e6, 0xf0255dc1, 0x4cdd2086, 0x8470eb26, 0x6382e9c6, 0x021ecc5e, 0x09686b3f, 0x3ebaefc9, 0x3c971814, 0x6b6a70a1, 0x687f3584, 0x52a0e286, 0xb79c5305, 0xaa500737, 0x3e07841c, 0x7fdeae5c, 0x8e7d44ec, 0x5716f2b8, 0xb03ada37, 0xf0500c0d, 0xf01c1f04, 0x0200b3ff, 0xae0cf51a, 0x3cb574b2, 0x25837a58, 0xdc0921bd, 0xd19113f9, 0x7ca92ff6, 0x94324773, 0x22f54701, 0x3ae5e581, 0x37c2dadc, 0xc8b57634, 0x9af3dda7, 0xa9446146, 0x0fd0030e, 0xecc8c73e, 0xa4751e41, 0xe238cd99, 0x3bea0e2f, 0x3280bba1, 0x183eb331, 0x4e548b38, 0x4f6db908, 0x6f420d03, 0xf60a04bf, 0x2cb81290, 0x24977c79, 0x5679b072, 0xbcaf89af, 0xde9a771f, 0xd9930810, 0xb38bae12, 0xdccf3f2e, 0x5512721f, 0x2e6b7124, 0x501adde6, 0x9f84cd87, 0x7a584718, 0x7408da17, 0xbc9f9abc, 0xe94b7d8c, 0xec7aec3a, 0xdb851dfa, 0x63094366, 0xc464c3d2, 0xef1c1847, 0x3215d908, 0xdd433b37, 0x24c2ba16, 0x12a14d43, 0x2a65c451, 0x50940002, 0x133ae4dd, 0x71dff89e, 0x10314e55, 0x81ac77d6, 0x5f11199b, 0x043556f1, 0xd7a3c76b, 0x3c11183b, 0x5924a509, 0xf28fe6ed, 0x97f1fbfa, 0x9ebabf2c, 0x1e153c6e, 0x86e34570, 0xeae96fb1, 0x860e5e0a, 0x5a3e2ab3, 0x771fe71c, 0x4e3d06fa, 0x2965dcb9, 0x99e71d0f, 0x803e89d6, 0x5266c825, 0x2e4cc978, 0x9c10b36a, 0xc6150eba, 0x94e2ea78, 0xa5fc3c53, 0x1e0a2df4, 0xf2f74ea7, 0x361d2b3d, 0x1939260f, 0x19c27960, 0x5223a708, 0xf71312b6, 0xebadfe6e, 0xeac31f66, 0xe3bc4595, 0xa67bc883, 0xb17f37d1, 0x018cff28, 0xc332ddef, 0xbe6c5aa5, 0x65582185, 0x68ab9802, 0xeecea50f, 0xdb2f953b, 0x2aef7dad, 0x5b6e2f84, 0x1521b628, 0x29076170, 0xecdd4775, 0x619f1510, 0x13cca830, 0xeb61bd96, 0x0334fe1e, 0xaa0363cf, 0xb5735c90, 0x4c70a239, 0xd59e9e0b, 0xcbaade14, 0xeecc86bc, 0x60622ca7, 0x9cab5cab, 0xb2f3846e, 0x648b1eaf, 0x19bdf0ca, 0xa02369b9, 0x655abb50, 0x40685a32, 0x3c2ab4b3, 0x319ee9d5, 0xc021b8f7, 0x9b540b19, 0x875fa099, 0x95f7997e, 0x623d7da8, 0xf837889a, 0x97e32d77, 0x11ed935f, 0x16681281, 0x0e358829, 0xc7e61fd6, 0x96dedfa1, 0x7858ba99, 0x57f584a5, 0x1b227263, 0x9b83c3ff, 0x1ac24696, 0xcdb30aeb, 0x532e3054, 0x8fd948e4, 0x6dbc3128, 0x58ebf2ef, 0x34c6ffea, 0xfe28ed61, 0xee7c3c73, 0x5d4a14d9, 0xe864b7e3, 0x42105d14, 0x203e13e0, 0x45eee2b6, 0xa3aaabea, 0xdb6c4f15, 0xfacb4fd0, 0xc742f442, 0xef6abbb5, 0x654f3b1d, 0x41cd2105, 0xd81e799e, 0x86854dc7, 0xe44b476a, 0x3d816250, 0xcf62a1f2, 0x5b8d2646, 0xfc8883a0, 0xc1c7b6a3, 0x7f1524c3, 0x69cb7492, 0x47848a0b, 0x5692b285, 0x095bbf00, 0xad19489d, 0x1462b174, 0x23820e00, 0x58428d2a, 0x0c55f5ea, 0x1dadf43e, 0x233f7061, 0x3372f092, 0x8d937e41, 0xd65fecf1, 0x6c223bdb, 0x7cde3759, 0xcbee7460, 0x4085f2a7, 0xce77326e, 0xa6078084, 0x19f8509e, 0xe8efd855, 0x61d99735, 0xa969a7aa, 0xc50c06c2, 0x5a04abfc, 0x800bcadc, 0x9e447a2e, 0xc3453484, 0xfdd56705, 0x0e1e9ec9, 0xdb73dbd3, 0x105588cd, 0x675fda79, 0xe3674340, 0xc5c43465, 0x713e38d8, 0x3d28f89e, 0xf16dff20, 0x153e21e7, 0x8fb03d4a, 0xe6e39f2b, 0xdb83adf7]);
        this.sBox2 = new Uint32Array([0xe93d5a68, 0x948140f7, 0xf64c261c, 0x94692934, 0x411520f7, 0x7602d4f7, 0xbcf46b2e, 0xd4a20068, 0xd4082471, 0x3320f46a, 0x43b7d4b7, 0x500061af, 0x1e39f62e, 0x97244546, 0x14214f74, 0xbf8b8840, 0x4d95fc1d, 0x96b591af, 0x70f4ddd3, 0x66a02f45, 0xbfbc09ec, 0x03bd9785, 0x7fac6dd0, 0x31cb8504, 0x96eb27b3, 0x55fd3941, 0xda2547e6, 0xabca0a9a, 0x28507825, 0x530429f4, 0x0a2c86da, 0xe9b66dfb, 0x68dc1462, 0xd7486900, 0x680ec0a4, 0x27a18dee, 0x4f3ffea2, 0xe887ad8c, 0xb58ce006, 0x7af4d6b6, 0xaace1e7c, 0xd3375fec, 0xce78a399, 0x406b2a42, 0x20fe9e35, 0xd9f385b9, 0xee39d7ab, 0x3b124e8b, 0x1dc9faf7, 0x4b6d1856, 0x26a36631, 0xeae397b2, 0x3a6efa74, 0xdd5b4332, 0x6841e7f7, 0xca7820fb, 0xfb0af54e, 0xd8feb397, 0x454056ac, 0xba489527, 0x55533a3a, 0x20838d87, 0xfe6ba9b7, 0xd096954b, 0x55a867bc, 0xa1159a58, 0xcca92963, 0x99e1db33, 0xa62a4a56, 0x3f3125f9, 0x5ef47e1c, 0x9029317c, 0xfdf8e802, 0x04272f70, 0x80bb155c, 0x05282ce3, 0x95c11548, 0xe4c66d22, 0x48c1133f, 0xc70f86dc, 0x07f9c9ee, 0x41041f0f, 0x404779a4, 0x5d886e17, 0x325f51eb, 0xd59bc0d1, 0xf2bcc18f, 0x41113564, 0x257b7834, 0x602a9c60, 0xdff8e8a3, 0x1f636c1b, 0x0e12b4c2, 0x02e1329e, 0xaf664fd1, 0xcad18115, 0x6b2395e0, 0x333e92e1, 0x3b240b62, 0xeebeb922, 0x85b2a20e, 0xe6ba0d99, 0xde720c8c, 0x2da2f728, 0xd0127845, 0x95b794fd, 0x647d0862, 0xe7ccf5f0, 0x5449a36f, 0x877d48fa, 0xc39dfd27, 0xf33e8d1e, 0x0a476341, 0x992eff74, 0x3a6f6eab, 0xf4f8fd37, 0xa812dc60, 0xa1ebddf8, 0x991be14c, 0xdb6e6b0d, 0xc67b5510, 0x6d672c37, 0x2765d43b, 0xdcd0e804, 0xf1290dc7, 0xcc00ffa3, 0xb5390f92, 0x690fed0b, 0x667b9ffb, 0xcedb7d9c, 0xa091cf0b, 0xd9155ea3, 0xbb132f88, 0x515bad24, 0x7b9479bf, 0x763bd6eb, 0x37392eb3, 0xcc115979, 0x8026e297, 0xf42e312d, 0x6842ada7, 0xc66a2b3b, 0x12754ccc, 0x782ef11c, 0x6a124237, 0xb79251e7, 0x06a1bbe6, 0x4bfb6350, 0x1a6b1018, 0x11caedfa, 0x3d25bdd8, 0xe2e1c3c9, 0x44421659, 0x0a121386, 0xd90cec6e, 0xd5abea2a, 0x64af674e, 0xda86a85f, 0xbebfe988, 0x64e4c3fe, 0x9dbc8057, 0xf0f7c086, 0x60787bf8, 0x6003604d, 0xd1fd8346, 0xf6381fb0, 0x7745ae04, 0xd736fccc, 0x83426b33, 0xf01eab71, 0xb0804187, 0x3c005e5f, 0x77a057be, 0xbde8ae24, 0x55464299, 0xbf582e61, 0x4e58f48f, 0xf2ddfda2, 0xf474ef38, 0x8789bdc2, 0x5366f9c3, 0xc8b38e74, 0xb475f255, 0x46fcd9b9, 0x7aeb2661, 0x8b1ddf84, 0x846a0e79, 0x915f95e2, 0x466e598e, 0x20b45770, 0x8cd55591, 0xc902de4c, 0xb90bace1, 0xbb8205d0, 0x11a86248, 0x7574a99e, 0xb77f19b6, 0xe0a9dc09, 0x662d09a1, 0xc4324633, 0xe85a1f02, 0x09f0be8c, 0x4a99a025, 0x1d6efe10, 0x1ab93d1d, 0x0ba5a4df, 0xa186f20f, 0x2868f169, 0xdcb7da83, 0x573906fe, 0xa1e2ce9b, 0x4fcd7f52, 0x50115e01, 0xa70683fa, 0xa002b5c4, 0x0de6d027, 0x9af88c27, 0x773f8641, 0xc3604c06, 0x61a806b5, 0xf0177a28, 0xc0f586e0, 0x006058aa, 0x30dc7d62, 0x11e69ed7, 0x2338ea63, 0x53c2dd94, 0xc2c21634, 0xbbcbee56, 0x90bcb6de, 0xebfc7da1, 0xce591d76, 0x6f05e409, 0x4b7c0188, 0x39720a3d, 0x7c927c24, 0x86e3725f, 0x724d9db9, 0x1ac15bb4, 0xd39eb8fc, 0xed545578, 0x08fca5b5, 0xd83d7cd3, 0x4dad0fc4, 0x1e50ef5e, 0xb161e6f8, 0xa28514d9, 0x6c51133c, 0x6fd5c7e7, 0x56e14ec4, 0x362abfce, 0xddc6c837, 0xd79a3234, 0x92638212, 0x670efa8e, 0x406000e0]);
        this.sBox3 = new Uint32Array([0x3a39ce37, 0xd3faf5cf, 0xabc27737, 0x5ac52d1b, 0x5cb0679e, 0x4fa33742, 0xd3822740, 0x99bc9bbe, 0xd5118e9d, 0xbf0f7315, 0xd62d1c7e, 0xc700c47b, 0xb78c1b6b, 0x21a19045, 0xb26eb1be, 0x6a366eb4, 0x5748ab2f, 0xbc946e79, 0xc6a376d2, 0x6549c2c8, 0x530ff8ee, 0x468dde7d, 0xd5730a1d, 0x4cd04dc6, 0x2939bbdb, 0xa9ba4650, 0xac9526e8, 0xbe5ee304, 0xa1fad5f0, 0x6a2d519a, 0x63ef8ce2, 0x9a86ee22, 0xc089c2b8, 0x43242ef6, 0xa51e03aa, 0x9cf2d0a4, 0x83c061ba, 0x9be96a4d, 0x8fe51550, 0xba645bd6, 0x2826a2f9, 0xa73a3ae1, 0x4ba99586, 0xef5562e9, 0xc72fefd3, 0xf752f7da, 0x3f046f69, 0x77fa0a59, 0x80e4a915, 0x87b08601, 0x9b09e6ad, 0x3b3ee593, 0xe990fd5a, 0x9e34d797, 0x2cf0b7d9, 0x022b8b51, 0x96d5ac3a, 0x017da67d, 0xd1cf3ed6, 0x7c7d2d28, 0x1f9f25cf, 0xadf2b89b, 0x5ad6b472, 0x5a88f54c, 0xe029ac71, 0xe019a5e6, 0x47b0acfd, 0xed93fa9b, 0xe8d3c48d, 0x283b57cc, 0xf8d56629, 0x79132e28, 0x785f0191, 0xed756055, 0xf7960e44, 0xe3d35e8c, 0x15056dd4, 0x88f46dba, 0x03a16125, 0x0564f0bd, 0xc3eb9e15, 0x3c9057a2, 0x97271aec, 0xa93a072a, 0x1b3f6d9b, 0x1e6321f5, 0xf59c66fb, 0x26dcf319, 0x7533d928, 0xb155fdf5, 0x03563482, 0x8aba3cbb, 0x28517711, 0xc20ad9f8, 0xabcc5167, 0xccad925f, 0x4de81751, 0x3830dc8e, 0x379d5862, 0x9320f991, 0xea7a90c2, 0xfb3e7bce, 0x5121ce64, 0x774fbe32, 0xa8b6e37e, 0xc3293d46, 0x48de5369, 0x6413e680, 0xa2ae0810, 0xdd6db224, 0x69852dfd, 0x09072166, 0xb39a460a, 0x6445c0dd, 0x586cdecf, 0x1c20c8ae, 0x5bbef7dd, 0x1b588d40, 0xccd2017f, 0x6bb4e3bb, 0xdda26a7e, 0x3a59ff45, 0x3e350a44, 0xbcb4cdd5, 0x72eacea8, 0xfa6484bb, 0x8d6612ae, 0xbf3c6f47, 0xd29be463, 0x542f5d9e, 0xaec2771b, 0xf64e6370, 0x740e0d8d, 0xe75b1357, 0xf8721671, 0xaf537d5d, 0x4040cb08, 0x4eb4e2cc, 0x34d2466a, 0x0115af84, 0xe1b00428, 0x95983a1d, 0x06b89fb4, 0xce6ea048, 0x6f3f3b82, 0x3520ab82, 0x011a1d4b, 0x277227f8, 0x611560b1, 0xe7933fdc, 0xbb3a792b, 0x344525bd, 0xa08839e1, 0x51ce794b, 0x2f32c9b7, 0xa01fbac9, 0xe01cc87e, 0xbcc7d1f6, 0xcf0111c3, 0xa1e8aac7, 0x1a908749, 0xd44fbd9a, 0xd0dadecb, 0xd50ada38, 0x0339c32a, 0xc6913667, 0x8df9317c, 0xe0b12b4f, 0xf79e59b7, 0x43f5bb3a, 0xf2d519ff, 0x27d9459c, 0xbf97222c, 0x15e6fc2a, 0x0f91fc71, 0x9b941525, 0xfae59361, 0xceb69ceb, 0xc2a86459, 0x12baa8d1, 0xb6c1075e, 0xe3056a0c, 0x10d25065, 0xcb03a442, 0xe0ec6e0e, 0x1698db3b, 0x4c98a0be, 0x3278e964, 0x9f1f9532, 0xe0d392df, 0xd3a0342b, 0x8971f21e, 0x1b0a7441, 0x4ba3348c, 0xc5be7120, 0xc37632d8, 0xdf359f8d, 0x9b992f2e, 0xe60b6f47, 0x0fe3f11d, 0xe54cda54, 0x1edad891, 0xce6279cf, 0xcd3e7e6f, 0x1618b166, 0xfd2c1d05, 0x848fd2c5, 0xf6fb2299, 0xf523f357, 0xa6327623, 0x93a83531, 0x56cccd02, 0xacf08162, 0x5a75ebb5, 0x6e163697, 0x88d273cc, 0xde966292, 0x81b949d0, 0x4c50901b, 0x71c65614, 0xe6c6c7bd, 0x327a140a, 0x45e1d006, 0xc3f27b9a, 0xc9aa53fd, 0x62a80f00, 0xbb25bfe2, 0x35bdd2f6, 0x71126905, 0xb2040222, 0xb6cbcf7c, 0xcd769c2b, 0x53113ec0, 0x1640e3d3, 0x38abbd60, 0x2547adf0, 0xba38209c, 0xf746ce76, 0x77afa1c5, 0x20756060, 0x85cbfe4e, 0x8ae88dd8, 0x7aaaf9b0, 0x4cf9aa7e, 0x1948c25c, 0x02fb8a8c, 0x01c36ae4, 0xd6ebe1f9, 0x90d4f869, 0xa65cdea0, 0x3f09252d, 0xc208e69f, 0xb74e6132, 0xce77e25b, 0x578fdfe3, 0x3ac372e6]);
        this.pArray= new Uint32Array([0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344, 0xa4093822, 0x299f31d0, 0x082efa98, 0xec4e6c89, 0x452821e6, 0x38d01377, 0xbe5466cf, 0x34e90c6c, 0xc0ac29b7, 0xc97c50dd, 0x3f84d5b5, 0xb5470917, 0x9216d5d9, 0x8979fb1b]);
        this.generateSubkeys(key);
    };
    Blowfish.prototype = {
        sBox0: null,
        sBox1: null,
        sBox2: null,
        sBox3: null,
        pArray: null,
        key: null,
        fixNegative: (number) => (number >>> 0),
        num2block32: (num) => [num >>> 24, num << 8 >>> 24, num << 16 >>> 24, num << 24 >>> 24],
        block32toNum: function(block32) {
            return this.fixNegative(block32[0] << 24 | block32[1] << 16 | block32[2] << 8 | block32[3]);
        },
        xor: function(a, b) {
            return this.fixNegative(a ^ b);
        },
        addMod32: function(a, b) {
            return this.fixNegative((a + b) | 0);
        },
        split64by32: function(block64) {
            return [this.block32toNum(block64.subarray(0, 4)), this.block32toNum(block64.subarray(4, 8))];
        },
        decryptCBC: function(data, iv) {
            let blocks = Math.ceil(data.length / 8),
                ivLivR = this.split64by32(iv),
                ivL = ivLivR[0],
                ivR = ivLivR[1],
                ivLtmp,
                ivRtmp;
            for (let i = 0; i < blocks; i++) {
                let block = data.subarray(i * 8, (i + 1) * 8);
                if (block.length < 8) throw new Error('BF: ciphertext too short (must be multiple of 8 bytes)');
                let xLxR = this.split64by32(block),
                    xL = xLxR[0],
                    xR = xLxR[1];
                ivLtmp = xL;
                ivRtmp = xR;
                xLxR = this.decipher(xL, xR);
                xL = xLxR[0];
                xR = xLxR[1];
                xL = this.xor(xL, ivL);
                xR = this.xor(xR, ivR);
                ivL = ivLtmp;
                ivR = ivRtmp;
                data.set(this.num2block32(xL), i * 8);
                data.set(this.num2block32(xR), i * 8 + 4);
            }
        },
        F: function(xL) {
            let a = xL >>> 24,
                b = xL << 8 >>> 24,
                c = xL << 16 >>> 24,
                d = xL << 24 >>> 24,
                res = this.addMod32(this.sBox0[a], this.sBox1[b]);
            res = this.xor(res, this.sBox2[c]);
            res = this.addMod32(res, this.sBox3[d]);
            return res;
        },
        encipher: function(xL, xR) {
            let tmp;
            for (let i = 0; i < 16; i++) {
                xL = this.xor(xL, this.pArray[i]);
                xR = this.xor(this.F(xL), xR);
                tmp = xL;
                xL = xR;
                xR = tmp;
            }
            tmp = xL;
            xL = xR;
            xR = tmp;
            xR = this.xor(xR, this.pArray[16]);
            xL = this.xor(xL, this.pArray[17]);
            return [xL, xR];
        },
        decipher: function(xL, xR) {
            let tmp;
            xL = this.xor(xL, this.pArray[17]);
            xR = this.xor(xR, this.pArray[16]);
            tmp = xL;
            xL = xR;
            xR = tmp;
            for (let i = 15; i >= 0; i--) {
                tmp = xL;
                xL = xR;
                xR = tmp;
                xR = this.xor(this.F(xL), xR);
                xL = this.xor(xL, this.pArray[i]);
            }
            return [xL, xR];
        },
        generateSubkeys: function(key) {
            let data = 0,
                k = 0,
                i,
                j;
            for (i = 0; i < 18; i++) {
                for (j = 4; j > 0; j--) {
                    data = this.fixNegative(data << 8 | key[k]);
                    k = (k + 1) % key.length;
                }
                this.pArray[i] = this.xor(this.pArray[i], data);
                data = 0;
            }
            let block64 = [0, 0];
            for (i = 0; i < 18; i += 2) {
                block64 = this.encipher(block64[0], block64[1]);
                this.pArray[i] = block64[0];
                this.pArray[i + 1] = block64[1];
            }
            for (i = 0; i < 256; i += 2) {
                block64 = this.encipher(block64[0], block64[1]);
                this.sBox0[i] = block64[0];
                this.sBox0[i + 1] = block64[1];
            }
            for (i = 0; i < 256; i += 2) {
                block64 = this.encipher(block64[0], block64[1]);
                this.sBox1[i] = block64[0];
                this.sBox1[i + 1] = block64[1];
            }
            for (i = 0; i < 256; i += 2) {
                block64 = this.encipher(block64[0], block64[1]);
                this.sBox2[i] = block64[0];
                this.sBox2[i + 1] = block64[1];
            }
            for (i = 0; i < 256; i += 2) {
                block64 = this.encipher(block64[0], block64[1]);
                this.sBox3[i] = block64[0];
                this.sBox3[i + 1] = block64[1];
            }
        }
    };// End Blowfish.prototype


    /* Below — message handling, downloading and other routines */

    // Browser ID3 Writer v4.0.0
    // Author:  egoroof
    // License: MIT
    // https://github.com/egoroof/browser-id3-writer
    // Minified version from https://egoroof.ru/browser-id3-writer/js/browser-id3-writer.4.0.0.js

    // JS FLACMetadataEditor v0.0.2.1
    // Author:  AHOHNMYC
    // License: GPL-3.0-or-later
    // https://greasyfork.org/scripts/40545

    /* jshint    ignore: start */
    const ID3Writer=(()=>{"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e){return String(e).split("").map(function(e){return e.charCodeAt(0)})}function r(e){return new Uint8Array(t(e))}function n(e){let r=new Uint8Array(2*e.length);return new Uint16Array(r.buffer).set(t(e)),r}function a(e){return 73===e[0]&&68===e[1]&&51===e[2]}function i(e){if(!e||!e.length)return null;if(255===e[0]&&216===e[1]&&255===e[2])return"image/jpeg";if(137===e[0]&&80===e[1]&&78===e[2]&&71===e[3])return"image/png";if(71===e[0]&&73===e[1]&&70===e[2])return"image/gif";if(87===e[8]&&69===e[9]&&66===e[10]&&80===e[11])return"image/webp";let t=73===e[0]&&73===e[1]&&42===e[2]&&0===e[3],r=77===e[0]&&77===e[1]&&0===e[2]&&42===e[3];return t||r?"image/tiff":66===e[0]&&77===e[1]?"image/bmp":0===e[0]&&0===e[1]&&1===e[2]&&0===e[3]?"image/x-icon":null}function s(e){return[e>>>24&255,e>>>16&255,e>>>8&255,255&e]}function o(e){return[e>>>21&127,e>>>14&127,e>>>7&127,127&e]}function c(e){return(e[0]<<21)+(e[1]<<14)+(e[2]<<7)+e[3]}function u(e){return 11+e}function f(e){return 13+2*e}function h(e,t){return 16+2*e+2+2+2*t}function p(e,t,r,n){return 11+t+1+1+(n?2+2*(r+1):r+1)+e}function l(e,t){return 16+2*e+2+2+2*t}function g(e,t){return 13+2*e+2+2+2*t}function m(e){return 10+e}return function(){function t(r){if(e(this,t),!(r&&"object"==typeof r&&"byteLength"in r))throw new Error("First argument should be an instance of ArrayBuffer or Buffer");this.arrayBuffer=r,this.padding=4096,this.frames=[],this.url=""}return t.prototype._setIntegerFrame=function(e,t){let r=parseInt(t,10);this.frames.push({name:e,value:r,size:u(r.toString().length)})},t.prototype._setStringFrame=function(e,t){let r=t.toString();this.frames.push({name:e,value:r,size:f(r.length)})},t.prototype._setPictureFrame=function(e,t,r,n){let a=i(new Uint8Array(t)),s=r.toString();if(!a)throw new Error("Unknown picture MIME type");r||(n=!1),this.frames.push({name:"APIC",value:t,pictureType:e,mimeType:a,useUnicodeEncoding:n,description:s,size:p(t.byteLength,a.length,s.length,n)})},t.prototype._setLyricsFrame=function(e,t){let r=e.toString(),n=t.toString();this.frames.push({name:"USLT",value:n,description:r,size:h(r.length,n.length)})},t.prototype._setCommentFrame=function(e,t){let r=e.toString(),n=t.toString();this.frames.push({name:"COMM",value:n,description:r,size:l(r.length,n.length)})},t.prototype._setUserStringFrame=function(e,t){let r=e.toString(),n=t.toString();this.frames.push({name:"TXXX",description:r,value:n,size:g(r.length,n.length)})},t.prototype._setUrlLinkFrame=function(e,t){let r=t.toString();this.frames.push({name:e,value:r,size:m(r.length)})},t.prototype.setFrame=function(e,t){switch(e){case"TPE1":case"TCOM":case"TCON":if(!Array.isArray(t))throw new Error(e+" frame value should be an array of strings");let r="TCON"===e?";":"/",n=t.join(r);this._setStringFrame(e,n);break;case"TIT2":case"TALB":case"TPE2":case"TPE3":case"TPE4":case"TRCK":case"TPOS":case"TMED":case"TPUB":this._setStringFrame(e,t);break;case"TBPM":case"TLEN":case"TYER":this._setIntegerFrame(e,t);break;case"USLT":if(!("object"==typeof t&&"description"in t&&"lyrics"in t))throw new Error("USLT frame value should be an object with keys description and lyrics");this._setLyricsFrame(t.description,t.lyrics);break;case"APIC":if(!("object"==typeof t&&"type"in t&&"data"in t&&"description"in t))throw new Error("APIC frame value should be an object with keys type, data and description");if(t.type<0||t.type>20)throw new Error("Incorrect APIC frame picture type");this._setPictureFrame(t.type,t.data,t.description,!!t.useUnicodeEncoding);break;case"TXXX":if(!("object"==typeof t&&"description"in t&&"value"in t))throw new Error("TXXX frame value should be an object with keys description and value");this._setUserStringFrame(t.description,t.value);break;case"TKEY":if(!/^([A-G][#b]?m?|o)$/.test(t))throw new Error(e+" frame value should be like Dbm, C#, B or o");this._setStringFrame(e,t);break;case"WCOM":case"WCOP":case"WOAF":case"WOAR":case"WOAS":case"WORS":case"WPAY":case"WPUB":this._setUrlLinkFrame(e,t);break;case"COMM":if(!("object"==typeof t&&"description"in t&&"text"in t))throw new Error("COMM frame value should be an object with keys description and text");this._setCommentFrame(t.description,t.text);break;default:throw new Error("Unsupported frame "+e)}return this},t.prototype.removeTag=function(){if(!(this.arrayBuffer.byteLength<10)){let e=new Uint8Array(this.arrayBuffer),t=e[3],r=c([e[6],e[7],e[8],e[9]])+10;!a(e)||t<2||t>4||(this.arrayBuffer=new Uint8Array(e.subarray(r)).buffer)}},t.prototype.addTag=function(){this.removeTag();let e=[255,254],t=[101,110,103],a=10+this.frames.reduce(function(e,t){return e+t.size},0)+this.padding,i=new ArrayBuffer(this.arrayBuffer.byteLength+a),c=new Uint8Array(i),u=0,f=[];return f=[73,68,51,3],c.set(f,u),u+=f.length,u++,u++,f=o(a-10),c.set(f,u),u+=f.length,this.frames.forEach(function(a){switch(f=r(a.name),c.set(f,u),u+=f.length,f=s(a.size-10),c.set(f,u),u+=f.length,u+=2,a.name){case"WCOM":case"WCOP":case"WOAF":case"WOAR":case"WOAS":case"WORS":case"WPAY":case"WPUB":f=r(a.value),c.set(f,u),u+=f.length;break;case"TPE1":case"TCOM":case"TCON":case"TIT2":case"TALB":case"TPE2":case"TPE3":case"TPE4":case"TRCK":case"TPOS":case"TKEY":case"TMED":case"TPUB":f=[1].concat(e),c.set(f,u),u+=f.length,f=n(a.value),c.set(f,u),u+=f.length;break;case"TXXX":case"USLT":case"COMM":f=[1],"USLT"!==a.name&&"COMM"!==a.name||(f=f.concat(t)),f=f.concat(e),c.set(f,u),u+=f.length,f=n(a.description),c.set(f,u),u+=f.length,f=[0,0].concat(e),c.set(f,u),u+=f.length,f=n(a.value),c.set(f,u),u+=f.length;break;case"TBPM":case"TLEN":case"TYER":u++,f=r(a.value),c.set(f,u),u+=f.length;break;case"APIC":f=[a.useUnicodeEncoding?1:0],c.set(f,u),u+=f.length,f=r(a.mimeType),c.set(f,u),u+=f.length,f=[0,a.pictureType],c.set(f,u),u+=f.length,a.useUnicodeEncoding?(f=[].concat(e),c.set(f,u),u+=f.length,f=n(a.description),c.set(f,u),u+=f.length,u+=2):(f=r(a.description),c.set(f,u),u+=f.length,u++),c.set(new Uint8Array(a.value),u),u+=a.value.byteLength}}),u+=this.padding,c.set(new Uint8Array(this.arrayBuffer),u),this.arrayBuffer=i,i},t.prototype.getBlob=function(){return new Blob([this.arrayBuffer],{type:"audio/mpeg"})},t.prototype.getURL=function(){return this.url||(this.url=URL.createObjectURL(this.getBlob())),this.url},t.prototype.revokeURL=function(){URL.revokeObjectURL(this.url)},t}()})();
    const FLACMetadataEditor=(()=>{"use strict";const t="0.0.2.1";class VorbisComment extends Array{}class VorbisCommentPacket{_addComment(t){const e=t.split("=")[1];return t=t.split("=")[0].toUpperCase(),this.hasOwnProperty(t)||(this[t]=new VorbisComment),this[t].some(t=>t===e)||this[t].push(e.toString()),this}toStringArray(){const t=[];return Object.keys(this).sort().forEach(e=>{this[e].forEach(s=>{t.push(e+"="+s)})}),t}}class FLACMetadataBlockData{}class FLACMetadataBlock{constructor(){this.blockType="",this.blockTypeNubmer=0,this.blockSize=0,this.data=new FLACMetadataBlockData,this.offset=0}get serializedSize(){switch(this.blockType){case"STREAMINFO":return 34;case"PADDING":return this.blockSize;case"APPLICATION":return 4+this.data.applicationData.length;case"SEEKTABLE":return 18*this.data.points.length;case"VORBIS_COMMENT":const t=this.data.comments.toStringArray().reduce((t,e)=>t+4+e.toUTF8().length,0);return 4+this.data.vendorString.length+4+t;case"CUESHEET":return 0;case"PICTURE":return 8+this.data.MIMEType.toUTF8().length+4+this.data.description.toUTF8().length+4+4+4+4+4+this.data.data.length}}}class FLACMetadataBlocks extends Array{}class FLACMetadata{constructor(){this.blocks=new FLACMetadataBlocks,this.framesOffset=0,this.signature=""}}return class{get scriptVersion(){return t}constructor(t){if(!(t&&"object"==typeof t&&"byteLength"in t))throw new Error("First argument should be an instance of ArrayBuffer or Buffer");return this.arrayBuffer=t,this.metadata=new FLACMetadata,String.prototype.toUTF8=function(t=null){return(new TextEncoder).encode(t||this)},this._parseMetadata(),this}_getBytesAsNumber(t,e=0,s=t.length-e){return Array.from(t.subarray(e,e+s)).reduce((t,e)=>t=256*t+e,0)}_getBytesAsNumberLittleEndian(t,e=0,s=t.length-e){return Array.from(t.subarray(e,e+s)).reduceRight((t,e)=>t=256*t+e,0)}_getBytesAsHexString(t,e=0,s=t.length-e){return Array.from(t.subarray(e,e+s)).map(t=>(t>>4).toString(16)+(15&t).toString(16)).join("")}_getBytesAsUTF8String(t,e=0,s=t.length-e){return(new TextDecoder).decode(t.subarray(e,e+s))}_getBlockType(t){switch(t){case 0:return"STREAMINFO";case 1:return"PADDING";case 2:return"APPLICATION";case 3:return"SEEKTABLE";case 4:return"VORBIS_COMMENT";case 5:return"CUESHEET";case 6:return"PICTURE";case 127:return"invalid, to avoid confusion with a frame sync code";default:return"reserved"}}_uint32ToUint8Array(t){return[t>>>24&255,t>>>16&255,t>>>8&255,255&t]}_uint24ToUint8Array(t){return[t>>>16&255,t>>>8&255,255&t]}_uint16ToUint8Array(t){return[t>>>8&255,255&t]}_hexStringToUint8Array(t){return t.replace(/(\w\w)/g,"$1,").slice(0,-1).split(",").map(t=>(parseInt(t[0],16)<<4)+parseInt(t[1],16))}get _vorbisComment(){const t=this.metadata.blocks.find(t=>"VORBIS_COMMENT"===t.blockType);if(t)return t.data}addComment(t,e=null){if(t){if(!e){const s=t.split("=");if(!s[1])return this;e=s[1],t=s[0]}t=t.toUpperCase(),this._vorbisComment.comments.hasOwnProperty(t)||(this._vorbisComment.comments[t]=new VorbisComment),this._vorbisComment.comments[t].find(t=>t===e)||this._vorbisComment.comments[t].push(e.toString())}return this}removeComment(t=null,e=null){return t?(t=t.toUpperCase(),e?(e=e.toString(),this.hasOwnProperty(t)&&(this._vorbisComment.comments[t]=this._vorbisComment.comments[t].filter(t=>t!==e))):delete this._vorbisComment.comments[t]):Object.keys(this._vorbisComment.comments).forEach(t=>delete this._vorbisComment.comments[t]),this}getComment(t){return this._vorbisComment.comments[t.toUpperCase()]}addPicture(t){if(!(t.data&&t.data&&"object"==typeof t.data&&"byteLength"in t.data))throw new Error('Field "data" should be an instance of ArrayBuffer or Buffer');t.data=new Uint8Array(t.data);const e={APICtype:3,MIMEType:"image/jpeg",colorDepth:0,colorNumber:0,data:new Uint8Array([]),description:"",width:0,height:0},s=new FLACMetadataBlock;s.blockTypeNubmer=6,s.blockType="PICTURE";for(let r in e)t[r]?s.data[r]=t[r]:s.data[r]=e[r];const r=this.metadata.blocks;let a=r.length;return"PADDING"===r[r.length-1].blockType&&a--,r.splice(a,0,s),this.metadata.blocks=r,this}_serializeMetadataBlock(t){const e=new Uint8Array(t.serializedSize),s=t.data;let r=0;switch(t.blockType){case"STREAMINFO":e.set(this._uint16ToUint8Array(s.minBlockSize)),r+=2,e.set(this._uint16ToUint8Array(s.maxBlockSize),r),r+=2,e.set(this._uint24ToUint8Array(s.minFrameSize),r),r+=3,e.set(this._uint24ToUint8Array(s.maxFrameSize),r),r+=3,e.set(this._uint24ToUint8Array((s.sampleRate<<4)+(s.numberOfChannels-1<<1)+(s.bitsPerSample-1>>4)),r),e[r+=3]=((s.bitsPerSample-1&15)<<4)+(15&Math.trunc(s.totalSamples/Math.pow(2,32))),r+=1,e.set(this._uint32ToUint8Array(s.totalSamples),r),r+=4,e.set(this._hexStringToUint8Array(s.rawMD5),r);break;case"PADDING":break;case"APPLICATION":e.set(s.applicationID.toUTF8()),r+=4,e.set(s.applicationData,r);break;case"SEEKTABLE":s.points.forEach(t=>{e.set(this._hexStringToUint8Array(t.sampleNumber),r),e.set(this._hexStringToUint8Array(t.offset),r+8),e.set(this._hexStringToUint8Array(t.numberOfSamples),r+16),r+=18});break;case"VORBIS_COMMENT":e.set(this._uint32ToUint8Array(s.vendorString.toUTF8().length).reverse(),r),r+=4,e.set(s.vendorString.toUTF8(),r),r+=s.vendorString.toUTF8().length;const a=s.comments.toStringArray();e.set(this._uint32ToUint8Array(a.length).reverse(),r),r+=4,a.forEach(t=>{e.set(this._uint32ToUint8Array(t.toUTF8().length).reverse(),r),r+=4,e.set(t.toUTF8(),r),r+=t.toUTF8().length});break;case"CUESHEET":break;case"PICTURE":e.set(this._uint32ToUint8Array(s.APICtype)),r+=4,e.set(this._uint32ToUint8Array(s.MIMEType.toUTF8().length),r),r+=4,e.set(s.MIMEType.toUTF8(),r),r+=s.MIMEType.toUTF8().length,e.set(this._uint32ToUint8Array(s.description.toUTF8().length),r),r+=4,e.set(s.description.toUTF8(),r),r+=s.description.toUTF8().length,e.set(this._uint32ToUint8Array(s.width),r),r+=4,e.set(this._uint32ToUint8Array(s.height),r),r+=4,e.set(this._uint32ToUint8Array(s.colorDepth),r),r+=4,e.set(this._uint32ToUint8Array(s.colorNumber),r),r+=4,e.set(this._uint32ToUint8Array(s.data.length),r),r+=4,e.set(s.data,r)}return e}serializeMetadata(){const t=4+this.metadata.blocks.reduce((t,e)=>t+4+e.serializedSize,0)+(this.arrayBuffer.byteLength>this.metadata.framesOffset?this.arrayBuffer.byteLength-this.metadata.framesOffset:0),e=new Uint8Array(t);e.set(this.metadata.signature.toUTF8());let s=4,r=!1;return this.metadata.blocks.forEach((t,a,i)=>{i.length-1===a&&(r=!0),e[s]=t.blockTypeNubmer|r<<7,s+=1,e.set(this._uint24ToUint8Array(t.serializedSize),s),s+=3,e.set(this._serializeMetadataBlock(t),s),s+=t.serializedSize}),e.set(new Uint8Array(this.arrayBuffer).subarray(this.metadata.framesOffset),s),this.arrayBuffer=e.buffer,this}_parseMetadataBlock(t,e,s,r){const a=t.subarray(e,e+r);let i=0;const n=new FLACMetadataBlockData;switch(s){case"STREAMINFO":n.minBlockSize=this._getBytesAsNumber(a,i,2),i+=2,n.maxBlockSize=this._getBytesAsNumber(a,i,2),i+=2,n.minFrameSize=this._getBytesAsNumber(a,i,3),i+=3,n.maxFrameSize=this._getBytesAsNumber(a,i,3),i+=3,n.sampleRate=this._getBytesAsNumber(a,i,3)>>4,i+=2,n.numberOfChannels=1+(a[i]>>1&7),n.bitsPerSample=1+((1&a[i])<<4)+(a[i+1]>>4),i+=1,n.totalSamples=(15&a[i])*Math.pow(2,32)+this._getBytesAsNumber(a,i+1,4),i+=5,n.rawMD5=this._getBytesAsHexString(a,i,16).toUpperCase();break;case"PADDING":break;case"APPLICATION":n.applicationID=this._getBytesAsUTF8String(a,i,4),i+=4,n.applicationData=a.subarray(i);break;case"SEEKTABLE":n.pointCount=r/18,n.points=[];for(let t=0;t<n.pointCount;t++)n.points.push({sampleNumber:this._getBytesAsHexString(a,i,8),offset:this._getBytesAsHexString(a,i+8,8),numberOfSamples:this._getBytesAsHexString(a,i+16,2)}),i+=18;break;case"VORBIS_COMMENT":const t=this._getBytesAsNumberLittleEndian(a,i,4);i+=4,n.vendorString=this._getBytesAsUTF8String(a,i,t),i+=t;const e=this._getBytesAsNumberLittleEndian(a,i,4);i+=4,n.comments=new VorbisCommentPacket;let o=0;for(let t=0;t<e;t++)o=this._getBytesAsNumberLittleEndian(a,i,4),i+=4,n.comments._addComment(this._getBytesAsUTF8String(a,i,o)),i+=o;break;case"CUESHEET":break;case"PICTURE":n.APICtype=this._getBytesAsNumber(a,i,4),i+=4;const h=this._getBytesAsNumber(a,i,4);i+=4,n.MIMEType=this._getBytesAsUTF8String(a,i,h),i+=h;const c=this._getBytesAsNumber(a,i,4);i+=4,n.description=this._getBytesAsUTF8String(a,i,c),i+=c,n.width=this._getBytesAsNumber(a,i,4),i+=4,n.height=this._getBytesAsNumber(a,i,4),i+=4,n.colorDepth=this._getBytesAsNumber(a,i,4),i+=4,n.colorNumber=this._getBytesAsNumber(a,i,4),i+=4;const m=this._getBytesAsNumber(a,i,4);i+=4,n.data=a.subarray(i,i+m)}return n}_parseMetadata(){const t=new Uint8Array(this.arrayBuffer);this.metadata.signature=this._getBytesAsUTF8String(t,0,4);let e,s=4,r=!1,a=0;for(;!r&&s<t.length;){if(a++>42)throw new RangeError("Too much METADATA_BLOCKS. Looks like file corrupted");(e=new FLACMetadataBlock).offset=s,r=!!(t[s]>>7),e.blockTypeNubmer=127&t[s],e.blockType=this._getBlockType(e.blockTypeNubmer),s+=1,e.blockSize=this._getBytesAsNumber(t,s,3),s+=3,e.data=this._parseMetadataBlock(t,s,e.blockType,e.blockSize),s+=e.blockSize,this.metadata.blocks.push(e)}return this.metadata.framesOffset=s,this}}})();
    /* jshint    ignore: end */

    // Inner, in worker scope debug. Rewrites later
    let DEBUG = true;
    let coverSize = 1200;
    let coverQuality = 80;


    this.onmessage = ({data: data}) => {
        if (data.hasOwnProperty('debug')) {
            DEBUG = data.debug;
            coverSize = data.coverSize;
            coverQuality = data.coverQuality;
            return true;
        }

        if (DEBUG) console.info('Worker got message:', data);


        const url = data.url;
        const key = data.key;
        const trackData = data.trackData;
        const tags = data.tags;
        const azLyrics = data.azLyrics;
        const albumData = data.albumData;

        // config:  url, responseType, onProgress, onSuccess, anyway
        function niceXhr(config) {
            const xhr = new XMLHttpRequest();
            xhr.responseType = config.responseType;
            xhr.onload = e=>{
                if (200 === e.target.status)
                    config.onSuccess(e.target.response);
                else
                    console.warn('Error with getting data from', e.target.responseURL);
                config.anyway();
            };
            xhr.onerror = config.anyway;
            xhr.onabort = config.anyway;
            xhr.onprogress = config.onProgress;
            xhr.open('GET', config.url);
            xhr.send();
        }


        postMessage([trackData, '^waiting']);

        niceXhr({
            url: url,
            responseType: 'arraybuffer',
            onProgress: e=>{
                const toMB = bytes=>(bytes/1024/1024).toFixed(2);
                const loaded = toMB(e.loaded);
                if (e.lengthComputable) {
                    const total = toMB(e.total);
                    const percent = Math.floor(100 * e.loaded / e.total);
                    postMessage([trackData, `^downloading ${loaded}/${total}^mb : ${percent}%`]);
                } else {
                    postMessage([trackData, `^downloading ${loaded}^mb`]);
                }
            },
            onSuccess: response=>{
                postMessage([trackData,'^decrypting']);
                let data = new Uint8Array(response);
                const bf = new Blowfish(key);
                const iv = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
                const L = data.length;
                if (DEBUG) console.info('Data length:', data.length);
                for (let i = 0; i < L; i += 6144) {
                    if (i % (6144 * 20) === 6144 * 19){ // let it display state at every 120K
                        const percent = Math.floor(i * 100.0 / L);
                        postMessage([trackData, `^decrypting ${percent}%`]);
                    }
                    if (i + 2048 <= L) {
                        let D = data.subarray(i, i + 2048);
                        // if (i===0) console.log(D.toString(), D.length);
                        bf.decryptCBC(D, iv);
                        data.set(D, i);
                    }
                }
                function binArr2utfStr(arr) { return Array.from(arr).map(n=>String.fromCharCode(n)).join(''); }
                // According https://en.wikipedia.org/wiki/List_of_file_signatures
                const isMP3 = (data[0] === 0xFF && data[1] === 0xFB) || 'ID3' === binArr2utfStr(data.subarray(0,3));
                const isFLAC = 'fLaC' === binArr2utfStr(data.subarray(0,4));

                if (!(isMP3 || isFLAC)) return console.warn('Decrypted file not MP3 nor FLAC!', data);

                let writer;
                if (isMP3) {
                    writer = new ID3Writer(data);
                    writer.setFrame('TIT2', tags.title)
                        .setFrame('TPE1', tags._artistsArray)
                        .setFrame('TALB', tags.album)
                        // TODO: wait answer: https://github.com/egoroof/browser-id3-writer/issues/52
                        // .setFrame('TSRC', tags.isrc)
                        .setFrame('WOAS', `https://deezer.com/track/${tags.id}`);
                    if (tags.track)
                        writer.setFrame('TRCK', tags.track);

                    if (albumData.label)
                        writer.setFrame('TPUB', albumData.label);
                    if (albumData.release_date)
                        writer.setFrame('TYER', albumData.release_date);

                    if (azLyrics.lyrics)
                        writer.setFrame('USLT', {
                            description: '',
                            lyrics: azLyrics.lyrics
                        });
                    // if (azLyrics.year)
                    //     writer.setFrame('TYER', azLyrics.year);
                }
                if (isFLAC) {
                    writer = new FLACMetadataEditor(data);
                    writer.removeComment()
                        .addComment('ALBUM',    tags.album)
                        .addComment('TITLE',    tags.title)
                        .addComment('ISRC',     tags.isrc)
                        .addComment('URL',      `https://deezer.com/track/${tags.id}`);
                    tags._artistsArray.forEach(artist => writer.addComment('ARTIST', artist));
                    if (tags.track)
                        writer.addComment('TRACKNUMBER', tags.track);

                    if (albumData.label)
                        writer.addComment('ORGANIZATION', albumData.label);
                    if (albumData.release_date)
                        writer.addComment('DATE', albumData.release_date);

                    // At first i thought that GAIN is for ReplayGain, but my player returns other values,
                    // So now i don't know what is it ~
                    // if (tags.gain) writer.addComment('REPLAYGAIN_TRACK_GAIN', `${tags.replayGain} dB`);
                    if (azLyrics.lyrics)
                        writer.addComment('LYRICS', azLyrics.lyrics);
                    // if (azLyrics.year)
                    //     writer.addComment('DATE', azLyrics.year);
                }

                // Downloading cover
                const coverLink = `https://e-cdns-images.dzcdn.net/images/cover/${tags.cover}/${coverSize}x${coverSize}-000000-${coverQuality}-0-0.jpg`;
                if (DEBUG) console.info('Trying to download', coverLink );
                postMessage([trackData,'^coverDownloading']);
                niceXhr({
                    url: coverLink,
                    responseType: 'arraybuffer',
                    onProgress: e=>{
                        const toMB = bytes=>(bytes/1024/1024).toFixed(2);
                        const loaded = toMB(e.loaded);
                        if (e.lengthComputable) {
                            const total = toMB(e.total);
                            const percent = Math.floor(100 * e.loaded / e.total);
                            postMessage([trackData, `^downloading ${loaded}/${total}^mb : ${percent}%`]);
                        } else {
                            postMessage([trackData, `^downloading ${loaded}^mb`]);
                        }
                    },
                    onSuccess: imageData=> {
                        if (isMP3) {
                            writer.setFrame('APIC', {
                                type: 3,
                                data: imageData,
                                description: ''
                            });
                        }
                        if (isFLAC) {
                            writer.addPicture({
                                data: imageData,
                                colorDepth: 24,
                                width: coverSize,
                                height: coverSize
                            });
                        }
                    },
                    anyway: ()=> {
                        if (isMP3)
                            writer.addTag();
                        if (isFLAC)
                            writer.serializeMetadata();
                        data = writer.arrayBuffer;

                        const blobUrl = URL.createObjectURL(new Blob([data], {
                            type: (isMP3 ? 'audio/mpeg' : isFLAC ? 'audio/flac' : 'audio/mpeg')
                        }));

                        if (DEBUG) console.info('Blob for "%s - %s" created: %s', tags.artist, tags.title, blobUrl);
                        postMessage([trackData, 'DONE', blobUrl]);
                    }
                });
            },
            anyway: ()=>{}
        });

    };

});//End var mainWk


// Set debug and other values in worker like in script
mainWk.postMessage({
    debug: DEBUG,
    coverSize: coverSize,
    coverQuality: coverQuality,
});


// azLyrics parser
function azLyrics(artist, title, onsuccess, anyway) {
    const url = formatAzLyricsUrl(artist, title);
    if (!url) return anyway();

    const data = {
        method: 'GET',
        url: url,
        onload: e=>{
            if (200 === e.status)
                onsuccess(parseAzLyricsPage(e.response));
            else
                console.warn('Cannot grab lyrics from', e.finalUrl);
            anyway();
        },
        onerror: anyway,
        onabort: anyway
    };

    // Greasemonkey with their 4.0 API became a monster ~
    if (typeof GM !== 'undefined' && typeof GM.xmlHttpRequest !== 'undefined')
        GM.xmlHttpRequest(data);
    else
        GM_xmlhttpRequest(data);
}
function parseAzLyricsPage(text) {
    const azPage = new DOMParser().parseFromString(text, 'text/html');
    const data = {};
    const divs = Array.from(azPage.getElementsByTagName('div'));
    const lyricsDiv = divs.find(div=>div.innerHTML.substr(1,4) === '<!--');
    const lyrics = lyricsDiv.textContent;
    data.lyrics = lyrics.replace(/^\s*/,'').replace(/\s*$/,''); // clean spaces and new lines in begin and end

    const album = azPage.querySelector('.album-panel a[data-toggle]');
    if (album) {
        const matches = album.textContent.match(/"([^"]+)" \((\d+)\)/);
        data.album = matches[1];
        data.year = +matches[2];
    }
    return data;
}
function formatAzLyricsUrl(artist, title) {
    const partOfUrl = [artist, title].map(el=>el.toLowerCase().replace(/[^\w]/g,'')).join('/').replace(/^the/,'');
    if (partOfUrl === '/') return false;
    return `https://www.azlyrics.com/lyrics/${partOfUrl}.html`;
}


// DOWNLOADER LOGIC: URL ENCRYPTION
function zeroPad(data) {
    const aesBS = 16;
    const l = data.length;
    if (l % aesBS !== 0)
        data += '\0'.repeat(aesBS - (l % aesBS));
    return data;
}

function encryptURL(track, fmt) {
    const urlsep = '\xa4';
    const key = aesjs.utils.utf8.toBytes('jo6aey6haid2Teih');
    const cryptor = new aesjs.ModeOfOperation.ecb(key);

    let steps = [track.MD5_ORIGIN, fmt, track.SNG_ID, track.MEDIA_VERSION].join(urlsep);
    steps = [hex_md5(steps), steps, ''].join(urlsep);
    steps = zeroPad(steps);
    // This not works because it translates `urlsep' as two symbols
    // steps = aesjs.utils.utf8.toBytes(steps);
    // That's why we use this:
    steps = steps.split('').map(c => c.charCodeAt(0)); // str2bin
    steps = cryptor.encrypt(steps);
    steps = aesjs.utils.hex.fromBytes(steps);
    return steps;
}

// DOWNLOADER LOGIC: GLOBAL VARIABLES AND HELPER METHODS
const fmtMp3_32 = 11, fmtMp3_64 = 10, fmtMp3_128 = 1, fmtMp3_320 = 3, fmtFLAC = 9;
const trackDB = {};
const urlDB = {};
if (!localStorage.dlNameProto)
    unsafeWindow.localStorage.dlNameProto = '%NN. %Artists - %Title %Version';
if (!localStorage.dlAzLyrics)
    unsafeWindow.localStorage.dlAzLyrics = true;

function generateName(track, format = null) {
    const tags = dzTags(track);
    const nameProto = elNameProto.value;

    let name = nameProto.replace(/%(\w+)/g, (full, keyword)=> {
        let replacement = '';

        if (/^n+$/i.test(keyword)) {
            if (!tags.track) return '';
            // Replace `NNNNN' to track number padded with zeroes
            let rept = keyword.length - (tags.track).toString().length;
            if (rept < 0) rept = 0;
            return '0'.repeat(rept) + tags.track;

        } else if (tags.hasOwnProperty(keyword.toLowerCase())) {
            // Finded in dzTags values
            replacement = tags[keyword.toLowerCase()];
            if (!replacement) return '';

            if (keyword === keyword.toLowerCase())
                replacement = replacement.toLowerCase();
            if (keyword === keyword.toUpperCase())
                replacement = replacement.toUpperCase();
            return replacement;

        } else {
            return full;
        }
    });

    // remove escaping slashes
    name = name.replace(/\\%/g, '%');
    // remove trailing and starting spaces
    name = name.replace(/\s*(.*[^\s])\s*/, '$1');

    if (format) {
        if (format === fmtFLAC)
            name += '.flac';
        else
            name += '.mp3';
    }
    return name;
}

function updateNames() {
    const trackNameEls = document.querySelectorAll('.dlTrackName');
    trackNameEls.forEach( nameEl=> {
        const nbsp = '\u00A0';
        const trackId = nameEl.closest('.dlTrack').dataset.trackId;
        nameEl.textContent = generateName(trackDB[trackId]).replace(/\s/g, nbsp);
    });
}

// CONVERT TIME into min:sec
function formatTime(seconds) {
    const minutes = Math.floor(seconds/60);
    seconds %= 60;
    const zeroPad = seconds<10 ? '0' : '';
    return `${minutes}:${zeroPad}${seconds}`;
}

// FILES TAGS
function dzTags(trackInfo) {
    // `new Set' is needed to unique atrists. e.g. https://deezer.com/album/6883271
    const artistsArray = trackInfo.ARTISTS && GM_info.scriptHandler !== 'Greasemonkey' ? [...new Set(trackInfo.ARTISTS.map(a=>a.ART_NAME))] : [trackInfo.ART_NAME];
    return {
        artist:     trackInfo.ART_NAME,
        _artistsArray: artistsArray,
        artists:    artistsArray.join(', '),
        album:      trackInfo.ALB_TITLE,
        album_id:   trackInfo.ALB_ID,
        cover:      trackInfo.ALB_PICTURE,
        disk:       trackInfo.DISK_NUMBER,
        // by name, it's have to be ReplayGain value. But in fact, this is something other ~
        // looks like https://en.wikipedia.org/wiki/Audio_normalization#Peak_normalization
        // http://wiki.hydrogenaud.io/index.php?title=ReplayGain
        gain:       trackInfo.GAIN,
        id:         trackInfo.SNG_ID,
        // ISO 3901:1986 International Standard Recording Code (ISRC). Technical committee / subcommittee: TC 46 / SC 9
        isrc:       trackInfo.ISRC,
        time:       formatTime( trackInfo.DURATION ),
        title:      trackInfo.SNG_TITLE,
        track:      trackInfo.TRACK_NUMBER,
        version:    trackInfo.VERSION
    };
}

const bfGK = 'g4el58wc0zvf9na1';

function bfGenKey(id) {
    const hash = hex_md5(id.toString());
    const key = new Uint8Array(16);
    for (let i = 0; i < 16; i++)
        key[i] = bfGK.charCodeAt(i) ^ hash.charCodeAt(i) ^ hash.charCodeAt(i+16);
    return key;
}


function fileSizeToMb(aSize) {
    return isNaN(aSize) ? 0 : Math.round(aSize /1024/1024 * 10)/10;
}

// DOWNLOAD ENTRY POINT
function dzDownload(track, trackId, fmt) {
    const tags = dzTags(track);
    const trackData = {
        trackId: trackId,
        fmt: fmt
    };
    let albumData = {};
    let azLyricsData = {};

    function processTrack() {
        mainWk.postMessage({
            url: `https://e-cdns-proxy-${track.MD5_ORIGIN[0]}.dzcdn.net/mobile/1/${encryptURL(track, fmt)}`,
            key: bfGenKey(track.SNG_ID),
            trackData: trackData,
            tags: dzTags(track),
            azLyrics: azLyricsData,
            albumData: albumData
        });
    }

    function getAlbumData() {
        messageProcessor({data: [trackData, translate.gettingAlbumInfo]});
        niceXhr({
            url: `https://api.deezer.com/album/${tags.album_id}`,
            responseType: 'json',
            onProgress: ()=>{},
            onSuccess: json=> {
                albumData.label = json.label;
                albumData.release_date = json.release_date;
            },
            anyway: processTrack
        });
    }

    if (elAzLyrics.checked) {
        messageProcessor({data: [trackData, translate.lyricsDownloading]});

        azLyrics(tags.artist, tags.title,
            data=>{
                if (DEBUG) console.info(data);
                azLyricsData=data;
            },
            getAlbumData
        );
    } else {
        getAlbumData();
    }

}

// DOWNLOADER WORKER CALLBACK
function messageProcessor(msg) {
    const fmt = +msg.data[0].fmt;
    const trackId = msg.data[0].trackId;
    let trackEl = document.querySelector(`.dlTrack[data-track-id="${trackId}"]`);
    if (!trackEl)
        console.warn('Downloaded track not found in track list!');

    const state = msg.data[1];

    switch (state) {
        case 'DONE':
            if (!urlDB[trackId]) urlDB[trackId] = {};
            urlDB[trackId][fmt] = msg.data[2];

            let anchor;
            if (trackEl) {
                anchor = trackEl.querySelector(`.dlLink[data-fmt="${fmt}"]`);
            } else {
                // create new temporary link element if container not found
                anchor = document.head.appendChild(document.createElement('a'));
            }
            anchor.download = generateName(trackDB[trackId], fmt);
            anchor.href = msg.data[2];
            anchor.click();
            // remove temporary link
            if (!trackEl) anchor.remove();
            break;
        case 'ABORT':
            console.error('Download abort:', trackId, fmt);
            break;
        case 'ERROR':
            console.error('Download ERROR!', trackId, fmt);
            break;
        default:
            const message = translateCircumstring(state);
            if (trackEl) {
                trackEl.querySelector('.dlTrackLinks').classList.add('hidden');
                trackEl.querySelector('.dlTrackStatus').classList.remove('hidden');
                trackEl.querySelector('.dlTrackStatus').textContent = message;
            } else {
                const tags = dzTags(trackDB[trackId]);
                console.info('%s - %s: %s', tags.artist, tags.title, message);
            }
            return;
    }
    if (trackEl) {
        trackEl.querySelector('.dlTrackLinks').classList.remove('hidden');
        trackEl.querySelector('.dlTrackStatus').classList.add('hidden');
    }
}
mainWk.onmessage = messageProcessor;

// DOWNLOADER LOGIC: HTML GENERATOR
function getFilesize(track, fmt_name) {
    const sizeProp = `FILESIZE_${fmt_name}`;
    let size = 0;
    if (track[sizeProp] && !isNaN(track[sizeProp]))
        size = +track[sizeProp];
    return size;
}

function generateDlLink(track, fmt_name, fmt_id, size) {
    const trackId = track.SNG_ID;
    const el = document.createElement('a');
    el.classList.add('dlLink');
    el.dataset.fmt = fmt_id;
    el.textContent = `⬇ ${fmt_name}`;
    el.title = `${fileSizeToMb(size).toLocaleString()} ${translate.mb}`;
    if (urlDB[trackId] && urlDB[trackId][fmt_id]) {
        el.download = generateName(trackDB[trackId], fmt_id);
        el.href = urlDB[trackId][fmt_id];
    }
    el.onclick = function() {
        if (this.href)
            return true;

        const trackId = this.closest('.dlTrack').dataset.trackId;
        const fmt = this.dataset.fmt;
        dzDownload(trackDB[trackId], trackId, fmt);
        return false;
    };
    return el;
}

function generateDlTrack(track) {
    const tags = dzTags(track);
    const infosTooltips =
        '^artist:\t' + tags.artist +
        '\n^title:\t' + tags.title +
        '\n^album:\t' + tags.album +      // disk number sometimes not recognized when change track playing ????
        '\n^duration:\t' + tags.time;

    const trackEl = document.createElement('div');
    trackEl.classList.add('dlTrack');
    trackEl.dataset.trackId = tags.id;

    const nameEl = document.createElement('span');
    nameEl.classList.add('dlTrackName');
    nameEl.title = translateCircumstring(infosTooltips);

    const linksEl = document.createElement('div');
    linksEl.classList.add('dlTrackLinks');
    if (showMp3_32)  if (getFilesize(track, 'MP3_32')  > 0) linksEl.appendChild(generateDlLink(track, 'mp3 32', fmtMp3_32, getFilesize(track, 'MP3_32')));
    if (showMp3_64)  if (getFilesize(track, 'MP3_64')  > 0) linksEl.appendChild(generateDlLink(track, 'mp3 64', fmtMp3_64, getFilesize(track, 'MP3_64')));
    if (showMp3_128) if (getFilesize(track, 'MP3_128') > 0) linksEl.appendChild(generateDlLink(track, 'mp3 128', fmtMp3_128, getFilesize(track, 'MP3_128')));
    if (showMp3_320) if (getFilesize(track, 'MP3_320') > 0) linksEl.appendChild(generateDlLink(track, 'mp3 320', fmtMp3_320, getFilesize(track, 'MP3_320')));
    if (showFLAC)    if (getFilesize(track, 'FLAC')    > 0) linksEl.appendChild(generateDlLink(track, 'flac', fmtFLAC, getFilesize(track, 'FLAC')));

    const statusEl = document.createElement('div');
    statusEl.classList.add('dlTrackStatus', 'hidden');

    const endFloat = document.createElement('div');
    endFloat.classList.add('dlEndFloat');

    trackEl.appendChild(nameEl);
    trackEl.appendChild(linksEl);
    trackEl.appendChild(statusEl);
    trackEl.appendChild(endFloat);
    return trackEl;
}

function isLoggedIn() {
    return typeof unsafeWindow.USER !== 'undefined' && unsafeWindow.USER.USER_ID !== 0;
}

function getTrackListByHand() {
    const links = Array.from(document.querySelectorAll('[data-instance=track_name]'));
    const albums = links.map(el=>el.href.match(/\d+/)[0]);
    const names  = links.map(el=>el.textContent);

    if (DEBUG) console.info('trackDB:: length:', Object.keys(trackDB).length, 'db:', trackDB);

    const result = [];
    for (let i=0; i<links.length; i++) {
        Object.keys(trackDB).forEach(trackId=>{
            if (trackDB[trackId].ALB_ID === albums[i])
                if (trackDB[trackId].SNG_TITLE === names[i] || `${trackDB[trackId].SNG_TITLE} ${trackDB[trackId].VERSION}` === names[i])
                    result.push(trackDB[trackId]);
        });
    }

    if (DEBUG) console.info('filtered', result);

    return result;
}

function getTrackListIndexByHand() {
    const links = Array.from(document.querySelectorAll('[data-instance=track_name]'));
    const names = links.map(el => el.textContent);
    let currentIndex = -1;
    const currentEl = document.querySelector('.player-track-link');
    if (currentEl)
        currentIndex = names.indexOf(currentEl.textContent);
    return currentIndex;
}

// ENTRY POINTS
function refreshTracklist() {
    if (DEBUG) console.info('Refreshing the Track List');

    while (divTracklist.firstElementChild)
        divTracklist.firstElementChild.remove();

//    if ( !isLoggedIn() ) {
//        const placeHolderDiv = document.createElement('div');
//        placeHolderDiv.classList.add('dlNotLoggedWarning');
//        placeHolderDiv.textContent = translate.pleaseLogIn;
//        divTracklist.appendChild(placeHolderDiv);
//        return;
//    }

    let list, current;
    if (unsafeWindow.dzPlayer) {
        if (DEBUG) console.info('Used native `dzPlayer\'');
        // In fact, this one is already array, but Firefox+Greasemonkey don't believe it
        list = Array.from(unsafeWindow.dzPlayer.getTrackList());
        current = unsafeWindow.dzPlayer.getTrackListIndex();
    } else {
        if (DEBUG) console.info('Tracks are getting manually. Be careful with result');
        // Do some magic
        list = getTrackListByHand();
        current = getTrackListIndexByHand();
    }
    list.forEach( (track, index)=> {
        trackDB[track.SNG_ID] = track;

        const trackDiv = generateDlTrack(track);
        if (index === current)
            trackDiv.classList.add('current');
        divTracklist.appendChild(trackDiv);
    });

    updateNames();
}

// THE DOWNLOADER PANEL
const rootEl = document.createElement('div');
rootEl.classList.add('dzHidden');
rootEl.id = 'dzDownloader';

const elNameProto = document.createElement('input');
elNameProto.classList.add('dlNameProto');
elNameProto.title = `${translate.choose} ${translate.fileNaming}`;
elNameProto.value = localStorage.dlNameProto;
['change', 'keyup', 'keydown'].forEach( event=> {
    elNameProto.addEventListener(event, ()=>{
        unsafeWindow.localStorage.dlNameProto = elNameProto.value;
        updateNames();
    });
});

const elInsert = document.createElement('span');
elInsert.classList.add('dlInsert');
elInsert.addEventListener('mouseenter', ()=>elNameProto.focus());

const elInsertButton = document.createElement('button');
elInsertButton.classList.add('dlInsertButton');
elInsertButton.textContent = '⬇ ⬇ ⬇ ⬇';
elInsertButton.title = `Case of tag's impact to resulting case:
%ARTIST\t=> 'SYSTEM OF A DOWN'
%Artist\t=> 'System of a Down'
%artist\t=> 'system of a down'

If count of digits in track number less than 'N' count, it will be padded with zeroes:
If track number is 2:
%N\t=> 2
%NN\t=> 02
%NNN\t=> 002
%NNNN\t=> 0002
If track number is 42:
%N\t=> 42
%NN\t=> 42
%NNN\t=> 042
%NNNN\t=> 0042`;

const elInsertTable = document.createElement('table');
elInsertTable.classList.add('dlInsertTable');
function addInsertVariant(value) {
    const row = elInsertTable.insertRow();
    const title = row.insertCell();
    title.textContent = value;

    if ('---' === value)return;

    row.addEventListener('click', ()=>{
        const sel = {
            start: elNameProto.selectionStart,
            end: elNameProto.selectionEnd,
            direction: elNameProto.selectionDirection,
        };
        const src = elNameProto.value;
        elNameProto.value = src.substr(0, elNameProto.selectionStart) + '%' + value + src.substr(elNameProto.selectionEnd);
        if (sel.start === src.length) {
            elNameProto.selectionStart = elNameProto.selectionEnd = elNameProto.value.length;
        } else {
            elNameProto.selectionStart = sel.start;
            elNameProto.selectionEnd = sel.end;
        }
        elNameProto.selectionDirection = sel.direction;
        elNameProto.dispatchEvent(new Event('change'));
        elNameProto.focus();
    });
}
// strings
addInsertVariant('Artist');
addInsertVariant('Artists');
addInsertVariant('Album');
addInsertVariant('Title');
addInsertVariant('Version');
addInsertVariant('---');
// numbers
addInsertVariant('disk');
addInsertVariant('time');
addInsertVariant('isrc');
addInsertVariant('NN');
addInsertVariant('---');
// Deezer-specific
addInsertVariant('cover');
addInsertVariant('gain');
addInsertVariant('id');
addInsertVariant('album_id');

elInsert.appendChild(elInsertButton);
elInsert.appendChild(elInsertTable);

const elRefresh = document.createElement('a');
elRefresh.classList.add('dlRefresh');
elRefresh.textContent = `⟳ ${translate.refresh} ${translate.tracklist.toLowerCase()}`;
elRefresh.addEventListener('click', refreshTracklist);

const elTrackListHeader = document.createElement('p');
elTrackListHeader.classList.add('dlTitle');
elTrackListHeader.textContent = `♪ ${translate.tracklist}`;


if (forceAzLyrics)
    unsafeWindow.localStorage.dlAzLyrics = forceAzValue;

const elAzLyrics = document.createElement('input');
elAzLyrics.type = 'checkbox';
elAzLyrics.classList.add('dlDoAzLyrics');
elAzLyrics.id = 'dlDoAzLyrics';
elAzLyrics.checked = !!localStorage.dlAzLyrics;
elAzLyrics.addEventListener('change', ()=>{
    unsafeWindow.localStorage.dlAzLyrics = elAzLyrics.checked;
});

const elAzLyricsLabel = document.createElement('label');
elAzLyricsLabel.setAttribute('for', 'dlDoAzLyrics');
elAzLyrics.classList.add('dlDoAzLyricsLabel');
elAzLyricsLabel.textContent = `azLyrics`;


const elListDownloadSelect = document.createElement('select');
elListDownloadSelect.classList.add('dlListDownloadSelect');
elListDownloadSelect.innerHTML =
    (!showMp3_32  ? '' : `<option value="${fmtMp3_32}" >mp3 32</option>`)+
    (!showMp3_64  ? '' : `<option value="${fmtMp3_64}" >mp3 64</option>`)+
    (!showMp3_128 ? '' : `<option value="${fmtMp3_128}">mp3 128</option>`)+
    (!showMp3_320 ? '' : `<option value="${fmtMp3_320}">mp3 320</option>`)+
    (!showFLAC    ? '' : `<option value="${fmtFLAC}"   >flac</option>`);
elListDownloadSelect.value = localStorage.dlListDownload;
elListDownloadSelect.addEventListener('change', ()=>{
    unsafeWindow.localStorage.dlListDownload = elListDownloadSelect.value;
});

const elListDownloadButton = document.createElement('button');
elListDownloadButton.classList.add('dlListDownloadButton');
elListDownloadButton.textContent = translate.downloadList;
elListDownloadButton.addEventListener('click', ()=>{
    const selector = `.dlLink[data-fmt="${elListDownloadSelect.value}"]`;
    document.querySelectorAll(selector).forEach(anchor=>anchor.click());
});

if (showAzLyrics) {
    elTrackListHeader.appendChild(elAzLyrics);
    elTrackListHeader.appendChild(elAzLyricsLabel);
}
if (showListDownloader) {
    elTrackListHeader.appendChild(elListDownloadSelect);
    elTrackListHeader.appendChild(elListDownloadButton);
}


const divTracklist = document.createElement('div');
divTracklist.classList.add('dlTrackList');

rootEl.appendChild(elNameProto);
rootEl.appendChild(elInsert);
rootEl.appendChild(elRefresh);
if (showAzLyrics || showListDownloader)
    rootEl.appendChild(elTrackListHeader);
rootEl.appendChild(divTracklist);

document.body.appendChild(rootEl);


const triggerEl = document.createElement('div');
triggerEl.classList.add('dlTrigger');
triggerEl.title = translate.clickToOpen;
triggerEl.textContent = 'D➲wnloader ☰';
triggerEl.addEventListener('click', ()=>{
    const panelContainer = document.querySelector('#dzDownloader');
    if (rootEl.classList.contains('dzHidden')) {
        panelContainer.style.display = 'block';
        panelContainer.classList.add('opened');
        setTimeout(()=>{
            if (panelContainer.classList.contains('opened'))
                panelContainer.style.display = 'block';
        }, 150);

        triggerEl.textContent = 'D➲wnloader ⚟';
        // refreshTracklist();
    } else {
        if ('true' === panelContainer.classList.contains('opened')) {
            panelContainer.classList.remove('opened');
            setTimeout(()=>{
                if ('true' === panelContainer.getAttribute('aria-hidden'))
                    panelContainer.style = '';
            }, 150);
        }

        triggerEl.textContent = 'D➲wnloader ☰';
    }
    rootEl.classList.toggle('dzHidden');
});

document.body.appendChild(triggerEl);


function hidePannel() {
    if (!rootEl.classList.contains('dzHidden'))
        triggerEl.click();
}


// Hotkey handling
addEventListener('keydown', e => {
    switch (e.code) {
        case 'Escape':
            hidePannel();
            break;
        case 'KeyD':
            if (document.activeElement.nodeName !== 'INPUT')
                triggerEl.click();
            break;
        default:
            if (SHOW_KEYS) console.info(`Key with code "${e.code}" was pressed.`);
    }
});



// Hide trigger when Deezer interface loading
// This element will be removed later
const delayStyleElement = document.head.appendChild(document.createElement('style'));
delayStyleElement.textContent = '#dzDownloader {display: none}';

function onInterfaceLoaded() {
    delayStyleElement.remove();

    document.getElementById('menu_search').addEventListener('focus', hidePannel);
    document.getElementById('page_panels').addEventListener('click', hidePannel);
    document.getElementById('page_sidebar').addEventListener('click', hidePannel);

    if (document.querySelector('.hotkeys')) {
        document.head.appendChild(document.createElement('style')).textContent =
            '.hotkeys {height: 225px !important}';

        document.querySelector('.hotkeys .mapping').innerHTML +=
            '<div class="hotkey">'+
            ' <div class="hotkey-icon single">D</div>'+
            ` <div class="hotkey-label">${translate.downloaderHotkey}</div>`+
            '</div>';
    }

    // There we show and immediately hide playlist. It's for initializing this element, nothing more
    if (!unsafeWindow.dzPlayer) {
        const pannels = document.getElementById('page_panels');
        const playListEl = document.querySelector('button.control-qlist');
        pannels.style.dislplay = 'none';
        playListEl.click();
        playListEl.click();
        setTimeout(() => {
            pannels.removeAttribute('style');
        }, 500);
    }

    // grab info about tracks from `PLAYER_INIT' variable
    trackRecurseLookup(unsafeWindow.PLAYER_INIT);

    refreshTracklist();

    if (openOnStart)
        triggerEl.click();
}

const waitInterfaceLoading = ()=>{
    if (!document.querySelector('button.control-qlist')) return setTimeout(waitInterfaceLoading, 150);
    onInterfaceLoaded();
};
waitInterfaceLoading();


// DATA STYLESHEET.
document.head.appendChild(document.createElement('style')).textContent = `
#dzDownloader {
  transform: translateX(220px);
  transition: transform .15s;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 299;
  background: #ccc;
  padding: 5px;
  height: 100%;
  overflow-y: auto;
  max-width: 80%;
  font-size: 1.05em;
}
#dzDownloader.dzHidden {
  transform: translateX(calc(0px - 100%));
}
.dlNameProto {
  text-align: center;
  width: 30em;
}
.dlInsert {
}
.dlInsertButton {
  cursor: help;
  height: 1.86em;
  padding-left: 0.3em;
}
.dlInsert:not(:hover) .dlInsertTable {
  display: none;
}
.dlInsertTable {
  position: absolute;
  left: calc(220px + 13em);
  background-color: #c8c8c8;
  border: #888 solid 1px;
}
.dlInsertTable tr:hover {
  background-color: #ddd;
}
.dlInsertTable td {
  cursor: pointer;
}
.dlRefresh {
  font-size: .85em;
  margin-left: 25px;
}
.dlTitle {
  cursor: default;
  border-bottom: gray 1.5px solid;
  border-style: none none dashed;
  color: #000;
  font-weight: 700er;
  margin-bottom: 1%;
  margin-left: 7px;
  padding-bottom: 3px;
  padding-top: 3px;
}
.dlDoAzLyrics {
    margin-left: 4em;
}
.dlDoAzLyricsLabel {
}
.dlListDownloadSelect {
  text-align: center;
  margin-left: 4em;
}
.dlListDownloadButton:hover {background: #444;}
.dlListDownloadButton {
  border-radius: 12px;
  text-shadow: 2px 1px 2px #000000;
  color: #fff;
  font-size: 12px;
  box-shadow: 1px 1px 4px #000000;
  padding: 2px 11px;
  background: #777;
  margin-left: 14px;
}
.dlNotLoggedWarning {
  color: #b91616;
  display: grid;
  font-size: medium;
  font-weight: bold;
  height: 4em;
  width: 100%;
  text-align: center;
  align-content: center;
}
.dlTrackList {
}
.dlTrack:nth-child(even) {
  background: #ddd;
}
.dlTrack.current {
  background: #888;
  color: #fff;
}
.dlTrackName {
  display: inline-block;
  max-width: 30em;
  margin-left: .5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 0.1em;
  cursor: help;
}
.dlTrackLinks {
  float: right;
  margin-top: .2em;
  margin-right: .3em;
}
.dlLink {
  margin-left: 4px;
}
.dlLink[download] {
  text-decoration: line-through;
}
.dlLink:hover {
  text-decoration: underline;
}
.dlTrackStatus {
  float: right;
  margin-top: .2em;
  margin-right: .3em;
  overflow: hidden;
}
.dlEndFloat {
  clear: both;
}

.dlTrigger {
  cursor: pointer;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 501;
  background: #ccc;
  padding: 3px;
  width: 220px;
  text-align: right;
  font-size: 1.1em;
}

/* below - deezer's native elements */


#page_sidebar {
  padding-top: 20px;
}
.logo-deezer {height: 55px}
.index-header-logo {
  height: 65px;
  max-width: 100%;
  width: 227px;
}

.logo-deezer-hp.logo.index-header-logo,
.logo-deezer.logo {
  background-image: url(https://e-cdns-files.dzcdn.net/cache/slash/images/common/logos/deezer.c0869f01203aa5800fe970cf4d7b4fa4.png);
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}
.page-sidebar .brand {margin-bottom: 0;}
#menu_navigation {top: 135px;}
.page-sidebar .nav-link {padding: 7px;}
`;
