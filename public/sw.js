// Service worker : affiche les notifications de l'église et ouvre la bonne page au clic.

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "EBB-JR Tanmey", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "EBB-JR Tanmey", {
      body: data.body || "",
      icon: "/brand/logo-ebb-jr-192.png",
      badge: "/brand/logo-ebb-jr-192.png",
      tag: data.tag,
      data: { url: data.url || "/" },
      lang: "fr",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
