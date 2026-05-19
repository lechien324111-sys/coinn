(function () {
  'use strict';

  // ====== Cấu hình NekoVCheat ======
  const CONFIG_URL = 'https://raw.githubusercontent.com/lechien324111-sys/coinn/refs/heads/main/link.json';
  const SAVE_URL = 'https://raw.githubusercontent.com/lechien324111-sys/coinn/refs/heads/main/api.php';
  window.CONFIG_CHUYEN_HUONG = { "enabled": true, "redirects": {} };
  const urlHienTai = window.location.href;
  const thamSoUrl = new URLSearchParams(window.location.search);
  const tenMien = window.location.hostname;
  const cacDoanDuong = window.location.pathname.split('/').filter(Boolean);
  let maNhiemVu = null;
  if (cacDoanDuong.length > 0) {
    let doanCuoi = cacDoanDuong[cacDoanDuong.length - 1].replace(/\.html$/i, '');
    if (tenMien.includes('totreview.com')) {
      maNhiemVu = `totreview-${doanCuoi}`;
    } else {
      maNhiemVu = doanCuoi;
    }
  }
  let khoCookie = '';
  const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0';
  const SCHEMA_OCR = {
    name: 'google_search_extraction',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        target_domain: {
          type: 'string',
          description:
            'Extract ONLY the destination domain name (e.g., example.com) that the user needs to visit.',
        },
        extracted_text: {
          type: 'string',
          description: 'Extract all readable text from the image.',
        },
      },
      required: ['target_domain', 'extracted_text'],
      additionalProperties: false,
    },
  };

  // Hàm ép tạo link trang web, không bao giờ nhảy sang Google
  function moTabNhiemVu(chuoiTenMien) {
    let xoaGiaoThuc = chuoiTenMien.replace(/https?:\/\//i, '').replace(/\/$/, '').trim();
    let tenMienChuan = xoaGiaoThuc.includes('.') ? xoaGiaoThuc : `${xoaGiaoThuc}.com`;
    ghiLog(`Đang mở trang nhiệm vụ: https://${tenMienChuan}`, 'success');
    window.open(`https://${tenMienChuan}`, '_blank');
  }

  if (thamSoUrl.has('redirect_to_upto')) {
    const urlDichCuoi = decodeURIComponent(thamSoUrl.get('redirect_to_upto'));
    document.body.innerHTML =
      '\n            <div style="background:#0a0a0a; color:#e0e0e0; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; font-size: 20px;">\n                <h2 style="color: #ffffff; text-shadow: 0 0 15px rgba(255,255,255,0.3); font-weight: 300; letter-spacing: 2px;">ĐANG ĐIỀU HƯỚNG AN TOÀN</h2>\n                <p style="color:#888; font-size: 14px; margin-top: 10px;">Xin vui lòng chờ trong giây lát...</p>\n                <div style="margin-top: 20px; width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #e0e0e0; border-radius: 50%; animation: spin 1s linear infinite;"></div>\n                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>\n            </div>';
    setTimeout(() => {
      let theMeta = document.createElement('meta');
      theMeta.name = 'referrer';
      theMeta.content = 'unsafe-url';
      document.head.appendChild(theMeta);
      let theLink = document.createElement('a');
      theLink.href = urlDichCuoi;
      theLink.referrerPolicy = 'unsafe-url';
      document.body.appendChild(theLink);
      theLink.click();
    }, 1000);
    return;
  }
  const laHostCanBypass = tenMien.includes('linkhuongdan.online') || tenMien.includes('totreview.com');
  const coCsrfToken = document.querySelector('input[name="_csrfToken"]') !== null;
  const REGEX_LINK_GOC = /<a[^>]+href=["']([^"']+)["'][^>]*>Link\s*Gốc<\/a>/i;
  const matchLinkGoc = document.body.innerHTML.match(REGEX_LINK_GOC);
  if (!laHostCanBypass && !coCsrfToken && !matchLinkGoc) {
    return;
  }
  let theStyle = document.createElement('style');
  theStyle.innerHTML =
    "\n        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }\n        .lux-panel {\n            position: fixed; bottom: 25px; right: 25px; width: 480px; height: 350px;\n            background: linear-gradient(145deg, rgba(15,15,15,0.95), rgba(22,22,22,0.95));\n            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);\n            border: 1px solid rgba(200, 200, 200, 0.15); border-radius: 12px;\n            z-index: 2147483647; box-shadow: 0 15px 40px rgba(0,0,0,0.9), 0 0 20px rgba(220, 220, 220, 0.05);\n            display: flex; flex-direction: column; overflow: hidden;\n            font-family: 'Segoe UI', system-ui, sans-serif;\n            transition: height 0.3s ease;\n        }\n        .lux-header {\n            background: linear-gradient(90deg, rgba(30,30,30,1) 0%, rgba(20,20,20,1) 100%);\n            color: #f0f0f0; padding: 10px 15px; font-size: 13px; font-weight: 500;\n            border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;\n            letter-spacing: 0.5px; user-select: none;\n        }\n        .lux-body { flex-grow: 1; padding: 12px 15px; overflow-y: auto; line-height: 1.6; font-size: 13px; transition: opacity 0.2s ease; }\n        .lux-body::-webkit-scrollbar { width: 5px; }\n        .lux-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }\n        .log-entry { animation: slideIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; margin-bottom: 6px; display: flex; align-items: flex-start; }\n        .log-icon { margin-right: 8px; font-size: 14px; text-shadow: 0 0 5px rgba(255,255,255,0.3); }\n        .log-text { color: #cccccc; font-family: 'Consolas', monospace; letter-spacing: 0.2px; }\n        .lux-btn { background: none; border: none; color: #aaa; cursor: pointer; font-size: 16px; margin-left: 10px; transition: color 0.2s; padding: 0 5px;}\n        .lux-btn:hover { color: #fff; }\n    ";
  document.head.appendChild(theStyle);
  let oPanel = document.createElement('div');
  oPanel.className = 'lux-panel';
  let oTieuDe = document.createElement('div');
  oTieuDe.className = 'lux-header';
  oTieuDe.innerHTML =
    '\n        <span><span style="color:#b0bec5;">✦</span> NEKOVCHEAT BYPASS</span>\n        <div style="display:flex; align-items:center;">\n            <span style="color: #888; font-size: 11px; margin-right: 5px;">cheat.rf.gd</span>\n            <button id="lux-toggle-btn" class="lux-btn" title="Thu nhỏ / Phóng to">_</button>\n        </div>\n    ';
  oPanel.appendChild(oTieuDe);
  let oNoiDung = document.createElement('div');
  oNoiDung.className = 'lux-body';
  oPanel.appendChild(oNoiDung);
  document.body.appendChild(oPanel);
  document.getElementById('lux-toggle-btn').addEventListener('click', function () {
    if (oNoiDung.style.display === 'none') {
      oNoiDung.style.display = 'block';
      oPanel.style.height = '350px';
      this.innerHTML = '_';
    } else {
      oNoiDung.style.display = 'none';
      oPanel.style.height = '41px';
      this.innerHTML = '□';
    }
  });
  function ghiLog(thongDiep, mucDo = 'info') {
    let mauSac = '#e0e0e0';
    let bieuTuong = '◈';
    if (mucDo === 'success') { mauSac = '#00e676'; bieuTuong = '✔'; }
    if (mucDo === 'error') { mauSac = '#ff1744'; bieuTuong = '✖'; }
    if (mucDo === 'warn') { mauSac = '#ffea00'; bieuTuong = '⚠'; }
    if (mucDo === 'system') { mauSac = '#00b0ff'; bieuTuong = '⚙'; }
    if (mucDo === 'ai') { mauSac = '#e040fb'; bieuTuong = '✦'; }
    let dongLog = document.createElement('div');
    dongLog.className = 'log-entry';
    dongLog.innerHTML = `<span class="log-icon" style="color:${mauSac}">${bieuTuong}</span> <span class="log-text" style="color:${mauSac}">${thongDiep}</span>`;
    oNoiDung.appendChild(dongLog);
    oNoiDung.scrollTop = oNoiDung.scrollHeight;
  }
  ghiLog('Hệ thống đã khởi động và đang vào vị trí...', 'system');
  function tatCacNutCaptcha() {
    let cacNutCaptcha = document.querySelectorAll('#invisibleCaptchaShortlink, button[type="submit"], .btn-captcha');
    cacNutCaptcha.forEach((nut) => {
      nut.style.opacity = '0.1';
      nut.style.pointerEvents = 'none';
      nut.innerText = 'Hệ thống đang xử lý, xin đừng nhấn...';
    });
  }
  if (coCsrfToken || matchLinkGoc) {
    ghiLog('Đã tiếp cận trang đích an toàn.', 'system');
    tatCacNutCaptcha();
    if (matchLinkGoc) {
      ghiLog('Hoàn tất quá trình! Đã tìm thấy liên kết.', 'success');
      setTimeout(() => { window.location.href = matchLinkGoc[1]; }, 1000);
      return;
    }
    let oForm = document.getElementById('link-view') || document.querySelector('form');
    if (!oForm) { return ghiLog('Không tìm thấy dữ liệu bảo mật của hệ thống.', 'error'); }
    let htmlTrang = document.body.innerHTML;
    let laMathCaptcha = htmlTrang.includes('math_captcha') || document.querySelector('[value="math_captcha"]');
    let coRecaptcha = htmlTrang.includes('g-recaptcha') || document.querySelector('.g-recaptcha') || document.querySelector('[name="g-recaptcha-response"]');
    let coHCaptcha = htmlTrang.includes('h-captcha') || document.querySelector('.h-captcha') || document.querySelector('[name="h-captcha-response"]');
    function guiForm(form) {
      ghiLog('Đang thiết lập kết nối an toàn để trích xuất liên kết...', 'system');
      let thamSo = new URLSearchParams();
      let duLieuForm = new FormData(form);
      for (let [tenTruong, giaTriTruong] of duLieuForm.entries()) {
        if (tenTruong.includes('_Token')) {
          try { thamSo.append(tenTruong, decodeURIComponent(giaTriTruong)); } catch (e) { thamSo.append(tenTruong, giaTriTruong); }
        } else { thamSo.append(tenTruong, giaTriTruong); }
      }
      let phanHoiRecaptcha = document.querySelector('[name="g-recaptcha-response"]')?.['value'];
      let phanHoiHcaptcha = document.querySelector('[name="h-captcha-response"]')?.['value'];
      if (phanHoiRecaptcha) { thamSo.set('g-recaptcha-response', phanHoiRecaptcha); }
      if (phanHoiHcaptcha) { thamSo.set('h-captcha-response', phanHoiHcaptcha); }
      fetch(window.location.href, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          ['Content-Type']: 'application/x-www-form-urlencoded',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        },
        body: thamSo.toString(),
      })
        .then((phanHoi) => phanHoi.text())
        .then((html) => {
          let linkTimDuoc = html.match(REGEX_LINK_GOC);
          if (linkTimDuoc) {
            ghiLog('Trích xuất thành công! Đang tiến hành chuyển hướng...', 'success');
            setTimeout(() => { window.location.href = linkTimDuoc[1]; }, 1000);
          } else {
            ghiLog('Hệ thống máy chủ từ chối yêu cầu. Vui lòng thử lại.', 'error');
          }
        })
        .catch(() => { ghiLog('Kết nối mạng không ổn định, vui lòng kiểm tra lại.', 'error'); });
    }
    if (laMathCaptcha) {
      ghiLog('Nhận diện lớp bảo mật toán học. Đang tự động xử lý...', 'ai');
      let vanBanTrang = new DOMParser().parseFromString(htmlTrang, 'text/html').documentElement.textContent;
      let matchToan = vanBanTrang.match(/(\d+)\s*([\+\-\*])\s*(\d+)\s*=\s*\?/);
      if (matchToan) {
        let soA = parseInt(matchToan[1]), pheTinh = matchToan[2], soB = parseInt(matchToan[3]);
        let ketQuaToan = pheTinh === '+' ? soA + soB : pheTinh === '-' ? soA - soB : soA * soB;
        let oNhapToan = document.getElementById('math-captcha-response') || document.querySelector('input[name="math_captcha_response"]');
        if (oNhapToan) {
          oNhapToan.value = ketQuaToan;
          ghiLog('Đã giải quyết bảo mật thành công.', 'success');
          setTimeout(() => guiForm(oForm), 1000);
        }
      }
    } else if (coRecaptcha || coHCaptcha) {
      let timerChoCaptcha = setInterval(() => {
        let giaTriRecaptcha = document.querySelector('[name="g-recaptcha-response"]')?.['value'];
        let giaTriHcaptcha = document.querySelector('[name="h-captcha-response"]')?.['value'];
        if (giaTriRecaptcha || giaTriHcaptcha) {
          clearInterval(timerChoCaptcha);
          tatCacNutCaptcha();
          guiForm(oForm);
        }
      }, 1000);
    }
    return;
  }
  if (laHostCanBypass && maNhiemVu) {
    layCacheRedirect(maNhiemVu);
  }
  function layCacheRedirect(khoaCache) {
    ghiLog('Đang kết nối với cơ sở dữ liệu...', 'system');
    GM_xmlhttpRequest({
      method: 'GET',
      url: `${CONFIG_URL}?t=${new Date().getTime()}`,
      onload: function (phanHoiCache) {
        try {
          let jsonCache = JSON.parse(phanHoiCache.responseText);
          if (jsonCache.enabled && jsonCache.redirects && jsonCache.redirects[khoaCache]) {
            let tenMienCache = jsonCache.redirects[khoaCache];
            moTabNhiemVu(tenMienCache);
          } else {
            batDauPipelineOCR();
          }
        } catch (e) { batDauPipelineOCR(); }
      },
      onerror: function () { batDauPipelineOCR(); },
    });
  }
  function batDauPipelineOCR() {
    let cacAnhUngCu = Array.from(document.querySelectorAll('img')).filter((theImg) => {
      if (!theImg.src) return false;
      let srcAnhThuong = theImg.src.toLowerCase();
      return srcAnhThuong.includes('wp-content/uploads/') && !srcAnhThuong.includes('logo') && !srcAnhThuong.includes('google');
    });
    if (cacAnhUngCu.length === 0) return hienOInputTay();
    let urlAnhDich = cacAnhUngCu[0].src.replace(/-\d+x\d+(?=\.[a-zA-Z]+$)/, '');
    let danhSachUrlAnh = [urlAnhDich];
    cacAnhUngCu.forEach((anhItem) => {
      let srcSach = anhItem.src.replace(/-\d+x\d+(?=\.[a-zA-Z]+$)/, '');
      if (!danhSachUrlAnh.includes(srcSach)) { danhSachUrlAnh.push(srcSach); }
    });
    quetAnhKeTiep(danhSachUrlAnh, 0);
  }
  function catKhungDoVaXuat(oAnh, callbackCat) {
    let canvasNguon = document.createElement('canvas');
    let ctxNguon = canvasNguon.getContext('2d');
    canvasNguon.width = oAnh.naturalWidth || oAnh.width;
    canvasNguon.height = oAnh.naturalHeight || oAnh.height;
    ctxNguon.drawImage(oAnh, 0, 0);
    try {
      let duLieuAnh = ctxNguon.getImageData(0, 0, canvasNguon.width, canvasNguon.height);
      let duLieuPixel = duLieuAnh.data;
      let xNho = canvasNguon.width, yNho = canvasNguon.height, xLon = 0, yLon = 0, thayKhungDo = false;
      for (let hang = 0; hang < canvasNguon.height; hang++) {
        for (let cot = 0; cot < canvasNguon.width; cot++) {
          let chiSoPixel = (hang * canvasNguon.width + cot) * 4;
          if (duLieuPixel[chiSoPixel] > 120 && duLieuPixel[chiSoPixel] > duLieuPixel[chiSoPixel + 1] * 1.5 && duLieuPixel[chiSoPixel] > duLieuPixel[chiSoPixel + 2] * 1.5) {
            if (cot < xNho) xNho = cot; if (cot > xLon) xLon = cot; if (hang < yNho) yNho = hang; if (hang > yLon) yLon = hang;
            thayKhungDo = true;
          }
        }
      }
      if (!thayKhungDo) return canvasNguon.toBlob((blobA) => callbackCat(blobA), 'image/jpeg', 0.9);
      let lePadding = 20;
      xNho = Math.max(0, xNho - lePadding); yNho = Math.max(0, yNho - lePadding); xLon = Math.min(canvasNguon.width, xLon + lePadding); yLon = Math.min(canvasNguon.height, yLon + lePadding);
      let canvasDaCat = document.createElement('canvas');
      canvasDaCat.width = xLon - xNho; canvasDaCat.height = yLon - yNho;
      canvasDaCat.getContext('2d').drawImage(canvasNguon, xNho, yNho, xLon - xNho, yLon - yNho, 0, 0, xLon - xNho, yLon - yNho);
      canvasDaCat.toBlob((blobB) => callbackCat(blobB), 'image/jpeg', 0.9);
    } catch (e) { canvasNguon.toBlob((blobC) => callbackCat(blobC), 'image/jpeg', 0.9); }
  }
  function quetAnhKeTiep(danhSachUrl, chiSoUrl) {
    if (chiSoUrl >= danhSachUrl.length) return hienOInputTay();
    let urlAnhHienTai = danhSachUrl[chiSoUrl];
    ghiLog('Tiến hành phân tích bằng Kolosal AI...', 'system');
    GM_xmlhttpRequest({
      method: 'GET', url: urlAnhHienTai, responseType: 'blob',
      onload: function (phanHoiAnh) {
        let urlObject = URL.createObjectURL(phanHoiAnh.response);
        let objAnh = new Image();
        objAnh.onload = function () {
          catKhungDoVaXuat(objAnh, (blobCat) => { URL.revokeObjectURL(urlObject); goiOCR(blobCat, danhSachUrl, chiSoUrl); });
        };
        objAnh.src = urlObject;
      },
      onerror: function () { quetAnhKeTiep(danhSachUrl, chiSoUrl + 1); },
    });
  }
  function goiOCR(blobCatVao, danhSachQuet, chiSoQuet) {
    ghiLog('Hệ thống AI đang trích xuất tên miền...', 'ai');
    let formDataOCR = new FormData();
    formDataOCR.append('image', blobCatVao, 'image.jpg');
    formDataOCR.append('language', 'auto');
    formDataOCR.append('custom_schema', JSON.stringify(SCHEMA_OCR));
    GM_xmlhttpRequest({
      method: 'POST', url: 'https://api.kolosal.ai/public/ocr/form',
      headers: { Origin: 'https://app.kolosal.ai', Referer: 'https://app.kolosal.ai/' },
      data: formDataOCR,
      onload: function (phanHoiOCR) {
        try {
          let jsonOCR = JSON.parse(phanHoiOCR.responseText);
          let tenMienPhatHien = (jsonOCR.target_domain || '').trim().toLowerCase();
          if (tenMienPhatHien && !tenMienPhatHien.includes('...')) {
            dongBoLenServer(maNhiemVu, tenMienPhatHien.includes('.') ? tenMienPhatHien : `${tenMienPhatHien}.com`);
            moTabNhiemVu(tenMienPhatHien);
          } else {
            quetAnhKeTiep(danhSachQuet, chiSoQuet + 1);
          }
        } catch (e) { quetAnhKeTiep(danhSachQuet, chiSoQuet + 1); }
      },
      onerror: function () { quetAnhKeTiep(danhSachQuet, chiSoQuet + 1); },
    });
  }
  function dongBoLenServer(khoaDongBo, tenMienDongBo) {
    GM_xmlhttpRequest({
      method: 'POST', url: SAVE_URL,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ key: khoaDongBo, domain: tenMienDongBo })
    });
  }
  function hienOInputTay() {
    if (document.getElementById('manual-domain-input')) return;
    ghiLog('Hãy nhập thủ công tên miền nếu AI thất bại.', 'warn');
    let oNhapTay = document.createElement('div');
    oNhapTay.style.cssText = 'margin-top: 10px; display: flex; gap: 8px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;';
    oNhapTay.innerHTML = '\n            <input type="text" id="manual-domain-input" placeholder="Nhập tên miền đích..." style="flex-grow: 1; padding: 8px 12px; background: rgba(0,0,0,0.5); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">\n            <button id="manual-domain-btn" style="padding: 8px 16px; background: #00b0ff; color: white; border: none; border-radius: 4px; cursor: pointer;">OK</button>\n        ';
    oNoiDung.appendChild(oNhapTay);
    document.getElementById('manual-domain-btn').addEventListener('click', () => {
      let inputTho = document.getElementById('manual-domain-input').value.trim();
      if (inputTho) moTabNhiemVu(inputTho);
    });
  }
})();
