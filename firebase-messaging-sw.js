importScripts("https://www.gstatic.com/firebasejs/12.3.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.3.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBHwp2gpOD6mzEyA5nInZz0qrVDRo_G5FU",
    authDomain: "app1-38c8c.firebaseapp.com",
    projectId: "app1-38c8c",
    storageBucket: "app1-38c8c.firebasestorage.app",
    messagingSenderId: "697659997178",
    appId: "1:697659997178:web:734b3b41570fef15914243",
    measurementId: "G-S12H4SCSYB"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log("Notificación recibida:", payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
