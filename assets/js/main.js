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
      $('#content').load('/hello.html')
      toggleNav("hello")
    } else if (page == "azaz") {
      easterEgg()
    } else {
      $('#content').load('/'+page+'.html', function() {
        toggleNav(page)
      })
    }
  }
  function toggleNav(page) {
    $('ul.nav li').each(function() {
      $(this).removeClass("active")
    })
    $("ul.nav li#"+page).addClass("active")
  }
  loadPage()
});
