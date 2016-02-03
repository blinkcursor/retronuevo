(function() {

/*
  We're in. Reset JS class on HTML
*/
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');


/*
  Cache DOM queries
*/
  var navSlider = document.querySelector('.nav-slider');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide')); // to return array not node list
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.slide__text a'));


/*
  NAVSLIDER ANIMATION
*/

  // initialise
  navSlider.classList.add('will-animate');

  // When navSlider images are ready kick off the animation
  imagesLoaded( slides, {background:true}, function( instance ) {
    navSlider.classList.add('is-animate');
    navSlider.classList.remove('will-animate');
    // remove animation helper class when complete, could do via transitionend event listener
    window.setTimeout( function() {
     navSlider.classList.remove('is-animate');
    }, 4000);
  });



/*
  SET UP THE TEMPLATES
*/
  var templates = {
    pieces : document.getElementById('pieces').content,
    projects : document.getElementById('projects').content,
    services : document.querySelector('.template-wrapper').cloneNode(true)
  };


/* 
  SET CLICK HANDLERS FOR NAVSLIDER NAVIGATION
*/

  // TODO: change this to use event bubbling and target
  navLinks.forEach( function(currentValue){
    currentValue.addEventListener('click', navigate, false);
  });

  function navigate(event) {
    event.preventDefault();

    // ignore if slide is already active
    if ( event.target.parentNode.parentNode.classList.contains('slide--active') ) return;

    // animate the navigation
    document.querySelector('.slide--active').classList.remove('slide--active');
    event.target.parentNode.parentNode.classList.add('slide--active');

    // swap out the content of .main section with template
    if (event.target.dataset.template) {

      var   main = document.querySelector('.main'),
            templateWrapper = main.querySelector('.template-wrapper'),
            target = event.target.dataset.template;

      // remove old content
      main.removeChild(templateWrapper);

      // add in new template
      main.appendChild(templates[target].cloneNode(true));

      // now re-initialise gallery modal
      galleryModal.init();

      /*
        TODO: properly update history API
      */
      // history.pushState( null, null, target + ".html");
    }
  }


/*
  GALLERY MODAL
*/

  var galleryModal = {

    init: function(){
 
      this.cacheVars();

      if (this.gallery) {
        // attach event handler to launch modal
        this.thisLaunchModal = this.launchModal.bind(this);
        this.gallery.addEventListener('click', this.thisLaunchModal, false);
      }
    },

    cacheVars: function(){
      this.gallery = document.querySelector('.gallery');
    },

    launchModal: function(e) {
      e.preventDefault();

      // grab and keep a list of all the images in the gallery
      this.images = Array.prototype.slice.call(this.gallery.querySelectorAll('img')); // returns array not node list

      // keep a pointer to the current image
      this.currentImage = e.target;

      // create the modal
      this.modal = document.createElement('div');
      this.modal.classList.add('gallery__modal');

      // attach event listeners
      this.bindModalEvents();

      // insert into DOM
      insertAfter(this.gallery, this.modal);

      // set currentImage pointer
      this.currentImage = e.target;
      // return a clone of the img with an orientation class added
      var orientatedImage = this.orientateImage(this.currentImage);
      // add to the DOM
      this.modal.appendChild(orientatedImage);
    },

    orientateImage: function(srcNode) {

      var clonedNode = srcNode.cloneNode(true);

      // (note: we can't get natural height/width from original)
      if (clonedNode.height > clonedNode.width) {
        clonedNode.classList.add("portrait");
      } else {
        clonedNode.classList.add("landscape");
      }
      return clonedNode;
    },

    bindModalEvents: function() {
      // esc key to close
      // click away from image to close
      this.thisHandleModalEvents = this.handleModalEvents.bind(this);
      window.addEventListener('keyup', this.thisHandleModalEvents, false);
      this.modal.addEventListener('click', this.thisHandleModalEvents, false);

    },
    handleModalEvents: function(e) {
      // key presses
      if (e.type === 'keyup') {

        var key = e.keyCode || e.which;

        switch (key) {
          case 27:
            // esc key closes modal
            this.killModal();
          break;
          case 37:
            this.updateModal(-1);
          break;
          case 39:
            this.updateModal(+1);
        }
      }
      // click away from image to close
      if (e.type === 'click' && e.target === this.modal) {
        this.killModal();
      }

    },

    updateModal: function(direction) {

      var index = this.images.indexOf(this.currentImage),
          nextIndex = index + direction;
      // wraparound at first and last images
      nextIndex = ( nextIndex === this.images.length ) ? 0 : nextIndex;
      nextIndex = ( nextIndex < 0 ) ? this.images.length - 1 : nextIndex;

      var nextImage = this.images[nextIndex];

      // remove old image
      this.modal.removeChild(this.modal.firstChild);


      // update pointer to current image
      this.currentImage = nextImage;

      // return a clone of the img with an orientation class added
      var orientatedImage = this.orientateImage(this.currentImage);
      // add to the DOM
      this.modal.appendChild(orientatedImage);
    },

    killModal: function() {
      // tidy up event handlers
      this.modal.removeEventListener('click',this.thisHandleModalEvents, false);
      window.removeEventListener('keyup', this.thisHandleModalEvents, false);

      this.modal.parentNode.removeChild(this.modal);
    }

  }
  galleryModal.init();

  // HELPER function to insert a new node after a reference node
  function insertAfter(referenceNode, newNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }


})();


