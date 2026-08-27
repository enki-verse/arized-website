(function (global) {
  const SESSION_KEY = "arizedAuctionSession";

  function getApiUrl() {
    const fromAdmin = localStorage.getItem("auctionApiUrl");
    if (fromAdmin && fromAdmin.trim()) return fromAdmin.trim();
    if (global.AUCTION_CONFIG && global.AUCTION_CONFIG.apiUrl) {
      return String(global.AUCTION_CONFIG.apiUrl).trim();
    }
    const host = location.hostname;
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      location.port === "8080"
    ) {
      return location.origin + "/api/auction";
    }
    return "";
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }

  function setSession(session) {
    if (!session) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  async function call(payload) {
    const url = getApiUrl();
    if (!url) {
      return {
        ok: false,
        error:
          "Auction API is not connected yet. Paste the Apps Script URL in the admin panel.",
      };
    }
    const isGas = /script\.google\.com/i.test(url);
    const res = await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": isGas
          ? "text/plain;charset=utf-8"
          : "application/json",
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { ok: false, error: "Unexpected response from auction server." };
    }
  }

  function withToken(payload) {
    const session = getSession();
    if (session && session.token) payload.token = session.token;
    return payload;
  }

  global.AuctionAPI = {
    getApiUrl,
    getSession,
    setSession,
    call,
    getAuction() {
      return call({ action: "getAuction" });
    },
    getPaintings() {
      return call({ action: "getPaintings" });
    },
    getPainting(id) {
      return call({ action: "getPainting", paintingId: id });
    },
    register(fields) {
      return call({ action: "register", ...fields });
    },
    login(email, password) {
      return call({ action: "login", email, password });
    },
    logout() {
      const session = getSession();
      return call({ action: "logout", token: session && session.token });
    },
    me() {
      return call(withToken({ action: "me" }));
    },
    placeBid(paintingId, amount) {
      return call(withToken({ action: "placeBid", paintingId, amount }));
    },
    myBids() {
      return call(withToken({ action: "myBids" }));
    },
    admin(action, extra) {
      const adminKey = localStorage.getItem("auctionAdminKey") || "";
      return call({ action, adminKey, ...(extra || {}) });
    },
  };
})(window);
