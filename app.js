window.onload = function () {
  console.log("App loaded");
  var currentConfig = this.document.getElementById("utagjs").src;
  this.document.getElementById("config").innerText = currentConfig;
  console.log("Current Config: " + currentConfig);
};
