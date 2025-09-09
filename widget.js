(function () {
    const restaurant = document.currentScript.getAttribute("data-restaurant");
    console.log("Widget loaded for:", restaurant);
  
    fetch(`https:/zyra-api.onrender.com/api/promotions?restaurant=${restaurant}`)
      .then((res) => res.json())
      .then((promo) => {
        console.log("Promo fetched:", promo);
        if (promo && promo.active) {
          // ===== Overlay =====
          const overlay = document.createElement("div");
          overlay.style.position = "fixed";
          overlay.style.top = "0";
          overlay.style.left = "0";
          overlay.style.width = "100%";
          overlay.style.height = "100%";
          overlay.style.background = "rgba(0,0,0,0.6)";
          overlay.style.display = "flex";
          overlay.style.alignItems = "center";
          overlay.style.justifyContent = "center";
          overlay.style.zIndex = "9999";
          overlay.style.backdropFilter = "blur(6px)";
  
          // ===== Modal box =====
          const modal = document.createElement("div");
          modal.style.background = "rgba(255,255,255,0.95)";
          modal.style.padding = "0";
          modal.style.borderRadius = "16px";
          modal.style.boxShadow = "0 8px 30px rgba(0,0,0,0.25)";
          modal.style.width = "480px";
          modal.style.maxWidth = "90%";
          modal.style.fontFamily = "'Segoe UI', Roboto, sans-serif";
          modal.style.overflow = "hidden";
          modal.style.position = "relative";
          modal.style.animation = "fadeInScale 0.3s ease";
  
          // ===== Close button =====
          const closeBtn = document.createElement("span");
          closeBtn.innerHTML = "&times;";
          closeBtn.style.position = "absolute";
          closeBtn.style.top = "12px";
          closeBtn.style.right = "18px";
          closeBtn.style.fontSize = "26px";
          closeBtn.style.color = "#fff";
          closeBtn.style.background = "rgba(0,0,0,0.6)";
          closeBtn.style.borderRadius = "50%";
          closeBtn.style.width = "32px";
          closeBtn.style.height = "32px";
          closeBtn.style.display = "flex";
          closeBtn.style.alignItems = "center";
          closeBtn.style.justifyContent = "center";
          closeBtn.style.cursor = "pointer";
          closeBtn.style.transition = "background 0.2s ease";
          closeBtn.onmouseenter = () => (closeBtn.style.background = "rgba(0,0,0,0.8)");
          closeBtn.onmouseleave = () => (closeBtn.style.background = "rgba(0,0,0,0.6)");
          closeBtn.onclick = () => document.body.removeChild(overlay);
  
          // ===== Image section =====
          const img = document.createElement("img");
          img.src = promo.image || "https://www.allrecipes.com/thmb/fFW1o307WSqFFYQ3-QXYVpnFj6E=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/48727-Mikes-homemade-pizza-DDMFS-beauty-4x3-BG-2974-a7a9842c14e34ca699f3b7d7143256cf.jpg";
          img.alt = promo.title;
          img.style.width = "100%";
          img.style.height = "240px";
          img.style.objectFit = "cover";
          img.style.display = "block";
  
          // ===== Content section =====
          const content = document.createElement("div");
          content.style.padding = "24px";
  
          const title = document.createElement("h2");
          title.innerText = promo.title;
          title.style.margin = "0 0 12px 0";
          title.style.fontSize = "24px";
          title.style.fontWeight = "700";
          title.style.color = "#222";
  
          const desc = document.createElement("p");
          desc.innerText = promo.description;
          desc.style.fontSize = "16px";
          desc.style.lineHeight = "1.5";
          desc.style.color = "#444";
          desc.style.margin = "0";
  
          content.appendChild(title);
          content.appendChild(desc);
  
          modal.appendChild(closeBtn);
          modal.appendChild(img);
          modal.appendChild(content);
          overlay.appendChild(modal);
          document.body.appendChild(overlay);
  
          // ===== Add CSS Animations =====
          const style = document.createElement("style");
          style.innerHTML = `
            @keyframes fadeInScale {
              0% { opacity: 0; transform: scale(0.9); }
              100% { opacity: 1; transform: scale(1); }
            }
          `;
          document.head.appendChild(style);
        } else {
          console.log("No active promo.");
        }
      })
      .catch((err) => console.error("Widget error:", err));
  })();
  