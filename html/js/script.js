/* global initMap:true */

initMap = false;

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'Requires jQuery to be loaded first';
    }
    fn(jQuery);
}(function ($) {
    "use strict";

    // generic data and functionality
    var $w = $(window),
        $doc = $(document),
        loaded = false,
        randomId = function (obj) {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1)
                ;
            }
            var ret = s4() + s4();
            // if id exists within @obj - re-create id
            return obj && typeof(obj[ret]) !== 'undefined' ? randomId(obj) : ret;
        },
        loadImage = function (src){
            var dfd = $.Deferred(),
                imageSrc = src
            ;
            $('<img>')
                .on({
                    'load' : function (){
                        dfd.resolve(imageSrc);
                        $(this).remove();
                    },
                    'error' : function (){
                        dfd.reject();
                        $(this).remove();
                    }
                })
                .attr('src', imageSrc)
            ;
            return dfd;
        },
        applyBlockClasses = function($block, action){
            var actionName = action === 'hide' ? 'hide' : 'show',
                actionClasses = $block.data(actionName + 'BlockClass'),
                reverceActionClasses = $block.data( (action === 'hide' ? 'show' : 'hide') + 'BlockClass')
            ;
            if( actionClasses ){
                $block.addClass( actionClasses );
            }else{
                $block[actionName]();
            }
            if( reverceActionClasses ){
                $block.removeClass( reverceActionClasses );
            }
        },
        findBlock = function(val){
            if (val instanceof $){
                return val;
            }
            var blocks = (val + '').split(';'),
                $blocks = $([])
            ;
            for (var i = 0; i < blocks.length; i++) {
                $blocks = $blocks.add( $('[data-block="' + blocks[i] + '"]') );
            }
            return $blocks;
        },
        hideBlock = function (name){
            var $blocks = findBlock(name);
            $blocks.each(function(i, block){
                applyBlockClasses( $(block), 'hide' );
            });
            return $blocks;
        },
        showBlock = function (name){
            var $blocks = findBlock(name);
            $blocks.each(function(i, block){
                applyBlockClasses( $(block), 'show' );
            });
            return $blocks;
        }
    ;

    // mark window as loaded
    $w.on('load', function (){
        loaded = true;
    });

    /* Lazy image load */
    var lazyIds = {},
        inView = function (el, off){
            var $el = $(el),
                rect = el.getBoundingClientRect(),
                height = (window.innerHeight || document.documentElement.clientHeight) + off,
                width = (window.innerWidth || document.documentElement.clientWidth) + off
            ;

            return (
                (rect.top <= height || rect.bottom <= height) &&
                (rect.left <= width || rect.right <= width)
            );
        },
        lazyload = function (el){
            var $el = $(el);
            if( !$el.is('.lazy') ){
                var id = randomId(lazyIds),
                    fn = function (){
                        if( $el.is(':visible') && inView($el, 100) ){
                            var src = $el.data('__Lazy');
                            $('[data-lazy="' + src + '"]').triggerHandler('lazyLoaded');
                            loadImage(src)
                                .done(function (src){
                                    $('[data-lazy="' + src + '"]').attr('src', src);
                                })
                            ;
                        }
                    }
                ;
                lazyIds[id] = true;
                $w.on('DOMContentLoaded.__Lazy_' + id + ' load.__Lazy_' + id + ' resize.__Lazy_' + id + ' scroll.__Lazy_' + id, fn);
                $doc.on('show.__Lazy_' + id, fn);
                $el.addClass('lazy').on('lazyLoaded', function (){
                    $w.off('.__Lazy_' + id);
                    $doc.off('.__Lazy_' + id);
                    $el.off('lazyLoaded');
                    delete lazyIds[id];
                    $el = id = null;
                });
            }
        }
    ;

    /* Cover image */
    var coverimage = function (el){
        var $el = $(el);
        if( !$el.is('.covered') ){
            var fn = function (){
                $el.addClass('hide').after(
                    $('<span>').addClass('cover-image').addClass($el.data('coverImageClass') || '').css('backgroundImage', "url(" + $el.attr('src') + ")" )
                );
            };
            if( $el.is('[data-lazy]') ){
                $el.on('lazyLoaded', fn);
            }else{
                fn();
            }
        }
    };

    $('[data-cover-image]:not(.cover)').each(function (i, el){
        coverimage(el);
    });

    // Page loader
    $('body').addClass('loader-loading');
    var showPage = function(){
        $('body')
            .removeClass('loader-loading')
            .off('.pageLoader')
        ;
        $(window).trigger('resize');
    };
    $(window).on('load.pageLoader', showPage);
    //force page show if it's loading too long
    setTimeout(showPage, 60000); // 60000 ~ 1 minute

    $('.menu-items .toggle-icon').on('click', function(){
        $(this).closest('li').toggleClass('active');
    });

    $('.accordion-item .accordion-title').on('click', function(){
        $(this).closest('.accordion-item').toggleClass('active');
    });

    // FlexSlider
    $('.flexslider').each(function(i, el){
        var $slider = $(el),
            $directions = $slider.find(".flex-custom-navigation a"),
            $controls = $slider.find(".flex-custom-controls"),
            options = {
                animation : "slide",
                selector : ".slides > .slide",
                controlsContainer: $controls,
                customDirectionNav: $directions,
                controlNav : !!$controls.length,
                directionNav : !!$directions.length,
                video : true
            }
        ;
        $slider.flexslider(options);
    });

    // Owl Carousel 2
    $('.owl-carousel').each(function(i, el){
        var $slider = $(el),
            data = $slider.data(),
            options = {
                nav : !!data.owlNav,
                dots : !!data.owlDots,
                margin : data.owlMargin || 0,
                autoplay : data.hasOwnProperty('autoplay') ? data.autoplay : true,
                autoplayHoverPause : true,
                center : !!data.owlCenter,
                items : data.owlItems || 3,
                loop : data.hasOwnProperty('owlLoop') ? !!data.owlLoop : true,
                responsive: {
                    0 : {
                        items : 1
                    },
                    768:{
                        items : 2
                    },
                    1200 : {
                        items : 3
                    }
                }
            }
        ;
        if( data.owlResponsive ){
            var values = data.owlResponsive.split(';'),
                responsive = {
                    0 : 1
                },
                sizes = [0, 768, 992, 1200]
            ;
            for (var ind = 0; ind < sizes.length && ind < values.length; ind++) {
                if( values[ind] ){
                    responsive[sizes[ind]] = {
                        items : parseInt(values[ind], 10)
                    };
                }
            }
            options.responsive = responsive;
        }
        $slider.owlCarousel(options);
    });

    // Waypoint Counters
    $('[data-waypoint-counter]').each(function(i, el){
        var $el = $(el),
            $value = $('<span>').appendTo($el),
            waypointCounter = $el.waypoint({
            handler : function() {
                $el.prop('CounterValue',0).animate({
                    CounterValue: $el.data('waypointCounter')
                }, {
                    duration: 2000,
                    step : function (now) {
                        $value.text(Math.ceil(now));
                    }
                });
                this.destroy();
            },
            offset : 'bottom-in-view'
        });
        $('<span>').appendTo($el)
            .css({
                opacity : 0,
                height : 0,
                display : 'block',
                overflow : 'hidden'
            })
            .text($el.data('waypointCounter'))
        ;
    });

    // Menu stick
    $('.stick-menu').each(function(i, el){
        var waypointMenu = new Waypoint({
                element : el,
                handler : function(direction) {
                    if(direction === 'up'){
                        $(el).closest('.header').removeClass('sticked-menu');
                    }else{
                        var body = document.body,
                            html = document.documentElement,
                            docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight ),
                            elHeight = this.element.clientHeight,
                            windowHeight = $(window).height()
                        ;
                        if( docHeight > (windowHeight + 2*elHeight) ){
                            $(el).closest('.header').addClass('sticked-menu');
                        }
                    }
                },
                offset : -1
            })
        ;
    });

    // Inview showup
    $('[data-inview-showup]').each(function(){
        var $el = $(this);
        $el.addClass('inview-showup');
        new Waypoint({
            element: $el,
            handler: function() {
                $el.removeClass('inview-showup');
                var showupClasses = $el.data('inviewShowup');
                if( showupClasses ){
                    $el.addClass(showupClasses);
                }
                this.destroy();
            },
            offset : '100%',
            group : 'inview'
        });
    });

    // Trigger resize for parallax blocks
    $('[data-parallax]').each(function(i, el){
        new Waypoint({
            element: el,
            handler: function() {
                $(window).resize();
            },
            offset : '100%'
        });
    });

    // Preview image / Product images preview
    $('[data-preview-image]').each(function(i, el){
        var $container = $(el),
            $current = $([]),
            $clone = $([]),
            name = $container.data('previewImage') || ''
        ;
        $('[data-preview-image-source="' + name + '"]').on('mouseenter.previewImage', function(){
            var $source = $(this);
            if( $current.is($source) ){
                return;
            }
            $clone.clearQueue().fadeOut(500, function(){
                $(this).remove();
            });
            $current = $source;
            $clone = $source.clone(true, true).removeClass().off('.previewImage').css({
                'display' : 'none',
                'transition' : 'none'
            }).appendTo($container).fadeIn(500);
        }).first().triggerHandler('mouseenter');
    });

    // Pricing Switch
    $('.pricing-switch').each(function(i, el){
        var $el = $(el),
            $back = $el.find('.background'),
            $active = $el.find('.item.active'),
            backFn = function(){
                $back
                    .css({
                        'width': $active.innerWidth(),
                        'height': $active.innerHeight()
                    })
                    .offset($active.offset())
                ;
            },
            fn = function($item){
                if( $active.length && !$active.is($item) ){
                    $active.removeClass('active');
                    if( $active.data('pricingBlock') ){
                        hideBlock($active.data('pricingBlock'));
                    }
                }
                $active = $item;
                if( $active.data('pricingBlock') ){
                    showBlock($active.data('pricingBlock'));
                }
                $active.addClass('active');
                backFn();
            }
        ;
        fn($active.length ? $active : $el.find('.item:first-child'));
        $w.on('resize', function(){
            backFn();
        });
        $el.find('.item').on('click', function(){
            fn($(this));
        });
    });

    // Scroll Top
    var checkScroll = function(){
        if( $(window).scrollTop() > 0 ){
            $('.scroll-top').removeClass('disabled');
        }else{
            $('.scroll-top').addClass('disabled');
        }
    };
    checkScroll();
    $(window).on('scroll resize orientationchange focus', checkScroll);
    $('.scroll-top').on('click', function(e){
        e.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    });

    // Show/hide categories
    $('ul.categories-list > li .open-sub-link').on('click', function(e){
        e.preventDefault();
        var $el = $(this),
            $current = $el.closest('li').toggleClass('active'),
            $ignore = $current.hasClass('active') ? $current : $([])
        ;
        $current.closest('ul').find('> li.active').not($ignore).removeClass('active');
    });

    /* Google Maps */
    initMap = function (){
        // Create a new StyledMapType object, passing it an array of styles,
        // and the name to be displayed on the map type control.
        var styledMapType = new google.maps.StyledMapType(
            [
                {
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                    ]
                },
                {
                    "elementType": "labels.icon",
                    "stylers": [
                    {
                        "visibility": "off"
                    }
                    ]
                },
                {
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#616161"
                    }
                    ]
                },
                {
                    "elementType": "labels.text.stroke",
                    "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                    ]
                },
                {
                    "featureType": "administrative.land_parcel",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#bdbdbd"
                    }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#757575"
                    }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#ffffff"
                    }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#757575"
                    }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#dadada"
                    }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#616161"
                    }
                    ]
                },
                {
                    "featureType": "road.local",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                    ]
                },
                {
                    "featureType": "transit.line",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                    ]
                },
                {
                    "featureType": "transit.station",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#c9c9c9"
                    }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                    ]
                }
            ],
            {name: 'Styled Map'});

        // Create a map object, and include the MapTypeId to add
        // to the map type control.
        $('.gmap').each(function(i, el){
            var $el = $(el),
                centredAt = 992,
                offset = $(window).width() >= centredAt ? 0.013 : 0,
                data = $el.data(),
                mark = {lat: data.lat, lng: data.lng},
                center = {lat: data.centerLat || (mark.lat), lng: data.centerLng || (mark.lng - offset)},
                map = new google.maps.Map(el, {
                    center: center, // map center position
                    zoom: data.zoom || 15,
                    scrollwheel: false,
                    zoomControl: true,
                    zoomControlOptions: {
                      position: google.maps.ControlPosition.LEFT_CENTER
                    },
                    streetViewControl: true,
                    streetViewControlOptions: {
                      position: google.maps.ControlPosition.LEFT_BOTTOM
                    },
                    mapTypeControlOptions: {
                        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', 'styled_map']
                    }
                }),
                marker = new google.maps.Marker({
                  position: mark,
                  map: map,
                  icon: "./images/icons/map-marker.png"
                })
            ;

            // Associate the styled map with the MapTypeId and set it to display.
            map.mapTypes.set('styled_map', styledMapType);
            map.setMapTypeId('styled_map');
            // Center map on resize
            $(window).on('resize', function(){
                google.maps.event.trigger(map, 'resize');
                offset = $(window).width() >= centredAt ? 0.013 : 0;
                center = {lat: data.centerLat || (mark.lat), lng: data.centerLng || (mark.lng - offset)};
                map.setCenter(center);
            });
        });
    };

    /* Chosen - custeom selects*/
    $('.chosen-field select.field-control').each(function(i, el){
        var $field = $(el);
        $field.chosen({
            width : '100%',
            disable_search_threshold : 10
        });
    });

    /* add active class to one of the sub elements on click */
    $('[data-sub-active-class]').each(function (i, el){
        var $root = $(el),
            activeClass = $root.data('subActiveClass')
        ;
        $root.find(' > *')
            .removeClass(activeClass)
            .on('click mouseover', function(){
                var $this = $(this);
                $root.find(' > *').not($this).removeClass(activeClass);
                $this.addClass(activeClass);
            })
        ;
        $root.find(' > [data-is-active]').addClass(activeClass);
    });
}));