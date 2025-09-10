(function () {
  const restaurant = document.currentScript.getAttribute("data-restaurant");
  console.log("Widget loaded for:", restaurant);

  fetch(`https://zyra-api.onrender.com/api/promotions?restaurant=${restaurant}`)
    .then((res) => res.json())
    .then((promo) => {
      console.log("Promo fetched:", promo);

      const today = new Date().toISOString().split("T")[0];
      const isActive =
        promo &&
        promo.active &&
        (!promo.startDate || today >= promo.startDate) &&
        (!promo.endDate || today <= promo.endDate);

      if (isActive && promo.html) {
        // ===== Overlay =====
        const overlay = document.createElement("div");
        overlay.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; backdrop-filter: blur(6px);
        `;

        // ===== Modal =====
        const modal = document.createElement("div");
        modal.style.cssText = `
          background: rgba(255,255,255,0.95);
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
          width: 500px; max-width: 90%;
          font-family: 'Segoe UI', Roboto, sans-serif;
          overflow: hidden; position: relative;
          animation: fadeInScale 0.3s ease;
        `;

        // ===== Close Button =====
        const closeBtn = document.createElement("span");
        closeBtn.innerHTML = "&times;";
        closeBtn.style.cssText = `
          position: absolute; top: 12px; right: 18px;
          font-size: 26px; color: #fff;
          background: rgba(0,0,0,0.6);
          border-radius: 50%; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s ease;
        `;
        closeBtn.onmouseenter = () =>
          (closeBtn.style.background = "rgba(0,0,0,0.8)");
        closeBtn.onmouseleave = () =>
          (closeBtn.style.background = "rgba(0,0,0,0.6)");
        closeBtn.onclick = () => document.body.removeChild(overlay);

        modal.appendChild(closeBtn);

        // ===== Insert Admin-Generated HTML =====
        modal.insertAdjacentHTML("beforeend", promo.html);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // ===== CSS Animation =====
        const style = document.createElement("style");
        style.innerHTML = `
          @keyframes fadeInScale {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
      } else {
        console.log("No active promo or outside date range.");
      }
    })
    .catch((err) => console.error("Widget error:", err));
})();
