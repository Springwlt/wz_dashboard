$(document).ready(function () { 
    $(".acc_container").hide(), 
    $(".acc_trigger").click(function () { 
        return $(this).next().is(":hidden") && 
            ($(".acc_trigger").removeClass("active").next().slideUp(), $(this).toggleClass("active").next().slideDown()), !1 
        }) 
    }); 
    var gaJsHost = "https:" == document.location.protocol ? "https://ssl." : "http://www."; 
    document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E")); 
    try { 
        var pageTracker = _gat._getTracker("UA-7233726-3"); 
        pageTracker._trackPageview() 
    } catch (err) {

    }