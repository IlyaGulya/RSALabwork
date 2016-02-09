`use strict`;

$(function() {
  $(window).on('hashchange',function() {
    $.sammy(function(){
      this.get('#:page',function(){
        loadPage(this.params['page'])
      })
    }).run()
  });
  function easterEgg() {

  }
  function loadPage(page) {
    if (page == undefined || page == "") {
      showBlock("hello")
      toggleNav("hello")
    } else if (page == "azaz") {
      easterEgg()
    } else {
      showBlock(page)
      toggleNav(page)
    }
  }

  function showBlock(blockName) {
    $('#content>div').hide()
    $('#content>div[data-id='+ blockName +']').show()
  }

  function toggleNav(page) {
    $('ul.nav li').each(function() {
      $(this).removeClass("active")
    })
    $("ul.nav li#"+page).addClass("active")
  }
  loadPage()
});
