window.onload = function () {
  console.log("App loaded");
  var utagScript = document.getElementById("utagjs");
  var configElement = document.getElementById("config");

  if (utagScript && configElement) {
    var currentConfig = utagScript.src;
    configElement.innerText = currentConfig;
    console.log("Current Config: " + currentConfig);
  }

  var cfgDisplay = document.getElementById("utagCfg");
  if (cfgDisplay) {
    cfgDisplay.innerText = "Waiting for utag.cfg data...";
    displayUtagCfg(cfgDisplay);
  }
};

function displayUtagCfg(targetElement) {
  var attempts = 0;
  var maxAttempts = 40;
  var pollInterval = setInterval(function () {
    attempts++;

    if (window.utag && window.utag.cfg) {
      clearInterval(pollInterval);
      try {
        var cfgString = JSON.stringify(window.utag.cfg, null, 2);
        targetElement.textContent = cfgString;
      } catch (err) {
        targetElement.textContent = "Error stringifying utag.cfg: " + err;
      }
      return;
    }

    if (attempts >= maxAttempts) {
      clearInterval(pollInterval);
      targetElement.textContent = "utag.cfg data not available.";
    }
  }, 250);
}
