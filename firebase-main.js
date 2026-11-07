import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "AIzaSyBHwp2gpOD6mzEyA5nInZz0qrVDRo_G5FU",
    authDomain: "app1-38c8c.firebaseapp.com",
    projectId: "app1-38c8c",
    storageBucket: "app1-38c8c.firebasestorage.app",
    messagingSenderId: "697659997178",
    appId: "1:697659997178:web:734b3b41570fef15914243",
    measurementId: "G-S12H4SCSYB"
};


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const btnRecibirNotificaciones = document.getElementById("btnRecibirNotificaciones");
if (btnRecibirNotificaciones) {
    btnRecibirNotificaciones.addEventListener("click", async function () {
        try {
            const permiso = await Notification.requestPermission();
            if (permiso === "granted") {
                const token = await getToken(messaging, {
                    vapidKey: "BAo97hDKovEgLz5ticXJeDKJZtNZtcz3oSNFg-r3As5xtGyiJzbUG6GQbraeXcsSLewVJf42r7qTKjBkmy-eLUo",
                    serviceWorkerRegistration: await navigator.serviceWorker.ready
                });
                console.log("Firebase Token:", token);
                localStorage.setItem("fbtoken", token);
            }
            else {
                console.error("Permiso denegado.");
            }
        }
        catch (error) {
            console.error("No se pudo obtener el token:", error);
        }
    });
}

onMessage(messaging, function (payload) {
    console.log("Notificación recibida (foreground):", payload);
    console.log("Título Notificación:", payload.notification.title);
    console.log("Contenido Notificación:", payload.notification.body);
});


// Hace 1 año funcionaba, mejor le pongo un false de momento :(
if ("serviceWorker" in navigator && false) {
    navigator.serviceWorker
    .register("./firebase-messaging-sw.js")
    .then(function (registration) {
        console.log("Service Worker registrado correctamente:", registration);
    })
    .catch(function (error) {
        console.error("Error al registrar el Service Worker:", error);
    });
}
