
// Sidebar Script
// Param: 1. div-Element, das als Sidebar dient, 2. Navigation icon

function sidebar(sidebarcontainer, navicon) {
  $("#maincontainer").css("height", $(document).height());
  $("#sidebarcontainer").css("height", $(document).height());
  $("#maincontainer").css("width", $(document).width());
  $(sidebarcontainer).css("left", sidebarcontainer.width() * (-1)); // By default, the container is left to the left document border
  // Mouse click outside the sidebar -> Sidebar disappears
  $(document).mouseup(function (e) {
    if (!sidebarcontainer.is(e.target) // if the target of the click isn't the sidebarcontainer...
        && sidebarcontainer.has(e.target).length === 0) { // ... nor a descendant of the container
      if (getXright() == sidebarcontainer.width()) {
        sidebarcontainer.animate({"left": "-=" + sidebarcontainer.width() + "px"}, "slow", function () {
          $(navicon).fadeIn("slow"); // Navicon appears
        });
      }
    }
  });
  // Mouse Click on the navicon -> Sidebar appears
  $(navicon).click(function () {
    sidebarcontainer.animate({"left": "+=" + sidebarcontainer.width() + "px"}, "slow", function () {
      $(navicon).fadeOut("fast"); // Navicon disappears
    });
  });
  function getXright() {
    var left = $(sidebarcontainer).position().left;// get left position
    var width = $(sidebarcontainer).width(); // get width;
    return left + width;
  }
}