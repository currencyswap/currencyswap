(function($){
    $(window).load(function() {
        
        "use strict";
        
        // Page Preloader
        $('#preloader').delay(350).fadeOut(function(){
           $('body').delay(350).css({'overflow':'visible'});
        });
     });

     $(document).ready(function() {
        
        "use strict";
        
        function init() {
            $.detectDevice();
         // Toggle Left Menu
            $('.leftpanel .nav-parent > a').live('click', function() {
               
               var parent = $(this).parent();
               var sub = parent.find('> ul');
               
               // Dropdown works only when leftpanel is not collapsed
               if(!$('body').hasClass('leftpanel-collapsed')) {
                  if(sub.is(':visible')) {
                     sub.slideUp(200, function(){
                        parent.removeClass('nav-active');
                        $('.mainpanel').css({height: ''});
                        adjustmainpanelheight();
                     });
                  } else {
                     closeVisibleSubMenu();
                     parent.addClass('nav-active');
                     sub.slideDown(200, function(){
                        adjustmainpanelheight();
                     });
                  }
               }
               return false;
            });
            
            adjustmainpanelheight();
            $(window).resize($.buildCSLeftPanelMenu);
            
            
            // Tooltip
            $('.tooltips').tooltip({ container: 'body'});
            
            // Popover
            $('.popovers').popover();
            
            // Close Button in Panels
            $('.panel .panel-close').click(function(){
               $(this).closest('.panel').fadeOut(200);
               return false;
            });
            
            // Form Toggles
            $('.toggle').toggles({on: true});
            
            $('.toggle-chat1').toggles({on: false});
            
            var scColor1 = '#428BCA';
            if ($.cookie('change-skin') && $.cookie('change-skin') == 'bluenav') {
               scColor1 = '#fff';
            }
            
            
            // Sparkline
            $('#sidebar-chart').sparkline([4,3,3,1,4,3,2,2,3,10,9,6], {
                  type: 'bar', 
                  height:'30px',
                  barColor: scColor1
            });
            
            $('#sidebar-chart2').sparkline([1,3,4,5,4,10,8,5,7,6,9,3], {
                   type: 'bar', 
                   height:'30px',
                  barColor: '#D9534F'
            });
            
            $('#sidebar-chart3').sparkline([5,9,3,8,4,10,8,5,7,6,9,3], {
                   type: 'bar', 
                   height:'30px',
                  barColor: '#1CAF9A'
            });
            
            $('#sidebar-chart4').sparkline([4,3,3,1,4,3,2,2,3,10,9,6], {
                   type: 'bar', 
                   height:'30px',
                  barColor: scColor1
            });
            
            $('#sidebar-chart5').sparkline([1,3,4,5,4,10,8,5,7,6,9,3], {
                   type: 'bar', 
                   height:'30px',
               barColor: '#F0AD4E'
            });
            
            
            // Minimize Button in Panels
            $('.minimize').click(function(){
               var t = $(this);
               var p = t.closest('.panel');
               if(!$(this).hasClass('maximize')) {
                  p.find('.panel-body, .panel-footer').slideUp(200);
                  t.addClass('maximize');
                  t.html('&plus;');
               } else {
                  p.find('.panel-body, .panel-footer').slideDown(200);
                  t.removeClass('maximize');
                  t.html('&minus;');
               }
               return false;
            });
            
            
            // Add class everytime a mouse pointer hover over it
            $('.nav-bracket > li').hover(function(){
               $(this).addClass('nav-hover');
            }, function(){
               $(this).removeClass('nav-hover');
            });
            
            
            // Menu Toggle
            $('.menutoggle').click(function(){
               
               var body = $('body');
               var bodypos = body.css('position');
               
               if(bodypos != 'relative') {
                  
                  if(!body.hasClass('leftpanel-collapsed')) {
                     body.addClass('leftpanel-collapsed');
                     $('.nav-bracket ul').attr('style','');
                     
                     $(this).addClass('menu-collapsed');
                     
                  } else {
                     body.removeClass('leftpanel-collapsed chat-view');
                     $('.nav-bracket li.active ul').css({display: 'block'});
                     
                     $(this).removeClass('menu-collapsed');
                     
                  }
               } else {
                  
                  if(body.hasClass('leftpanel-show'))
                     body.removeClass('leftpanel-show');
                  else
                     body.addClass('leftpanel-show');
                  
                  adjustmainpanelheight();
               }

            });
            
            // Chat View
            $('#chatview').click(function(){
               
               var body = $('body');
               var bodypos = body.css('position');
               
               if(bodypos != 'relative') {
                  
                  if(!body.hasClass('chat-view')) {
                     body.addClass('leftpanel-collapsed chat-view');
                     $('.nav-bracket ul').attr('style','');
                     
                  } else {
                     
                     body.removeClass('chat-view');
                     
                     if(!$('.menutoggle').hasClass('menu-collapsed')) {
                        $('body').removeClass('leftpanel-collapsed');
                        $('.nav-bracket li.active ul').css({display: 'block'});
                     } else {
                        
                     }
                  }
                  
               } else {
                  
                  if(!body.hasClass('chat-relative-view')) {
                     
                     body.addClass('chat-relative-view');
                     body.css({left: ''});
                  
                  } else {
                     body.removeClass('chat-relative-view');   
                  }
               }
               
            });
         // Sticky Header
            if($.cookie('sticky-header'))
               $('body').addClass('stickyheader');
               
            // Sticky Left Panel
            if($.cookie('sticky-leftpanel')) {
               $('body').addClass('stickyheader');
               $('.leftpanel').addClass('sticky-leftpanel');
            }
            
            // Left Panel Collapsed
            if($.cookie('leftpanel-collapsed')) {
               $('body').addClass('leftpanel-collapsed');
               $('.menutoggle').addClass('menu-collapsed');
            }
            
            // Changing Skin
            var c = $.cookie('change-skin');
            var cssSkin = 'css/style.'+c+'.css';
            if ($('body').css('direction') == 'rtl') {
               cssSkin = '../css/style.'+c+'.css';
               $('html').addClass('rtl');
            }
            if(c) {
               $('head').append('<link id="skinswitch" rel="stylesheet" href="'+cssSkin+'" />');
            }
            
            // Changing Font
            var fnt = $.cookie('change-font');
            if(fnt) {
               $('head').append('<link id="fontswitch" rel="stylesheet" href="css/font.'+fnt+'.css" />');
            }
            
            // Check if leftpanel is collapsed
            if($('body').hasClass('leftpanel-collapsed'))
               $('.nav-bracket .children').css({display: ''});
               
              
            // Handles form inside of dropdown 
            $('.dropdown-menu').find('form').click(function (e) {
               e.stopPropagation();
            });
            
            
            // This is not actually changing color of btn-primary
            // This is like you are changing it to use btn-orange instead of btn-primary
            // This is for demo purposes only
            var c = $.cookie('change-skin');
            if (c && c == 'greyjoy') {
               $('.btn-primary').removeClass('btn-primary').addClass('btn-orange');
               $('.rdio-primary').addClass('rdio-default').removeClass('rdio-primary');
               $('.text-primary').removeClass('text-primary').addClass('text-orange');
            }
        }; // end init function
        
        function closeVisibleSubMenu() {
           $('.leftpanel .nav-parent').each(function() {
              var t = $(this);
              if(t.hasClass('nav-active')) {
                 t.find('> ul').slideUp(200, function(){
                    t.removeClass('nav-active');
                 });
              }
           });
        };
        
        function adjustmainpanelheight() {
           // Adjust mainpanel height
           var docHeight = $(document).height();
           if(docHeight > $('.mainpanel').height())
              $('.mainpanel').height(docHeight);
        };
        
        $.buildCSLeftPanelMenu = function(){
            if($('body').css('position') == 'relative') {

               $('body').removeClass('leftpanel-collapsed chat-view');
               
            } else {
               
               $('body').removeClass('chat-relative-view');
               $('body').css({left: '', marginRight: ''});
            }
            
            reposition_searchform();
            reposition_topnav();
         };

        /* This function will reposition search form to the left panel when viewed
         * in screens smaller than 767px and will return to top when viewed higher
         * than 767px
         */ 
        function reposition_searchform() {
           if($('.searchform').css('position') == 'relative') {
              $('.searchform').insertBefore('.leftpanelinner .userlogged');
           } else {
              $('.searchform').insertBefore('.header-right');
           }
        };

        /* This function allows top navigation menu to move to left navigation menu
         * when viewed in screens lower than 1024px and will move it back when viewed
         * higher than 1024px
         */
        function reposition_topnav() {
           if($('.nav-horizontal').length > 0) {
              // top navigation move to left nav
              // .nav-horizontal will set position to relative when viewed in screen below 1024
              if($('.nav-horizontal').css('position') == 'relative') {
                 if($('.leftpanel .nav-bracket').length == 2) {
                    $('.nav-horizontal').insertAfter('.nav-bracket:eq(1)');
                 } else {
                    // only add to bottom if .nav-horizontal is not yet in the left panel
                    if($('.leftpanel .nav-horizontal').length == 0)
                       $('.nav-horizontal').appendTo('.leftpanelinner');
                 }
                 
                 $('.nav-horizontal').css({display: 'block'}).addClass('nav-pills nav-stacked nav-bracket');

                 $('.nav-horizontal .children').removeClass('dropdown-menu');
                 $('.nav-horizontal > li').each(function() { 
                    
                    $(this).removeClass('open');
                    $(this).find('a').removeAttr('class');
                    $(this).find('a').removeAttr('data-toggle');
                    
                 });
                 
                 if($('.nav-horizontal li:last-child').has('form')) {
                    $('.nav-horizontal li:last-child form').addClass('searchform').appendTo('.topnav');
                    $('.nav-horizontal li:last-child').hide();
                 }
              } else {
                 // move nav only when .nav-horizontal is currently from leftpanel
                 // that is viewed from screen size above 1024
                 if($('.leftpanel .nav-horizontal').length > 0) {
                    $('.nav-horizontal').removeClass('nav-pills nav-stacked nav-bracket').appendTo('.topnav');
                    $('.nav-horizontal .children').addClass('dropdown-menu').removeAttr('style');
                    $('.nav-horizontal li:last-child').show();
                    $('.searchform').removeClass('searchform').appendTo('.nav-horizontal li:last-child .dropdown-menu');
                    $('.nav-horizontal > li > a').each(function() {
                       
                       $(this).parent().removeClass('nav-active');
                       
                       if($(this).parent().find('.dropdown-menu').length > 0) {
                          $(this).attr('class','dropdown-toggle');
                          $(this).attr('data-toggle','dropdown');  
                       }
                       
                    });
                 }
                 
              }
              
           }
        };
        
        $.detectDevice = function() {
            var ua = window.navigator.userAgent;
            console.log('detectDevice for userAgent:', ua);
            var md = new MobileDetect(ua);
            console.log('detectDevice mobile:', md.mobile() );
            console.log('detectDevice phone:', md.phone() );
            console.log('detectDevice tablet:', md.tablet() );
            console.log('detectDevice userAgent:', md.userAgent() );
            console.log('detectDevice os:', md.os() );
            console.log('detectDevice is iPhone:', md.is('iPhone') );
            console.log('detectDevice is bot:', md.is('bot') );
            console.log('detectDevice version Webkit:', md.version('Webkit') );
            console.log('detectDevice versionStr Build:', md.versionStr('Build') );
            console.log('detectDevice match playstation|xbox:', md.match('playstation|xbox') );
            var viewport = {
                    width  : $(window).width(),
                    height : $(window).height()
                };
            console.log('detectDevice viewport width:', viewport.width );
            console.log('detectDevice viewport height:', viewport.height );
            if (md.mobile()) {
                window.device = $.device = {'isMobile': true};
                if (md.phone()) {
                    $.device['isPhone'] = true;
                }
                if (md.tablet()) {
                    $.device['isTablet'] = true;
                }
                $.device['os'] = md.os();
                $.device['iPhone'] = md.is('iPhone');
                $.device['iPad'] = md.is('iPad');
                $.device['iPod'] = md.is('iPod');
                $.device['iPod'] = md.is('iPod');
                $.device['md'] = md;
                $.device['viewport'] = viewport;
            } else {
                window.device = $.device = null;
            }
        };
        
        $.menuSwipeActions = function() {
            document.addEventListener('touchstart', handleTouchStart, false);
            document.addEventListener('touchmove', handleTouchMove, false);
            document.addEventListener('touchend', handleTouchEnd, false);
            
            var swiper = {'up': false, 'down': false, 'left': false, 'right': false};
            
            var xDown = null;
            var yDown = null;

            function handleTouchStart(evt) {
                xDown = evt.touches[0].clientX;
                yDown = evt.touches[0].clientY;
                swiper = {'up': false, 'down': false, 'left': false, 'right': false};
            };
            
            function handleTouchEnd(evt) {
                $.publish('/cs/swipe', [swiper]);
            };

            function handleTouchMove(evt) {
                if ( ! xDown || ! yDown ) {
                    return;
                }

                var xUp = evt.touches[0].clientX;
                var yUp = evt.touches[0].clientY;

                var xDiff = xDown - xUp;
                var yDiff = yDown - yUp;

                if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
                    if ( xDiff > 0 ) {
                        /* left swipe */
                        swiper = {'up': false, 'down': false, 'left': true, 'right': false};
                    } else {
                        /* right swipe */
                        swiper = {'up': false, 'down': false, 'left': false, 'right': true};
                    }
                } else {
                    if ( yDiff > 0 ) {
                        /* up swipe */ 
                        swiper = {'up': true, 'down': false, 'left': false, 'right': false};
                    } else { 
                        /* down swipe */
                        swiper = {'up': false, 'down': true, 'left': false, 'right': false};
                    }
                }
                /* reset values */
                xDown = null;
                yDown = null;
            };
        };
        
        // initialize
        init();
     });// end doc ready
})(jQuery)