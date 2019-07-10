// Если на проекте jQuery
$( document ).ready(function() {
  // https://github.com/digitalBush/jquery.maskedinput
  $(".phone-mask").mask("+7(999) 999-9999");

  // https://github.com/erensuleymanoglu/parallax-background
  $('.parallax').parallaxBackground();


  $('.product-carousel').on('initialized.owl.carousel changed.owl.carousel', function(e) {
    if (!e.namespace) {
      return;
    }
    var carousel = e.relatedTarget;
    carousel.$element.prev('.counter-out').text(carousel.relative(carousel.current()) + 1 + '/' + carousel.items().length);
  }).owlCarousel({
    items:1,
    video:true,
    margin: 30,
    lazyLoad:true,
    loop:true,
    dots: false,
    nav: true,
    // Enable thumbnails
    thumbs: true,
    // When only using images in your slide (like the demo) use this option to dynamicly create thumbnails without using the attribute data-thumb.
    thumbImage: false,
    // Enable this if you have pre-rendered thumbnails in your html instead of letting this plugin generate them. This is recommended as it will prevent FOUC
    thumbsPrerendered: true,
    // Class that will be used on the thumbnail container
    thumbContainerClass: 'owl-thumbs',
    // Class that will be used on the thumbnail item's
    thumbItemClass: 'owl-thumb-item',
    navText: ['<svg width="11px" height="21px"><path d="M0.396,11.972 L8.698,20.584 C9.226,21.132 10.082,21.132 10.610,20.584 C11.138,20.036 11.138,19.148 10.610,18.600 L3.264,10.980 L10.610,3.359 C11.138,2.812 11.138,1.923 10.610,1.375 C10.082,0.828 9.226,0.828 8.698,1.375 L0.395,9.988 C0.131,10.263 -0.000,10.620 -0.000,10.980 C-0.000,11.339 0.132,11.697 0.396,11.972 Z"/></svg>','<svg width="11px" height="20px"><path d="M10.604,10.985 L2.302,19.585 C1.774,20.132 0.918,20.132 0.390,19.585 C-0.138,19.038 -0.138,18.151 0.390,17.605 L7.736,9.995 L0.390,2.387 C-0.138,1.839 -0.138,0.953 0.390,0.406 C0.918,-0.141 1.774,-0.141 2.302,0.406 L10.604,9.006 C10.868,9.279 11.000,9.637 11.000,9.995 C11.000,10.354 10.868,10.713 10.604,10.985 Z"/></svg>'],
  });

  $('.about-carousel').owlCarousel({
    items: 1,
    margin: 30,
    nav: true,
    dots: true,
    responsive : {
      992 : {
        items: 2,
      }
    },
    navText: ['<svg width="16px" height="29px"><path d="M0.576,15.929 L12.652,28.398 C13.420,29.192 14.665,29.192 15.433,28.398 C16.201,27.605 16.201,26.319 15.433,25.526 L4.748,14.494 L15.433,3.460 C16.201,2.668 16.201,1.381 15.433,0.589 C14.665,-0.204 13.420,-0.204 12.651,0.589 L0.575,13.058 C0.191,13.454 -0.000,13.974 -0.000,14.494 C-0.000,15.013 0.192,15.533 0.576,15.929 Z"/></svg>','<svg width="16" height="29"><path d="M15.424,15.929 L3.348,28.398 C2.580,29.192 1.335,29.192 0.567,28.398 C-0.201,27.605 -0.201,26.319 0.567,25.526 L11.252,14.494 L0.567,3.460 C-0.201,2.668 -0.201,1.381 0.567,0.589 C1.335,-0.204 2.580,-0.204 3.348,0.589 L15.425,13.058 C15.809,13.454 16.000,13.974 16.000,14.494 C16.000,15.013 15.808,15.533 15.424,15.929 Z"/></svg>'],
  });
  $('.reviews-carousel').owlCarousel({
    center: false,
    items:1,
    nav: false,
    loop:true,
    responsive : {
      768 : {
        items: 3,
        center: true,
        nav: true,
      }
    },
    navText: ['<svg width="16px" height="29px"><path d="M0.576,15.929 L12.652,28.398 C13.420,29.192 14.665,29.192 15.433,28.398 C16.201,27.605 16.201,26.319 15.433,25.526 L4.748,14.494 L15.433,3.460 C16.201,2.668 16.201,1.381 15.433,0.589 C14.665,-0.204 13.420,-0.204 12.651,0.589 L0.575,13.058 C0.191,13.454 -0.000,13.974 -0.000,14.494 C-0.000,15.013 0.192,15.533 0.576,15.929 Z"/></svg>','<svg width="16" height="29"><path d="M15.424,15.929 L3.348,28.398 C2.580,29.192 1.335,29.192 0.567,28.398 C-0.201,27.605 -0.201,26.319 0.567,25.526 L11.252,14.494 L0.567,3.460 C-0.201,2.668 -0.201,1.381 0.567,0.589 C1.335,-0.204 2.580,-0.204 3.348,0.589 L15.425,13.058 C15.809,13.454 16.000,13.974 16.000,14.494 C16.000,15.013 15.808,15.533 15.424,15.929 Z"/></svg>'],
  });

  // https://www.jqueryscript.net/time-clock/psg-countdown-timer.html
  var timer = new PsgTimer({
      selector: '#zefricaTimer',
      currentDateTime: Date.UTC(2018, 0, 26, 12, 0, 0),
      endDateTime: 'UTC+02:00 26.02.2018 13:00:00',
      multilpeBlocks: true,
      animation: 'fade',
      labels: {
          days: 'Дней',
          hours: 'Часов',
          minutes: 'Минут',
          seconds: 'Секунд'
      },
      callbacks: {
          onInit: function () {
              console.log('Hello world!');
          }
      }
  });
});

// Изоляция без jQuery
// (function(){
//   // code
// }());

// На проекте нет jQuery, но хочется $( document ).ready...
// function ready(fn) {
//   if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
//     fn();
//   } else {
//     document.addEventListener('DOMContentLoaded', fn);
//   }
// }
//
// ready(function(){
//   // code
// });