/*
  POLYFILL FOR HTML TEMPLATES
*/
(function templatePolyfill(d) {
  if('content' in d.createElement('template')) {
    return false;
  }

  var qPlates = d.getElementsByTagName('template'),
    plateLen = qPlates.length,
    elPlate,
    qContent,
    contentLen,
    docContent;

  for(var x=0; x<plateLen; ++x) {
    elPlate = qPlates[x];
    qContent = elPlate.childNodes;
    contentLen = qContent.length;
    docContent = d.createDocumentFragment();

    while(qContent[0]) {
      docContent.appendChild(qContent[0]);
    }

    elPlate.content = docContent;
  }
})(document);


/*
  SMOOTH SCROLLING
*/
(function() {
  var smoothScrolling = {
    // add smooth vertical scrolling to internal anchors
    init: function() {
      // if new native support available we don't need any of this
      var isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;
      if ( isSmoothScrollSupported ) {
        return;
      }

      this.bindEvents();
    },

    bindEvents: function() {
      window.addEventListener('click', this.triggerScroll.bind(this), false);
    },

    triggerScroll: function(event) {
      // is this an internal anchor?
      if ( event.target.hash && event.target.pathname.replace(/^\//,'') === location.pathname.replace(/^\//,'') ) {
        var target = document.getElementById( event.target.hash.slice(1) ),
            targetY = this.getElementY( target );
        this.smoothScroll( targetY );
        event.preventDefault();
      }
    },

    getElementY: function(element) {
      var y = element.offsetTop,
          node = element;
      while (node.offsetParent && node.offsetParent !== document.body) {
          node = node.offsetParent;
          y += node.offsetTop;
      } 
      return y;
    },

    getCurrentY: function() {
      // Firefox, Chrome, Opera, Safari
      if (window.self.pageYOffset) {return window.self.pageYOffset;}
      // Internet Explorer 6 - standards mode
      if (document.documentElement && document.documentElement.scrollTop)
          {return document.documentElement.scrollTop;}
      // Internet Explorer 6, 7 and 8
      if (document.body.scrollTop) {return document.body.scrollTop;}
      return 0;
    },

    smoothScroll: function(targetY) {
      var startY = this.getCurrentY(),
          scrollBy = targetY - startY,
          speed = Math.abs(scrollBy / 100),
          increment = scrollBy / 25;

      // if close just jump
      if ( Math.abs(scrollBy) < 100 ) {
        scrollTo(0, targetY);
        return;
      }
      // otherwise animate the scroll
      var intermediateY;
      for ( var i=0; i<=25; i++) {
        intermediateY = Math.round(startY + i * increment);
        setTimeout("window.scrollTo(0, " + intermediateY + ")", Math.round(i*speed) );
      }
    }
  };
  smoothScrolling.init();
})();