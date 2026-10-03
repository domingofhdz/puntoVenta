/*
  Nexus System Template
  https://templatemo.com/tm-629-nexus-system
*/

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var cards = Array.prototype.slice.call(document.querySelectorAll(".zcard"));
  var hudFill = document.getElementById("hudFill");
  var hudPct = document.getElementById("hudPct");
  var navUp = document.getElementById("navUp");
  var navDown = document.getElementById("navDown");

  var vh = window.innerHeight;
  var ticking = false;

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  /* the z-depth escalator engine */
  function renderEngine() {
    var y = window.scrollY || window.pageYOffset || 0;
    var i, entry, recede, scale, ty;

    for (i = 0; i < cards.length; i++) {
      entry = i === 0 ? 1 : clamp01((y - (i - 1) * vh) / vh);
      recede = i === cards.length - 1 ? 0 : clamp01((y - i * vh) / vh);
      scale = 1 - 0.1 * recede;
      ty = (1 - entry) * 100;
      cards[i].style.transform = "translateY(" + ty + "%) scale(" + scale + ")";
      cards[i].style.opacity = String(1 - 0.6 * recede);
    }
  }

  /* hud scroll progress, works in both engine and static modes */
  function renderProgress() {
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    var p = clamp01((window.scrollY || window.pageYOffset || 0) / max);
    hudFill.style.width = (p * 100) + "%";
    hudPct.textContent = String(Math.round(p * 100)).padStart(3, "0") + "%";
    navUp.disabled = p <= 0.001;
    navDown.disabled = p >= 0.999;
  }

  function onFrame() {
    if (!reduceMotion) { renderEngine(); }
    renderProgress();
    ticking = false;
  }

  function requestRender() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onFrame);
    }
  }

  window.addEventListener("scroll", requestRender, { passive: true });

  window.addEventListener("resize", function () {
    vh = window.innerHeight;
    requestRender();
  });

  /* fallback render for iframe previews where scroll may never fire */
  setTimeout(requestRender, 3000);
  requestRender();

  /* up and down arrow nav: snaps to exact card boundaries */
  function gotoCard(index) {
    var i = Math.max(0, Math.min(cards.length - 1, index));
    var top;

    if (reduceMotion) {
      top = cards[i].getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      window.scrollTo(0, top);
    } else {
      window.scrollTo({ top: i * vh, behavior: "smooth" });
    }
  }

  navUp.addEventListener("click", function () {
    var y = window.scrollY || window.pageYOffset || 0;
    gotoCard(Math.ceil(y / vh - 0.001) - 1);
  });

  navDown.addEventListener("click", function () {
    var y = window.scrollY || window.pageYOffset || 0;
    gotoCard(Math.floor(y / vh + 0.001) + 1);
  });

  /* kinetic accordion: hover on fine pointers, tap or click everywhere */
  var accordion = document.getElementById("accordion");
  var slices = Array.prototype.slice.call(accordion.querySelectorAll(".slice"));
  var hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function setActiveSlice(target) {
    slices.forEach(function (s) {
      var on = s === target;
      s.classList.toggle("active", on);
      s.setAttribute("aria-expanded", on ? "true" : "false");
    });
  }

  slices.forEach(function (slice) {
    if (hoverCapable) {
      slice.addEventListener("mouseenter", function () { setActiveSlice(slice); });
      slice.addEventListener("focus", function () { setActiveSlice(slice); });
    }
    slice.addEventListener("click", function () {
      if (slice.classList.contains("active") && !hoverCapable) {
        setActiveSlice(null);
      } else {
        setActiveSlice(slice);
      }
    });
  });

  if (hoverCapable) {
    accordion.addEventListener("mouseleave", function () { setActiveSlice(null); });
  }

  /* matrix tabs with data-goto switching */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".matrix-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".matrix-img"));
  var caption = document.getElementById("matrixCaption");

  var captions = {
    core: "FIG. 01 / CORE FRAME",
    fluidics: "FIG. 02 / FLUIDICS MANIFOLD",
    sync: "FIG. 03 / SYNC TIMING PLANE"
  };

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-goto");

      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });

      panels.forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-panel") === key);
      });

      caption.textContent = captions[key];
    });
  });


  /**
   * Configuraci.n Navegaci.n y localStorage
   */
  function beforeUnloadHandler(event) {
      event.preventDefault()
      event.returnValue = "Seguro que quieres abandonar este sitio?"
  
      return "Seguro que quieres abandonar este sitio?"
  }
  function addBeforeUnloadListener() {
      window.addEventListener("beforeunload", beforeUnloadHandler)
  }
  function removeBeforeUnloadListener() {
      window.removeEventListener("beforeunload", beforeUnloadHandler)
  }
  function asset(file) {
      return `http://localhost/test/pwas/app/puntoVenta/${(file ? file : "")}`
  }
  function reload(redir) {
      window.location = asset((redir ? redir : ""))
  }
  
  
  /**
   * Manejo de eventos online y offline
   */
  function sincronizarOffline() {
  }
  function disableAll() {
    const elements = document.querySelectorAll(".while-waiting")
    elements.forEach(function (el, index) {
      el.setAttribute("disabled", "true")
      el.classList.add("disabled")
    })
  }
  function enableAll() {
    const elements = document.querySelectorAll(".while-waiting")
    elements.forEach(function (el, index) {
      el.removeAttribute("disabled")
      el.classList.remove("disabled")
    })
  }
  function validateOnline() {
      disableAll()
  
      const xhr = (XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHttp"))
      xhr.onload = function () {
          enableAll()
          sincronizarOffline()
      }
      xhr.onerror = disableAll
      xhr.open("GET", PINGURL, true)
      xhr.send()
  }
  
  window.addEventListener("online", function (event) {
      console.log("Se reestableció la conexión")
      validateOnline()
  })
  window.addEventListener("offline", function (event) {
      console.log("Se perdió la conexión")
      validateOnline()
  })
  
  
  /**
   * Configuraci.n Service Worker
   */
  function regAll(fun) {
      if ("serviceWorker" in navigator) {
          console.log("info")
          console.info("Compatible con serviceWorker.")
  
          regWorker(fun)
      }
  
      if ("PushManager" in window) {
          console.log("info")
          console.info("Compatible con PushManager.")
  
          regSyncNotifications()
          regPeriodicSyncNotifications()
      }
  }
  async function regWorker(fun) {
      // Registramos el service worker, sin este paso no funcionará nuestra aplicación web progresiva.
      navigator.serviceWorker.register(asset("pwa-sw.js")).then(function (reg) {
          if (typeof fun == "function") {
              fun()
          }
  
          if (!("sync" in reg)) {
              console.log("error")
              console.error("Error registering background sync")
  
              syncNotifications(reg)
          }
  
          console.log("info")
          console.info("Yey!", reg)
  
          navigator.serviceWorker.addEventListener("message", function (event) {
              const data    = event.data
              const subject = data.subject
              const message = data.message
              if (subject == "installationProgress") {
                  const length = message.length
                  const x      = parseInt(message.x) + 1
  
                  const porcentaje = x/length*100
  
                  console.log(`${x} de ${length} archivo(s) ${porcentaje.toFixed(2)} %`)

                  document.querySelector("#descripcionPorcentaje").innerHTML = `${x} de ${length} archivo(s)`
                  document.querySelector("#porcentaje").innerHTML = `${porcentaje.toFixed(2)} %`
              }
          })
  
          const installingWorker = reg.installing
  
          if (installingWorker) {
              addBeforeUnloadListener()
  
              document.querySelector("#mensajeInstalling").style.display = "block"

              installingWorker.addEventListener("statechange", function () {
                  const state = installingWorker.state
                  if (state == "installed") {
                      removeBeforeUnloadListener()

                      setInterval(function () {
                          document.querySelector("#mensajeInstalling").style.display = "none"
                      }, 1000)
                  }
              })
          }
      })
  }
  async function regSyncNotifications() {
      navigator.serviceWorker.ready.then(function (reg) {
          if ("sync" in reg) {
              reg.sync.register(SYNCEVENTNAME)
              .then(function () {
                  console.log("info")
                  console.info("Registered background sync")
              })
              .catch(function (err) {
                  console.log("error")
                  console.error("Error registering background sync", err)
  
                  syncNotifications(reg)
              })
          }
      })
  }
  async function regPeriodicSyncNotifications() {
      navigator.serviceWorker.ready.then(function (reg) {
          if ("periodicSync" in reg) {
              navigator.permissions.query({
                  name: "periodic-background-sync"
              }).then(function (status) {
                  console.log("info")
  
                  if (status.state === "granted") {
                      console.info("Periodic background sync can be used.")
  
                      reg.periodicSync.register(PERIODICSYNCEVENTNAME, {
                          minInterval: 24 * 60 * 60 * 1000
                      })
                      .then(function () {
                          console.log("info")
                          console.info("Registered periodic background sync")
                      })
                      .catch(function (err) {
                          console.log("error")
                          console.error("Periodic background sync cannot be used.", err)
                      })
                  }
                  else {
                      console.info("Periodic background sync cannot be used.")
                  }
              })
          }
      })
  }
  function syncNotifications(reg) {}
  function periodicSyncNotifications(reg) {}
  async function unregWorker(redir, /** fun */ ) {
      if (!("serviceWorker" in navigator)) {
          console.log("info")
          console.info("Sin soporte a serviceWorker.")
  
          return
      }
  
      navigator.serviceWorker.ready
      .then(function (reg) {
          reg.unregister()
          if ("periodicSync" in reg) {
              reg.periodicSync.unregister(PERIODICSYNCEVENTNAME)
          }
  
          caches.delete(PRECACHENAME)
          .then(function () {
              if (typeof fun == "function") {
                  // No soportado en celular el cacheado sin recargar.
                  // regAll(fun)
                  // return
              }
  
              reload(redir)
          })
          .catch(function (err) {
              console.log("error")
              console.error("Boo!", err)
          })
      })
      .catch(function (err) {
          console.log("error")
          console.error("Boo!", err)
      })
  }
  function reinstall(redir) {
      if (redir) {
      }
  
      unregWorker(redir, /** function () {
          // cacheado sin recargar.
      } */ )
  }
  
  regAll()
  
  // Definimos las constantes como venían en el pwa-sw.js .
  const PRECACHENAME          = "pwa-precache-v1"
  const SYNCEVENTNAME         = "pwa-sync-notifications"
  const PERIODICSYNCEVENTNAME = "pwa-periodic-sync-notifications"
  
  // Definimos el ping.php de nuestro proyecto.
  const PINGURL               = asset("ping.php")


})();
