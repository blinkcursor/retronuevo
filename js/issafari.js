var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;

console.log("isSafari is " + isSafari);