/*
* Core site constants used for 
*/
quaid.site = {
  siteRoot: String(window.location).replace(/(.*yoursite\/|www.yoursite.com\/).*/i,"$1"),
  currentDirectory: String(window.location).replace(/(.*yoursite\/|www..yoursite.com\/)(.*\/).*/i, "$1$2")
}
