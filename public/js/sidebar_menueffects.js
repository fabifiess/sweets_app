// Menu unfold, highlight
(function menuEffects() {
    // Main Menu Items, Sub Menu Items, Sub Sub Menu Items
    modifyClass4Css("main_menuitem");
    modifyClass4Css("sub_menuitem");
    modifyClass4Css("sub_sub_menuitem");

    // menuAnimation(label, content); --> Mit Click auf das Label wird der Content geöffnet
    for (var i = 1; i < 15; i++) {
        menuAnimation($("#" + i), $("#" + i + "_menu"));
        for (var j = 1; j < 15; j++) {
            menuAnimation($("#" + i + "_" + j), $("#" + i + "_" + j + "_menu"));
            for (var k = 1; k < 15; k++) {
                menuAnimation($("#" + i + "_" + j + "_" + k), $("#" + i + "_" + j + "_" + k + "_menu"));
            }
        }
    }

    // CSS Styles für Main Menu Items, Sub Menu Items, Sub Sub Menu Items
    function modifyClass4Css(menuitem) {
        $("." + menuitem).hover(function () {
            $(this).stop(true, true).addClass(menuitem + "_hover", 300);
        }, function () {
            $(this).stop(true, true).removeClass(menuitem + "_hover", 300);
        });

        $("." + menuitem).click(function () {
            $("." + menuitem).removeClass(menuitem + "_active");
            $(this).removeClass(menuitem + "_hover").addClass(menuitem + "_active");
        });
    }

    // Animation Menüs aufklappen
    function menuAnimation(label, content) {
        content.hide();
        label.click(function () {
            content.slideToggle("fast");
        });
    }
})();