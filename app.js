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
      var cfgDetails = extractCfgDetails(window.utag.cfg);
      renderCfgTable(targetElement, cfgDetails);
      return;
    }

    if (attempts >= maxAttempts) {
      clearInterval(pollInterval);
      targetElement.textContent = "utag.cfg data not available.";
    }
  }, 250);
}

function extractCfgDetails(cfg) {
  var utidParts = parseUtid(cfg.utid || "");
  return {
    template: cfg.template || "N/A",
    domain: cfg.domain || "N/A",
    datasource: cfg.datasource || "N/A",
    environment: parseEnvironment(cfg.path || "") || "N/A",
    account: utidParts.account || "N/A",
    profile: utidParts.profile || "N/A",
    time: formatUtidTime(utidParts.time) || "N/A",
  };
}

function renderCfgTable(targetElement, cfgDetails) {
  var rows = Object.keys(cfgDetails)
    .map(function (key) {
      return (
        "<tr><th>" +
        capitalizeLabel(key) +
        "</th><td>" +
        cfgDetails[key] +
        "</td></tr>"
      );
    })
    .join("");
  targetElement.innerHTML =
    '<table class="config-table"><tbody>' + rows + "</tbody></table>";
}

function capitalizeLabel(label) {
  return label
    .split("_")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function parseEnvironment(pathValue) {
  if (!pathValue) {
    return null;
  }
  var trimmed = pathValue.replace(/\/+$/, "");
  var parts = trimmed.split("/");
  return parts.length ? parts[parts.length - 1] : null;
}

function parseUtid(utid) {
  var parts = (utid || "").split("/");
  if (parts.length < 3) {
    return { account: null, profile: null, time: null };
  }
  return {
    account: parts[0] || null,
    profile: parts[1] || null,
    time: parts[2] || null,
  };
}

function formatUtidTime(raw) {
  if (!raw) {
    return null;
  }
  var clean = raw.trim();
  if (!/^\d{12}$/.test(clean)) {
    return clean;
  }
  var year = clean.slice(0, 4);
  var month = clean.slice(4, 6);
  var day = clean.slice(6, 8);
  var hour = clean.slice(8, 10);
  var minute = clean.slice(10, 12);
  return year + "-" + month + "-" + day + " " + hour + ":" + minute;
}
