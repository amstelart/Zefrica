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
    $('.counter-out').text(carousel.relative(carousel.current()) + 1 + '/' + carousel.items().length);
  }).owlCarousel({
    items:1,
    video:true,
    margin: 30,
    lazyLoad:true,
    loop:true,
    dots: false,
    // Enable thumbnails
    thumbs: true,
    // When only using images in your slide (like the demo) use this option to dynamicly create thumbnails without using the attribute data-thumb.
    thumbImage: false,
    // Enable this if you have pre-rendered thumbnails in your html instead of letting this plugin generate them. This is recommended as it will prevent FOUC
    thumbsPrerendered: true,
    // Class that will be used on the thumbnail container
    thumbContainerClass: 'owl-thumbs',
    // Class that will be used on the thumbnail item's
    thumbItemClass: 'owl-thumb-item'
  });

  $('.about-carousel').owlCarousel({
    items: 2,
    margin: 30,
    nav: true,
    dots: true
  });
  $('.reviews-carousel').owlCarousel({
    center: true,
    items:3,
    loop:true,
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
