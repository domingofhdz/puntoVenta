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
    return `/test/pwas/app/puntoVenta/${(file ? file : "")}`
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

// Definimos las constantes como venían en el pwa-sw.js .
const PRECACHENAME          = "pwa-precache-v1"
const SYNCEVENTNAME         = "pwa-sync-notifications"
const PERIODICSYNCEVENTNAME = "pwa-periodic-sync-notifications"

// Definimos el ping.php de nuestro proyecto.
const PINGURL               = asset("ping.php")

regAll()

setTimeout(disableAll, 100)
setTimeout(validateOnline, 1000)
