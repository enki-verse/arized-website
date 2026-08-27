(function (global) {
  const SESSION_KEY = "arizedAuctionSession";

  function getApiUrl() {
    const fromConfig =
      global.AUCTION_CONFIG && String(global.AUCTION_CONFIG.apiUrl || "").trim();
    if (fromConfig) return fromConfig;
    const fromAdmin = (localStorage.getItem("auctionApiUrl") || "").trim();
    if (fromAdmin) return fromAdmin;
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

  function parseResponse(text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  function toQuery(url, payload) {
    const u = new URL(url, location.href);
    Object.keys(payload || {}).forEach(function (k) {
      const v = payload[k];
      if (v == null || v === "") return;
      if (typeof v === "object") u.searchParams.set(k, JSON.stringify(v));
      else u.searchParams.set(k, String(v));
    });
    return u.toString();
  }

  async function call(payload) {
    const url = getApiUrl();
    if (!url) {
      return {
        ok: false,
        error:
          "Auction API is not connected yet. Push js/auction-config.js with the Apps Script URL, then hard-refresh.",
      };
    }
    const isGas = /script\.google\.com/i.test(url);
    const readActions = {
      getAuction: true,
      getPaintings: true,
      getPainting: true,
      me: true,
      myBids: true,
    };
    // Writes must POST. Long artwork ids + image URLs blow the GET length limit,
    // which is why flagged works never reached the Sheet.
    if (isGas && readActions[payload.action]) {
      try {
        const getRes = await fetch(toQuery(url, payload), {
          method: "GET",
          redirect: "follow",
        });
        const getText = await getRes.text();
        const getJson = parseResponse(getText);
        if (getJson) return getJson;
      } catch (err) {
        /* fall through to POST */
      }
    }

    try {
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
      const json = parseResponse(text);
      if (json) return json;
      return {
        ok: false,
        error:
          "Auction server returned a web page instead of data. In Apps Script: Deploy > Manage deployments > Web app must be Execute as Me and Who has access = Anyone. Then deploy a new version.",
      };
    } catch (err) {
      return { ok: false, error: err.message || "Network error talking to auction server." };
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
