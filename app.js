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
  var timeParts = formatUtidTimeParts(utidParts.time);
  return {
    account: utidParts.account || "N/A",
    profile: utidParts.profile || "N/A",
    environment: parseEnvironment(cfg.path || "") || "N/A",

    template: cfg.template || "N/A",

    last_publish_date: timeParts.date || "N/A",
    last_publish_time_tealium_format: timeParts.time24 || "N/A",
    last_publish_time_central: timeParts.time12 || "N/A",
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

function formatUtidTimeParts(raw) {
  if (!raw) {
    return { date: null, time24: null, time12: null };
  }
  var clean = raw.trim();
  if (!/^\d{12}$/.test(clean)) {
    return { date: clean, time24: clean, time12: clean };
  }
  var year = parseInt(clean.slice(0, 4), 10);
  var month = parseInt(clean.slice(4, 6), 10) - 1;
  var day = parseInt(clean.slice(6, 8), 10);
  var hour = parseInt(clean.slice(8, 10), 10);
  var minute = parseInt(clean.slice(10, 12), 10);
  var utcDate = new Date(Date.UTC(year, month, day, hour, minute));
  var rawTime = clean.slice(8, 12);

  try {
    var centralDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(utcDate);

    var centralTime12 = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(utcDate);

    return { date: centralDate, time24: rawTime, time12: centralTime12 };
  } catch (err) {
    var fallbackDate =
      clean.slice(0, 4) + "-" + clean.slice(4, 6) + "-" + clean.slice(6, 8);
    var fallbackTime12 = fallbackTo12Hour(
      clean.slice(8, 10),
      clean.slice(10, 12)
    );
    return { date: fallbackDate, time24: rawTime, time12: fallbackTime12 };
  }
}

function fallbackTo12Hour(hourStr, minuteStr) {
  var hourNum = parseInt(hourStr, 10);
  if (isNaN(hourNum)) {
    return hourStr + ":" + minuteStr;
  }
  var suffix = hourNum >= 12 ? "PM" : "AM";
  var hour12 = hourNum % 12;
  if (hour12 === 0) {
    hour12 = 12;
  }
  return hour12 + ":" + minuteStr + " " + suffix;
}
